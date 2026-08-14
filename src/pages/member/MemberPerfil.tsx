import React, { useEffect, useState } from 'react'
import {
  User as UserIcon,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Bike,
  Calendar,
  Users,
  Pencil,
  Save,
  X,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { StatusBadge } from '@/lib/member'

interface ProfileForm {
  name: string
  phone: string
  email: string
  cpf: string
  city: string
  bike_brand: string
  bike_model: string
  bike_year: string
  pillion_name: string
  pillion_phone: string
}

const MemberPerfil: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProfileForm>(emptyForm())

  function emptyForm(): ProfileForm {
    return {
      name: '',
      phone: '',
      email: '',
      cpf: '',
      city: '',
      bike_brand: '',
      bike_model: '',
      bike_year: '',
      pillion_name: '',
      pillion_phone: '',
    }
  }

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        cpf: user.cpf || '',
        city: user.city || '',
        bike_brand: user.bike_brand || '',
        bike_model: user.bike_model || '',
        bike_year: user.bike_year ? String(user.bike_year) : '',
        pillion_name: user.pillion_name || '',
        pillion_phone: user.pillion_phone || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!form.name.trim() || !form.email.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e e-mail são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        cpf: form.cpf.trim(),
        city: form.city.trim(),
        bike_brand: form.bike_brand.trim(),
        bike_model: form.bike_model.trim(),
        bike_year: form.bike_year ? parseInt(form.bike_year, 10) : null,
        pillion_name: form.pillion_name.trim(),
        pillion_phone: form.pillion_phone.trim(),
      }

      await userService.updateUserProfile(user.id, payload)
      await refreshUser()
      setEditing(false)
      toast({
        title: 'Perfil atualizado!',
        description: 'Seus dados foram salvos com sucesso.',
      })
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err)
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Ocorreu um erro ao salvar seus dados. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        cpf: user.cpf || '',
        city: user.city || '',
        bike_brand: user.bike_brand || '',
        bike_model: user.bike_model || '',
        bike_year: user.bike_year ? String(user.bike_year) : '',
        pillion_name: user.pillion_name || '',
        pillion_phone: user.pillion_phone || '',
      })
    }
    setEditing(false)
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-500" /> Meu Perfil
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualize e atualize seus dados cadastrais e da sua moto.
          </p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider h-9 rounded-sm uppercase gap-1.5 self-start"
          >
            <Pencil className="w-3.5 h-3.5" /> Editar Perfil
          </Button>
        )}
      </div>

      {/* Status banner */}
      <div className="bg-[#0f131c] border border-[#1d2638] rounded-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg">
            {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user.name}</p>
            <p className="text-[11px] text-slate-400">{user.email}</p>
          </div>
        </div>
        <StatusBadge status={user.status} />
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <ProfileSection title="Dados Pessoais">
            <Field
              label="Nome completo"
              name="name"
              icon={UserIcon}
              value={form.name}
              onChange={handleChange}
              required
            />
            <Field
              label="Telefone / WhatsApp"
              name="phone"
              icon={Phone}
              value={form.phone}
              onChange={handleChange}
            />
            <Field
              label="E-mail"
              name="email"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              required
            />
            <Field
              label="CPF"
              name="cpf"
              icon={CreditCard}
              value={form.cpf}
              onChange={handleChange}
            />
            <Field
              label="Cidade"
              name="city"
              icon={MapPin}
              value={form.city}
              onChange={handleChange}
            />
          </ProfileSection>

          <ProfileSection title="Minha Moto">
            <Field
              label="Marca da moto"
              name="bike_brand"
              icon={Bike}
              value={form.bike_brand}
              onChange={handleChange}
            />
            <Field
              label="Modelo da moto"
              name="bike_model"
              icon={Bike}
              value={form.bike_model}
              onChange={handleChange}
            />
            <Field
              label="Ano da moto"
              name="bike_year"
              type="number"
              icon={Calendar}
              value={form.bike_year}
              onChange={handleChange}
            />
          </ProfileSection>

          <ProfileSection title="Garupa">
            <Field
              label="Nome do garupa (opcional)"
              name="pillion_name"
              icon={Users}
              value={form.pillion_name}
              onChange={handleChange}
            />
            <Field
              label="Telefone do garupa (opcional)"
              name="pillion_phone"
              icon={Phone}
              value={form.pillion_phone}
              onChange={handleChange}
            />
          </ProfileSection>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider h-10 rounded-sm uppercase gap-1.5"
            >
              <Save className="w-4 h-4" /> {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="border-[#263248] text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-10 rounded-sm uppercase gap-1.5"
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <ProfileSection title="Dados Pessoais">
            <ViewField label="Nome completo" value={user.name} icon={UserIcon} />
            <ViewField label="Telefone / WhatsApp" value={user.phone} icon={Phone} />
            <ViewField label="E-mail" value={user.email} icon={Mail} />
            <ViewField label="CPF" value={user.cpf} icon={CreditCard} />
            <ViewField label="Cidade" value={user.city} icon={MapPin} />
          </ProfileSection>

          <ProfileSection title="Minha Moto">
            <ViewField label="Marca" value={user.bike_brand} icon={Bike} />
            <ViewField label="Modelo" value={user.bike_model} icon={Bike} />
            <ViewField
              label="Ano"
              value={user.bike_year ? String(user.bike_year) : ''}
              icon={Calendar}
            />
          </ProfileSection>

          <ProfileSection title="Garupa">
            {user.pillion_name ? (
              <>
                <ViewField label="Nome do garupa" value={user.pillion_name} icon={Users} />
                <ViewField label="Telefone do garupa" value={user.pillion_phone} icon={Phone} />
              </>
            ) : (
              <div className="bg-[#121824] border border-dashed border-[#1c2538] rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-xs">Nenhum garupa cadastrado.</span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setEditing(true)
                  }}
                  variant="outline"
                  className="border-blue-600/60 text-blue-300 hover:text-white hover:bg-blue-600/20 text-[11px] h-8 rounded-sm uppercase gap-1.5 self-start"
                >
                  <Plus className="w-3.5 h-3.5" /> Cadastrar Garupa
                </Button>
              </div>
            )}
          </ProfileSection>
        </div>
      )}
    </div>
  )
}

const ProfileSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 sm:p-5 space-y-4">
    <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase border-b border-[#1c2538] pb-2">
      {title}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </section>
)

const ViewField: React.FC<{
  label: string
  value?: string
  icon: React.ComponentType<{ className?: string }>
}> = ({ label, value, icon: Icon }) => (
  <div className="space-y-1">
    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
      <Icon className="w-3 h-3" /> {label}
    </span>
    <p className="text-sm text-white font-medium">
      {value && value.trim() !== '' ? value : <span className="text-slate-600">Não informado</span>}
    </p>
  </div>
)

const Field: React.FC<{
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  icon: React.ComponentType<{ className?: string }>
  required?: boolean
}> = ({ label, name, value, onChange, type = 'text', icon: Icon, required }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
      <Icon className="w-3 h-3 text-slate-500" /> {label}
      {required && <span className="text-red-400">*</span>}
    </Label>
    <Input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="bg-[#141a26] border-[#202a3d] focus:border-blue-500 text-white placeholder:text-slate-500 text-xs h-10 rounded-sm"
    />
  </div>
)

export default MemberPerfil
