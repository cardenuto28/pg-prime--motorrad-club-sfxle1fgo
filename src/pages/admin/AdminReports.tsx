import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  Bike,
  ClipboardList,
  Download,
  CalendarRange,
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
  children: React.ReactNode
}> = ({ title, headers, onExport, children }) => (
  <section className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c2538]">
      <h2 className="text-xs font-extrabold text-white uppercase tracking-widest font-montserrat">
        {title}
      </h2>
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-[11px] h-8 gap-1.5"
      >
        <Download className="w-3.5 h-3.5" /> CSV
      </Button>
    </div>
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
