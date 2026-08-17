import React, { useEffect, useState } from 'react'
import { Save, Loader2, Settings as SettingsIcon, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { settingsService, type SiteSettings } from '@/services/settings'

const EMPTY_SETTINGS: SiteSettings = {
  id: '',
  key: 'site',
  club_name: '',
  slogan: '',
  address: '',
  phone: '',
  contact_email: '',
  website_url: '',
  instagram_url: '',
  facebook_url: '',
  youtube_url: '',
  whatsapp_number: '',
  eligibility_criteria: '',
  admin_email: '',
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast()
  const [form, setForm] = useState<SiteSettings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await settingsService.getSettings()
      // getSettings() já lida com todos os erros internamente e retorna null.
      // Usar EMPTY_SETTINGS silenciosamente quando não houver dados.
      setForm(data || EMPTY_SETTINGS)
    } catch (e) {
      // Erro realmente inesperado (ex: rede offline) — ainda assim renderiza o form.
      console.error('Erro inesperado ao carregar configurações:', e)
      setForm(EMPTY_SETTINGS)
      toast({
        title: 'Aviso',
        description:
          'Não foi possível conectar ao servidor. Você ainda pode preencher e salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsService.saveSettings(form)
      toast({
        title: 'Configurações salvas',
        description: 'As informações do site foram atualizadas com sucesso.',
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Painel Administrativo
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-500" /> Configurações do Site
            </h1>
          </div>
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
            {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
          </Button>
        </div>
      </section>

      {/* Informações do Site */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1c2538]">
          <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-montserrat tracking-wide uppercase">
              Informações do Site
            </h2>
            <p className="text-[11px] text-slate-500">
              Dados principais de contato e identidade do clube.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome do Clube">
            <Input
              value={form.club_name}
              onChange={(e) => set('club_name', e.target.value)}
              placeholder="Euro Motors Motorrad Club"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Slogan">
            <Input
              value={form.slogan}
              onChange={(e) => set('slogan', e.target.value)}
              placeholder="Mais que um clube. Uma tribo."
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Endereço">
              <Input
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Av. Pref. Luis Latorre, 4501 - Lj A - Retiro, Jundiaí - SP, 13209-430"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>
          <Field label="Telefone">
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="(11) 4839-1010"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="E-mail de contato">
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => set('contact_email', e.target.value)}
              placeholder="motorradclub@euromotors.com.br"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Link do site oficial">
              <Input
                value={form.website_url}
                onChange={(e) => set('website_url', e.target.value)}
                placeholder="https://jundiai.bmwmotorrad.euromotors.com.br"
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Redes Sociais */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1c2538]">
          <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-montserrat tracking-wide uppercase">
              Redes Sociais
            </h2>
            <p className="text-[11px] text-slate-500">
              Links exibidos no rodapé e na home do site.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Instagram URL">
            <Input
              value={form.instagram_url}
              onChange={(e) => set('instagram_url', e.target.value)}
              placeholder="https://instagram.com/..."
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="Facebook URL">
            <Input
              value={form.facebook_url}
              onChange={(e) => set('facebook_url', e.target.value)}
              placeholder="https://facebook.com/..."
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="YouTube URL">
            <Input
              value={form.youtube_url}
              onChange={(e) => set('youtube_url', e.target.value)}
              placeholder="https://youtube.com/@..."
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <Field label="WhatsApp (número, com DDI)">
            <Input
              value={form.whatsapp_number}
              onChange={(e) => set('whatsapp_number', e.target.value)}
              placeholder="551148391010"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
        </div>
      </section>

      {/* Critérios de Elegibilidade */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1c2538]">
          <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-montserrat tracking-wide uppercase">
              Critérios de Elegibilidade
            </h2>
            <p className="text-[11px] text-slate-500">
              Texto exibido no formulário de cadastro e páginas públicas.
            </p>
          </div>
        </div>

        <Field label="Quem pode participar">
          <Textarea
            value={form.eligibility_criteria}
            onChange={(e) => set('eligibility_criteria', e.target.value)}
            rows={5}
            placeholder="Clientes que adquiriram motocicletas novas ou seminovas nos últimos 4 anos..."
            className="bg-[#141b27] border-[#222c3f] text-white text-xs resize-none"
          />
        </Field>
      </section>

      {/* Notificações do admin */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1c2538]">
          <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-montserrat tracking-wide uppercase">
              Notificações
            </h2>
            <p className="text-[11px] text-slate-500">
              E-mail que recebe avisos de novos cadastros pendentes.
            </p>
          </div>
        </div>

        <Field label="E-mail do administrador">
          <Input
            type="email"
            value={form.admin_email}
            onChange={(e) => set('admin_email', e.target.value)}
            placeholder="motorradclub@euromotors.com.br"
            className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
          />
        </Field>
      </section>

      {/* Ação flutuante de salvar (rodapé) */}
      <div className="flex items-center justify-end gap-2 pb-6">
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
          {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
        </Button>
      </div>
    </div>
  )
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-slate-300 font-medium">{label}</Label>
    {children}
  </div>
)

export default AdminSettings
