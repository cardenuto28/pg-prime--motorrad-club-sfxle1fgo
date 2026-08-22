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
  StoreVisit,
  userService,
  rideService,
  registrationService,
  storeVisitService,
} from '@/services/api'
import { formatDate, isRidePast } from '@/lib/member'
import {
  calcularCategoriaMembro,
  calcularScoreCompleto,
  normalizeCategory,
  parseDateFlexible,
  mesesEntre,
} from '@/lib/membership'
import { CategoryBadge } from '@/components/CategoryBadge'
import {
  Shield,
  Diamond,
  Crown,
  Star,
  AlertTriangle,
  UserX,
  Gauge,
  TrendingUp,
  Clock,
} from 'lucide-react'

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
  const [storeVisits, setStoreVisits] = useState<StoreVisit[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [allUsers, allRides, allRegs, allVisits] = await Promise.all([
        userService.getAllUsers(),
        rideService.getAllRides(),
        registrationService.getAllRegistrations().catch(() => [] as Registration[]),
        storeVisitService.getAllVisits().catch(() => [] as StoreVisit[]),
      ])
      setUsers(allUsers)
      setRides(allRides)
      setRegs(allRegs)
      setStoreVisits(allVisits)
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

    // Contagem detalhada por categoria
    let platinumCount = 0
    let goldCount = 0
    let silverCount = 0
    let bronzeActiveCount = 0
    let bronzeExpiringCount = 0
    let bronzeInactiveCount = 0

    // PARTE 2/3.1 — contadores de Score de Oficina e Tags Inteligentes (dados REAIS)
    let scoreSum = 0
    let scoreMembersCount = 0 // membros que já têm score calculado (>0 ou com histórico de oficina)
    let scoreHigh85Count = 0
    let vipAtivoCount = 0
    let vipAfastadoCount = 0
    let proximoGoldCount = 0
    let proximoPlatinumCount = 0
    let primeiraPassagemPendenteCount = 0
    let bronzeProximoVencimentoCount = 0

    const agora = new Date()

    users.forEach((u) => {
      // Recalcula categoria/status usando os campos REAIS do banco (inclui bike_brand/model)
      const calc = calcularCategoriaMembro({
        quantidade_motos_compradas: u.quantidade_motos_compradas,
        data_ultima_passagem_oficina: u.data_ultima_passagem_oficina,
        status_membro_atual: u.status_membro || u.status,
        total_valor_vendido: u.total_valor_vendido,
        numero_passagens_oficina: u.numero_passagens_oficina,
        total_liquido_oficina: u.total_liquido_oficina,
        bike_brand: u.bike_brand,
        bike_model: u.bike_model,
        data_primeira_compra: u.data_primeira_compra,
      })

      // Categoria efetiva: prioriza o campo persistido no banco, senão usa o calculado.
      const effectiveCat = normalizeCategory(u.categoria || u.category || calc.categoria)

      if (effectiveCat === 'PLATINUM') platinumCount++
      else if (effectiveCat === 'GOLD') goldCount++
      else if (effectiveCat === 'SILVER') silverCount++
      else if (effectiveCat === 'BRONZE') {
        if (calc.status_membro === 'ATENCAO' || u.status_membro === 'ATENCAO') {
          bronzeExpiringCount++
        } else if (calc.status_membro === 'INATIVO' || u.status_membro === 'INATIVO') {
          bronzeInactiveCount++
        } else {
          bronzeActiveCount++
        }
      } else {
        bronzeInactiveCount++
      }

      // BRONZE PRÓXIMOS DO VENCIMENTO — Bronze cuja última passagem válida
      // está entre 5 e 6 meses atrás (janela de ATENÇÃO, antes de virar inativo).
      if (effectiveCat === 'BRONZE') {
        // data_ultima_passagem_valida (preferencial) ou data_ultima_passagem_oficina
        const rawPassagem = u.data_ultima_passagem_valida || u.data_ultima_passagem_oficina || ''
        const passagemDate = parseDateFlexible(rawPassagem)
        if (passagemDate) {
          const meses = mesesEntre(passagemDate, agora)
          if (meses >= 5 && meses <= 6) bronzeProximoVencimentoCount++
        }
      }

      // PARTE 3.1 — Score e Tags calculados a partir dos campos REAIS do banco.
      // Usa score_oficina persistido quando existe; senão recalcula on-the-fly.
      // para refletir importações recentes mesmo antes do snapshot ser salvo.
      let score = Number(u.score_oficina)
      const temScorePersistido =
        !isNaN(score) && score > 0 && u.data_ultimo_calculo && u.data_ultimo_calculo.trim() !== ''
      if (!temScorePersistido) {
        const recalc = calcularScoreCompleto({
          total_liquido_oficina: u.total_liquido_oficina,
          numero_passagens_oficina: u.numero_passagens_oficina,
          categoria_clube: calc.categoria_clube,
          total_veiculos_elegiveis: calc.total_veiculos_elegiveis,
          data_primeira_compra: u.data_primeira_compra,
          data_ultima_passagem_oficina: u.data_ultima_passagem_oficina,
        })
        score = recalc.score_oficina
      }
      if (isNaN(score)) score = 0

      // Só soma/média membros que efetivamente têm histórico de oficina
      // (passagens > 0 ou valor de oficina > 0). Membros sem nenhum histórico
      // não "puxam" a média para baixo nem contam como score baixo.
      const temHistoricoOficina =
        Number(u.numero_passagens_oficina || 0) > 0 || Number(u.total_liquido_oficina || 0) > 0
      if (temHistoricoOficina || temScorePersistido) {
        scoreSum += score
        scoreMembersCount++
      }
      if (score >= 85) scoreHigh85Count++

      // Tags Inteligentes — recalcadas dos campos REAIS
      const catClube = (calc.categoria_clube || '').toUpperCase()
      const totalVeiculos = Number(calc.total_veiculos_elegiveis || 0)
      const catIsVip = catClube === 'GOLD' || catClube === 'PLATINUM'

      if (catIsVip && score >= 70) vipAtivoCount++
      if (catIsVip && score < 30) vipAfastadoCount++
      if (catClube === 'PRATA' && totalVeiculos === 2) proximoGoldCount++
      if (catClube === 'GOLD' && totalVeiculos === 4) proximoPlatinumCount++

      // PRIMEIRA PASSAGEM PENDENTE — data_venda preenchida (data_primeira_compra)
      // e ultima_data_oficina vazia, sem passagens registradas.
      const temVenda = !!(u.data_primeira_compra && String(u.data_primeira_compra).trim())
      const semOficina = !(
        u.data_ultima_passagem_oficina && String(u.data_ultima_passagem_oficina).trim()
      )
      const semPassagens = !Number(u.numero_passagens_oficina || 0)
      if (temVenda && semOficina && semPassagens) primeiraPassagemPendenteCount++
    })

    const scoreMedio = scoreMembersCount > 0 ? scoreSum / scoreMembersCount : 0

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

    // Top 5 active members ranking (by total points: (rides × 100) + (store_visits × 10))
    const membersMap = new Map<
      string,
      {
        user: UserProfile
        attendedCount: number
        storeVisitsCount: number
        totalPoints: number
        lastRideName: string
        lastRideDate: string
        category: string
      }
    >()

    // Prepopulate registered member users
    users.forEach((u) => {
      const calc = calcularCategoriaMembro({
        quantidade_motos_compradas: u.quantidade_motos_compradas,
        data_ultima_passagem_oficina: u.data_ultima_passagem_oficina,
        status_membro_atual: u.status_membro || u.status,
        total_valor_vendido: u.total_valor_vendido,
        numero_passagens_oficina: u.numero_passagens_oficina,
        total_liquido_oficina: u.total_liquido_oficina,
        bike_brand: u.bike_brand,
        bike_model: u.bike_model,
        data_primeira_compra: u.data_primeira_compra,
      })
      const cat = normalizeCategory(u.categoria || u.category || calc.categoria)

      membersMap.set(u.id, {
        user: u,
        attendedCount: 0,
        storeVisitsCount: 0,
        totalPoints: 0,
        lastRideName: '—',
        lastRideDate: '',
        category: cat,
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

    // Map store visits
    storeVisits.forEach((sv) => {
      if (sv.user && membersMap.has(sv.user)) {
        const item = membersMap.get(sv.user)!
        item.storeVisitsCount += 1
      }
    })

    // Compute total points
    membersMap.forEach((item) => {
      item.totalPoints = item.attendedCount * 100 + item.storeVisitsCount * 10
    })

    const topActiveMembers = Array.from(membersMap.values())
      .filter((m) => m.totalPoints > 0 || m.attendedCount > 0 || m.storeVisitsCount > 0)
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints
        }
        return b.attendedCount - a.attendedCount
      })
      .slice(0, 5)

    return {
      totalMembers,
      newMembers,
      activeMembers,
      platinumCount,
      goldCount,
      silverCount,
      bronzeActiveCount,
      bronzeExpiringCount,
      bronzeInactiveCount,
      // PARTE 2/3.1 — Score e Tags
      scoreMedio,
      scoreMembersCount,
      scoreHigh85Count,
      vipAtivoCount,
      vipAfastadoCount,
      proximoGoldCount,
      proximoPlatinumCount,
      primeiraPassagemPendenteCount,
      bronzeProximoVencimentoCount,
      nextRide,
      nextRideBikes,
      nextRideParticipants,
      nextRideAvailable,
      ridesDone,
      upcomingRides,
      topActiveMembers,
    }
  }, [users, rides, regs, storeVisits])

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
          label="Novos Membros no Mês"
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

      {/* Indicadores de Categorias Euro Motors Club */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              Categorização de Membros
            </h2>
          </div>
          <Link
            to="/admin/members"
            className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
          >
            GERENCIAR MEMBROS <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0a0d14] border border-blue-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400">
              <Diamond className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Platinum (5+)
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">{stats.platinumCount}</p>
          </div>

          <div className="bg-[#0a0d14] border border-amber-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Crown className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Gold (3-4)
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">{stats.goldCount}</p>
          </div>

          <div className="bg-[#0a0d14] border border-slate-700/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Star className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Prata (1-2)
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">{stats.silverCount}</p>
          </div>

          <div className="bg-[#0a0d14] border border-orange-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-orange-400">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Bronze Ativos
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.bronzeActiveCount}
            </p>
          </div>

          <div className="bg-amber-950/30 border border-amber-600/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Bronze Atenção
              </span>
            </div>
            <p className="text-xl font-black text-amber-300 font-montserrat">
              {stats.bronzeExpiringCount}
            </p>
            <span className="text-[9px] text-amber-400/80">Vence em &le;30d</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <UserX className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Bronze Inativos
              </span>
            </div>
            <p className="text-xl font-black text-slate-400 font-montserrat">
              {stats.bronzeInactiveCount}
            </p>
            <span className="text-[9px] text-slate-500">&gt;6 meses sem oficina</span>
          </div>
        </div>
      </section>

      {/* PARTE 2 — Indicadores de Score de Oficina e Inteligência de Relacionamento */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              Score de Oficina &amp; Inteligência de Relacionamento
            </h2>
          </div>
          <Link
            to="/admin/score-config"
            className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
          >
            ⚙️ CONFIGURAR FAIXAS <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="bg-[#0a0d14] border border-cyan-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Gauge className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Score Médio de Oficina
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.scoreMembersCount > 0 ? (
                <>
                  {stats.scoreMedio.toFixed(1)}
                  <span className="text-[10px] text-slate-500 font-normal">/100</span>
                </>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </p>
            <span className="text-[9px] text-slate-500">
              {stats.scoreMembersCount} membro(s) com histórico
            </span>
          </div>
          <div className="bg-[#0a0d14] border border-emerald-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Clientes Score 85+
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.scoreHigh85Count}
            </p>
            <span className="text-[9px] text-emerald-400/80">Alto valor pós-vendas</span>
          </div>

          <div className="bg-[#0a0d14] border border-emerald-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Crown className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                VIP Ativos
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">{stats.vipAtivoCount}</p>
            <span className="text-[9px] text-emerald-400/80">GOLD/PLAT &amp; score ≥70</span>
          </div>

          <div className="bg-[#0a0d14] border border-red-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-red-400">
              <UserX className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                VIP Afastados
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.vipAfastadoCount}
            </p>
            <span className="text-[9px] text-red-400/80">GOLD/PLAT &amp; score &lt;30</span>
          </div>

          <div className="bg-[#0a0d14] border border-blue-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400">
              <Star className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Próximos do Gold
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.proximoGoldCount}
            </p>
            <span className="text-[9px] text-blue-400/80">Prata c/ 2 motos</span>
          </div>

          <div className="bg-[#0a0d14] border border-purple-900/40 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-400">
              <Diamond className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Próximos do Platinum
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.proximoPlatinumCount}
            </p>
            <span className="text-[9px] text-purple-400/80">Gold c/ 4 motos</span>
          </div>

          <div className="bg-[#0a0d14] border border-orange-900/40 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-orange-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Primeira Passagem Pendente
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.primeiraPassagemPendenteCount}
            </p>
            <span className="text-[9px] text-orange-400/80">Comprou, sem oficina</span>
          </div>

          <div className="bg-[#0a0d14] border border-amber-900/40 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                Bronze Próximos do Vencimento
              </span>
            </div>
            <p className="text-xl font-black text-white font-montserrat">
              {stats.bronzeProximoVencimentoCount}
            </p>
            <span className="text-[9px] text-amber-400/80">Última passagem 5–6 meses</span>
          </div>
        </div>
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

      {/* 🏆 TOP MEMBROS - RANKING POR TOTAL DE PONTOS */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              🏆 TOP MEMBROS (Ranking por Pontos)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/qrcode-loja"
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 font-montserrat"
            >
              QR CODE LOJA <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/reports"
              className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
            >
              VER RANKING COMPLETO <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {stats.topActiveMembers.length === 0 ? (
          <div className="bg-[#0a0d14] border border-dashed border-[#1c2538] rounded-md p-6 text-center">
            <p className="text-xs text-slate-500">
              Nenhum check-in em passeios ou visita na loja registrado ainda. Os pontos serão
              calculados automaticamente (Passeio = 100 pts, Loja = 10 pts).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.topActiveMembers.map((item, idx) => {
              const medals = ['🥇 1º', '🥈 2º', '🥉 3º', '4º', '5º']

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
                    <span className="text-base leading-none font-bold font-mono text-white">
                      {medals[idx]}
                    </span>
                    <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/50 font-mono">
                      {item.totalPoints} PTS
                    </span>
                  </div>

                  <div>
                    <h3
                      className="text-xs font-bold text-white font-montserrat truncate"
                      title={item.user.name}
                    >
                      {item.user.name}
                    </h3>
                    <div className="mt-1">
                      <CategoryBadge category={item.category} size="sm" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1c2538] space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>🏍️ Passeios (100 pts):</span>
                      <strong className="text-emerald-400 font-mono">{item.attendedCount}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>🏬 Visitas Loja (10 pts):</span>
                      <strong className="text-blue-400 font-mono">{item.storeVisitsCount}</strong>
                    </div>
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
