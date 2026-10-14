import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Volume2,
  VolumeX,
  Keyboard,
  Search,
  Check,
  Bike,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registrationService, Registration } from '@/services/api'
import { formatMemberId } from '@/lib/member'

interface QrCheckInModalProps {
  rideId: string
  rideName: string
  isOpen: boolean
  onClose: () => void
  onCheckInSuccess?: (reg: Registration) => void
  registrations: Registration[]
}

interface ScanFeedback {
  type: 'success' | 'error' | 'warning'
  title: string
  subtitle?: string
  memberName?: string
  bikeInfo?: string
  timestamp: string
  memberIdFormatted?: string
  isAlreadyCheckedIn?: boolean
}

export const QrCheckInModal: React.FC<QrCheckInModalProps> = ({
  rideId,
  rideName,
  isOpen,
  onClose,
  onCheckInSuccess,
  registrations,
}) => {
  const [scannerStarted, setScannerStarted] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [isManualModeOpen, setIsManualModeOpen] = useState(false)
  const [recentCheckIns, setRecentCheckIns] = useState<
    {
      id: string
      name: string
      bike?: string
      time: string
      success: boolean
      alreadyCheckedIn?: boolean
    }[]
  >([])
  const [processing, setProcessing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const manualInputRef = useRef<HTMLInputElement | null>(null)
  const processingRef = useRef(false)
  const lastScannedIdRef = useRef<string | null>(null)
  const lastScanTimeRef = useRef<number>(0)

  // Realtime calculated statistics
  const confirmedList = registrations.filter(
    (r) => r.status === 'confirmada' && (r.checked_in || false),
  )
  const totalBikesConfirmed = confirmedList.length
  const totalBikesRegistered = registrations.filter((r) => r.status === 'confirmada').length
  const totalParticipantsConfirmed = confirmedList.reduce(
    (acc, r) => acc + (r.has_pillion ? 2 : 1),
    0,
  )

  // Helper sound effect
  const playBeep = useCallback((success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)

      if (success) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1) // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.3)
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime) // A3
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.25)
      }
    } catch (_) {
      // AudioContext might be blocked before user interaction
    }
  }, [])

  // Extract Member ID / User ID / Code from QR Code text or manual input
  const extractIdentifier = useCallback((text: string): string => {
    const trimmed = text.trim()
    // Check if it's a verification URL: e.g. https://domain.com/verificar/RECORD_ID
    const urlMatch = trimmed.match(/\/verificar\/([a-zA-Z0-9_-]+)/)
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1]
    }
    // Or if it has ?id= or ?member= query params
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed)
        const idParam = url.searchParams.get('id') || url.searchParams.get('user')
        if (idParam) return idParam
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length > 0) {
          return pathParts[pathParts.length - 1]
        }
      }
    } catch {
      /* intentionally ignored */
    }

    // Direct ID or custom format
    return trimmed
  }, [])

  // In-memory registration quick lookup for suggestions or instant local resolution
  const findRegistrationLocally = useCallback(
    (code: string): Registration | undefined => {
      const trimmed = code.trim()
      if (!trimmed) return undefined
      const upper = trimmed.toUpperCase()
      const cleanDigits = trimmed.replace(/\D/g, '')

      return registrations.find((r) => {
        // Direct reg id
        if (r.id === trimmed) return true

        const user = r.expand?.user
        if (user) {
          if (user.id === trimmed) return true
          if (user.member_id && user.member_id.toUpperCase() === upper) return true
          const formattedId = formatMemberId(user).toUpperCase()
          if (formattedId === upper) return true
          if (cleanDigits && user.cpf && user.cpf.replace(/\D/g, '') === cleanDigits) return true
        }

        // Guest match
        if (r.is_guest) {
          if (cleanDigits && r.guest_cpf && r.guest_cpf.replace(/\D/g, '') === cleanDigits)
            return true
        }

        return false
      })
    },
    [registrations],
  )

  // Unified check-in executor for both QR scanner and manual input
  const processCheckIn = useCallback(
    async (rawCode: string, origin: 'qr' | 'manual' = 'manual') => {
      if (processingRef.current) return
      const clean = extractIdentifier(rawCode)

      if (!clean) {
        if (soundEnabled) playBeep(false)
        setFeedback({
          type: 'warning',
          title: 'Código vazio ou inválido',
          subtitle: 'Digite o código do membro, ID PGP ou selecione uma inscrição.',
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        })
        return
      }

      const now = Date.now()
      // Throttle exact same scan only for camera QR
      if (
        origin === 'qr' &&
        lastScannedIdRef.current === clean &&
        now - lastScanTimeRef.current < 3000
      ) {
        return
      }

      lastScannedIdRef.current = clean
      lastScanTimeRef.current = now
      processingRef.current = true
      setProcessing(true)

      const timeStr = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      try {
        // Consult backend via registrationService.checkInMember
        const result = await registrationService.checkInMember(rideId, clean)

        const localReg = result.registration || findRegistrationLocally(clean)
        const memberUser = localReg?.expand?.user
        const formattedId = memberUser ? formatMemberId(memberUser) : clean.toUpperCase()
        const bikeStr =
          result.bikeInfo ||
          [
            memberUser?.bike_brand || localReg?.guest_bike_brand,
            memberUser?.bike_model || localReg?.guest_bike_model,
          ]
            .filter(Boolean)
            .join(' ') ||
          'Moto não informada'

        if (result.success && result.registration) {
          const isAlready = !!result.alreadyCheckedIn
          const mName =
            result.memberName || localReg?.expand?.user?.name || localReg?.guest_name || 'Membro'

          if (isAlready) {
            if (soundEnabled) playBeep(true)
            setFeedback({
              type: 'warning',
              title: `⚠️ ${mName} — JÁ REALIZOU CHECK-IN`,
              subtitle: `Presença já havia sido confirmada anteriormente para este passeio.`,
              memberName: mName,
              bikeInfo: bikeStr,
              memberIdFormatted: formattedId,
              isAlreadyCheckedIn: true,
              timestamp: timeStr,
            })
            setRecentCheckIns((prev) => [
              {
                id: Math.random().toString(),
                name: mName,
                bike: bikeStr,
                time: timeStr,
                success: true,
                alreadyCheckedIn: true,
              },
              ...prev.slice(0, 9),
            ])
          } else {
            if (soundEnabled) playBeep(true)
            setFeedback({
              type: 'success',
              title: `✅ ${mName} — PRESENÇA CONFIRMADA`,
              subtitle: `Check-in realizado com sucesso no passeio!`,
              memberName: mName,
              bikeInfo: bikeStr,
              memberIdFormatted: formattedId,
              isAlreadyCheckedIn: false,
              timestamp: timeStr,
            })
            setRecentCheckIns((prev) => [
              {
                id: Math.random().toString(),
                name: mName,
                bike: bikeStr,
                time: timeStr,
                success: true,
                alreadyCheckedIn: false,
              },
              ...prev.slice(0, 9),
            ])
            if (onCheckInSuccess) {
              onCheckInSuccess(result.registration)
            }
          }
          // Clear input if manual
          if (origin === 'manual') {
            setManualCode('')
          }
        } else {
          if (soundEnabled) playBeep(false)
          setFeedback({
            type: 'error',
            title: '❌ Inscrição não localizada',
            subtitle:
              result.message ||
              'Nenhum membro inscrito encontrado com o código informado neste passeio.',
            timestamp: timeStr,
          })
          setRecentCheckIns((prev) => [
            {
              id: Math.random().toString(),
              name: `Código: ${clean.slice(0, 16)} (Não encontrado)`,
              time: timeStr,
              success: false,
            },
            ...prev.slice(0, 9),
          ])
        }
      } catch (err: any) {
        if (soundEnabled) playBeep(false)
        setFeedback({
          type: 'error',
          title: 'Erro ao processar check-in',
          subtitle: err?.message || 'Falha de conexão com o servidor. Tente novamente.',
          timestamp: timeStr,
        })
      } finally {
        setTimeout(() => {
          processingRef.current = false
          setProcessing(false)
        }, 800)
      }
    },
    [rideId, soundEnabled, playBeep, extractIdentifier, onCheckInSuccess, findRegistrationLocally],
  )

  const handleQrScan = useCallback(
    (decodedText: string) => {
      processCheckIn(decodedText, 'qr')
    },
    [processCheckIn],
  )

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
      } catch (err) {
        console.warn('Erro ao parar scanner:', err)
      } finally {
        scannerRef.current = null
        setScannerStarted(false)
      }
    }
  }, [])

  const startScanner = useCallback(async () => {
    setCameraError(null)
    const readerElementId = 'qr-reader-region'

    try {
      if (scannerRef.current) {
        await stopScanner()
      }

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })
      scannerRef.current = html5QrCode

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleQrScan(decodedText)
        },
        () => {
          // Frame error (no QR detected in frame) — ignore
        },
      )

      setScannerStarted(true)
    } catch (err: any) {
      console.error('Erro ao iniciar câmera:', err)
      setCameraError(
        err?.message || 'Não foi possível acessar a câmera. Verifique as permissões do navegador.',
      )
      setScannerStarted(false)
      setIsManualModeOpen(true)
    }
  }, [handleQrScan, stopScanner])

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow modal DOM node to mount
      const timer = setTimeout(() => {
        startScanner()
      }, 250)
      return () => {
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
      setFeedback(null)
      setCameraError(null)
      setManualCode('')
    }
  }, [isOpen, startScanner, stopScanner])

  // Focus manual input when camera error occurs or manual mode opens
  useEffect(() => {
    if (cameraError || isManualModeOpen) {
      const t = setTimeout(() => {
        manualInputRef.current?.focus()
      }, 150)
      return () => clearTimeout(t)
    }
  }, [cameraError, isManualModeOpen])

  // Pending registrations that have not checked in yet (for quick selection)
  const pendingAttendees = useMemo(() => {
    return registrations.filter((r) => r.status === 'confirmada' && !r.checked_in).slice(0, 8)
  }, [registrations])

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!manualCode.trim()) return
    processCheckIn(manualCode.trim(), 'manual')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0f17] border border-[#1e2a3f] rounded-xl text-white w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1a2436] flex items-center justify-between bg-gradient-to-r from-[#0e1422] to-[#0a0d14]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase font-montserrat">
                  CHECK-IN POR QR CODE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white font-montserrat truncate max-w-sm sm:max-w-md">
                {rideName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsManualModeOpen((prev) => !prev)}
              className={`h-8 px-2.5 text-xs font-semibold gap-1.5 border transition-all ${
                isManualModeOpen || cameraError
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'border-[#1e2a3f] text-slate-300 hover:text-white hover:bg-[#141c2c]'
              }`}
              title="Alternar para entrada manual"
            >
              <Keyboard className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Entrada Manual</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
              title={soundEnabled ? 'Silenciar bipe' : 'Ativar bipe'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-400" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                stopScanner()
                onClose()
              }}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Realtime Counters Banner */}
        <div className="grid grid-cols-2 bg-[#121929] border-b border-[#1c273c] p-3 text-center">
          <div className="border-r border-[#1e2a3f] px-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-montserrat">
              Motos Confirmadas
            </span>
            <p className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
              ✅ {totalBikesConfirmed} / {totalBikesRegistered} motos
            </p>
          </div>
          <div className="px-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-montserrat">
              Total Participantes
            </span>
            <p className="text-base sm:text-lg font-black text-blue-400 font-mono mt-0.5">
              👥 {totalParticipantsConfirmed} presentes
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* CAMERA ERROR BANNER & PROMINENT MANUAL ENTRY WHEN CAMERA FAILS */}
          {cameraError ? (
            <div className="space-y-4">
              {/* Friendly notification banner */}
              <div className="bg-[#141017] border border-amber-500/40 rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                  <CameraOff className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-amber-300 font-montserrat uppercase tracking-wider">
                      Câmera indisponível no dispositivo
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={startScanner}
                      className="text-[11px] h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-800 gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Tentar Novamente
                    </Button>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Câmera indisponível. Digite o código do membro abaixo para fazer o check-in
                    manualmente.
                  </p>
                </div>
              </div>

              {/* Main highlighted manual check-in form */}
              <div className="bg-gradient-to-b from-[#101726] to-[#0c121e] border-2 border-blue-500/60 rounded-xl p-4 sm:p-5 shadow-[0_0_30px_rgba(0,102,255,0.15)] space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase font-montserrat block">
                      CHECK-IN MANUAL PRINCIPAL
                    </span>
                    <h3 className="text-sm font-extrabold text-white font-montserrat">
                      Digite o Código ou ID do Membro
                    </h3>
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between font-montserrat">
                      <span>Código do QR ou ID Oficial (PGP-XXXXX)</span>
                      <span className="text-[10px] text-blue-400 font-normal">
                        Aceita PGP-XXXXX, CPF, ID ou link do QR
                      </span>
                    </label>
                    <div className="relative">
                      <Input
                        ref={manualInputRef}
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Ex: PGP-02458, CPF ou cole o link do QR..."
                        disabled={processing}
                        className="bg-[#090d14] border-2 border-blue-500/50 text-white placeholder:text-slate-500 text-sm h-12 pl-3.5 pr-24 font-mono font-bold focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                      />
                      {manualCode && (
                        <button
                          type="button"
                          onClick={() => setManualCode('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={processing || !manualCode.trim()}
                    className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-black text-sm h-12 uppercase tracking-wider font-montserrat gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99]"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        VALIDANDO INSCRIÇÃO...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 stroke-[3]" />
                        VERIFICAR E FAZER CHECK-IN
                      </>
                    )}
                  </Button>
                </form>

                {/* Quick select from registered members waiting for check-in */}
                {pendingAttendees.length > 0 && (
                  <div className="pt-2 border-t border-[#1a2436] space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-montserrat block">
                      Ou selecione rapidamente um inscrito que ainda não fez check-in:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {pendingAttendees.map((reg) => {
                        const name = reg.expand?.user?.name || reg.guest_name || 'Inscrito'
                        const idDisplay = reg.expand?.user
                          ? formatMemberId(reg.expand.user)
                          : reg.id.slice(0, 7)
                        return (
                          <button
                            key={reg.id}
                            type="button"
                            disabled={processing}
                            onClick={() => {
                              const codeToUse = reg.expand?.user?.id || reg.id
                              setManualCode(idDisplay)
                              processCheckIn(codeToUse, 'manual')
                            }}
                            className="text-left text-xs bg-[#0b101a] hover:bg-blue-600/20 hover:border-blue-500/60 border border-[#1e2a3e] rounded-md px-2.5 py-1.5 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 font-medium group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
                            <span className="truncate max-w-[140px] sm:max-w-[180px]">{name}</span>
                            <span className="text-[10px] text-blue-400 font-mono font-bold">
                              ({idDisplay})
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* CAMERA ACTIVE VIEWPORT */
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black border border-[#22314a] aspect-video max-h-72 flex items-center justify-center shadow-lg">
                <div id="qr-reader-region" className="w-full h-full object-cover" />

                {processing && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-10">
                    <div className="bg-[#0f172a] border border-blue-500/50 rounded-lg px-4 py-2.5 flex items-center gap-2.5 text-blue-400 shadow-xl">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span className="text-xs font-bold tracking-wide">
                        Validando Inscrição...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* MANUAL INPUT ACCORDION / TOGGLE WHEN CAMERA IS ACTIVE */}
              <div className="bg-[#0e1422] border border-[#1d293d] rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-montserrat">
                    <Keyboard className="w-4 h-4 text-blue-400" />
                    <span>CHECK-IN MANUAL ALTERNATIVO</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Útil se a câmera não focar</span>
                </div>

                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    ref={manualInputRef}
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Código PGP-XXXXX, ID ou link..."
                    disabled={processing}
                    className="bg-[#090d14] border-[#22314a] text-white text-xs h-9 font-mono"
                  />
                  <Button
                    type="submit"
                    disabled={processing || !manualCode.trim()}
                    className="bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs uppercase px-3 h-9 flex-shrink-0"
                  >
                    {processing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'VERIFICAR'}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Detailed Feedback Visual Box */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200'
                  : feedback.type === 'error'
                    ? 'bg-red-950/70 border-red-500/70 text-red-200'
                    : 'bg-amber-950/70 border-amber-500/70 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border mt-0.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-900/60 border-emerald-400/50 text-emerald-300'
                      : feedback.type === 'error'
                        ? 'bg-red-900/60 border-red-400/50 text-red-300'
                        : 'bg-amber-900/60 border-amber-400/50 text-amber-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  ) : feedback.type === 'error' ? (
                    <XCircle className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black tracking-widest uppercase font-montserrat px-2 py-0.5 rounded bg-black/40 border border-current/30">
                      {feedback.type === 'success'
                        ? 'PRESENÇA CONFIRMADA'
                        : feedback.type === 'warning'
                          ? feedback.isAlreadyCheckedIn
                            ? 'CHECK-IN JÁ REGISTRADO'
                            : 'ATENÇÃO'
                          : 'INSCRIÇÃO NÃO LOCALIZADA'}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {feedback.timestamp}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-extrabold font-montserrat uppercase tracking-tight text-white mt-1">
                    {feedback.memberName ? feedback.memberName : feedback.title}
                  </p>

                  {feedback.subtitle && (
                    <p className="text-xs opacity-90 mt-0.5 font-medium leading-relaxed">
                      {feedback.subtitle}
                    </p>
                  )}

                  {/* Informações detalhadas do membro e moto se disponíveis */}
                  {(feedback.memberIdFormatted || feedback.bikeInfo) && (
                    <div className="flex flex-wrap items-center gap-2.5 mt-2 pt-2 border-t border-current/20 text-xs">
                      {feedback.memberIdFormatted && (
                        <span className="inline-flex items-center gap-1 font-mono font-bold bg-black/40 px-2 py-0.5 rounded">
                          <UserCheck className="w-3.5 h-3.5" />
                          {feedback.memberIdFormatted}
                        </span>
                      )}
                      {feedback.bikeInfo && (
                        <span className="inline-flex items-center gap-1 font-semibold bg-black/40 px-2 py-0.5 rounded">
                          <Bike className="w-3.5 h-3.5" />
                          {feedback.bikeInfo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Últimos Check-ins */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-montserrat">
                Últimos Check-ins Realizados
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {recentCheckIns.length} registro(s)
              </span>
            </div>
            {recentCheckIns.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-[#0f1422] p-3 rounded border border-[#1a2436] text-center">
                Aguardando leituras ou entrada manual do código do membro.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {recentCheckIns.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded bg-[#0f1422] border border-[#1a2436] hover:border-[#22314a] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.success ? (
                        item.alreadyCheckedIn ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-white truncate block">{item.name}</span>
                        {item.bike && (
                          <span className="text-[10px] text-slate-400 truncate block">
                            {item.bike}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-2">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1a2436] flex items-center justify-between bg-[#0a0d14]">
          <span className="text-[11px] text-slate-400">
            Conexão direta em tempo real (4G/Wi-Fi)
          </span>
          <Button
            type="button"
            onClick={() => {
              stopScanner()
              onClose()
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-4 h-9"
          >
            ENCERRAR CHECK-IN
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QrCheckInModal
