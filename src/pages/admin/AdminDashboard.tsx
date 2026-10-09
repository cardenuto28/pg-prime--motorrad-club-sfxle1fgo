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
import { exportDashboardPdf } from '@/lib/pdfExport'
import { exportDashboardExcel } from '@/lib/excelExport'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { FileText, FileSpreadsheet } from 'lucide-react'
import {
  calcularCategoriaMembro,
  calcularScoreCompleto,
  calcularEstatisticasMotosPorCategoria,
  CategoryBikeStats,
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
  const { toast } = useToast()
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

    // Estatísticas e Distribuição de Motos e Ranking de Compradores por Categoria
    const bikeCategoryStats = calcularEstatisticasMotosPorCategoria(users)

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
      bikeCategoryStats,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Painel Administrativo
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">Visão geral e métricas do PG PRIME CLUB</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => {
                exportDashboardExcel(stats, stats.topActiveMembers, stats.bikeCategoryStats)
                toast({
                  title: 'Excel Gerado',
                  description:
                    'Relatório do Dashboard exportado em XLSX com distribuição e ranking de motos.',
                })
              }}
              variant="outline"
              className="border-[#222c3f] bg-[#101622] text-emerald-400 hover:text-white hover:bg-emerald-950/40 text-xs gap-1.5 h-9"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> EXPORTAR EXCEL
            </Button>
            <Button
              onClick={() => {
                exportDashboardPdf(stats, stats.topActiveMembers, stats.bikeCategoryStats)
                toast({
                  title: 'PDF Gerado',
                  description:
                    'Relatório do Dashboard exportado em PDF com distribuição e ranking de motos.',
                })
              }}
              variant="outline"
              className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5 h-9"
            >
              <FileText className="w-4 h-4 text-blue-400" /> EXPORTAR PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Métricas principais */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          to="/admin/membros"
          icon={Users}
          label="Total de Membros"
          value={String(stats.totalMembers)}
          tone="blue"
        />
        <MetricCard
          to="/admin/membros"
          icon={UserPlus}
          label="Novos Membros no Mês"
          value={String(stats.newMembers)}
          tone="emerald"
        />
        <MetricCard
          to="/admin/membros?filtro=ATIVOS"
          icon={UserCheck}
          label="Membros Ativos"
          value={String(stats.activeMembers)}
          tone="blue"
        />
        <MetricCard
          to="/admin/rides"
          icon={CheckCircle2}
          label="Passeios Realizados"
          value={String(stats.ridesDone)}
          tone="amber"
        />
      </section>

      {/* Indicadores de Categorias PG PRIME CLUB */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-300 font-montserrat tracking-widest uppercase">
              Categorização de Membros
            </h2>
          </div>
          <Link
            to="/admin/membros"
            className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat transition-colors"
          >
            GERENCIAR MEMBROS <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/membros?filtro=PLATINUM"
            className="group bg-[#0a0d14] border border-blue-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-blue-500 hover:shadow-[0_0_15px_rgba(0,102,255,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-blue-400">
                <div className="flex items-center gap-1.5">
                  <Diamond className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Platinum (5+)
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.platinumCount}
              </p>
            </div>
            <span className="text-[9px] text-blue-400/70 group-hover:text-blue-300">
              Ver membros &rarr;
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=GOLD"
            className="group bg-[#0a0d14] border border-amber-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-amber-400">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Gold (3-4)
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.goldCount}
              </p>
            </div>
            <span className="text-[9px] text-amber-400/70 group-hover:text-amber-300">
              Ver membros &rarr;
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=PRATA"
            className="group bg-[#0a0d14] border border-slate-700/50 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-slate-400 hover:shadow-[0_0_15px_rgba(148,163,184,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Prata (1-2)
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.silverCount}
              </p>
            </div>
            <span className="text-[9px] text-slate-400 group-hover:text-slate-200">
              Ver membros &rarr;
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=BRONZE_ATIVO"
            className="group bg-[#0a0d14] border border-orange-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-orange-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Bronze Ativos
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.bronzeActiveCount}
              </p>
            </div>
            <span className="text-[9px] text-orange-400/70 group-hover:text-orange-300">
              Ver membros &rarr;
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=BRONZE_ATENCAO"
            className="group bg-amber-950/30 border border-amber-600/50 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-amber-400 hover:shadow-[0_0_15px_rgba(217,119,6,0.3)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-amber-400">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Bronze Atenção
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </div>
              <p className="text-xl font-black text-amber-300 font-montserrat mt-1">
                {stats.bronzeExpiringCount}
              </p>
            </div>
            <span className="text-[9px] text-amber-400/80 group-hover:text-amber-200">
              Vence em &le;30d
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=BRONZE_INATIVO"
            className="group bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-slate-500 hover:shadow-[0_0_15px_rgba(100,116,139,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Bronze Inativos
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </div>
              <p className="text-xl font-black text-slate-400 font-montserrat mt-1">
                {stats.bronzeInactiveCount}
              </p>
            </div>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-300">
              &gt;6 meses sem oficina
            </span>
          </Link>
        </div>
      </section>

      {/* 🏍️ DISTRIBUIÇÃO E RANKING DE MOTOS POR CATEGORIA (PLATINUM, GOLD, PRATA, BRONZE) */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2538] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white font-montserrat tracking-tight uppercase">
                Distribuição e Maiores Compradores por Categoria
              </h2>
              <p className="text-xs text-slate-400">
                Somatória de clientes por quantidade de motos e ranking dos maiores compradores
              </p>
            </div>
          </div>
          <Link
            to="/admin/reports"
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 font-montserrat"
          >
            RELATÓRIOS DETALHADOS <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PLATINUM */}
          <CategoryBikeCard
            category="PLATINUM"
            title="Platinum (5+ motos)"
            accentColor="blue"
            icon={Diamond}
            stats={stats.bikeCategoryStats.PLATINUM}
          />

          {/* GOLD */}
          <CategoryBikeCard
            category="GOLD"
            title="Gold (3-4 motos)"
            accentColor="amber"
            icon={Crown}
            stats={stats.bikeCategoryStats.GOLD}
          />

          {/* PRATA */}
          <CategoryBikeCard
            category="PRATA"
            title="Prata (1-2 motos)"
            accentColor="slate"
            icon={Star}
            stats={stats.bikeCategoryStats.PRATA}
          />

          {/* BRONZE */}
          <CategoryBikeCard
            category="BRONZE"
            title="Bronze (Oficina)"
            accentColor="orange"
            icon={Shield}
            stats={stats.bikeCategoryStats.BRONZE}
          />
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
          <Link
            to="/admin/membros"
            className="group bg-[#0a0d14] border border-cyan-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-cyan-400">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Score Médio de Oficina
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.scoreMembersCount > 0 ? (
                  <>
                    {stats.scoreMedio.toFixed(1)}
                    <span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </p>
            </div>
            <span className="text-[9px] text-slate-500 group-hover:text-cyan-300">
              {stats.scoreMembersCount} membro(s) com histórico
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=SCORE_85"
            className="group bg-[#0a0d14] border border-emerald-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Clientes Score 85+
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.scoreHigh85Count}
              </p>
            </div>
            <span className="text-[9px] text-emerald-400/80 group-hover:text-emerald-300">
              Alto valor pós-vendas
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=VIP_ATIVO"
            className="group bg-[#0a0d14] border border-emerald-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    VIP Ativos
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.vipAtivoCount}
              </p>
            </div>
            <span className="text-[9px] text-emerald-400/80 group-hover:text-emerald-300">
              GOLD/PLAT &amp; score ≥70
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=VIP_AFASTADO"
            className="group bg-[#0a0d14] border border-red-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-red-400">
                <div className="flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    VIP Afastados
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.vipAfastadoCount}
              </p>
            </div>
            <span className="text-[9px] text-red-400/80 group-hover:text-red-300">
              GOLD/PLAT &amp; score &lt;30
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=PROXIMO_GOLD"
            className="group bg-[#0a0d14] border border-blue-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-blue-500 hover:shadow-[0_0_15px_rgba(0,102,255,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-blue-400">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Próximos do Gold
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.proximoGoldCount}
              </p>
            </div>
            <span className="text-[9px] text-blue-400/80 group-hover:text-blue-300">
              Prata c/ 2 motos
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=PROXIMO_PLATINUM"
            className="group bg-[#0a0d14] border border-purple-900/40 rounded-lg p-3 space-y-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-purple-400">
                <div className="flex items-center gap-1.5">
                  <Diamond className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Próximos do Platinum
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.proximoPlatinumCount}
              </p>
            </div>
            <span className="text-[9px] text-purple-400/80 group-hover:text-purple-300">
              Gold c/ 4 motos
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=PRIMEIRA_PASSAGEM_PENDENTE"
            className="group bg-[#0a0d14] border border-orange-900/40 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-orange-400">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Primeira Passagem Pendente
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.primeiraPassagemPendenteCount}
              </p>
            </div>
            <span className="text-[9px] text-orange-400/80 group-hover:text-orange-300">
              Comprou, sem oficina
            </span>
          </Link>

          <Link
            to="/admin/membros?filtro=BRONZE_PROXIMO_VENCIMENTO"
            className="group bg-[#0a0d14] border border-amber-900/40 rounded-lg p-3 space-y-1 col-span-2 sm:col-span-1 cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-amber-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-montserrat">
                    Bronze Próximos do Vencimento
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </div>
              <p className="text-xl font-black text-white font-montserrat mt-1">
                {stats.bronzeProximoVencimentoCount}
              </p>
            </div>
            <span className="text-[9px] text-amber-400/80 group-hover:text-amber-300">
              Última passagem 5–6 meses
            </span>
          </Link>
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
              <Link to={`/admin/rides/${stats.nextRide.id}`} className="group flex-1">
                <h3 className="text-lg font-extrabold text-white font-montserrat tracking-tight group-hover:text-blue-400 transition-colors">
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
              </Link>
              <RideStatusPill status={stats.nextRide.status} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat
                to="/admin/registrations"
                icon={Bike}
                label="Motos Inscritas"
                value={String(stats.nextRideBikes)}
                hint={`de ${stats.nextRide.max_bikes || 0} vagas`}
              />
              <MiniStat
                to="/admin/registrations"
                icon={Users2}
                label="Participantes"
                value={String(stats.nextRideParticipants)}
                hint="incl. garupas"
              />
              <MiniStat
                to={`/admin/rides/${stats.nextRide.id}`}
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
                <Link
                  key={item.user.id}
                  to={`/admin/membros/${item.user.id}`}
                  className={`p-3.5 rounded-md border flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 hover:scale-[1.03] ${
                    idx === 0
                      ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : idx === 1
                        ? 'bg-slate-800/30 border-slate-600/50 hover:border-slate-400 hover:shadow-[0_0_15px_rgba(148,163,184,0.25)]'
                        : idx === 2
                          ? 'bg-amber-900/15 border-amber-700/40 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(217,119,6,0.25)]'
                          : 'bg-[#0a0d14] border-[#1c2538] hover:border-blue-500 hover:shadow-[0_0_15px_rgba(0,102,255,0.25)]'
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
                </Link>
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
                <Link
                  key={ride.id}
                  to={`/admin/rides/${ride.id}`}
                  className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 space-y-3 hover:border-blue-500/60 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(0,102,255,0.2)] transition-all cursor-pointer block group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase font-montserrat line-clamp-1 group-hover:text-blue-400 transition-colors">
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
                  <div className="flex items-center justify-between pt-2 border-t border-[#1c2538] text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">
                        <span className="text-white font-bold">{bikes}</span> motos
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">
                        <span className="text-white font-bold">{available}</span> vagas
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                      Ver passeio &rarr;
                    </span>
                  </div>
                </Link>
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
  to?: string
}> = ({ icon: Icon, label, value, tone, to }) => {
  const toneClass =
    tone === 'emerald' ? 'text-emerald-400' : tone === 'amber' ? 'text-amber-400' : 'text-blue-400'

  const content = (
    <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 space-y-2 group transition-all duration-200 hover:scale-[1.02] hover:border-blue-500/60 hover:shadow-[0_0_15px_rgba(0,102,255,0.2)] cursor-pointer h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-[#131b2b] border border-[#222e43] flex items-center justify-center group-hover:border-blue-500/40 transition-colors">
              <Icon className={`w-4 h-4 ${toneClass}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-montserrat leading-tight">
              {label}
            </span>
          </div>
          {to && (
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
          )}
        </div>
        <p className="text-2xl font-extrabold text-white font-montserrat mt-2">{value}</p>
      </div>
      {to && (
        <span className="text-[9px] text-slate-500 group-hover:text-blue-400 font-medium">
          Ver detalhes &rarr;
        </span>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    )
  }

  return content
}

