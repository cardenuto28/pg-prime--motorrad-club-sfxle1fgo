import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search,
  Pencil,
  Plus,
  Trash2,
  Ban,
  RotateCcw,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  AlertTriangle,
  AlertCircle,
  Pin,
} from 'lucide-react'
import { Announcement, announcementService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/member'

const PAGE_SIZE = 10

type Priority = Announcement['priority']

const PRIORITY_BADGE: Record<Priority, { label: string; className: string }> = {
  normal: {
    label: 'Normal',
    className: 'bg-slate-800/70 text-slate-300 border-slate-600/50',
  },
  important: {
    label: 'Importante',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
  },
  urgent: {
    label: 'Urgente',
    className: 'bg-red-950/70 text-red-300 border-red-700/50',
  },
}

const PRIORITY_ICON: Record<Priority, React.ComponentType<{ className?: string }>> = {
  normal: Pin,
  important: AlertCircle,
  urgent: AlertTriangle,
}

type AnnouncementForm = {
  title: string
  content: string
  priority: Priority
  important: boolean
  active: boolean
  publish_at: string
  expires_at: string
  date: string
}

const EMPTY_FORM: AnnouncementForm = {
  title: '',
  content: '',
  priority: 'normal',
  important: false,
  active: true,
  publish_at: '',
  expires_at: '',
  date: '',
}

const toInputDate = (value?: string): string => {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const AdminAnnouncements: React.FC = () => {
  const { toast } = useToast()
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Announcement | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await announcementService.getAllAnnouncements()
      setItems(all)
    } catch (e) {
      console.error('Erro ao carregar comunicados:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os comunicados.',
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
    if (!q) return items
    return items.filter(
      (a) =>
        (a.title || '').toLowerCase().includes(q) || (a.content || '').toLowerCase().includes(q),
    )
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search])

  const updateLocal = (id: string, patch: Partial<Announcement>) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  const toggleActive = async (a: Announcement) => {
    setActionLoading(a.id)
    try {
      const next = !a.active
      await announcementService.updateAnnouncement(a.id, { active: next })
      updateLocal(a.id, { active: next })
      toast({
        title: 'Sucesso',
        description: `${a.title || 'Comunicado'} → ${next ? 'Ativo' : 'Inativo'}.`,
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

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(deleteTarget.id)
    try {
      await announcementService.deleteAnnouncement(deleteTarget.id)
      setItems((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      toast({
        title: 'Excluído',
        description: `${deleteTarget.title || 'Comunicado'} foi removido.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o comunicado.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
      setDeleteTarget(null)
    }
  }

  const urgentCount = items.filter((a) => a.priority === 'urgent' && a.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Gestão de Comunicados
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Comunicados do Club
            </h1>
            {urgentCount > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-red-300 bg-red-950/60 border border-red-700/50 px-2.5 py-1 rounded uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5" /> {urgentCount} urgente(s) ativo(s)
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Megaphone className="w-4 h-4 text-blue-500" />
              <span>
                <span className="text-white font-bold">{items.length}</span> comunicado(s)
              </span>
            </div>
            <Button
              onClick={() => setCreating(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider gap-1.5"
            >
              <Plus className="w-4 h-4" /> NOVO COMUNICADO
            </Button>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título ou conteúdo..."
          className="pl-9 bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1c2538] bg-[#0a0d14]">
                <Th>Título</Th>
                <Th>Prioridade</Th>
                <Th>Status</Th>
                <Th>Publicação</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                    Nenhum comunicado encontrado.
                  </td>
                </tr>
              ) : (
                pageItems.map((a) => {
                  const badge = PRIORITY_BADGE[a.priority || 'normal']
                  const Icon = PRIORITY_ICON[a.priority || 'normal']
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-[#161e2c] last:border-0 hover:bg-[#11172250]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {a.title || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[9px] font-bold tracking-wider px-2 py-1 rounded uppercase border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.active ? (
                          <span className="text-[9px] font-bold tracking-wider px-2 py-1 rounded uppercase border bg-emerald-950/70 text-emerald-300 border-emerald-700/50">
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold tracking-wider px-2 py-1 rounded uppercase border bg-slate-800/70 text-slate-300 border-slate-600/50">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {formatDate(a.publish_at || a.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn
                            title="Editar"
                            onClick={() => setEditing(a)}
                            className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </ActionBtn>
                          {a.active ? (
                            <ActionBtn
                              title="Desativar"
                              disabled={actionLoading === a.id}
                              onClick={() => toggleActive(a)}
                              className="text-amber-300 hover:text-amber-200 hover:bg-amber-950/50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </ActionBtn>
                          ) : (
                            <ActionBtn
                              title="Ativar"
                              disabled={actionLoading === a.id}
                              onClick={() => toggleActive(a)}
                              className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </ActionBtn>
                          )}
                          <ActionBtn
                            title="Excluir"
                            onClick={() => setDeleteTarget(a)}
                            className="text-red-300 hover:text-red-200 hover:bg-red-950/50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1c2538]">
            <span className="text-[11px] text-slate-500">
              {filtered.length} comunicado(s) · página {currentPage} de {totalPages}
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

      {/* Create / Edit modal */}
      <AnnouncementFormModal
        open={creating || !!editing}
        announcement={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={(id, patch, isNew) => {
          if (isNew) {
            load()
          } else {
            updateLocal(id, patch)
          }
          setCreating(false)
          setEditing(null)
        }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0f141d] border-[#1e2738] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold tracking-wide text-white">
              Excluir comunicado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              Tem certeza que deseja excluir{' '}
              <span className="text-white font-semibold">{deleteTarget?.title}</span>? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              {actionLoading === deleteTarget?.id ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

/* ---------- Form modal ---------- */

const AnnouncementFormModal: React.FC<{
  open: boolean
  announcement: Announcement | null
  onClose: () => void
  onSaved: (id: string, patch: Partial<Announcement>, isNew: boolean) => void
}> = ({ open, announcement, onClose, onSaved }) => {
  const { toast } = useToast()
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (announcement) {
        setForm({
          title: announcement.title || '',
          content: announcement.content || '',
          priority: (announcement.priority as Priority) || 'normal',
          important: !!announcement.important,
          active: announcement.active ?? true,
          publish_at: toInputDate(announcement.publish_at),
          expires_at: toInputDate(announcement.expires_at),
          date: announcement.date || '',
        })
      } else {
        setForm({
          ...EMPTY_FORM,
          publish_at: toInputDate(new Date().toISOString()),
        })
      }
    }
  }, [open, announcement])

  const set = <K extends keyof AnnouncementForm>(k: K, v: AnnouncementForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o título do comunicado.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      // important fica true automaticamente quando prioridade != normal
      const important = form.priority !== 'normal'
      const payload = {
        title: form.title,
        content: form.content,
        priority: form.priority,
        important,
        active: form.active,
        publish_at: form.publish_at || null,
        expires_at: form.expires_at || null,
        date: form.date || form.publish_at || new Date().toISOString(),
      }
      if (announcement) {
        await announcementService.updateAnnouncement(announcement.id, payload)
        toast({ title: 'Comunicado atualizado', description: form.title })
        onSaved(announcement.id, { ...payload }, false)
      } else {
        const created = await announcementService.createAnnouncement(payload)
        toast({ title: 'Comunicado criado', description: form.title })
        onSaved(created.id, { ...payload }, true)
      }
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o comunicado.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-500" />
            {announcement ? 'Editar Comunicado' : 'Novo Comunicado'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {announcement
              ? 'Atualize os dados do comunicado.'
              : 'Crie um novo comunicado para os membros do clube.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="sm:col-span-2">
            <Field label="Título *">
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Ex.: Calendário de passeios 2025"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Conteúdo">
              <Textarea
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                rows={6}
                placeholder="Escreva o conteúdo do comunicado..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <Field label="Prioridade">
            <Select value={form.priority} onValueChange={(v) => set('priority', v as Priority)}>
              <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                <SelectItem value="normal" className="text-xs">
                  Normal
                </SelectItem>
                <SelectItem value="important" className="text-xs">
                  Importante
                </SelectItem>
                <SelectItem value="urgent" className="text-xs">
                  Urgente
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Data de publicação">
            <Input
              type="date"
              value={form.publish_at}
              onChange={(e) => set('publish_at', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Data de expiração (opcional)">
            <Input
              type="date"
              value={form.expires_at}
              onChange={(e) => set('expires_at', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <div className="flex items-center justify-between bg-[#121824] border border-[#1c2538] rounded-md p-3 sm:col-span-2">
            <div>
              <Label className="text-[11px] text-slate-300 font-medium">Comunicado ativo</Label>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Inativo não aparece para os membros.
              </p>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => set('active', v)} />
          </div>
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

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-slate-300 font-medium">{label}</Label>
    {children}
  </div>
)

export default AdminAnnouncements
