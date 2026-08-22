import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  ClipboardList,
  CalendarClock,
  ShieldCheck,
  Bike,
  ChevronRight,
  History,
  XCircle,
  Download,
  Smartphone,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { usePWA } from '@/hooks/use-pwa'
import {
  Ride,
  Registration,
  Benefit,
  Announcement,
  StoreVisit,
  rideService,
  registrationService,
  benefitService,
  announcementService,
  storeVisitService,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import {
  StatusBadge,
  formatDate,
  isRidePast,
  coverFallback,
  resolveFileUrl,
  formatMemberId,
  getMemberCategory,
} from '@/lib/member'
import { CategoryBadge, getCategoryMessage } from '@/components/CategoryBadge'
import { calcularCategoriaMembro, nivelRelacionamentoMeta } from '@/lib/membership'
import pb from '@/lib/pocketbase/client'
import {
  Gift,
  Store,
  Megaphone,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  CreditCard,
  QrCode,
  Trophy,
  Sparkles,
} from 'lucide-react'

const MemberDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWA()
  const [rides, setRides] = useState<Ride[]>([])
  const [regs, setRegs] = useState<Registration[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [storeVisits, setStoreVisits] = useState<StoreVisit[]>([])
  const [pointsSummary, setPointsSummary] = useState<{
    rideCheckins: number
    storeVisits: number
    ridePoints: number
    storePoints: number
    totalPoints: number
  }>({
    rideCheckins: 0,
    storeVisits: 0,
    ridePoints: 0,
    storePoints: 0,
    totalPoints: 0,
  })
  const [expandedAnn, setExpandedAnn] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [allRides, userRegs, activeBenefits, activeAnnouncements, userVisits, memberPts] =
        await Promise.all([
          rideService.getAllRides(),
          registrationService.getRegistrationsByUser(user.id),
          benefitService.getActiveBenefits(),
          announcementService.getActive(),
          storeVisitService.getVisitsByUser(user.id).catch(() => [] as StoreVisit[]),
          storeVisitService.getMemberPoints(user.id),
        ])
      setRides(allRides)
      setRegs(userRegs)
      setBenefits(activeBenefits)
      setAnnouncements(activeAnnouncements)
      setStoreVisits(userVisits)
      setPointsSummary(memberPts)
    } catch (e) {
      console.error('Erro ao carregar dashboard:', e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const categoryCalc = user
    ? calcularCategoriaMembro({
        quantidade_motos_compradas: user.quantidade_motos_compradas,
        data_ultima_passagem_oficina: user.data_ultima_passagem_oficina,
        status_membro_atual: user.status_membro || user.status,
      })
    : null

  const categoryMessage = getCategoryMessage({
    category: user?.categoria || user?.category || categoryCalc?.categoria,
    motos: user?.quantidade_motos_compradas,
    diasParaVencerBronze: categoryCalc?.diasParaVencerBronze,
    isAtencao: user?.status_membro === 'ATENCAO',
  })

  const confirmedRegs = regs.filter((r) => r.status === 'confirmada')
  const registeredRideIds = new Set(confirmedRegs.map((r) => r.ride))

  const upcomingRides = rides.filter(
    (r) => !isRidePast(r.date) && r.status !== 'cancelado' && r.status !== 'realizado',
  )

  const nextRide =
    upcomingRides.find((r) => registeredRideIds.has(r.id)) || upcomingRides[0] || null

  const myUpcomingRegs = confirmedRegs.filter((r) => {
    const ride = r.expand?.ride
    return ride && !isRidePast(ride.date)
  })

  const myPastRegs = regs.filter((r) => {
    const ride = r.expand?.ride
    return ride && isRidePast(ride.date)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header do perfil */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xl flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
                Bem-vindo de volta
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight">
                {user?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-slate-300">
                    {user?.bike_brand || user?.bike_model
                      ? `${user?.bike_brand || ''} ${user?.bike_model || ''} ${
                          user?.bike_year || ''
                        }`.trim()
                      : 'Moto não cadastrada'}
                  </span>
                </div>
                {user?.quantidade_motos_compradas !== undefined && (
                  <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Motos Compradas:{' '}
                    <strong className="text-blue-400">{user.quantidade_motos_compradas}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              category={user?.categoria || user?.category || getMemberCategory(user)}
              size="md"
            />
            <Link to="/member/card">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/50 bg-blue-950/40 text-blue-300 hover:text-white hover:bg-blue-900/60 text-xs font-bold gap-1.5"
              >
                <CreditCard className="w-4 h-4" /> CARTEIRINHA
              </Button>
            </Link>
            <StatusBadge status={user?.status || 'pendente'} />
          </div>
        </div>

        {/* Card de Mensagem da Categoria */}
        <div
          className={`mt-5 p-4 rounded-lg border text-xs flex items-start gap-3 ${
            categoryMessage.type === 'warning'
              ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
              : categoryMessage.type === 'success'
                ? 'bg-blue-950/40 border-blue-600/50 text-blue-200'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300'
          }`}
        >
          {categoryMessage.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : categoryMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5 flex-1">
            <h4 className="font-bold text-sm tracking-wide text-white font-montserrat">
              {categoryMessage.title}
            </h4>
            <p className="leading-relaxed opacity-90">{categoryMessage.message}</p>
          </div>
        </div>
      </section>

      {/* PARTE 3.1 — Score de Relacionamento do membro (somente score + nível textual) */}
      {(() => {
        const rawScore = Number(user?.score_oficina || 0)
        const temScoreCalculado =
          !isNaN(rawScore) &&
          rawScore > 0 &&
          !!user?.data_ultimo_calculo &&
          String(user.data_ultimo_calculo).trim() !== ''
        const score = temScoreCalculado ? rawScore : 0
        const meta = nivelRelacionamentoMeta(user?.nivel_relacionamento || '')
        return (
          <section className="bg-gradient-to-br from-[#0c1322] via-[#090e18] to-[#0c1424] border border-cyan-600/40 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-full bg-cyan-600/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-600/50 text-[10px] font-black uppercase tracking-widest text-cyan-300 font-montserrat">
                  ⚙️ SEU SCORE DE RELACIONAMENTO
                </span>
              </div>
              {temScoreCalculado ? (
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white font-montserrat tracking-tight">
                      <span className={meta.textColor}>{score}</span>
                      <span className="text-slate-500 text-2xl">/100</span>
                    </h2>
                    <p className={`text-sm font-bold mt-1 ${meta.textColor}`}>{meta.label}</p>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="w-full h-3 rounded-full bg-[#1c2538] overflow-hidden">
                      <div
                        className={`h-full ${meta.barColor} transition-all`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Seu nível de relacionamento com o Euro Motors Motorrad Club é calculado
                      automaticamente com base no seu histórico de oficinas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white font-montserrat tracking-tight">
                      <span className="text-slate-500">—</span>
                      <span className="text-slate-600 text-2xl">/100</span>
                    </h2>
                    <p className="text-sm font-bold mt-1 text-slate-400">
                      Aguardando primeira importação
                    </p>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="w-full h-3 rounded-full bg-[#1c2538] overflow-hidden">
                      <div className="h-full bg-slate-700 transition-all" style={{ width: '0%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Seu score será calculado automaticamente assim que o histórico de oficinas for
                      importado pela concessionária.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )
      })()}

      {/* 🏆 DESTAQUE DOS PONTOS DO MEMBRO (SISTEMA DE PONTOS EURO MOTORS CLUB) */}
      <section className="bg-gradient-to-br from-[#0c1322] via-[#090e18] to-[#0c1424] border border-blue-600/40 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-600/50 text-[10px] font-black uppercase tracking-widest text-amber-300 font-montserrat">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> SEUS PONTOS NO CLUBE
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Ranking Oficial</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-montserrat uppercase tracking-tight">
                Pontuação Euro Motors Club
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Acumule pontos participando dos passeios oficiais e visitando a concessionária Euro
                Motors. Seus pontos determinam sua posição no Top Membros!
              </p>
            </div>
          </div>

          {/* Placar de Pontos */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Box Total */}
            <div className="bg-gradient-to-br from-blue-950/80 to-[#0b101c] border-2 border-blue-500/60 rounded-xl p-4 text-center min-w-[140px] shadow-lg shadow-blue-950/60">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block font-montserrat">
                TOTAL DE PONTOS
              </span>
              <p className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-300">
                {pointsSummary.totalPoints}
              </p>
              <span className="text-[9px] text-slate-400 font-mono">PONTOS TOTAIS</span>
            </div>

            {/* Box Passeios */}
            <div className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-3.5 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-400 uppercase font-montserrat">
                <Bike className="w-3 h-3" /> Passeios
              </div>
              <p className="text-xl font-black text-white font-mono mt-1">
                {pointsSummary.rideCheckins}
              </p>
              <span className="text-[9px] text-emerald-400/90 font-mono font-bold">
                +{pointsSummary.ridePoints} pts (100/un)
              </span>
            </div>

            {/* Box Visitas Loja */}
            <div className="bg-[#0e131d] border border-[#1c2538] rounded-xl p-3.5 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-blue-400 uppercase font-montserrat">
                <Store className="w-3 h-3" /> Visitas Loja
              </div>
              <p className="text-xl font-black text-white font-mono mt-1">
                {pointsSummary.storeVisits}
              </p>
              <span className="text-[9px] text-blue-400/90 font-mono font-bold">
                +{pointsSummary.storePoints} pts (10/un)
              </span>
            </div>
          </div>
        </div>

        {/* Orientações sobre Check-in Presencial na Loja */}
        <div className="mt-4 pt-4 border-t border-[#182236] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Está na concessionária Euro Motors? Aponte a câmera do celular para a{' '}
              <strong>placa com QR Code</strong> no balcão da recepção para registrar sua presença e
              ganhar +10 pontos.
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-950/60 border border-blue-600/40 text-blue-300 text-[10px] font-black uppercase tracking-wider font-montserrat shrink-0">
            <QrCode className="w-3.5 h-3.5 text-blue-400" /> ESCANEIE NA LOJA
          </span>
        </div>
      </section>

      {/* Banner de Instalação PWA no Dashboard */}
      {!isInstalled && (isInstallable || isIOS) && (
        <section className="bg-gradient-to-r from-[#0066FF]/15 via-[#0b1220] to-[#07090e] border border-[#0066FF]/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-950/40 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#0066FF]/20 border border-[#0066FF]/50 flex items-center justify-center text-[#0066FF] flex-shrink-0 shadow-md">
              <Smartphone className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase font-montserrat">
                APLICATIVO PROGRESSIVO (PWA)
              </span>
              <h3 className="text-sm sm:text-base font-black text-white font-montserrat uppercase truncate">
                Instale o App do Euro Motors Club no celular
              </h3>
              <p className="text-xs text-slate-300 truncate">
                Acesso direto na sua tela inicial, funcionamento instantâneo e offline
              </p>
            </div>
          </div>
          {isInstallable && (
            <Button
              onClick={() => promptInstall()}
              className="relative z-10 w-full sm:w-auto bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider uppercase font-montserrat px-5 shadow-lg shadow-blue-950/60 gap-1.5 flex-shrink-0"
            >
              <Download className="w-4 h-4" /> INSTALAR APP
            </Button>
          )}
        </section>
      )}

      {/* Banner de Acesso Rápido à Carteirinha Digital */}
      <section className="bg-gradient-to-r from-[#0d1524] via-[#09101d] to-[#0d1524] border border-blue-900/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-blue-600/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-lg">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase font-montserrat">
                IDENTIFICAÇÃO OFICIAL
              </span>
              <span className="text-[9px] text-slate-400 font-mono">{formatMemberId(user)}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white font-montserrat uppercase truncate">
              Sua Carteirinha Digital de Membro está disponível
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Categoria: <strong className="text-slate-200">{getMemberCategory(user)}</strong> •
              Validação via QR Code em tempo real
            </p>
          </div>
        </div>
        <Link to="/member/card" className="relative z-10 w-full sm:w-auto flex-shrink-0">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase font-montserrat px-5 shadow-lg shadow-blue-950/60 gap-1.5">
            <CreditCard className="w-4 h-4" /> VER CARTEIRINHA <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Cards de resumo rápido */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={ClipboardList}
          label="Total de Inscrições"
          value={String(confirmedRegs.length)}
          hint={`${confirmedRegs.length} inscrição(ões) confirmada(s)`}
        />
        <SummaryCard
          icon={CalendarClock}
          label="Próximo Passeio"
          value={nextRide ? formatDate(nextRide.date) : 'Nenhum'}
          hint={nextRide ? nextRide.name : 'Sem passeios agendados'}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Status do Clube"
          value={user?.status === 'ativo' || user?.role === 'admin' ? 'Ativo' : 'Pendente'}
          hint={
            user?.status === 'ativo' || user?.role === 'admin'
              ? 'Acesso completo liberado'
              : 'Aguardando aprovação'
          }
        />
      </section>

      {/* Comunicados */}
      <section className="space-y-4">
        <SectionHeader
          title="Comunicados"
          icon={Megaphone}
          action={
            <Link
              to="/member/comunicados"
              className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
            >
              VER TODOS <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        {announcements.length === 0 ? (
          <EmptyState text="Nenhum comunicado ativo no momento." />
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 4).map((a) => {
              const isUrgent = a.priority === 'urgent'
              const isImportant = a.priority === 'important'
              const isOpen = !!expandedAnn[a.id]
              return (
                <div
                  key={a.id}
                  className={`rounded-md p-4 border transition-colors ${
                    isUrgent
                      ? 'bg-red-950/20 border-red-800/60'
                      : isImportant
                        ? 'bg-amber-950/20 border-amber-800/50'
                        : 'bg-[#0e131d] border-[#1c2538]'
                  }`}
                >
                  <button
                    onClick={() => setExpandedAnn((p) => ({ ...p, [a.id]: !p[a.id] }))}
                    className="flex items-start justify-between gap-3 w-full text-left"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      ) : isImportant ? (
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Megaphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      )}
                      <h3 className="text-sm font-bold text-white font-montserrat tracking-wide">
                        {a.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase border ${
                          isUrgent
                            ? 'bg-red-950/70 text-red-300 border-red-700/50'
                            : isImportant
                              ? 'bg-amber-950/70 text-amber-300 border-amber-700/50'
                              : 'bg-slate-800/70 text-slate-300 border-slate-600/50'
                        }`}
                      >
                        {isUrgent ? 'Urgente' : isImportant ? 'Importante' : 'Normal'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {a.content && (
                    <p
                      className={`text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-6 mt-2 ${
                        isOpen ? '' : 'line-clamp-2'
                      }`}
                    >
                      {a.content}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pl-6 mt-2">
                    {formatDate(a.publish_at || a.date)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Benefícios em destaque */}
      <section className="space-y-4">
        <SectionHeader
          title="Benefícios do Club"
          icon={Gift}
          action={
            <Link
              to="/member/beneficios"
              className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
            >
              VER TODOS <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        {benefits.length === 0 ? (
          <EmptyState text="Nenhum benefício ativo no momento." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.slice(0, 4).map((b) => {
              const img = resolveFileUrl(b.image) || coverFallback('discount,store,benefit')
              return (
                <div
                  key={b.id}
                  className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden flex flex-col group hover:border-blue-600/50 transition-all"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={img}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/40 to-transparent" />
                    {b.partner && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold text-blue-300 bg-blue-950/80 border border-blue-700/50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <Store className="w-3 h-3" /> {b.partner}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-2 flex-1">
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase font-montserrat line-clamp-1">
                      {b.title}
                    </h3>
                    {b.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {b.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Próximos Passeios */}
      <section className="space-y-4">
        <SectionHeader
          title="Próximos Passeios"
          action={
            <Link
              to="/member/passeios"
              className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
            >
              VER TODOS <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        {upcomingRides.length === 0 ? (
          <EmptyState text="Nenhum passeio agendado no momento." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingRides.slice(0, 4).map((ride) => {
              const isReg = registeredRideIds.has(ride.id)
              return (
                <RideMiniCard
                  key={ride.id}
                  ride={ride}
                  isRegistered={isReg}
                  onRegister={() => navigate('/member/passeios')}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* Minhas Inscrições */}
      <section className="space-y-4">
        <SectionHeader
          title="Minhas Inscrições"
          action={
            <Link
              to="/member/inscricoes"
              className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
            >
              VER TODAS <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        {myUpcomingRegs.length === 0 ? (
          <EmptyState text="Você ainda não tem inscrições em passeios futuros." />
        ) : (
          <div className="space-y-2.5">
            {myUpcomingRegs.map((reg) => (
              <RegistrationRow key={reg.id} reg={reg} />
            ))}
          </div>
        )}
      </section>

      {/* Histórico de Passeios */}
      <section className="space-y-4">
        <SectionHeader title="Histórico de Passeios" icon={History} />
        {myPastRegs.length === 0 ? (
          <EmptyState text="Nenhum passeio realizado ainda. O histórico aparecerá aqui." />
        ) : (
          <div className="space-y-2.5">
            {myPastRegs.map((reg) => (
              <RegistrationRow key={reg.id} reg={reg} past />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const SummaryCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
}> = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 space-y-2">
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-md bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-montserrat">
        {label}
      </span>
    </div>
    <p className="text-lg font-extrabold text-white font-montserrat truncate">{value}</p>
    {hint && <p className="text-[11px] text-slate-500 truncate">{hint}</p>}
  </div>
)

const SectionHeader: React.FC<{
  title: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}> = ({ title, icon: Icon, action }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-blue-500" />}
      {title}
    </h2>
    {action}
  </div>
)

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-8 text-center">
    <p className="text-xs text-slate-500">{text}</p>
  </div>
)

const RideMiniCard: React.FC<{
  ride: Ride
  isRegistered: boolean
  onRegister: () => void
}> = ({ ride, isRegistered, onRegister }) => {
  const img =
    ride.cover_image && ride.cover_image.startsWith('http')
      ? ride.cover_image
      : ride.cover_image
        ? pb.baseUrl + ride.cover_image
        : coverFallback('motorcycle,serra,road')

  return (
    <div className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden flex flex-col group hover:border-blue-600/50 transition-all">
      <div className="relative h-32 overflow-hidden">
        <img
          src={img}
          alt={ride.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-transparent to-transparent" />
        {isRegistered && (
          <span className="absolute top-2 right-2 text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Inscrito
          </span>
        )}
      </div>
      <div className="p-3 space-y-2 flex-1">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase font-montserrat line-clamp-1">
          {ride.name}
        </h3>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-500" /> <span>{formatDate(ride.date)}</span>
          </div>
          {ride.destination && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-500" />{' '}
              <span className="truncate">{ride.destination}</span>
            </div>
          )}
          {ride.meeting_time && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-500" /> <span>{ride.meeting_time}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 pt-0">
        <Link to={`/passeios/${ride.id}`}>
          <Button
            variant="outline"
            className="w-full border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider h-8 rounded-sm uppercase transition-all"
          >
            {isRegistered ? 'VER DETALHES' : 'INSCREVER-SE'}
          </Button>
        </Link>
      </div>
    </div>
  )
}

const RegistrationRow: React.FC<{ reg: Registration; past?: boolean }> = ({ reg, past }) => {
  const ride = reg.expand?.ride
  if (!ride) return null

  const statusColor =
    reg.status === 'confirmada'
      ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50'
      : reg.status === 'cancelada'
        ? 'text-red-300 bg-red-950/60 border-red-800/50'
        : 'text-amber-300 bg-amber-950/60 border-amber-800/50'

  return (
    <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-md bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
        {past ? <History className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate font-montserrat uppercase">
          {ride.name}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" /> {formatDate(ride.date)}
          </span>
          {ride.destination && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-slate-500" />{' '}
              <span className="truncate">{ride.destination}</span>
            </span>
          )}
        </div>
      </div>
      <span
        className={`text-[9px] font-bold tracking-wider px-2 py-1 rounded uppercase border flex items-center gap-1 flex-shrink-0 ${statusColor}`}
      >
        {reg.status === 'cancelada' && <XCircle className="w-3 h-3" />}
        {reg.status === 'confirmada' && <CheckCircle2 className="w-3 h-3" />}
        {reg.status}
      </span>
    </div>
  )
}

export default MemberDashboard
