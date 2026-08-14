import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Ban,
  Phone,
  Download,
  Bike,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Images,
  Plus,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import {
  Ride,
  Registration,
  Gallery,
  rideService,
  registrationService,
  galleryService,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatDate, resolveFileUrl } from '@/lib/member'
import { RideStatusBadge, RegStatusBadge } from '@/lib/ride'

const PAGE_SIZE = 10

const AdminRideDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [ride, setRide] = useState<Ride | null>(null)
  const [regs, setRegs] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [phoneInfo, setPhoneInfo] = useState<Registration | null>(null)
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [addImageOpen, setAddImageOpen] = useState(false)
  const [newImageUrls, setNewImageUrls] = useState('')
  const [newImageTitle, setNewImageTitle] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [r, rRegs] = await Promise.all([
        rideService.getRideById(id),
        registrationService.getRegistrationsByRide(id),
      ])
      setRide(r)
      setRegs(rRegs)
      // Gallery
      try {
        const g = await galleryService.getByRide(id)
        setGallery(g)
      } catch (_) {
        setGallery([])
      }
    } catch (e) {
      console.error('Erro ao carregar passeio:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o passeio.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  const reloadGallery = useCallback(async () => {
    if (!id) return
    setGalleryLoading(true)
    try {
      const g = await galleryService.getByRide(id)
      setGallery(g)
    } catch (_) {
      setGallery([])
    } finally {
      setGalleryLoading(false)
    }
  }, [id])

  const removeGalleryItem = async (g: Gallery) => {
    setActionLoading(g.id)
    try {
      await galleryService.deleteGallery(g.id)
      setGallery((prev) => prev.filter((x) => x.id !== g.id))
      toast({ title: 'Item removido', description: g.title })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const moveGalleryItem = async (g: Gallery, direction: -1 | 1) => {
    const sorted = [...gallery].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const idx = sorted.findIndex((x) => x.id === g.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const other = sorted[swapIdx]
    setActionLoading(`${g.id}:mv`)
    try {
      await Promise.all([
        galleryService.updateGallery(g.id, { sort_order: other.sort_order || 0 }),
        galleryService.updateGallery(other.id, { sort_order: g.sort_order || 0 }),
      ])
      await reloadGallery()
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

  const handleAddImages = async () => {
    if (!id || !ride) return
    const urls = newImageUrls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (urls.length === 0) {
      toast({
        title: 'Nenhuma URL',
        description: 'Cole ao menos uma URL de imagem.',
        variant: 'destructive',
      })
      return
    }
    setActionLoading('add')
    try {
      const images_json = JSON.stringify(urls.map((url) => ({ url })))
      const title = newImageTitle.trim() || ride.name || 'Galeria do passeio'
      const existing = gallery[0]
      if (existing && existing.type !== 'video') {
        // append
        let arr: unknown = existing.images_json
        if (typeof arr === 'string') {
          try {
            arr = JSON.parse(arr)
          } catch {
            arr = []
          }
        }
        const merged = [
          ...((Array.isArray(arr) ? arr : []) as any[]).map((it) =>
            typeof it === 'string' ? { url: it } : it,
          ),
          ...urls.map((url) => ({ url })),
        ]
        await galleryService.updateGallery(existing.id, {
          images_json: JSON.stringify(merged),
        })
      } else {
        await galleryService.createGallery({
          title,
          category: 'passeios',
          type: 'photo',
          images_json,
          cover_image: urls[0],
          ride: id,
          event_date: ride.date,
          sort_order: (gallery[gallery.length - 1]?.sort_order || 0) + 1,
        })
      }
      setNewImageUrls('')
      setNewImageTitle('')
      setAddImageOpen(false)
      await reloadGallery()
      toast({
        title: 'Fotos adicionadas',
        description: `${urls.length} imagem(ns) vinculada(s) ao passeio.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar as fotos.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return regs
    return regs.filter((r) => {
      const name = r.expand?.user?.name || ''
      return name.toLowerCase().includes(q)
    })
  }, [regs, search])

  useEffect(() => {
    setPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const confirmedRegs = regs.filter((r) => r.status === 'confirmada')
  const bikesCount = confirmedRegs.length
  const peopleCount = confirmedRegs.reduce((acc, r) => acc + (r.has_pillion ? 2 : 1), 0)
  const maxBikes = ride?.max_bikes || 0
  const vacancies = Math.max(0, maxBikes - bikesCount)
  const progress = maxBikes > 0 ? Math.min(100, (bikesCount / maxBikes) * 100) : 0

  const updateLocalReg = (regId: string, patch: Partial<Registration>) => {
    setRegs((prev) => prev.map((r) => (r.id === regId ? { ...r, ...patch } : r)))
  }

  const handleStatus = async (
    reg: Registration,
    status: 'confirmada' | 'cancelada',
    label: string,
  ) => {
    setActionLoading(reg.id)
    try {
      await registrationService.updateRegistrationStatus(reg.id, status)
      updateLocalReg(reg.id, { status })
      toast({
        title: 'Sucesso',
        description: `Inscrição de ${reg.expand?.user?.name || 'participante'} → ${label}.`,
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a inscrição.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleExportCSV = () => {
    const rows = [
      ['Nome', 'Telefone', 'E-mail', 'Moto', 'Garupa', 'Pessoas', 'Status'],
      ...confirmedRegs.map((r) => {
        const u = r.expand?.user
        const bike = [u?.bike_brand, u?.bike_model, u?.bike_year].filter(Boolean).join(' ')
        return [
          u?.name || '',
          u?.phone || '',
          u?.email || '',
          bike,
          r.has_pillion ? 'Sim' : 'Não',
          String(r.has_pillion ? 2 : 1),
          r.status,
        ]
      }),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inscritos-${(ride?.name || 'passeio').replace(/[^a-z0-9]/gi, '_')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({ title: 'Lista exportada', description: 'O arquivo CSV foi baixado.' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="space-y-6">
        <BackButton onClick={() => navigate('/admin/rides')} />
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-12 text-center">
          <p className="text-sm text-slate-500">Passeio não encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackButton onClick={() => navigate('/admin/rides')} />

      {/* Summary */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Inscritos por Passeio
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              {ride.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {formatDate(ride.date)}
              </span>
              <RideStatusBadge status={ride.status} />
            </div>
          </div>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5 h-9"
          >
            <Download className="w-4 h-4" /> EXPORTAR CSV
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <SummaryCard
            icon={<Bike className="w-4 h-4" />}
            label="Motos inscritas"
            value={`${bikesCount}/${maxBikes || '—'}`}
            tone="blue"
          />
          <SummaryCard
            icon={<Users className="w-4 h-4" />}
            label="Total de participantes"
            value={String(peopleCount)}
            tone="emerald"
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Vagas disponíveis"
            value={String(vacancies)}
            tone="amber"
          />
        </div>

        {/* Progress bar */}
        {maxBikes > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-montserrat">
                Ocupação de vagas
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {bikesCount}/{maxBikes} ({Math.round(progress)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#141b27] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Totalizer */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span>
          Motos inscritas:{' '}
          <span className="text-white font-bold">
            {bikesCount}/{maxBikes}
          </span>
        </span>
        <span>
          Participantes: <span className="text-white font-bold">{peopleCount}</span>
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome do participante..."
          className="pl-9 bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
        />
      </div>

      {/* Registrations table */}
      <div className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1c2538] bg-[#0a0d14]">
                <Th>Participante</Th>
                <Th>Telefone</Th>
                <Th>E-mail</Th>
                <Th>Moto</Th>
                <Th>Ano</Th>
                <Th>Garupa</Th>
                <Th>Pessoas</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-500">
                    Nenhum inscrito encontrado.
                  </td>
                </tr>
              ) : (
                pageItems.map((reg) => {
                  const u = reg.expand?.user
                  const people = reg.has_pillion ? 2 : 1
                  return (
                    <tr
                      key={reg.id}
                      className="border-b border-[#161e2c] last:border-0 hover:bg-[#11172250]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-white">{u?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{u?.phone || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{u?.email || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {[u?.bike_brand, u?.bike_model].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{u?.bike_year || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {reg.has_pillion ? 'Sim' : 'Não'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{people}</td>
                      <td className="px-4 py-3">
                        <RegStatusBadge status={reg.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {reg.status !== 'confirmada' && (
                            <ActionBtn
                              title="Confirmar inscrição"
                              disabled={actionLoading === reg.id}
                              onClick={() => handleStatus(reg, 'confirmada', 'Confirmada')}
                              className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </ActionBtn>
                          )}
                          {reg.status !== 'cancelada' && (
                            <ActionBtn
                              title="Cancelar inscrição"
                              disabled={actionLoading === reg.id}
                              onClick={() => handleStatus(reg, 'cancelada', 'Cancelada')}
                              className="text-red-300 hover:text-red-200 hover:bg-red-950/50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </ActionBtn>
                          )}
                          <ActionBtn
                            title="Ver telefone"
                            onClick={() => setPhoneInfo(reg)}
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-950/50"
                          >
                            <Phone className="w-3.5 h-3.5" />
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
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1c2538]">
            <span className="text-[11px] text-slate-500">
              {filtered.length} inscrito(s) · página {currentPage} de {totalPages}
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

      {/* Gallery management section */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-white font-montserrat tracking-wide uppercase">
              Galeria do Passeio
            </h2>
            <span className="text-[10px] text-slate-500">({gallery.length})</span>
          </div>
          <Button
            onClick={() => setAddImageOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] tracking-wider gap-1.5 h-8"
          >
            <Plus className="w-3.5 h-3.5" /> ADICIONAR FOTOS
          </Button>
        </div>

        {galleryLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gallery.length === 0 ? (
          <div className="border border-dashed border-[#1c2538] rounded-md p-8 text-center">
            <Images className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Nenhuma foto vinculada a este passeio ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gallery.map((g) => {
              const imgs: string[] = (() => {
                let arr: unknown = g.images_json
                if (typeof arr === 'string') {
                  try {
                    arr = JSON.parse(arr)
                  } catch {
                    arr = []
                  }
                }
                if (Array.isArray(arr)) {
                  return arr
                    .map((it) =>
                      typeof it === 'string' ? it : (it as any)?.url || (it as any)?.src || '',
                    )
                    .filter(Boolean)
                }
                return []
              })()
              const display = imgs.length > 0 ? imgs : g.cover_image ? [g.cover_image] : []
              return (
                <div
                  key={g.id}
                  className="bg-[#121824] border border-[#1c2538] rounded-md p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {g.title || 'Sem título'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {display.length} foto(s) · ordem {g.sort_order ?? 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <ActionBtn
                        title="Mover para cima"
                        disabled={!!actionLoading}
                        onClick={() => moveGalleryItem(g, -1)}
                        className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn
                        title="Mover para baixo"
                        disabled={!!actionLoading}
                        onClick={() => moveGalleryItem(g, 1)}
                        className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </ActionBtn>
                      <ActionBtn
                        title="Excluir"
                        disabled={actionLoading === g.id}
                        onClick={() => removeGalleryItem(g)}
                        className="text-red-300 hover:text-red-200 hover:bg-red-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </ActionBtn>
                    </div>
                  </div>
                  {display.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {display.slice(0, 12).map((url, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded overflow-hidden border border-[#1c2538] bg-[#07090e]"
                        >
                          <img
                            src={resolveFileUrl(url)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Phone info modal */}
      <Dialog open={!!phoneInfo} onOpenChange={(o) => !o && setPhoneInfo(null)}>
        <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-wide text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" /> Contato do Participante
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {phoneInfo?.expand?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <ContactRow label="Telefone" value={phoneInfo?.expand?.user?.phone} />
            <ContactRow label="E-mail" value={phoneInfo?.expand?.user?.email} />
            <ContactRow
              label="Garupa"
              value={
                phoneInfo?.has_pillion
                  ? `${phoneInfo.pillion_name || '—'}${phoneInfo.pillion_phone ? ' · ' + phoneInfo.pillion_phone : ''}`
                  : 'Sem garupa'
              }
            />
            <ContactRow
              label="Contato de emergência"
              value={
                phoneInfo?.emergency_contact_name
                  ? `${phoneInfo.emergency_contact_name}${phoneInfo.emergency_contact_phone ? ' · ' + phoneInfo.emergency_contact_phone : ''}`
                  : '—'
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add images modal */}
      <Dialog open={addImageOpen} onOpenChange={(o) => !o && setAddImageOpen(false)}>
        <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-wide text-white flex items-center gap-2">
              <Images className="w-4 h-4 text-blue-500" /> Adicionar fotos ao passeio
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Cole abaixo as URLs das imagens (uma por linha).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-300">Título do álbum (opcional)</Label>
              <Input
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder={ride?.name || 'Galeria do passeio'}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-300">URLs das fotos</Label>
              <Textarea
                value={newImageUrls}
                onChange={(e) => setNewImageUrls(e.target.value)}
                rows={6}
                placeholder={
                  'https://img.usecurling.com/p/800/560?q=motorcycle\nhttps://img.usecurling.com/p/800/1000?q=...'
                }
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none font-mono"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c2538]">
            <Button
              variant="outline"
              onClick={() => setAddImageOpen(false)}
              className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddImages}
              disabled={actionLoading === 'add'}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />{' '}
              {actionLoading === 'add' ? 'ADICIONANDO...' : 'ADICIONAR'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- helpers ---------- */

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
  >
    <ArrowLeft className="w-4 h-4" /> Voltar para passeios
  </button>
)

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

const SummaryCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  tone: 'blue' | 'emerald' | 'amber'
}> = ({ icon, label, value, tone }) => {
  const tones = {
    blue: 'text-blue-400 border-blue-500/30 bg-blue-950/30',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
  }
  return (
    <div className={`rounded-md border p-4 flex items-center gap-3 ${tones[tone]}`}>
      <div className="w-9 h-9 rounded-md bg-black/30 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-montserrat">
          {label}
        </p>
        <p className="text-lg font-extrabold text-white font-montserrat">{value}</p>
      </div>
    </div>
  )
}

const ContactRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between bg-[#141b27] border border-[#222c3f] rounded-md px-3 py-2">
    <span className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-xs text-white font-medium">{value || '—'}</span>
  </div>
)

export default AdminRideDetail
