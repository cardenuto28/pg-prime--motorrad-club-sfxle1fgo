import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search,
  Pencil,
  Plus,
  Trash2,
  CheckCircle2,
  Ban,
  RotateCcw,
  Gift,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Store,
} from 'lucide-react'
import { Benefit, benefitService } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import { ImageUploadField } from '@/components/ImageUploadField'
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

const PAGE_SIZE = 10

type BenefitForm = {
  title: string
  image: string
  image_file: string
  partner: string
  description: string
  exclusive_condition: string
  valid_until: string
  how_to_use: string
  contact_link: string
  active: boolean
}

const EMPTY_FORM: BenefitForm = {
  title: '',
  image: '',
  image_file: '',
  partner: '',
  description: '',
  exclusive_condition: '',
  valid_until: '',
  how_to_use: '',
  contact_link: '',
  active: true,
}

const AdminBenefits: React.FC = () => {
  const { toast } = useToast()
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Benefit | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Benefit | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await benefitService.getAllBenefits()
      setBenefits(all)
    } catch (e) {
      console.error('Erro ao carregar benefícios:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os benefícios.',
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
    if (!q) return benefits
    return benefits.filter((b) => {
      return (
        (b.title || '').toLowerCase().includes(q) || (b.partner || '').toLowerCase().includes(q)
      )
    })
  }, [benefits, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search])

  const updateLocal = (id: string, patch: Partial<Benefit>) => {
    setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  const toggleActive = async (b: Benefit) => {
    setActionLoading(b.id)
    try {
      const next = !b.active
      await benefitService.updateBenefit(b.id, { active: next })
      updateLocal(b.id, { active: next })
      toast({
        title: 'Sucesso',
        description: `${b.title || 'Benefício'} → ${next ? 'Ativo' : 'Inativo'}.`,
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
      await benefitService.deleteBenefit(deleteTarget.id)
      setBenefits((prev) => prev.filter((b) => b.id !== deleteTarget.id))
      toast({
        title: 'Excluído',
        description: `${deleteTarget.title || 'Benefício'} foi removido.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o benefício.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Gestão de Benefícios
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Benefícios do Club
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Gift className="w-4 h-4 text-blue-500" />
              <span>
                <span className="text-white font-bold">{benefits.length}</span> benefício(s)
              </span>
            </div>
            <Button
              onClick={() => setCreating(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider gap-1.5"
            >
              <Plus className="w-4 h-4" /> NOVO BENEFÍCIO
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
          placeholder="Buscar por nome ou parceiro..."
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
                <Th>Parceiro</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-slate-500">
                    Nenhum benefício encontrado.
                  </td>
                </tr>
              ) : (
                pageItems.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-[#161e2c] last:border-0 hover:bg-[#11172250]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <Gift className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {b.title || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-slate-500" />
                        {b.partner || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.active ? (
                        <span className="text-[9px] font-bold tracking-wider px-2 py-1 rounded uppercase border bg-emerald-950/70 text-emerald-300 border-emerald-700/50">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold tracking-wider px-2 py-1 rounded uppercase border bg-slate-800/70 text-slate-300 border-slate-600/50">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ActionBtn
                          title="Editar"
                          onClick={() => setEditing(b)}
                          className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </ActionBtn>
                        {b.active ? (
                          <ActionBtn
                            title="Desativar"
                            disabled={actionLoading === b.id}
                            onClick={() => toggleActive(b)}
                            className="text-amber-300 hover:text-amber-200 hover:bg-amber-950/50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </ActionBtn>
                        ) : (
                          <ActionBtn
                            title="Ativar"
                            disabled={actionLoading === b.id}
                            onClick={() => toggleActive(b)}
                            className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </ActionBtn>
                        )}
                        <ActionBtn
                          title="Excluir"
                          onClick={() => setDeleteTarget(b)}
                          className="text-red-300 hover:text-red-200 hover:bg-red-950/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </ActionBtn>
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
              {filtered.length} benefício(s) · página {currentPage} de {totalPages}
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
      <BenefitFormModal
        open={creating || !!editing}
        benefit={editing}
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
              Excluir benefício
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

const BenefitFormModal: React.FC<{
  open: boolean
  benefit: Benefit | null
  onClose: () => void
  onSaved: (id: string, patch: Partial<Benefit>, isNew: boolean) => void
}> = ({ open, benefit, onClose, onSaved }) => {
  const { toast } = useToast()
  const [form, setForm] = useState<BenefitForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setPendingImageFile(null)
      if (benefit) {
        setForm({
          title: benefit.title || '',
          image: benefit.image || '',
          image_file: (benefit as any).image_file || '',
          partner: benefit.partner || '',
          description: benefit.description || '',
          exclusive_condition: benefit.exclusive_condition || '',
          valid_until: benefit.valid_until || '',
          how_to_use: benefit.how_to_use || '',
          contact_link: benefit.contact_link || '',
          active: benefit.active ?? true,
        })
      } else {
        setForm(EMPTY_FORM)
      }
    }
  }, [open, benefit])

  useEffect(() => {
    if (!open) setPendingImageFile(null)
  }, [open])

  const set = <K extends keyof BenefitForm>(k: K, v: BenefitForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o nome do benefício.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const payload: any = { ...form }
      if (benefit) {
        if (pendingImageFile) {
          const fd = new FormData()
          for (const [k, v] of Object.entries(payload)) {
            if (v !== undefined && v !== null) fd.append(k, String(v))
          }
          fd.append('image_file', pendingImageFile)
          await pb.collection('benefits').update(benefit.id, fd)
        } else {
          await benefitService.updateBenefit(benefit.id, payload)
        }
        toast({ title: 'Benefício atualizado', description: form.title })
        onSaved(benefit.id, { ...payload }, false)
      } else {
        const created = await benefitService.createBenefit(payload)
        if (pendingImageFile) {
          const fd = new FormData()
          fd.append('image_file', pendingImageFile)
          await pb.collection('benefits').update(created.id, fd)
        }
        toast({ title: 'Benefício criado', description: form.title })
        onSaved(created.id, { ...payload }, true)
      }
      setPendingImageFile(null)
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o benefício.',
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
            <Gift className="w-4 h-4 text-blue-500" />
            {benefit ? 'Editar Benefício' : 'Novo Benefício'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {benefit
              ? 'Atualize os dados do benefício.'
              : 'Preencha os dados do novo benefício do club.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="sm:col-span-2">
            <Field label="Nome do benefício *">
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Ex.: 15% OFF em Acessórios BMW Motorrad"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>
          <Field label="Parceiro">
            <Input
              value={form.partner}
              onChange={(e) => set('partner', e.target.value)}
              placeholder="Ex.: Boutique Euro Motors"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Validade">
            <Input
              value={form.valid_until}
              onChange={(e) => set('valid_until', e.target.value)}
              placeholder="Ex.: 31/12/2026"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Imagem do benefício">
            <ImageUploadField
              collection="benefits"
              fieldName="image_file"
              recordId={benefit?.id}
              value={form.image_file}
              onChange={(v) => set('image_file', v)}
              onFileChange={(f) => setPendingImageFile(f)}
              allowUrl
            />
            <Input
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
              placeholder="URL alternativa (opcional)"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 mt-2"
            />
          </Field>
          <Field label="Contato (telefone ou link)">
            <Input
              value={form.contact_link}
              onChange={(e) => set('contact_link', e.target.value)}
              placeholder="Ex.: (11) 3000-1000 ou https://..."
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Descreva o benefício..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Condição exclusiva">
              <Textarea
                value={form.exclusive_condition}
                onChange={(e) => set('exclusive_condition', e.target.value)}
                rows={2}
                placeholder="Ex.: Válido para membros ativos apresentando a carteirinha."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Como utilizar">
              <Textarea
                value={form.how_to_use}
                onChange={(e) => set('how_to_use', e.target.value)}
                rows={2}
                placeholder="Ex.: Apresente seu CPF no balcão de vendas."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center justify-between bg-[#121824] border border-[#1c2538] rounded-md p-3">
            <div>
              <Label className="text-[11px] text-slate-300 font-medium">Benefício ativo</Label>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Inativo não aparece nas páginas públicas nem na área do membro.
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

export default AdminBenefits
