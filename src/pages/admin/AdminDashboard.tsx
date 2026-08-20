import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  Bike,
  Users2,
  Ticket,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Trophy,
  Medal,
} from 'lucide-react'
import {
  UserProfile,
  Ride,
  Registration,
  userService,
  rideService,
  registrationService,
} from '@/services/api'
import { formatDate, isRidePast } from '@/lib/member'

interface RideStatusBadgeProps {
  status: Ride['status']
}

const RIDE_STATUS_META: Record<Ride['status'], { label: string; className: string }> = {
  rascunho: {
    label: 'Rascunho',
    className: 'bg-slate-800/70 text-slate-300 border-slate-600/50',
  },
  inscricoes_abertas: {
    label: 'Inscrições Abertas',
    className: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
  },
  lotado: {
    label: 'Lotado',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
  },
  inscricoes_encerradas: {
    label: 'Insc. Encerradas',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
  },
  realizado: {
    label: 'Realizado',
    className: 'bg-blue-950/70 text-blue-300 border-blue-700/50',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-950/70 text-red-300 border-red-700/50',
  },
}

const RideStatusPill: React.FC<RideStatusBadgeProps> = ({ status }) => {
  const meta = RIDE_STATUS_META[status] || RIDE_STATUS_META.rascunho
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [regs, setRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [allUsers, allRides, allRegs] = await Promise.all([
        userService.getAllUsers(),
        rideService.getAllRides(),
        registrationService.getAllRegistrations().catch(() => [] as Registration[]),
      ])
      setUsers(allUsers)
      setRides(allRides)
      setRegs(allRegs)
    } catch (e) {
      console.error('Erro ao carregar dashboard admin:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    const totalMembers = users.length
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const newMembers = users.filter((u) => {
      const c = new Date(u.created).getTime()
      return !isNaN(c) && c >= thirtyDaysAgo
    }).length
    const activeMembers = users.filter((u) => u.status === 'ativo').length

    const upcomingRides = rides
      .filter((r) => !isRidePast(r.date) && r.status !== 'cancelado' && r.status !== 'realizado')
      .sort((a, b) => {
        const ta = new Date(a.date).getTime() || 0
        const tb = new Date(b.date).getTime() || 0
        return ta - tb
      })

    const nextRide = upcomingRides[0] || null

    const nextRideRegs = nextRide
      ? regs.filter((r) => r.ride === nextRide.id && r.status === 'confirmada')
      : []
    const nextRideBikes = nextRideRegs.length
    const nextRideParticipants = nextRideRegs.reduce((acc, r) => acc + (r.has_pillion ? 2 : 1), 0)
    const nextRideAvailable = nextRide ? Math.max(0, (nextRide.max_bikes || 0) - nextRideBikes) : 0

    const ridesDone = rides.filter((r) => r.status === 'realizado' || isRidePast(r.date)).length

    // Top 5 active members ranking (by checked_in rides count)
    const membersMap = new Map<
      string,
      {
        user: UserProfile
        attendedCount: number
        lastRideName: string
        lastRideDate: string
      }
    >()

    // Prepopulate registered member users
    users.forEach((u) => {
      membersMap.set(u.id, {
        user: u,
        attendedCount: 0,
        lastRideName: '—',
        lastRideDate: '',
      })
    })

    // Map rides for fast lookup
    const ridesMap = new Map<string, Ride>()
    rides.forEach((r) => ridesMap.set(r.id, r))

    regs.forEach((r) => {
      if (r.user && membersMap.has(r.user)) {
        const item = membersMap.get(r.user)!
        if (r.checked_in) {
          item.attendedCount += 1
          const rideObj = ridesMap.get(r.ride)
          if (rideObj) {
            const rideTs = new Date(rideObj.date).getTime() || 0
            const currentLastTs = item.lastRideDate ? new Date(item.lastRideDate).getTime() || 0 : 0
            if (rideTs >= currentLastTs) {
              item.lastRideName = rideObj.name
              item.lastRideDate = rideObj.date
            }
          }
        }
      }
    })

    const topActiveMembers = Array.from(membersMap.values())
      .filter((m) => m.attendedCount > 0)
      .sort((a, b) => b.attendedCount - a.attendedCount)
      .slice(0, 5)

    return {
      totalMembers,
      newMembers,
      activeMembers,
      nextRide,
      nextRideBikes,
      nextRideParticipants,
      nextRideAvailable,
      ridesDone,
      upcomingRides,
      topActiveMembers,
    }
  }, [users, rides, regs])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
          Painel Administrativo
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
          Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">Visão geral do Euro Motors Motorrad Club</p>
      </section>

      {/* Métricas principais */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Total de Membros"
          value={String(stats.totalMembers)}
          tone="blue"
        />
        <MetricCard
          icon={UserPlus}
          label="Novos Membros (30d)"
          value={String(stats.newMembers)}
          tone="emerald"
        />
        <MetricCard
          icon={UserCheck}
          label="Membros Ativos"
          value={String(stats.activeMembers)}
          tone="blue"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Passeios Realizados"
          value={String(stats.ridesDone)}
          tone="amber"
        />
      </section>

      {/* Próximo passeio — destaque */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
            Próximo Passeio
          </h2>
        </div>
        {stats.nextRide ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-white font-montserrat tracking-tight">
                  {stats.nextRide.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {formatDate(stats.nextRide.date)}
                  </span>
                  {stats.nextRide.destination && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {stats.nextRide.destination}
                    </span>
                  )}
                </div>
              </div>
              <RideStatusPill status={stats.nextRide.status} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat
                icon={Bike}
                label="Motos Inscritas"
                value={String(stats.nextRideBikes)}
                hint={`de ${stats.nextRide.max_bikes || 0} vagas`}
              />
              <MiniStat
                icon={Users2}
                label="Participantes"
                value={String(stats.nextRideParticipants)}
                hint="incl. garupas"
              />
              <MiniStat
                icon={Ticket}
                label="Vagas Disponíveis"
                value={String(stats.nextRideAvailable)}
                hint="restantes"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Nenhum passeio agendado no momento.</p>
        )}
      </section>

      {/* 🏆 MEMBROS MAIS ATIVOS - TOP 5 */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              🏆 Membros Mais Ativos (Top 5)
            </h2>
          </div>
          <Link
            to="/admin/reports"
            className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
          >
            VER RANKING COMPLETO <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.topActiveMembers.length === 0 ? (
          <div className="bg-[#0a0d14] border border-dashed border-[#1c2538] rounded-md p-6 text-center">
            <p className="text-xs text-slate-500">
              Nenhum check-in confirmado em passeios ainda. Os dados aparecerão conforme os
              check-ins forem realizados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.topActiveMembers.map((item, idx) => {
              const medals = ['🥇', '🥈', '🥉', '4º', '5º']
              const bikeLabel =
                [item.user.bike_brand, item.user.bike_model].filter(Boolean).join(' ') ||
                'Moto não inf.'

              return (
                <div
                  key={item.user.id}
                  className={`p-3.5 rounded-md border flex flex-col justify-between space-y-3 transition-all ${
                    idx === 0
                      ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400'
                      : idx === 1
                        ? 'bg-slate-800/30 border-slate-600/50 hover:border-slate-400'
                        : idx === 2
                          ? 'bg-amber-900/15 border-amber-700/40 hover:border-amber-500'
                          : 'bg-[#0a0d14] border-[#1c2538] hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xl leading-none font-bold">{medals[idx]}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 font-mono">
                      {item.attendedCount} {item.attendedCount === 1 ? 'passeio' : 'passeios'}
                    </span>
                  </div>

                  <div>
                    <h3
                      className="text-xs font-bold text-white font-montserrat truncate"
                      title={item.user.name}
                    >
                      {item.user.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5" title={bikeLabel}>
                      🏍️ {bikeLabel}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1c2538] text-[9px] text-slate-500">
                    <span
                      className="block text-slate-400 font-medium truncate"
                      title={item.lastRideName}
                    >
                      Último: {item.lastRideName}
                    </span>
                    {item.lastRideDate && (
                      <span className="font-mono text-slate-500">
                        {formatDate(item.lastRideDate)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Próximos passeios — lista */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Próximos Passeios
          </h2>
          <Link
            to="/admin/rides"
            className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
          >
            VER TODOS <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {stats.upcomingRides.length === 0 ? (
          <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-8 text-center">
            <p className="text-xs text-slate-500">Nenhum passeio agendado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.upcomingRides.slice(0, 6).map((ride) => {
              const rideRegs = regs.filter((r) => r.ride === ride.id && r.status === 'confirmada')
              const bikes = rideRegs.length
              const available = Math.max(0, (ride.max_bikes || 0) - bikes)
              return (
                <div
                  key={ride.id}
                  className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 space-y-3 hover:border-blue-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase font-montserrat line-clamp-1">
                      {ride.name}
                    </h3>
                    <RideStatusPill status={ride.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(ride.date)}
                    </span>
                    {ride.destination && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{ride.destination}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t border-[#1c2538] text-[11px]">
                    <span className="text-slate-400">
                      <span className="text-white font-bold">{bikes}</span> motos
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">
                      <span className="text-white font-bold">{available}</span> vagas
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

const MetricCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone: 'blue' | 'emerald' | 'amber'
}> = ({ icon: Icon, label, value, tone }) => {
  const toneClass =
    tone === 'emerald' ? 'text-emerald-400' : tone === 'amber' ? 'text-amber-400' : 'text-blue-400'
  return (
    <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-md bg-[#131b2b] border border-[#222e43] flex items-center justify-center">
          <Icon className={`w-4 h-4 ${toneClass}`} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-montserrat leading-tight">
          {label}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-white font-montserrat">{value}</p>
    </div>
  )
}

const MiniStat: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
}> = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-[#0a0d14] border border-[#1c2538] rounded-md p-3 space-y-1">
    <div className="flex items-center gap-1.5 text-slate-400">
      <Icon className="w-3.5 h-3.5 text-blue-500" />
      <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
        {label}
      </span>
    </div>
    <p className="text-lg font-extrabold text-white font-montserrat">{value}</p>
    {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
  </div>
)

export default AdminDashboard
