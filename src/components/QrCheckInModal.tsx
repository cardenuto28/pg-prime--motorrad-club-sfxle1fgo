import React, { useEffect, useRef, useState, useCallback } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  timestamp: string
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
  const [recentCheckIns, setRecentCheckIns] = useState<
    { id: string; name: string; time: string; success: boolean }[]
  >([])
  const [processing, setProcessing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const scannerRef = useRef<Html5Qrcode | null>(null)
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

  // Extract Member ID / User ID from QR Code text
  const extractUserId = (text: string): string => {
    const trimmed = text.trim()
    // Check if it's a verification URL: e.g. https://domain.com/verificar/RECORD_ID
    const urlMatch = trimmed.match(/\/verificar\/([a-zA-Z0-9_-]+)/)
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1]
    }
    // Or if it's a standard URL with ?id= or query params
    try {
      const url = new URL(trimmed)
      const pathParts = url.pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1]
      }
    } catch {
      /* intentionally ignored */
    }

    // Direct ID or custom format
    return trimmed
  }

  const handleQrScan = useCallback(
    async (decodedText: string) => {
      if (processingRef.current) return

      const now = Date.now()
      const rawId = extractUserId(decodedText)

      // Throttle exact same scan within 3 seconds
      if (lastScannedIdRef.current === rawId && now - lastScanTimeRef.current < 3000) {
        return
      }

      lastScannedIdRef.current = rawId
      lastScanTimeRef.current = now
      processingRef.current = true
      setProcessing(true)

      const timeStr = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      try {
        if (!rawId || rawId.length < 5) {
          if (soundEnabled) playBeep(false)
          setFeedback({
            type: 'warning',
            title: 'QR Code não reconhecido',
            subtitle: 'O conteúdo escaneado não é um ID válido de carteirinha.',
            timestamp: timeStr,
          })
          setRecentCheckIns((prev) => [
            {
              id: Math.random().toString(),
              name: 'QR Code Inválido',
              time: timeStr,
              success: false,
            },
            ...prev.slice(0, 9),
          ])
          return
        }

        // Consult backend via registrationService.checkInMember
        const result = await registrationService.checkInMember(rideId, rawId)

        if (result.success && result.registration) {
          if (soundEnabled) playBeep(true)
          const mName = result.memberName || result.registration.expand?.user?.name || 'Membro'
          setFeedback({
            type: 'success',
            title: `✅ ${mName} — PRESENÇA CONFIRMADA`,
            subtitle: result.message,
            timestamp: timeStr,
          })
          setRecentCheckIns((prev) => [
            { id: Math.random().toString(), name: mName, time: timeStr, success: true },
            ...prev.slice(0, 9),
          ])
          if (onCheckInSuccess) {
            onCheckInSuccess(result.registration)
          }
        } else {
          if (soundEnabled) playBeep(false)
          setFeedback({
            type: 'error',
            title: '❌ Membro não inscrito neste passeio',
            subtitle: result.message || 'Inscrição não localizada para esta carteirinha.',
            timestamp: timeStr,
          })
          setRecentCheckIns((prev) => [
            {
              id: Math.random().toString(),
              name: `ID: ${rawId.slice(0, 8)}... (Não inscrito)`,
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
          title: 'Erro ao verificar presença',
          subtitle: err?.message || 'Falha de conexão com o servidor.',
          timestamp: timeStr,
        })
      } finally {
        setTimeout(() => {
          processingRef.current = false
          setProcessing(false)
        }, 1200)
      }
    },
    [rideId, soundEnabled, playBeep, onCheckInSuccess],
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
    }
  }, [handleQrScan, stopScanner])

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow modal DOM node to mount
      const timer = setTimeout(() => {
        startScanner()
      }, 300)
      return () => {
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
    }
  }, [isOpen, startScanner, stopScanner])

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
          {/* Camera Viewport */}
          <div className="relative rounded-lg overflow-hidden bg-black border border-[#22314a] aspect-video max-h-72 flex items-center justify-center">
            {cameraError ? (
              <div className="p-6 text-center space-y-3">
                <CameraOff className="w-10 h-10 text-red-400 mx-auto" />
                <p className="text-xs text-red-300 font-medium">{cameraError}</p>
                <Button
                  onClick={startScanner}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
                </Button>
              </div>
            ) : (
              <div id="qr-reader-region" className="w-full h-full object-cover" />
            )}

            {processing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <div className="bg-[#0f172a] border border-blue-500/50 rounded-lg px-4 py-2 flex items-center gap-2.5 text-blue-400 shadow-xl">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold tracking-wide">Validando Inscrição...</span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Visual Box */}
          {feedback && (
            <div
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                  : feedback.type === 'error'
                    ? 'bg-red-950/60 border-red-500/60 text-red-200'
                    : 'bg-amber-950/60 border-amber-500/60 text-amber-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : feedback.type === 'error' ? (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-extrabold font-montserrat uppercase tracking-wide">
                  {feedback.title}
                </p>
                {feedback.subtitle && (
                  <p className="text-[11px] opacity-80 mt-0.5">{feedback.subtitle}</p>
                )}
                <span className="text-[9px] opacity-60 block mt-1 font-mono">
                  {feedback.timestamp}
                </span>
              </div>
            </div>
          )}

          {/* Últimos Check-ins */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-montserrat">
              Últimas Leituras
            </h3>
            {recentCheckIns.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-[#0f1422] p-3 rounded border border-[#1a2436] text-center">
                Aponte a câmera para o QR Code da carteirinha digital do membro.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {recentCheckIns.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-[#0f1422] border border-[#1a2436]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-white truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
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
