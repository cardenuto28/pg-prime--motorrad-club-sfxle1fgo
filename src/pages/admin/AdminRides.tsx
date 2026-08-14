import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Pencil,
  Copy,
  Trash2,
  Eye,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bike,
  Users,
  X,
  Save,
  Loader2,
} from 'lucide-react'
import { Ride, rideService } from '@/services/api'
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
  DialogFooter,
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
import { RIDE_STATUS_ORDER, rideStatusLabels, RideStatusBadge } from '@/lib/ride'

const PAGE_SIZE = 10

const EMPTY_FORM: RideFormState = {
  name: '',
  cover_image: '',
  description: '',
  date: '',
  meeting_time: '',
  departure_time: '',
  meeting_point: '',
  destination: '',
  route: '',
  distance_km: 0,
  estimated_time: '',
  max_bikes: 0,
  allow_pillion: true,
  price: 0,
  important_info: '',
  whats_included: '',
  rules: '',
  map_link: '',
  registration_deadline: '',
  status: 'rascunho',
}

interface RideFormState {
  name: string
  cover_image: string
  description: string
  date: string
  meeting_time: string
  departure_time: string
  meeting_point: string
  destination: string
  route: string
  distance_km: number
  estimated_time: string
  max_bikes: number
  allow_pillion: boolean
  price: number
  important_info: string
  whats_included: string
  rules: string
  map_link: string
  registration_deadline: string
  status: Ride['status']
}

