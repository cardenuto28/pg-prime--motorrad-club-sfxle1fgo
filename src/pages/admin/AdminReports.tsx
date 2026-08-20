import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  Bike,
  ClipboardList,
  Download,
  CalendarRange,
  Trophy,
  BarChart3,
  FileText,
} from 'lucide-react'
import {
  UserProfile,
  Ride,
  Registration,
  userService,
  rideService,
  registrationService,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/member'
import { RideStatusBadge } from '@/lib/ride'
import { exportActiveRankingPdf } from '@/lib/pdfExport'
import { CategoryBadge } from '@/components/CategoryBadge'
import { Sparkles, Crown, Star, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminReports: React.FC = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [u, r, regs] = await Promise.all([
        userService.getAllUsers(),
        rideService.getAllRides(),
        registrationService.getAllRegistrations(),
      ])
      setUsers(u)
      setRides(r)
      setRegistrations(regs)
    } catch (e) {
      console.error('Erro ao carregar relatórios:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados dos relatórios.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  // Parse a date string (DD/MM/YYYY or ISO) to a timestamp
  const parseDate = (value?: string): number => {
    if (!value) return NaN
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split('/').map(Number)
      return new Date(y, m - 1, d).getTime()
    }
    const d = new Date(value)
    return isNaN(d.getTime()) ? NaN : d.getTime()
  }

  const startTs = startDate ? parseDate(startDate) : NaN
  const endTs = endDate ? parseDate(endDate) + 24 * 60 * 60 * 1000 - 1 : NaN

  const inPeriod = (value?: string): boolean => {
    if (!startDate && !endDate) return true
    const ts = parseDate(value)
    if (isNaN(ts)) return false
    if (!isNaN(startTs) && ts < startTs) return false
    if (!isNaN(endTs) && ts > endTs) return false
    return true
  }

  // Filtered datasets based on the period
  const filteredUsers = useMemo(() => {
    if (!startDate && !endDate) return users
    return users.filter((u) => inPeriod(u.created))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, startDate, endDate])

  const filteredRides = useMemo(() => {
    if (!startDate && !endDate) return rides
    return rides.filter((r) => inPeriod(r.date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rides, startDate, endDate])

  const filteredRegistrations = useMemo(() => {
    if (!startDate && !endDate) return registrations
    return registrations.filter((r) => inPeriod(r.created))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrations, startDate, endDate])

  // Metrics
  const totalMembers = users.length
  const newMembers30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return users.filter((u) => {
      const ts = parseDate(u.created)
      return !isNaN(ts) && ts >= cutoff
    }).length
  }, [users])
  const activeMembers = users.filter((u) => u.status === 'ativo').length
  const totalRidesDone = rides.filter((r) => r.status === 'realizado').length
  const totalRegistrations = filteredRegistrations.length

  // 🎯 Oportunidades de Upgrade:
  // 1. "PRATA próximo do GOLD": membros com 2 motos compradas
  // 2. "GOLD próximo do PLATINUM": membros com 4 motos compradas
  const prataProximoGold = useMemo(() => {
    return users.filter((u) => Number(u.quantidade_motos_compradas) === 2)
  }, [users])

  const goldProximoPlatinum = useMemo(() => {
    return users.filter((u) => Number(u.quantidade_motos_compradas) === 4)
  }, [users])

  // Members by city
  const byCity = useMemo(() => {
    const map = new Map<string, number>()
    filteredUsers.forEach((u) => {
      const key = (u.city || 'Não informado').trim() || 'Não informado'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredUsers])

  // Members by bike model
  const byBike = useMemo(() => {
    const map = new Map<string, number>()
    filteredUsers.forEach((u) => {
      const model = (u.bike_model || '').trim()
      const brand = (u.bike_brand || '').trim()
      const key = [brand, model].filter(Boolean).join(' ') || 'Não informado'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([bike, count]) => ({ bike, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredUsers])

  // Ranking de Membros Mais Ativos (Top 10 ou mais)
  const activeRanking = useMemo(() => {
    const ridesMap = new Map<string, Ride>()
    rides.forEach((r) => ridesMap.set(r.id, r))

    const map = new Map<
      string,
      {
        user: UserProfile
        totalRegistered: number
        totalAttended: number
        lastRideName: string
        lastRideDate: string
      }
    >()

    users.forEach((u) => {
      map.set(u.id, {
        user: u,
        totalRegistered: 0,
        totalAttended: 0,
        lastRideName: '—',
        lastRideDate: '',
      })
    })

    registrations.forEach((reg) => {
      if (reg.user && map.has(reg.user) && reg.status === 'confirmada') {
        const item = map.get(reg.user)!
        item.totalRegistered += 1
        if (reg.checked_in) {
          item.totalAttended += 1
          const rideObj = ridesMap.get(reg.ride)
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

    return Array.from(map.values())
      .filter((m) => m.totalRegistered > 0 || m.totalAttended > 0)
      .map((m) => {
        const rate =
          m.totalRegistered > 0 ? Math.round((m.totalAttended / m.totalRegistered) * 100) : 0
        return {
          ...m,
          rate,
          bikeLabel: [m.user.bike_brand, m.user.bike_model].filter(Boolean).join(' ') || '—',
        }
      })
      .sort((a, b) => {
        if (b.totalAttended !== a.totalAttended) {
          return b.totalAttended - a.totalAttended
        }
        return b.rate - a.rate
      })
  }, [users, registrations, rides])

  // Frequência mensal nos últimos 12 meses
  const monthlyFrequency = useMemo(() => {
    const months: { key: string; label: string; count: number; riders: number }[] = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      months.push({ key: monthKey, label: label.toUpperCase(), count: 0, riders: 0 })
    }

    const monthMap = new Map<string, { count: number; riders: number }>()
    months.forEach((m) => monthMap.set(m.key, { count: 0, riders: 0 }))

    // Count rides in month
    rides.forEach((r) => {
      if (!r.date) return
      const d = new Date(r.date)
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (monthMap.has(key)) {
        monthMap.get(key)!.count += 1
      }
    })

    // Count confirmed check-ins or registrations
    registrations.forEach((reg) => {
      if (!reg.created || reg.status !== 'confirmada') return
      const d = new Date(reg.created)
      if (isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (monthMap.has(key)) {
        monthMap.get(key)!.riders += 1
      }
    })

    return months.map((m) => ({
      ...m,
      count: monthMap.get(m.key)?.count || 0,
      riders: monthMap.get(m.key)?.riders || 0,
    }))
  }, [rides, registrations])

  // Rides with registrations
  const ridesWithRegs = useMemo(() => {
    return filteredRides.map((ride) => {
      const regs = registrations.filter(
        (reg) => reg.ride === ride.id && reg.status === 'confirmada',
      )
      const bikes = regs.length
      const participants = regs.reduce((acc, reg) => acc + (reg.has_pillion ? 2 : 1), 0)
      const max = ride.max_bikes || 0
      const occupancy = max > 0 ? Math.round((bikes / max) * 100) : 0
      return { ride, bikes, participants, occupancy }
    })
  }, [filteredRides, registrations])

  const exportCsv = (rows: (string | number)[][], filename: string) => {
    if (rows.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há dados para exportar nesta tabela.',
        variant: 'destructive',
      })
      return
    }
    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? '')
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
              return `"${s.replace(/"/g, '""')}"`
            }
            return s
          })
          .join(','),
      )
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Exportação concluída', description: `${filename} baixado.` })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
          Painel Administrativo
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
          Relatórios
        </h1>
      </section>

      {/* Filtro por período */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase tracking-widest font-montserrat">
            <CalendarRange className="w-4 h-4 text-blue-500" />
            Filtrar por período
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider">Início</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 w-44"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider">Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 w-44"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStartDate('')
                setEndDate('')
              }}
              className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs h-9"
            >
              Limpar
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <MetricCard
              icon={<Users className="w-4 h-4" />}
              label="Total de membros"
              value={totalMembers}
            />
            <MetricCard
              icon={<UserPlus className="w-4 h-4" />}
              label="Novos (30 dias)"
              value={newMembers30}
            />
            <MetricCard
              icon={<UserCheck className="w-4 h-4" />}
              label="Ativos"
              value={activeMembers}
            />
            <MetricCard
              icon={<Bike className="w-4 h-4" />}
              label="Passeios realizados"
              value={totalRidesDone}
            />
            <MetricCard
              icon={<ClipboardList className="w-4 h-4" />}
              label="Inscrições"
              value={totalRegistrations}
            />
          </section>

          {/* 🎯 RELATÓRIO DE OPORTUNIDADES COMERCIAIS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-montserrat">
                🎯 Relatório de Oportunidades de Upgrade de Categoria
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Card Oportunidade 1: Prata -> Gold */}
              <div className="bg-[#0e131d] border border-amber-500/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1c2538] pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-montserrat">
                      Prata Próximo do Gold
                    </span>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50">
                    {prataProximoGold.length} clientes (2 motos)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Clientes com 2 motocicletas adquiridas. Falta apenas{' '}
                  <strong>1 motocicleta</strong> para atingir a categoria <strong>GOLD</strong>.
                </p>

                {prataProximoGold.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Nenhum membro elegível no momento.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {prataProximoGold.map((u) => (
                      <div
                        key={u.id}
                        className="p-2.5 rounded bg-[#0a0d14] border border-[#1c2538] flex items-center justify-between text-xs hover:border-amber-500/40"
                      >
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {u.email} · {u.phone || 'Sem tel'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                            +1 para GOLD
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Oportunidade 2: Gold -> Platinum */}
              <div className="bg-[#0e131d] border border-blue-500/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1c2538] pb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-montserrat">
                      Gold Próximo do Platinum
                    </span>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-600/50">
                    {goldProximoPlatinum.length} clientes (4 motos)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Clientes com 4 motocicletas adquiridas. Falta apenas{' '}
                  <strong>1 motocicleta</strong> para atingir o nível máximo{' '}
                  <strong>PLATINUM</strong>.
                </p>

                {goldProximoPlatinum.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Nenhum membro elegível no momento.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {goldProximoPlatinum.map((u) => (
                      <div
                        key={u.id}
                        className="p-2.5 rounded bg-[#0a0d14] border border-[#1c2538] flex items-center justify-between text-xs hover:border-blue-500/40"
                      >
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {u.email} · {u.phone || 'Sem tel'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-blue-400 font-bold bg-blue-950/50 px-2 py-0.5 rounded border border-blue-800/40">
                            +1 para PLATINUM
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 🏆 RANKING DE MEMBROS MAIS ATIVOS */}
          <ReportTable
            title="🏆 Ranking de Membros Mais Ativos"
            headers={[
              'Posição',
              'Membro',
              'Moto',
              'Total Comparecido',
              'Taxa Presença',
              'Último Passeio',
            ]}
            onExportPdf={() => {
              if (activeRanking.length === 0) {
                toast({
                  title: 'Sem dados',
                  description: 'Não há dados de ranking para exportar.',
                  variant: 'destructive',
                })
                return
              }
              exportActiveRankingPdf(activeRanking)
              toast({
                title: 'PDF Gerado',
                description: 'Ranking de membros mais ativos exportado em PDF.',
              })
            }}
            onExport={() =>
              exportCsv(
                [
                  [
                    'Posição',
                    'Nome',
                    'Email',
                    'Moto',
                    'Total Comparecido',
                    'Total Inscrito',
                    'Taxa Comparecimento (%)',
                    'Último Passeio',
                    'Data Último Passeio',
                  ],
                  ...activeRanking.map((item, idx) => [
                    idx + 1,
                    item.user.name,
                    item.user.email,
                    item.bikeLabel,
                    item.totalAttended,
                    item.totalRegistered,
                    `${item.rate}%`,
                    item.lastRideName,
                    item.lastRideDate ? formatDate(item.lastRideDate) : '—',
                  ]),
                ],
                'ranking-membros-mais-ativos.csv',
              )
            }
          >
            {' '}
            {activeRanking.length === 0 ? (
              <EmptyRow colSpan={6} />
            ) : (
              activeRanking.map((item, idx) => {
                const medals = ['🥇 1º', '🥈 2º', '🥉 3º']
                const posLabel = idx < 3 ? medals[idx] : `${idx + 1}º`
                return (
                  <tr
                    key={item.user.id}
                    className={`border-b border-[#161e2c] last:border-0 hover:bg-[#11172250] ${
                      idx === 0 ? 'bg-amber-950/15' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-xs font-bold text-white font-mono">{posLabel}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-white block">{item.user.name}</span>
                      <span className="text-[10px] text-slate-500 block">{item.user.email}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{item.bikeLabel}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400 font-bold font-mono">
                      {item.totalAttended} passeios ({item.totalRegistered} inscritos)
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                          item.rate >= 80
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                            : item.rate >= 50
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                              : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <span className="block text-slate-300 font-medium truncate max-w-xs">
                        {item.lastRideName}
                      </span>
                      {item.lastRideDate && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDate(item.lastRideDate)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </ReportTable>

          {/* 📊 FREQUÊNCIA MENSAL (ÚLTIMOS 12 MESES) */}
          <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-widest font-montserrat">
                  Frequência Mensal de Passeios (Últimos 12 meses)
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportCsv(
                    [
                      ['Mês', 'Passeios Realizados', 'Total Inscrições'],
                      ...monthlyFrequency.map((m) => [m.label, m.count, m.riders]),
                    ],
                    'frequencia-mensal-passeios.csv',
                  )
                }
                className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-[11px] h-8 gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {monthlyFrequency.map((m) => (
                <div
                  key={m.key}
                  className="bg-[#0a0d14] border border-[#1c2538] rounded-md p-3 text-center space-y-1 hover:border-blue-600/40 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider block font-montserrat">
                    {m.label}
                  </span>
                  <p className="text-xl font-black text-white font-mono">{m.count}</p>
                  <span className="text-[9px] text-slate-500 block">{m.riders} inscrições</span>
                </div>
              ))}
            </div>
          </section>
          {/* Members by city */}
          <ReportTable
            title="Membros por cidade"
            headers={['Cidade', 'Membros']}
            onExport={() =>
              exportCsv(
                [['Cidade', 'Membros'], ...byCity.map((c) => [c.city, c.count])],
                'membros-por-cidade.csv',
              )
            }
          >
            {byCity.length === 0 ? (
              <EmptyRow colSpan={2} />
            ) : (
              byCity.map((row) => (
                <tr key={row.city} className="border-b border-[#161e2c] last:border-0">
                  <td className="px-4 py-3 text-xs text-slate-300">{row.city}</td>
                  <td className="px-4 py-3 text-xs text-white font-bold text-right">{row.count}</td>
                </tr>
              ))
            )}
          </ReportTable>

          {/* Members by bike model */}
          <ReportTable
            title="Membros por modelo de moto"
            headers={['Moto', 'Membros']}
            onExport={() =>
              exportCsv(
                [['Moto', 'Membros'], ...byBike.map((b) => [b.bike, b.count])],
                'membros-por-moto.csv',
              )
            }
          >
            {byBike.length === 0 ? (
              <EmptyRow colSpan={2} />
            ) : (
              byBike.map((row) => (
                <tr key={row.bike} className="border-b border-[#161e2c] last:border-0">
                  <td className="px-4 py-3 text-xs text-slate-300">{row.bike}</td>
                  <td className="px-4 py-3 text-xs text-white font-bold text-right">{row.count}</td>
                </tr>
              ))
            )}
          </ReportTable>

          {/* Rides with registrations */}
          <ReportTable
            title="Passeios com inscrições"
            headers={['Passeio', 'Data', 'Status', 'Motos', 'Participantes', 'Ocupação']}
            onExport={() =>
              exportCsv(
                [
                  ['Passeio', 'Data', 'Status', 'Motos', 'Participantes', 'Ocupação (%)'],
                  ...ridesWithRegs.map((r) => [
                    r.ride.name,
                    formatDate(r.ride.date),
                    r.ride.status,
                    r.bikes,
                    r.participants,
                    r.occupancy,
                  ]),
                ],
                'passeios-inscricoes.csv',
              )
            }
          >
            {ridesWithRegs.length === 0 ? (
              <EmptyRow colSpan={6} />
            ) : (
              ridesWithRegs.map((r) => (
                <tr key={r.ride.id} className="border-b border-[#161e2c] last:border-0">
                  <td className="px-4 py-3 text-xs font-bold text-white">{r.ride.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(r.ride.date)}</td>
                  <td className="px-4 py-3">
                    <RideStatusBadge status={r.ride.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">{r.bikes}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{r.participants}</td>
                  <td className="px-4 py-3 text-xs text-right">
                    <span
                      className={`font-bold ${
                        r.occupancy >= 100
                          ? 'text-red-400'
                          : r.occupancy >= 70
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }`}
                    >
                      {r.occupancy}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </ReportTable>
        </>
      )}
    </div>
  )
}

/* ---------- helpers ---------- */

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({
  icon,
  label,
  value,
}) => (
  <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex flex-col gap-2">
    <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
        {label}
      </p>
      <p className="text-xl font-extrabold text-white font-montserrat">{value}</p>
    </div>
  </div>
)

const ReportTable: React.FC<{
  title: string
  headers: string[]
  onExport: () => void
  onExportPdf?: () => void
  children: React.ReactNode
}> = ({ title, headers, onExport, onExportPdf, children }) => (
  <section className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c2538]">
      <h2 className="text-xs font-extrabold text-white uppercase tracking-widest font-montserrat">
        {title}
      </h2>
      <div className="flex items-center gap-1.5">
        {onExportPdf && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="border-[#222c3f] bg-[#101622] text-blue-300 hover:text-white text-[11px] h-8 gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" /> PDF
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-[11px] h-8 gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </Button>
      </div>
    </div>{' '}
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#1c2538] bg-[#0a0d14]">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-montserrat ${
                  i === headers.length - 1 ? 'text-right' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  </section>
)

const EmptyRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="py-10 text-center text-xs text-slate-500">
      Nenhum dado encontrado para o período selecionado.
    </td>
  </tr>
)

export default AdminReports
