import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Search, Download, CheckCircle2, Ban, ChevronLeft, ChevronRight } from 'lucide-react'
import { Registration, registrationService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/member'
import { RegStatusBadge } from '@/lib/ride'

const PAGE_SIZE = 10

type StatusFilter = 'todas' | 'confirmada' | 'cancelada' | 'pendente'

const AdminRegistrations: React.FC = () => {
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await registrationService.getAllRegistrations()
      setRegistrations(all)
    } catch (e) {
      console.error('Erro ao carregar inscrições:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as inscrições.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return registrations.filter((reg) => {
      if (statusFilter !== 'todas' && reg.status !== statusFilter) return false
      if (!q) return true
      const participantName = (reg.expand?.user?.name || '').toLowerCase()
      const rideName = (reg.expand?.ride?.name || '').toLowerCase()
      return participantName.includes(q) || rideName.includes(q)
    })
  }, [registrations, search, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const updateLocal = (id: string, patch: Partial<Registration>) => {
    setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const handleConfirm = async (reg: Registration) => {
    setActionLoading(reg.id)
    try {
      const updated = await registrationService.updateRegistrationStatus(reg.id, 'confirmada')
      updateLocal(reg.id, { status: updated.status })
      toast({
        title: 'Inscrição confirmada',
        description: 'O participante foi confirmado com sucesso.',
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível confirmar a inscrição.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (reg: Registration) => {
    setActionLoading(reg.id)
    try {
      const updated = await registrationService.updateRegistrationStatus(reg.id, 'cancelada')
      updateLocal(reg.id, { status: updated.status })
      toast({
        title: 'Inscrição cancelada',
        description: 'A inscrição foi cancelada.',
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a inscrição.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há inscrições para exportar.',
        variant: 'destructive',
      })
      return
    }
    const rows: (string | number)[][] = [
      [
        'Participante',
        'Passeio',
        'Data do passeio',
        'Garupa',
        'Pessoas',
        'Status',
        'Data da inscrição',
      ],
      ...filtered.map((reg) => [
        reg.expand?.user?.name || '—',
        reg.expand?.ride?.name || '—',
        formatDate(reg.expand?.ride?.date),
        reg.has_pillion ? 'Sim' : 'Não',
        reg.has_pillion ? 2 : 1,
        reg.status,
        formatDate(reg.created),
      ]),
    ]
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
    a.download = 'inscricoes.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Exportação concluída', description: 'inscricoes.csv baixado.' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Gestão de Inscrições
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Inscrições nos Passeios
            </h1>
          </div>
          <Button
            onClick={exportCsv}
            variant="outline"
            className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5 h-9"
          >
            <Download className="w-4 h-4" /> EXPORTAR CSV
          </Button>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por participante ou passeio..."
            className="pl-9 bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-10 w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
            <SelectItem value="todas" className="text-xs">
              Todas
            </SelectItem>
            <SelectItem value="confirmada" className="text-xs">
              Confirmada
            </SelectItem>
            <SelectItem value="cancelada" className="text-xs">
              Cancelada
            </SelectItem>
            <SelectItem value="pendente" className="text-xs">
              Pendente
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1c2538] bg-[#0a0d14]">
                <Th>Participante</Th>
                <Th>Passeio</Th>
                <Th>Data do passeio</Th>
                <Th>Garupa</Th>
                <Th>Pessoas</Th>
                <Th>Status</Th>
                <Th>Inscrito em</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    Nenhuma inscrição encontrada.
                  </td>
                </tr>
              ) : (
                pageItems.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-[#161e2c] last:border-0 hover:bg-[#11172250]"
                  >
                    <td className="px-4 py-3 text-xs font-bold text-white">
                      {reg.expand?.user?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      {reg.expand?.ride?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDate(reg.expand?.ride?.date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {reg.has_pillion ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{reg.has_pillion ? 2 : 1}</td>
                    <td className="px-4 py-3">
                      <RegStatusBadge status={reg.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(reg.created)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {reg.status === 'pendente' && (
                          <ActionBtn
                            title="Confirmar inscrição"
                            disabled={actionLoading === reg.id}
                            onClick={() => handleConfirm(reg)}
                            className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </ActionBtn>
                        )}
                        {reg.status !== 'cancelada' && (
                          <ActionBtn
                            title="Cancelar inscrição"
                            disabled={actionLoading === reg.id}
                            onClick={() => handleCancel(reg)}
                            className="text-red-300 hover:text-red-200 hover:bg-red-950/50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1c2538]">
            <span className="text-[11px] text-slate-500">
              {filtered.length} inscrição(ões) · página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2 border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2 border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- helpers ---------- */

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <th
    className={`px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-montserrat ${className}`}
  >
    {children}
  </th>
)

const ActionBtn: React.FC<{
  children: React.ReactNode
  title: string
  onClick: () => void
  className?: string
  disabled?: boolean
}> = ({ children, title, onClick, className = '', disabled }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
)

export default AdminRegistrations
