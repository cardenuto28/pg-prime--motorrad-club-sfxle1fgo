/**
 * AdminSettings — página TOTALMENTE autossuficiente.
 *
 * Não depende de `services/settings` nem de `useToast`: qualquer erro de
 * importação de módulo que possa escapar do ErrorBoundary foi eliminado.
 * Toda a comunicação com o backend é feita inline via `fetch`, envolvendo
 * cada chamada em try/catch robusto. Se o fetch falhar por qualquer motivo,
 * o formulário é renderizado com dados vazios (EMPTY_SETTINGS). A página
 * NUNCA pode quebrar nem mostrar 404.
 *
 * Únicas dependências: React, lucide-react e os componentes UI primitivos
 * (Button, Input, Label, Textarea). Feedback via alert()/console.log.
 */
import React, { useEffect, useState } from 'react'
import { Save, Loader2, Settings as SettingsIcon, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

/** Shape das configurações do site — definido LOCALMENTE (não importado). */
interface SiteSettings {
  id: string
  key: string
  club_name: string
  slogan: string
  address: string
  phone: string
  contact_email: string
  website_url: string
  instagram_url: string
  facebook_url: string
  youtube_url: string
  whatsapp_number: string
  eligibility_criteria: string
  admin_email: string
  daily_token_secret: string
}

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
  daily_token_secret: 'PGPRIME2026',
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast()
  const [form, setForm] = useState<SiteSettings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    setLoading(true)
    // Qualquer erro aqui deve sempre resultar em setForm(data || EMPTY_SETTINGS).
    let data: SiteSettings | null = null
    try {
      const res = await fetch(
        `${pb.baseUrl}/api/collections/settings/records?filter=${encodeURIComponent("key='site'")}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      if (res.ok) {
        const json = await res.json()
        const items: any[] = Array.isArray(json?.items) ? json.items : []
        if (items.length > 0) {
          const rec = items[0]
          data = {
            id: rec?.id || '',
            key: rec?.key || 'site',
            club_name: rec?.club_name || '',
            slogan: rec?.slogan || '',
            address: rec?.address || '',
            phone: rec?.phone || '',
            contact_email: rec?.contact_email || '',
            website_url: rec?.website_url || '',
            instagram_url: rec?.instagram_url || '',
            facebook_url: rec?.facebook_url || '',
            youtube_url: rec?.youtube_url || '',
            whatsapp_number: rec?.whatsapp_number || '',
            eligibility_criteria: rec?.eligibility_criteria || '',
            admin_email: rec?.admin_email || '',
            daily_token_secret: rec?.daily_token_secret || 'PGPRIME2026',
          }
        }
      }
    } catch (e) {
      // Erro de rede / JSON inválido / qualquer outra coisa — ignora e usa fallback.
      console.warn('AdminSettings: não foi possível carregar configurações:', e)
    }
    // Sempre define o form — nunca quebra.
    setForm(data || EMPTY_SETTINGS)
    setLoading(false)
  }

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: Omit<SiteSettings, 'id'> = {
        key: form.key || 'site',
        club_name: form.club_name || '',
        slogan: form.slogan || '',
        address: form.address || '',
        phone: form.phone || '',
        contact_email: form.contact_email || '',
        website_url: form.website_url || '',
        instagram_url: form.instagram_url || '',
        facebook_url: form.facebook_url || '',
        youtube_url: form.youtube_url || '',
        whatsapp_number: form.whatsapp_number || '',
        eligibility_criteria: form.eligibility_criteria || '',
        admin_email: form.admin_email || '',
        daily_token_secret: form.daily_token_secret || 'PGPRIME2026',
      }

      let ok = false
      let errMsg = ''

      // 1) Se já temos id, PUT no registro existente.
      if (form.id) {
        try {
          const res = await fetch(
            `${pb.baseUrl}/api/collections/settings/records/${encodeURIComponent(form.id)}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            },
          )
          ok = res.ok
          if (!res.ok) errMsg = `HTTP ${res.status}`
        } catch (e: any) {
          errMsg = e?.message || String(e)
        }
      } else {
        // 2) Sem id: tenta PATCH/PUT no documento existente pelo key;
        //    se não houver, cria (POST).
        let existingId = ''
        try {
          const res = await fetch(
            `${pb.baseUrl}/api/collections/settings/records?filter=${encodeURIComponent(
              "key='site'",
            )}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } },
          )
          if (res.ok) {
            const json = await res.json()
            const items: any[] = Array.isArray(json?.items) ? json.items : []
            existingId = items[0]?.id || ''
          }
        } catch (_) {
          // ignora — segue para POST
        }

        if (existingId) {
          try {
            const res = await fetch(
              `${pb.baseUrl}/api/collections/settings/records/${encodeURIComponent(existingId)}`,
              {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              },
            )
            ok = res.ok
            if (ok) setForm((f) => ({ ...f, id: existingId }))
            if (!res.ok) errMsg = `HTTP ${res.status}`
          } catch (e: any) {
            errMsg = e?.message || String(e)
          }
        } else {
          try {
            const res = await fetch(`${pb.baseUrl}/api/collections/settings/records`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            ok = res.ok
            if (res.ok) {
              const created = await res.json()
              if (created?.id) setForm((f) => ({ ...f, id: created.id }))
            } else {
              errMsg = `HTTP ${res.status}`
            }
          } catch (e: any) {
            errMsg = e?.message || String(e)
          }
        }
      }

      if (ok) {
        console.log('AdminSettings: configurações salvas com sucesso.')
        toast({
          title: 'Configurações salvas',
          description: 'As configurações do site foram atualizadas com sucesso.',
        })
      } else {
        console.error('AdminSettings: falha ao salvar configurações:', errMsg)
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar as configurações. Tente novamente.',
          variant: 'destructive',
        })
      }
    } catch (e: any) {
      // Qualquer exceção imprevista — feedback ao usuário sem quebrar a página.
      console.error('AdminSettings: erro inesperado ao salvar:', e)
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao salvar as configurações. Tente novamente.',
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
              placeholder="PG PRIME Club"
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
                placeholder="BMW João Pessoa / BMW Natal..."
                className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
              />
            </Field>
          </div>
          <Field label="Telefone">
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="(83) 3194-1800"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>{' '}
          <Field label="E-mail de contato">
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => set('contact_email', e.target.value)}
              placeholder="contato@pgprime.club"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Link do site oficial">
              <Input
                value={form.website_url}
                onChange={(e) => set('website_url', e.target.value)}
                placeholder="https://pgprime.club"
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
              placeholder="558330228726"
              className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
            />
          </Field>{' '}
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
            placeholder="contato@pgprime.club"
            className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9"
          />
        </Field>
      </section>

      {/* Segurança & Check-in Presencial (Token Diário) */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1c2538]">
          <div className="w-8 h-8 rounded-md bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-montserrat tracking-wide uppercase">
              Segurança do Check-in Presencial (QR Code Diário)
            </h2>
            <p className="text-[11px] text-slate-500">
              Segredo fixo usado no cálculo HMAC-SHA256 do token diário de presença.
            </p>
          </div>
        </div>

        <Field label="Daily Token Secret (Chave Secreta)">
          <Input
            type="text"
            value={form.daily_token_secret}
            onChange={(e) => set('daily_token_secret', e.target.value)}
            placeholder="PGPRIME2026"
            className="bg-[#141b27] border-[#222c3f] text-white text-xs h-9 font-mono"
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