const AdminRides: React.FC = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Ride | null>(null)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await rideService.getAllRides()
      setRides(all)
    } catch (e) {
      console.error('Erro ao carregar passeios:', e)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os passeios.',
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
    if (!q) return rides
    return rides.filter((r) => (r.name || '').toLowerCase().includes(q))
  }, [rides, search])

  useEffect(() => {
    setPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await rideService.deleteRide(deletingId)
      setRides((prev) => prev.filter((r) => r.id !== deletingId))
      toast({ title: 'Passeio excluído', description: 'O passeio foi removido com sucesso.' })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o passeio.',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleDuplicate = async (ride: Ride) => {
    try {
      const {
        id,
        created,
        updated,
        bikes_registered,
        participants_registered,
        is_user_registered,
        ...rest
      } = ride
      const dup = await rideService.createRide({
        ...rest,
        name: `${ride.name} (cópia)`,
        status: 'rascunho',
      } as Omit<Ride, 'id' | 'created' | 'updated'>)
      setRides((prev) => [dup, ...prev])
      toast({ title: 'Passeio duplicado', description: 'Uma cópia em rascunho foi criada.' })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o passeio.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Gestão de Passeios
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
              Passeios do Clube
            </h1>
          </div>
          <Button
            onClick={() => setCreating(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 h-9"
          >
            <Plus className="w-4 h-4" /> CRIAR PASSEIO
          </Button>
        </div>
      </section>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome do passeio..."
          className="pl-9 bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1c2538] bg-[#0a0d14]">
                <Th>Passeio</Th>
                <Th>Data</Th>
                <Th>Status</Th>
                <Th>Motos</Th>
                <Th>Participantes</Th>
                <Th>Vagas</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    Nenhum passeio encontrado.
                  </td>
                </tr>
              ) : (
                pageItems.map((ride) => {
                  const bikes = ride.bikes_registered || 0
                  const people = ride.participants_registered || 0
                  const max = ride.max_bikes || 0
                  const vacancies = Math.max(0, max - bikes)
                  return (
                    <tr
                      key={ride.id}
                      className="border-b border-[#161e2c] last:border-0 hover:bg-[#11172250]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-white">{ride.name}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(ride.date)}
                      </td>
                      <td className="px-4 py-3">
                        <RideStatusBadge status={ride.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-blue-500" />
                          {bikes}/{max || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {people}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">{vacancies}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn
                            title="Ver inscritos"
                            onClick={() => navigate(`/admin/rides/${ride.id}`)}
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-950/50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </ActionBtn>
                          <ActionBtn
                            title="Editar"
                            onClick={() => setEditing(ride)}
                            className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </ActionBtn>
                          <ActionBtn
                            title="Duplicar"
                            onClick={() => handleDuplicate(ride)}
                            className="text-slate-300 hover:text-white hover:bg-[#1b2536]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </ActionBtn>
                          <ActionBtn
                            title="Excluir"
                            onClick={() => setDeletingId(ride.id)}
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
              {filtered.length} passeio(s) · página {currentPage} de {totalPages}
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

      {/* Create/Edit Modal */}
      <RideFormModal
        open={creating || !!editing}
        ride={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={() => {
          setCreating(false)
          setEditing(null)
          load()
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent className="bg-[#0f141d] border-[#1e2738] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir passeio?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs">
              Esta ação não pode ser desfeita. Todas as inscrições vinculadas também serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              Excluir
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

/* ---------- Form Modal ---------- */

const RideFormModal: React.FC<{
  open: boolean
  ride: Ride | null
  onClose: () => void
  onSaved: () => void
}> = ({ open, ride, onClose, onSaved }) => {
  const { toast } = useToast()
  const [form, setForm] = useState<RideFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (ride) {
        setForm({
          name: ride.name || '',
          cover_image: ride.cover_image || '',
          description: ride.description || '',
          date: ride.date || '',
          meeting_time: ride.meeting_time || '',
          departure_time: ride.departure_time || '',
          meeting_point: ride.meeting_point || '',
          destination: ride.destination || '',
          route: ride.route || '',
          distance_km: ride.distance_km || 0,
          estimated_time: ride.estimated_time || '',
          max_bikes: ride.max_bikes || 0,
          allow_pillion: ride.allow_pillion ?? true,
          price: ride.price || 0,
          important_info: ride.important_info || '',
          whats_included: ride.whats_included || '',
          rules: ride.rules || '',
          map_link: ride.map_link || '',
          registration_deadline: ride.registration_deadline || '',
          status: ride.status || 'rascunho',
        })
      } else {
        setForm({ ...EMPTY_FORM })
      }
    }
  }, [open, ride])

  const set = <K extends keyof RideFormState>(k: K, v: RideFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o nome do passeio.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const payload: Omit<Ride, 'id' | 'created' | 'updated'> = {
        name: form.name.trim(),
        cover_image: form.cover_image.trim(),
        description: form.description,
        date: form.date,
        meeting_time: form.meeting_time,
        departure_time: form.departure_time,
        meeting_point: form.meeting_point,
        destination: form.destination,
        route: form.route,
        distance_km: Number(form.distance_km) || 0,
        estimated_time: form.estimated_time,
        max_bikes: Number(form.max_bikes) || 0,
        allow_pillion: form.allow_pillion,
        price: Number(form.price) || 0,
        important_info: form.important_info,
        whats_included: form.whats_included,
        rules: form.rules,
        map_link: form.map_link.trim(),
        registration_deadline: form.registration_deadline,
        status: form.status,
      }
      if (ride) {
        await rideService.updateRide(ride.id, payload)
        toast({ title: 'Passeio atualizado', description: 'As alterações foram salvas.' })
      } else {
        await rideService.createRide(payload)
        toast({ title: 'Passeio criado', description: 'Novo passeio salvo como rascunho.' })
      }
      onSaved()
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o passeio.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0f141d] border-[#1e2738] text-white max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wide text-white">
            {ride ? 'Editar Passeio' : 'Criar Passeio'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Preencha todos os campos do passeio. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="sm:col-span-2">
            <Field label="Nome do passeio *">
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex: Passeio Serra do Rio do Rastro"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Foto de capa (URL)">
              <Input
                value={form.cover_image}
                onChange={(e) => set('cover_image', e.target.value)}
                placeholder="https://..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Descrição">
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Descrição do passeio..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>

          <Field label="Data do passeio">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Data limite para inscrição">
            <Input
              type="date"
              value={form.registration_deadline}
              onChange={(e) => set('registration_deadline', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <Field label="Horário do encontro">
            <Input
              type="time"
              value={form.meeting_time}
              onChange={(e) => set('meeting_time', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Horário da saída">
            <Input
              type="time"
              value={form.departure_time}
              onChange={(e) => set('departure_time', e.target.value)}
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <Field label="Ponto de encontro">
            <Input
              value={form.meeting_point}
              onChange={(e) => set('meeting_point', e.target.value)}
              placeholder="Ex: Posto Shell - BR-101"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Destino">
            <Input
              value={form.destination}
              onChange={(e) => set('destination', e.target.value)}
              placeholder="Ex: Serra do Corvo Branco"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Percurso / Rota">
              <Textarea
                value={form.route}
                onChange={(e) => set('route', e.target.value)}
                rows={2}
                placeholder="Descrição do percurso..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>

          <Field label="Quilometragem aproximada (km)">
            <Input
              type="number"
              value={form.distance_km || ''}
              onChange={(e) => set('distance_km', Number(e.target.value))}
              placeholder="0"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Tempo estimado">
            <Input
              value={form.estimated_time}
              onChange={(e) => set('estimated_time', e.target.value)}
              placeholder="Ex: 4 horas"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <Field label="Número máximo de motos (vagas)">
            <Input
              type="number"
              value={form.max_bikes || ''}
              onChange={(e) => set('max_bikes', Number(e.target.value))}
              placeholder="0"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Valor (R$, opcional)">
            <Input
              type="number"
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
              placeholder="0.00"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>

          <div className="sm:col-span-2 flex items-center justify-between bg-[#141b27] border border-[#222c3f] rounded-md px-4 py-3">
            <div>
              <p className="text-[11px] text-slate-300 font-medium">Permite garupa</p>
              <p className="text-[10px] text-slate-500">Define se o passeio aceita passageiros</p>
            </div>
            <Switch checked={form.allow_pillion} onCheckedChange={(v) => set('allow_pillion', v)} />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-[#1c2538]">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-montserrat mb-3">
              Informações complementares
            </p>
          </div>

          <div className="sm:col-span-2">
            <Field label="Informações importantes">
              <Textarea
                value={form.important_info}
                onChange={(e) => set('important_info', e.target.value)}
                rows={2}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="O que está incluso">
              <Textarea
                value={form.whats_included}
                onChange={(e) => set('whats_included', e.target.value)}
                rows={2}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Regulamento">
              <Textarea
                value={form.rules}
                onChange={(e) => set('rules', e.target.value)}
                rows={3}
                className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Link do mapa/rota (URL)">
              <Input
                value={form.map_link}
                onChange={(e) => set('map_link', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set('status', v as Ride['status'])}>
                <SelectTrigger className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f141d] border-[#222c3f] text-white">
                  {RIDE_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {rideStatusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-[#1c2538]">
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
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? 'SALVANDO...' : 'SALVAR'}
          </Button>
        </DialogFooter>
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

export default AdminRides
