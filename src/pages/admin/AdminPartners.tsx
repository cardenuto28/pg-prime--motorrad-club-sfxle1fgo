import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search,
  Pencil,
  Plus,
  Trash2,
  Ban,
  RotateCcw,
  Handshake,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
} from 'lucide-react'
import { Partner, partnerService } from '@/services/api'
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
import {
  PartnerCategoryBadge,
  partnerCategoryLabel,
  PARTNER_CATEGORIES,
  type PartnerCategory,
} from '@/lib/member'

const PAGE_SIZE = 10

type PartnerForm = {
  name: string
  category: PartnerCategory
  logo: string
  logo_file: string
  description: string
  discount_info: string
  website: string
  phone: string
  city: string
  active: boolean
}

const EMPTY_FORM: PartnerForm = {
  name: '',
  category: 'outros',
  logo: '',
  logo_file: '',
  description: '',
  discount_info: '',
  website: '',
  phone: '',
  city: '',
  active: true,
}

const AdminPartners: React.FC = () => {
  const { toast } = useToast()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Partner | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await partnerService.getAllPartners()
      setPartners(all)
    } catch (e) {
      console.error('Erro ao carregar parceiros:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os parceiros.',
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
    return partners.filter((p) => {
      const matchesSearch = !q || (p.name || '').toLowerCase().includes(q)
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter
      return matchesSearch && matchesCat
    })
  }, [partners, search, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter])

  const updateLocal = (id: string, patch: Partial<Partner>) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const toggleActive = async (p: Partner) => {
    setActionLoading(p.id)
    try {
      const next = !p.active
      await partnerService.updatePartner(p.id, { active: next })
      updateLocal(p.id, { active: next })
      toast({
        title: 'Sucesso',
        description: `${p.name || 'Parceiro'} → ${next ? 'Ativo' : 'Inativo'}.`,
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
      await partnerService.deletePartner(deleteTarget.id)
      setPartners((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      toast({
        title: 'Excluído',
        description: `${deleteTarget.name || 'Parceiro'} foi removido.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o parceiro.',
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
              Gestão de Parceiros
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Parceiros Credenciados
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Handshake className="w-4 h-4 text-blue-500" />
              <span>
                <span className="text-white font-bold">{partners.length}</span> parceiro(s)
              </span>
            </div>
            <Button
              onClick={() => setCreating(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider gap-1.5"
            >
              <Plus className="w-4 h-4" /> NOVO PARCEIRO
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9 bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-56 bg-[#141b27] border-[#222c3f] text-white text-xs h-10">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
            <SelectItem value="all" className="text-xs">
              Todas as categorias
            </SelectItem>
            {PARTNER_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {partnerCategoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1c2538] bg-[#0a0d14]">
                <Th>Nome</Th>
                <Th>Categoria</Th>
                <Th>Cidade</Th>
                <Th>Status</Th>
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
                    Nenhum parceiro encontrado.
                  </td>
                </tr>
              ) : (
                pageItems.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#161e2c] last:border-0 hover:bg-[#11172250]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <Handshake className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {p.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PartnerCategoryBadge category={p.category} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{p.city || '—'}</td>
                    <td className="px-4 py-3">
                      {p.active ? (
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
                          onClick={() => setEditing(p)}
                          className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </ActionBtn>
                        {p.active ? (
                          <ActionBtn
                            title="Desativar"
                            disabled={actionLoading === p.id}
                            onClick={() => toggleActive(p)}
                            className="text-amber-300 hover:text-amber-200 hover:bg-amber-950/50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </ActionBtn>
                        ) : (
                          <ActionBtn
                            title="Ativar"
                            disabled={actionLoading === p.id}
                            onClick={() => toggleActive(p)}
                            className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </ActionBtn>
                        )}
                        <ActionBtn
                          title="Excluir"
                          onClick={() => setDeleteTarget(p)}
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
              {filtered.length} parceiro(s) · página {currentPage} de {totalPages}
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
      <PartnerFormModal
        open={creating || !!editing}
        partner={editing}
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
              Excluir parceiro
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              Tem certeza que deseja excluir{' '}
              <span className="text-white font-semibold">{deleteTarget?.name}</span>? Esta ação não
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

const PartnerFormModal: React.FC<{
  open: boolean
  partner: Partner | null
  onClose: () => void
  onSaved: (id: string, patch: Partial<Partner>, isNew: boolean) => void
}> = ({ open, partner, onClose, onSaved }) => {
  const { toast } = useToast()
  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setPendingLogoFile(null)
      if (partner) {
        setForm({
          name: partner.name || '',
          category: (partner.category as PartnerCategory) || 'outros',
          logo: partner.logo || '',
          logo_file: (partner as any).logo_file || '',
          description: partner.description || '',
          discount_info: partner.discount_info || '',
          website: partner.website || '',
          phone: partner.phone || '',
          city: partner.city || '',
          active: partner.active ?? true,
        })
      } else {
        setForm(EMPTY_FORM)
      }
    }
  }, [open, partner])

  useEffect(() => {
    if (!open) setPendingLogoFile(null)
  }, [open])

  const set = <K extends keyof PartnerForm>(k: K, v: PartnerForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o nome do parceiro.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      // `logo_file` é um campo de arquivo do PocketBase — não deve ir no payload
      // JSON (apenas via FormData quando há upload). Enviamos apenas a URL texto.
      const { logo_file, ...rest } = form
      const payload: any = { ...rest }
      if (partner) {
        if (pendingLogoFile) {
          const fd = new FormData()
          for (const [k, v] of Object.entries(payload)) {
            if (v !== undefined && v !== null) fd.append(k, String(v))
          }
          fd.append('logo_file', pendingLogoFile)
          await pb.collection('partners').update(partner.id, fd)
        } else {
          await partnerService.updatePartner(partner.id, payload)
        }
        toast({ title: 'Parceiro atualizado', description: form.name })
        onSaved(partner.id, { ...payload }, false)
      } else {
        const created = await partnerService.createPartner(payload)
        if (pendingLogoFile) {
          const fd = new FormData()
          fd.append('logo_file', pendingLogoFile)
          await pb.collection('partners').update(created.id, fd)
        }
        toast({ title: 'Parceiro criado', description: form.name })
        onSaved(created.id, { ...payload }, true)
      }
      setPendingLogoFile(null)
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o parceiro.',
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
            <Handshake className="w-4 h-4 text-blue-500" />
            {partner ? 'Editar Parceiro' : 'Novo Parceiro'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {partner ? 'Atualize os dados do parceiro.' : 'Cadastre um novo parceiro credenciado.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="sm:col-span-2">
            <Field label="Nome do parceiro *">
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex.: Hotel Fazenda Dona Carolina"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>
          <Field label="Categoria">
            <Select
              value={form.category}
              onValueChange={(v) => set('category', v as PartnerCategory)}
            >
              <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                {PARTNER_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {partnerCategoryLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cidade">
            <Input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Ex.: Bananeiras - PB / Tibau do Sul - RN"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Logo / Imagem">
            <ImageUploadField
              collection="partners"
              fieldName="logo_file"
              recordId={partner?.id}
              value={form.logo_file}
              onChange={(v) => set('logo_file', v)}
              onFileChange={(f) => setPendingLogoFile(f)}
              allowUrl
            />
            <Input
              value={form.logo}
              onChange={(e) => set('logo', e.target.value)}
              placeholder="URL alternativa (opcional)"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 mt-2"
            />
          </Field>
          <Field label="Website">
            <Input
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://..."
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Telefone">
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="Ex.: (11) 4534-9000"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Descreva o parceiro..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Condições / Desconto">
              <Textarea
                value={form.discount_info}
                onChange={(e) => set('discount_info', e.target.value)}
                rows={2}
                placeholder="Ex.: 20% de desconto em hospedagem"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center justify-between bg-[#121824] border border-[#1c2538] rounded-md p-3">
            <div>
              <Label className="text-[11px] text-slate-300 font-medium">Parceiro ativo</Label>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Inativo não aparece na página pública de parceiros.
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

export default AdminPartners