const MiniStat: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
  to?: string
}> = ({ icon: Icon, label, value, hint, to }) => {
  const content = (
    <div
      className={`bg-[#0a0d14] border border-[#1c2538] rounded-md p-3 space-y-1 transition-all ${to ? 'cursor-pointer hover:border-blue-500/50 hover:scale-[1.02] hover:shadow-[0_0_10px_rgba(0,102,255,0.15)]' : ''}`}
    >
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

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    )
  }
  return content
}

interface CategoryBikeCardProps {
  category: 'PLATINUM' | 'GOLD' | 'PRATA' | 'BRONZE'
  title: string
  accentColor: 'blue' | 'amber' | 'slate' | 'orange'
  icon: React.ComponentType<{ className?: string }>
  stats: CategoryBikeStats
}

const CategoryBikeCard: React.FC<CategoryBikeCardProps> = ({
  category,
  title,
  accentColor,
  icon: Icon,
  stats,
}) => {
  const [showAllBuyers, setShowAllBuyers] = useState(false)

  const borderClass =
    accentColor === 'blue'
      ? 'border-blue-500/40 hover:border-blue-500'
      : accentColor === 'amber'
        ? 'border-amber-500/40 hover:border-amber-500'
        : accentColor === 'orange'
          ? 'border-orange-500/40 hover:border-orange-500'
          : 'border-slate-700 hover:border-slate-400'

  const titleColor =
    accentColor === 'blue'
      ? 'text-blue-400'
      : accentColor === 'amber'
        ? 'text-amber-400'
        : accentColor === 'orange'
          ? 'text-orange-400'
          : 'text-slate-300'

  const badgeBg =
    accentColor === 'blue'
      ? 'bg-blue-950/60 text-blue-300 border-blue-600/40'
      : accentColor === 'amber'
        ? 'bg-amber-950/60 text-amber-300 border-amber-600/40'
        : accentColor === 'orange'
          ? 'bg-orange-950/60 text-orange-300 border-orange-600/40'
          : 'bg-slate-800/80 text-slate-300 border-slate-600/50'

  const displayedBuyers = showAllBuyers ? stats.topBuyers : stats.topBuyers.slice(0, 5)

  return (
    <div
      className={`bg-[#0a0d14] border ${borderClass} rounded-lg p-4 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-sm`}
    >
      <div>
        {/* Header do Card */}
        <div className="flex items-center justify-between border-b border-[#1c2538] pb-3">
          <div className="flex items-center gap-1.5">
            <Icon className={`w-4 h-4 ${titleColor}`} />
            <h3
              className={`text-xs font-black uppercase font-montserrat tracking-wider ${titleColor}`}
            >
              {title}
            </h3>
          </div>
          <Link
            to={`/admin/membros?filtro=${category === 'PRATA' ? 'PRATA' : category}`}
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
            title="Ver no painel de membros"
          >
            Ver <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Resumo da Categoria: Clientes & Total de Motos */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-1">
          <div className="bg-[#0f1420] border border-[#1d2638] rounded p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-montserrat">
              Total Clientes
            </span>
            <p className="text-lg font-black text-white font-montserrat mt-0.5">
              {stats.totalMembers}
            </p>
          </div>
          <div className="bg-[#0f1420] border border-[#1d2638] rounded p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-montserrat">
              Total de Motos
            </span>
            <p className="text-lg font-black text-white font-montserrat mt-0.5">
              {stats.totalBikes}
            </p>
          </div>
        </div>

        {/* Distribuição: Clientes por Quantidade de Motos */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="uppercase tracking-wider font-montserrat flex items-center gap-1">
              📊 Distribuição de Motos
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              {stats.bikeDistribution.length} faixa(s)
            </span>
          </div>

          {stats.bikeDistribution.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-2 text-center bg-[#0d121c] rounded border border-[#1c2538]/60">
              Nenhum membro nesta categoria.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {stats.bikeDistribution.map((item) => {
                const percent = stats.totalMembers > 0 ? (item.count / stats.totalMembers) * 100 : 0
                return (
                  <div
                    key={item.bikes}
                    className="p-1.5 rounded bg-[#0d121c] border border-[#1c2538]/80 text-[11px] flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        <strong className="text-blue-400 font-mono">{item.count}</strong> cliente(s)
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${badgeBg} font-mono`}
                      >
                        {item.bikes} {item.bikes === 1 ? 'moto' : 'motos'}
                      </span>
                    </div>
                    {/* Barra de progresso proporcional */}
                    <div className="w-full bg-[#161f30] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Ranking dos Maiores Compradores */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="uppercase tracking-wider font-montserrat flex items-center gap-1">
              🏆 Maiores Compradores
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              Top {displayedBuyers.length} de {stats.topBuyers.length}
            </span>
          </div>

          {stats.topBuyers.length === 0 ? (
            <p className="text-[11px] text-slate-500 py-2 text-center bg-[#0d121c] rounded border border-[#1c2538]/60">
              Nenhum comprador cadastrado.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {displayedBuyers.map((buyer, idx) => (
                <Link
                  key={buyer.user.id}
                  to={`/admin/membros/${buyer.user.id}`}
                  className="p-2 rounded bg-[#0d121c] hover:bg-[#131b2c] border border-[#1c2538]/80 hover:border-blue-500/40 transition-colors flex items-center justify-between gap-2 block group"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 font-mono w-4 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {buyer.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {buyer.city ? `${buyer.city} · ` : ''}
                        {buyer.bikeModel || 'Moto PG PRIME'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-blue-400 font-mono block">
                      {buyer.motos} {buyer.motos === 1 ? 'moto' : 'motos'}
                    </span>
                    {buyer.totalValor > 0 && (
                      <span className="text-[9px] text-slate-500 block">
                        {buyer.totalValor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {stats.topBuyers.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAllBuyers(!showAllBuyers)}
          className="text-[10px] text-center w-full py-1 text-slate-400 hover:text-white uppercase font-bold tracking-wider transition-colors pt-2 border-t border-[#1c2538]"
        >
          {showAllBuyers ? 'Mostrar Menos' : `Ver todos os ${stats.topBuyers.length} compradores`}
        </button>
      )}
    </div>
  )
}

export default AdminDashboard
