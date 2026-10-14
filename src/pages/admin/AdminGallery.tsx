import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search,
  Pencil,
  Plus,
  Trash2,
  Star,
  Images,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Video,
  ArrowUp,
  ArrowDown,
  Film,
} from 'lucide-react'
import { Gallery, Ride, galleryService, rideService } from '@/services/api'
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
import { formatDate, resolveFileUrl } from '@/lib/member'

const PAGE_SIZE = 12

type GalleryCategory = Gallery['category']
type GalleryForm = {
  title: string
  category: GalleryCategory
  type: 'photo' | 'video'
  cover_image: string
  cover_image_file: string
  images_json: string
  video_url: string
  description: string
  event_date: string
  ride: string
  featured: boolean
  sort_order: number
}

const EMPTY_FORM: GalleryForm = {
  title: '',
  category: 'passeios',
  type: 'photo',
  cover_image: '',
  cover_image_file: '',
  images_json: '[]',
  video_url: '',
  description: '',
  event_date: '',
  ride: '',
  featured: false,
  sort_order: 0,
}

const AdminGallery: React.FC = () => {
  const { toast } = useToast()
  const [items, setItems] = useState<Gallery[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Gallery | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Gallery | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [all, allRides] = await Promise.all([
        galleryService.getAll(),
        rideService.getAllRides(),
      ])
      setItems(all)
      setRides(allRides)
    } catch (e) {
      console.error('Erro ao carregar galeria:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a galeria.',
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
      (g) =>
        (g.title || '').toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q),
    )
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search])

  const updateLocal = (id: string, patch: Partial<Gallery>) => {
    setItems((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  const toggleFeatured = async (g: Gallery) => {
    setActionLoading(g.id)
    try {
      const next = !g.featured
      await galleryService.updateGallery(g.id, { featured: next })
      updateLocal(g.id, { featured: next })
      toast({
        title: 'Sucesso',
        description: `${g.title || 'Item'} → ${next ? 'Destaque' : 'Comum'}.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const moveOrder = async (g: Gallery, direction: -1 | 1) => {
    const sorted = [...filtered].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const idx = sorted.findIndex((x) => x.id === g.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const other = sorted[swapIdx]
    setActionLoading(`${g.id}:${direction}`)
    try {
      await Promise.all([
        galleryService.updateGallery(g.id, { sort_order: other.sort_order || 0 }),
        galleryService.updateGallery(other.id, { sort_order: g.sort_order || 0 }),
      ])
      updateLocal(g.id, { sort_order: other.sort_order || 0 })
      updateLocal(other.id, { sort_order: g.sort_order || 0 })
      await load()
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar.',
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
      await galleryService.deleteGallery(deleteTarget.id)
      setItems((prev) => prev.filter((g) => g.id !== deleteTarget.id))
      toast({ title: 'Excluído', description: `${deleteTarget.title || 'Item'} removido.` })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir.',
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
              Gestão de Galeria
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Galeria de Fotos e Vídeos
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Images className="w-4 h-4 text-blue-500" />
              <span>
                <span className="text-white font-bold">{items.length}</span> item(s)
              </span>
            </div>
            <Button
              onClick={() => setCreating(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider gap-1.5"
            >
              <Plus className="w-4 h-4" /> NOVO ITEM
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
          placeholder="Buscar por título ou categoria..."
          className="pl-9 bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
        />
      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pageItems.length === 0 ? (
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-16 text-center">
          <Images className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map((g) => {
            const cover =
              g.type === 'video'
                ? resolveFileUrl(g.cover_image) ||
                  `https://img.usecurling.com/p/600/360?q=video,motorcycle`
                : resolveFileUrl(g.cover_image) ||
                  `https://img.usecurling.com/p/600/360?q=motorcycle,photo`
            return (
              <div
                key={g.id}
                className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden group"
              >
                <div className="relative h-40 bg-[#07090e] overflow-hidden">
                  <img
                    src={cover}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {g.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/30 flex items-center justify-center text-white">
                        <Video className="w-4 h-4 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  {g.featured && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase border bg-blue-950/80 text-blue-300 border-blue-600/50">
                      <Star className="w-3 h-3" fill="currentColor" /> Destaque
                    </span>
                  )}
                  <span className="absolute top-2 right-2 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase border bg-black/60 text-slate-200 border-white/20">
                    {g.category}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-bold text-white font-montserrat tracking-wide line-clamp-1">
                    {g.title || '—'}
                  </h3>
                  {g.event_date && (
                    <p className="text-[10px] text-slate-500">{formatDate(g.event_date)}</p>
                  )}
                  {g.ride && (
                    <p className="text-[10px] text-blue-400">
                      Passeio vinculado: {g.expand?.ride?.name || g.ride}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-0.5">
                      <ActionBtn
                        title="Mover para cima"
                        onClick={() => moveOrder(g, -1)}
                        disabled={!!actionLoading}
                        className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn
                        title="Mover para baixo"
                        onClick={() => moveOrder(g, 1)}
                        disabled={!!actionLoading}
                        className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <span className="text-[10px] text-slate-500 ml-1">
                        ordem: {g.sort_order ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <ActionBtn
                        title={g.featured ? 'Remover destaque' : 'Marcar destaque'}
                        onClick={() => toggleFeatured(g)}
                        disabled={actionLoading === g.id}
                        className={
                          g.featured
                            ? 'text-blue-300 hover:text-blue-200 hover:bg-blue-950/50'
                            : 'text-slate-300 hover:text-white hover:bg-[#1b2536]'
                        }
                      >
                        <Star className="w-3.5 h-3.5" fill={g.featured ? 'currentColor' : 'none'} />
                      </ActionBtn>
                      <ActionBtn
                        title="Editar"
                        onClick={() => setEditing(g)}
                        className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn
                        title="Excluir"
                        onClick={() => setDeleteTarget(g)}
                        className="text-red-300 hover:text-red-200 hover:bg-red-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </ActionBtn>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-slate-500">
            {filtered.length} item(s) · página {currentPage} de {totalPages}
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

      {/* Form modal */}
      <GalleryFormModal
        open={creating || !!editing}
        gallery={editing}
        rides={rides}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={(id, patch, isNew) => {
          if (isNew) load()
          else updateLocal(id, patch)
          setCreating(false)
          setEditing(null)
        }}
      />

      {/* Delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0f141d] border-[#1e2738] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold tracking-wide text-white">
              Excluir item da galeria
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              Tem certeza que deseja excluir{' '}
              <span className="text-white font-semibold">{deleteTarget?.title}</span>?
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

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-slate-300 font-medium">{label}</Label>
    {children}
  </div>
)

/* ---------- Form modal ---------- */

const GalleryFormModal: React.FC<{
  open: boolean
  gallery: Gallery | null
  rides: Ride[]
  onClose: () => void
  onSaved: (id: string, patch: Partial<Gallery>, isNew: boolean) => void
}> = ({ open, gallery, rides, onClose, onSaved }) => {
  const { toast } = useToast()
  const [form, setForm] = useState<GalleryForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setPendingCoverFile(null)
      if (gallery) {
        setForm({
          title: gallery.title || '',
          category: gallery.category || 'passeios',
          type: (gallery.type as 'photo' | 'video') || 'photo',
          cover_image: gallery.cover_image || '',
          cover_image_file: (gallery as any).cover_image_file || '',
          images_json: gallery.images_json || '[]',
          video_url: gallery.video_url || '',
          description: gallery.description || '',
          event_date: gallery.event_date || '',
          ride: gallery.ride || '',
          featured: !!gallery.featured,
          sort_order: gallery.sort_order || 0,
        })
      } else {
        setForm(EMPTY_FORM)
      }
    }
  }, [open, gallery])

  useEffect(() => {
    if (!open) setPendingCoverFile(null)
  }, [open])
  const set = <K extends keyof GalleryForm>(k: K, v: GalleryForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o título.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      // `cover_image_file` é um campo de arquivo do PocketBase — não vai no JSON,
      // apenas via FormData. `images_files` (multiplo) também não é enviado aqui.
      const payload: any = {
        title: form.title,
        category: form.category,
        type: form.type,
        cover_image: form.cover_image,
        images_json: form.images_json || '[]',
        video_url: form.video_url,
        description: form.description,
        event_date: form.event_date,
        ride: form.ride || null,
        featured: form.featured,
        sort_order: Number(form.sort_order) || 0,
      }
      if (gallery) {
        if (pendingCoverFile) {
          const fd = new FormData()
          for (const [k, v] of Object.entries(payload)) {
            if (v !== undefined && v !== null) fd.append(k, String(v))
          }
          fd.append('cover_image_file', pendingCoverFile)
          await pb.collection('galleries').update(gallery.id, fd)
        } else {
          await galleryService.updateGallery(gallery.id, payload)
        }
        toast({ title: 'Item atualizado', description: form.title })
        onSaved(gallery.id, { ...payload }, false)
      } else {
        const created = await galleryService.createGallery(payload)
        if (pendingCoverFile) {
          const fd = new FormData()
          fd.append('cover_image_file', pendingCoverFile)
          await pb.collection('galleries').update(created.id, fd)
        }
        toast({ title: 'Item criado', description: form.title })
        onSaved(created.id, { ...payload }, true)
      }
      setPendingCoverFile(null)
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar.',
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
            <Images className="w-4 h-4 text-blue-500" />
            {gallery ? 'Editar Item da Galeria' : 'Novo Item da Galeria'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {gallery
              ? 'Atualize os dados do álbum/mídia.'
              : 'Crie um novo álbum ou mídia para a galeria.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="sm:col-span-2">
            <Field label="Título *">
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Ex.: Costa das Falésias & Tabatinga 2026"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>

          <Field label="Tipo de mídia">
            <Select value={form.type} onValueChange={(v) => set('type', v as 'photo' | 'video')}>
              <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                <SelectItem value="photo" className="text-xs">
                  Foto (álbum)
                </SelectItem>
                <SelectItem value="video" className="text-xs">
                  Vídeo
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Categoria">
            <Select
              value={form.category}
              onValueChange={(v) => set('category', v as GalleryCategory)}
            >
              <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                <SelectItem value="passeios" className="text-xs">
                  Passeios
                </SelectItem>
                <SelectItem value="viagens" className="text-xs">
                  Viagens
                </SelectItem>
                <SelectItem value="encontros" className="text-xs">
                  Encontros
                </SelectItem>
                <SelectItem value="eventos" className="text-xs">
                  Eventos
                </SelectItem>
                <SelectItem value="videos" className="text-xs">
                  Vídeos
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Passeio vinculado">
            <Select
              value={form.ride || '__none__'}
              onValueChange={(v) => set('ride', v === '__none__' ? '' : v)}
            >
              <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                <SelectItem value="__none__" className="text-xs">
                  Nenhum
                </SelectItem>
                {rides.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Data do evento">
            <Input
              value={form.event_date}
              onChange={(e) => set('event_date', e.target.value)}
              placeholder="Ex.: 07/06/2025"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Imagem de capa">
              <ImageUploadField
                collection="galleries"
                fieldName="cover_image_file"
                recordId={gallery?.id}
                value={form.cover_image_file}
                onChange={(v) => set('cover_image_file', v)}
                onFileChange={(f) => setPendingCoverFile(f)}
                allowUrl
              />
              <Input
                value={form.cover_image}
                onChange={(e) => set('cover_image', e.target.value)}
                placeholder="URL alternativa (opcional)"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 mt-2"
              />
            </Field>
          </div>

          {form.type === 'video' ? (
            <div className="sm:col-span-2">
              <Field label="URL do vídeo (YouTube/Vimeo)">
                <Input
                  value={form.video_url}
                  onChange={(e) => set('video_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
                />
              </Field>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Field label="Fotos do álbum (JSON: uma URL por linha)">
                <Textarea
                  value={(() => {
                    try {
                      const arr = JSON.parse(form.images_json || '[]')
                      if (!Array.isArray(arr)) return form.images_json
                      return arr
                        .map((it) => (typeof it === 'string' ? it : (it as any)?.url || ''))
                        .filter(Boolean)
                        .join('\n')
                    } catch {
                      return form.images_json
                    }
                  })()}
                  onChange={(e) => {
                    const lines = e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((url) => ({ url }))
                    set('images_json', JSON.stringify(lines))
                  }}
                  rows={5}
                  placeholder={
                    'https://img.usecurling.com/p/800/560?q=motorcycle\nhttps://img.usecurling.com/p/800/1000?q=...'
                  }
                  className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none font-mono"
                />
              </Field>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Film className="w-3 h-3" /> Cole uma URL de imagem por linha.
              </p>
            </div>
          )}

          <div className="sm:col-span-2">
            <Field label="Descrição">
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Descrição opcional do álbum/mídia..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>

          <Field label="Ordem (sort_order)">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => set('sort_order', Number(e.target.value))}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <div className="flex items-center justify-between bg-[#121824] border border-[#1c2538] rounded-md p-3">
            <div>
              <Label className="text-[11px] text-slate-300 font-medium">Destaque</Label>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Aparece na home/galeria destacada.
              </p>
            </div>
            <Switch checked={form.featured} onCheckedChange={(v) => set('featured', v)} />
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

export default AdminGallery
