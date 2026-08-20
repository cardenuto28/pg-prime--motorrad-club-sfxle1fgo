import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search,
  Pencil,
  CheckCircle2,
  Ban,
  RotateCcw,
  History,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Bike,
  Calendar,
  Shield,
  ShieldPlus,
  Crown,
  Info,
  ExternalLink,
  FileText,
  Download,
} from 'lucide-react'
import { exportMembersPdf } from '@/lib/pdfExport'
import { UserProfile, Registration, userService, registrationService } from '@/services/api'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { StatusBadge, formatDate, statusLabel } from '@/lib/member'

const PAGE_SIZE = 10

type Status = UserProfile['status']

const AdminMembers: React.FC = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [historyUser, setHistoryUser] = useState<UserProfile | null>(null)
  const [historyRegs, setHistoryRegs] = useState<Registration[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modal rápido de Promover a Admin
  const [promoteModalOpen, setPromoteModalOpen] = useState(false)
  const [selectedMemberForAdmin, setSelectedMemberForAdmin] = useState<string>('')
  const [promoting, setPromoting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await userService.getAllUsers()
      setUsers(all)
    } catch (e) {
      console.error('Erro ao carregar membros:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os membros.',
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
    if (!q) return users
    return users.filter((u) => {
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.cpf || '').toLowerCase().includes(q)
      )
    })
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search])

  const updateLocalUser = (id: string, patch: Partial<UserProfile>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  const handlePromoteAdmin = async () => {
    if (!selectedMemberForAdmin) return
    const targetUser = users.find((u) => u.id === selectedMemberForAdmin)
    if (!targetUser) return

    setPromoting(true)
    try {
      await userService.updateUserProfile(targetUser.id, { role: 'admin' })
      updateLocalUser(targetUser.id, { role: 'admin' })
      toast({
        title: 'Membro Promovido!',
        description: `${targetUser.name || 'Membro'} agora possui privilégios de Administrador.`,
      })
      setPromoteModalOpen(false)
      setSelectedMemberForAdmin('')
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro ao promover',
        description: 'Não foi possível promover o membro para administrador.',
        variant: 'destructive',
      })
    } finally {
      setPromoting(false)
    }
  }

  const handleStatusAction = async (user: UserProfile, status: Status, label: string) => {
    setActionLoading(user.id)
    try {
      await userService.updateUserStatus(user.id, status)
      updateLocalUser(user.id, { status })
      toast({
        title: 'Sucesso',
        description: `${user.name || 'Membro'} → ${label}.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const openHistory = async (user: UserProfile) => {
    setHistoryUser(user)
    setHistoryLoading(true)
    setHistoryRegs([])
    try {
      const regs = await registrationService.getRegistrationsByUser(user.id)
      setHistoryRegs(regs)
    } catch (e) {
      console.error(e)
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Gestão de Membros
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Membros Cadastrados
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users className="w-4 h-4 text-blue-500" />
              <span>
                <span className="text-white font-bold">{users.length}</span> membros
              </span>
            </div>
            <Button
              onClick={() => {
                if (filtered.length === 0) {
                  toast({
                    title: 'Sem dados',
                    description: 'Nenhum membro para exportar.',
                    variant: 'destructive',
                  })
                  return
                }
                exportMembersPdf(filtered)
                toast({
                  title: 'PDF Gerado',
                  description: 'Lista de membros exportada em PDF.',
                })
              }}
              variant="outline"
              className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5 h-9"
            >
              <FileText className="w-4 h-4 text-blue-400" /> EXPORTAR PDF
            </Button>
            <Button
              onClick={() => setPromoteModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5 h-9 rounded-sm shadow-md"
            >
              <ShieldPlus className="w-4 h-4" /> PROMOVER A ADMIN
            </Button>
          </div>
        </div>
      </section>

      {/* Dica Informativa Visual */}
      <section className="bg-gradient-to-r from-blue-950/40 via-[#0e1728] to-purple-950/30 border border-blue-800/40 rounded-md p-3.5 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-white">Como gerenciar e promover administradores:</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Você pode promover qualquer membro clicando no botão{' '}
            <strong className="text-purple-300">"PROMOVER A ADMIN"</strong> acima ou clicando no
            ícone de edição (<span className="text-blue-300 font-bold">✏️</span>) na linha do membro
            e alterando o campo <em>"Tipo de Usuário (Permissões)"</em> para{' '}
            <strong>Administrador</strong>.
          </p>
        </div>
      </section>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF..."
          className="pl-9 bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1c2538] bg-[#0a0d14]">
                <Th>Nome</Th>
                <Th>Tipo / Nível</Th>
                <Th>Categoria</Th>
                <Th>Telefone</Th>
                <Th>Cidade</Th>
                <Th>Moto</Th>
                <Th>Chassi</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-500">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              ) : (
                pageItems.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#161e2c] last:border-0 hover:bg-[#11172250]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block">
                            {u.name || '—'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">{u.email || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 uppercase">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-700/40 uppercase">
                          Membro
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300 font-medium">
                      {u.category || 'Membro Premium'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{u.city || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {[u.bike_brand, u.bike_model, u.bike_year].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300 font-mono">
                      {u.bike_chassi || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/verificar/${u.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Verificar carteirinha pública"
                          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors text-slate-400 hover:text-white hover:bg-[#1b2536]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <ActionBtn
                          title="Editar cadastro"
                          onClick={() => setEditing(u)}
                          className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </ActionBtn>
                        <ActionBtn
                          title="Histórico de passeios"
                          onClick={() => openHistory(u)}
                          className="text-blue-300 hover:text-blue-200 hover:bg-blue-950/50"
                        >
                          <History className="w-3.5 h-3.5" />
                        </ActionBtn>
                        {u.status === 'pendente' && (
                          <ActionBtn
                            title="Aprovar cadastro"
                            disabled={actionLoading === u.id}
                            onClick={() => handleStatusAction(u, 'ativo', 'Ativo')}
                            className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </ActionBtn>
                        )}
                        {u.status !== 'bloqueado' && (
                          <ActionBtn
                            title="Bloquear cadastro"
                            disabled={actionLoading === u.id}
                            onClick={() => handleStatusAction(u, 'bloqueado', 'Bloqueado')}
                            className="text-red-300 hover:text-red-200 hover:bg-red-950/50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </ActionBtn>
                        )}
                        {u.status === 'bloqueado' && (
                          <ActionBtn
                            title="Desbloquear / Reativar"
                            disabled={actionLoading === u.id}
                            onClick={() => handleStatusAction(u, 'ativo', 'Ativo')}
                            className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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
              {filtered.length} membro(s) · página {currentPage} de {totalPages}
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

      {/* Edit Modal */}
      <EditMemberModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={(id, patch) => {
          updateLocalUser(id, patch)
          setEditing(null)
        }}
      />

      {/* Modal Promover a Admin */}
      <Dialog open={promoteModalOpen} onOpenChange={setPromoteModalOpen}>
        <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-wide text-white flex items-center gap-2 font-montserrat">
              <ShieldPlus className="w-5 h-5 text-purple-400" />
              Promover Membro a Administrador
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Selecione um membro cadastrado para conceder acesso total ao painel administrativo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Selecione o Membro</Label>
              <Select value={selectedMemberForAdmin} onValueChange={setSelectedMemberForAdmin}>
                <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-10">
                  <SelectValue placeholder="Escolha um membro na lista..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white max-h-60">
                  {users
                    .filter((u) => u.role !== 'admin')
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        {m.name} ({m.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {users.filter((u) => u.role !== 'admin').length === 0 && (
              <p className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded border border-amber-800/50">
                Todos os usuários atuais já são administradores ou não há membros elegíveis.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c2538]">
              <Button
                variant="outline"
                onClick={() => {
                  setPromoteModalOpen(false)
                  setSelectedMemberForAdmin('')
                }}
                className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePromoteAdmin}
                disabled={!selectedMemberForAdmin || promoting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                {promoting ? 'PROMOVENDO...' : 'CONFIRMAR PROMOÇÃO'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={!!historyUser} onOpenChange={(o) => !o && setHistoryUser(null)}>
        <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" />
              Histórico de Passeios
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {historyUser?.name} ·{' '}
              {historyRegs.filter((r) => r.status === 'confirmada' && r.expand?.ride).length}{' '}
              passeio(s) realizado(s)
            </DialogDescription>
          </DialogHeader>

          {historyLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : historyRegs.length === 0 ? (
            <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-8 text-center">
              <p className="text-xs text-slate-500">
                Este membro ainda não se inscreveu em nenhum passeio.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {historyRegs.map((reg) => {
                const ride = reg.expand?.ride
                const statusColor =
                  reg.status === 'confirmada'
                    ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50'
                    : reg.status === 'cancelada'
                      ? 'text-red-300 bg-red-950/60 border-red-800/50'
                      : 'text-amber-300 bg-amber-950/60 border-amber-800/50'
                return (
                  <div
                    key={reg.id}
                    className="bg-[#0e131d] border border-[#1c2538] rounded-md p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-md bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate font-montserrat uppercase">
                        {ride?.name || 'Passeio removido'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {ride ? formatDate(ride.date) : '—'}
                        </span>
                        {reg.has_pillion && <span className="text-blue-300">com garupa</span>}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold tracking-wider px-2 py-1 rounded uppercase border flex-shrink-0 ${statusColor}`}
                    >
                      {reg.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[#1c2538]">
            <span className="text-[11px] text-slate-400">
              Total de inscrições:{' '}
              <span className="text-white font-bold">{historyRegs.length}</span>
            </span>
            <span className="text-[11px] text-emerald-300">
              Passeios realizados:{' '}
              <span className="font-bold">
                {historyRegs.filter((r) => r.status === 'confirmada' && r.expand?.ride).length}
              </span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
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

/* ---------- Edit modal ---------- */

const EditMemberModal: React.FC<{
  user: UserProfile | null
  onClose: () => void
  onSaved: (id: string, patch: Partial<UserProfile>) => void
}> = ({ user, onClose, onSaved }) => {
  const { toast } = useToast()
  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'member',
        category: user.category || 'Membro Premium',
        member_id: user.member_id || '',
        phone: user.phone || '',
        cpf: user.cpf || '',
        city: user.city || '',
        bike_brand: user.bike_brand || '',
        bike_model: user.bike_model || '',
        bike_year: user.bike_year || 0,
        bike_chassi: user.bike_chassi || '',
        pillion_name: user.pillion_name || '',
        pillion_phone: user.pillion_phone || '',
        status: user.status,
      })
      setChassiError('')
    }
  }, [user])

  const [chassiError, setChassiError] = useState('')

  const validateChassi = (chassi: string): boolean => {
    if (!chassi || !chassi.trim()) return true
    const pattern = /^[A-Za-z]-\d{6}$/
    return pattern.test(chassi.trim())
  }

  const set = (k: keyof UserProfile, v: string | number) => {
    if (k === 'bike_chassi' && typeof v === 'string') {
      const upper = v.toUpperCase()
      setForm((f) => ({ ...f, [k]: upper }))
      if (upper.trim() && !validateChassi(upper)) {
        setChassiError('Formato inválido. Use 1 letra + traço + 6 dígitos (Ex: F-123456)')
      } else {
        setChassiError('')
      }
    } else {
      setForm((f) => ({ ...f, [k]: v }))
    }
  }

  const handleSave = async () => {
    if (!user) return

    const chassiVal = (form.bike_chassi as string) || ''
    if (chassiVal.trim() && !validateChassi(chassiVal)) {
      setChassiError('Formato inválido. Use 1 letra + traço + 6 dígitos (Ex: F-123456)')
      toast({
        title: 'Chassi inválido',
        description: 'O chassi deve seguir o formato 1 letra + traço + 6 dígitos (Ex: F-123456).',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const data: Partial<UserProfile> = {
        name: form.name,
        role: form.role,
        category: form.category || 'Membro Premium',
        member_id: form.member_id,
        phone: form.phone,
        cpf: form.cpf,
        city: form.city,
        bike_brand: form.bike_brand,
        bike_model: form.bike_model,
        bike_year: Number(form.bike_year) || 0,
        bike_chassi: chassiVal.trim().toUpperCase() || '',
        pillion_name: form.pillion_name,
        pillion_phone: form.pillion_phone,
        status: form.status,
      }
      await userService.updateUserProfile(user.id, data)
      toast({
        title: 'Cadastro atualizado',
        description: `${user.name || 'Membro'} foi atualizado com sucesso.`,
      })
      onSaved(user.id, data)
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-500" />
            Editar Cadastro
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {user?.name} · {user?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <Field label="Nome" icon={null}>
            <Input
              value={(form.name as string) || ''}
              onChange={(e) => set('name', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="E-mail" icon={<Mail className="w-3 h-3" />}>
            <Input
              type="email"
              value={(form.email as string) || ''}
              onChange={(e) => set('email', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Telefone" icon={<Phone className="w-3 h-3" />}>
            <Input
              value={(form.phone as string) || ''}
              onChange={(e) => set('phone', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="CPF" icon={null}>
            <Input
              value={(form.cpf as string) || ''}
              onChange={(e) => set('cpf', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Cidade" icon={<MapPin className="w-3 h-3" />}>
            <Input
              value={(form.city as string) || ''}
              onChange={(e) => set('city', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Status de Cadastro" icon={null}>
            <Select
              value={(form.status as string) || 'pendente'}
              onValueChange={(v) => set('status', v)}
            >
              <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                {(['pendente', 'ativo', 'inativo', 'bloqueado'] as Status[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="sm:col-span-2 pt-2 border-t border-[#1c2538]">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-montserrat mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Nível de Acesso e Carteirinha
            </p>
          </div>

          <Field
            label="Tipo de Usuário (Permissões)"
            icon={<Shield className="w-3 h-3 text-purple-400" />}
          >
            <Select value={(form.role as string) || 'member'} onValueChange={(v) => set('role', v)}>
              <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                <SelectItem value="member" className="text-xs">
                  Membro (Área do Membro)
                </SelectItem>
                <SelectItem value="admin" className="text-xs font-bold text-purple-300">
                  Administrador (Acesso Total ao Painel Admin)
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Categoria na Carteirinha"
            icon={<Crown className="w-3 h-3 text-amber-400" />}
          >
            <Input
              value={(form.category as string) || ''}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Ex.: Membro Premium, Membro VIP, Sócio Fundador"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <Field label="ID Customizado (Opcional)" icon={null}>
            <Input
              value={(form.member_id as string) || ''}
              onChange={(e) => set('member_id', e.target.value)}
              placeholder="Ex.: EMC-02458 (deixe em branco para auto)"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <div className="sm:col-span-2 pt-2 border-t border-[#1c2538]">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-montserrat mb-3">
              Moto
            </p>
          </div>
          <Field label="Marca da Moto" icon={<Bike className="w-3 h-3" />}>
            <Input
              value={(form.bike_brand as string) || ''}
              onChange={(e) => set('bike_brand', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Modelo da Moto" icon={null}>
            <Input
              value={(form.bike_model as string) || ''}
              onChange={(e) => set('bike_model', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Ano da Moto" icon={null}>
            <Input
              type="number"
              value={(form.bike_year as number) || ''}
              onChange={(e) => set('bike_year', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Chassi (última letra + 6 números)" icon={null}>
            <Input
              value={(form.bike_chassi as string) || ''}
              onChange={(e) => set('bike_chassi', e.target.value)}
              placeholder="Ex: F-123456"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
            {chassiError && <p className="text-[10px] text-red-400 mt-1">{chassiError}</p>}
          </Field>

          <div className="sm:col-span-2 pt-2 border-t border-[#1c2538]">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-montserrat mb-3">
              Garupa
            </p>
          </div>
          <Field label="Nome do Garupa" icon={null}>
            <Input
              value={(form.pillion_name as string) || ''}
              onChange={(e) => set('pillion_name', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Telefone do Garupa" icon={<Phone className="w-3 h-3" />}>
            <Input
              value={(form.pillion_phone as string) || ''}
              onChange={(e) => set('pillion_phone', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1c2538]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'SALVANDO...' : 'SALVAR'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const Field: React.FC<{
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
      {icon}
      {label}
    </Label>
    {children}
  </div>
)

export default AdminMembers
