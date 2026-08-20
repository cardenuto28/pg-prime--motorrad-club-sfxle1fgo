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
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  Ride,
  Registration,
  Benefit,
  Announcement,
  rideService,
  registrationService,
  benefitService,
  announcementService,
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
} from 'lucide-react'

const MemberDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rides, setRides] = useState<Ride[]>([])
  const [regs, setRegs] = useState<Registration[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [expandedAnn, setExpandedAnn] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [allRides, userRegs, activeBenefits, activeAnnouncements] = await Promise.all([
        rideService.getAllRides(),
        registrationService.getRegistrationsByUser(user.id),
        benefitService.getActiveBenefits(),
        announcementService.getActive(),
      ])
      setRides(allRides)
      setRegs(userRegs)
      setBenefits(activeBenefits)
      setAnnouncements(activeAnnouncements)
    } catch (e) {
      console.error('Erro ao carregar dashboard:', e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

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
              <div className="flex items-center gap-2 mt-1">
                <Bike className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-slate-300">
                  {user?.bike_brand || user?.bike_model
                    ? `${user?.bike_brand || ''} ${user?.bike_model || ''} ${
                        user?.bike_year || ''
                      }`.trim()
                    : 'Moto não cadastrada'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/member/card">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/50 bg-blue-950/40 text-blue-300 hover:text-white hover:bg-blue-900/60 text-xs font-bold gap-1.5"
              >
                <CreditCard className="w-4 h-4" /> CARTEIRINHA DIGITAL
              </Button>
            </Link>
            <StatusBadge status={user?.status || 'pendente'} />
          </div>
        </div>
      </section>

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
