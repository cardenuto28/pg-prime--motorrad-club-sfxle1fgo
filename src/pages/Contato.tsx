import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Phone, Mail, MapPin, Globe, Send, ChevronRight } from 'lucide-react'
import { settingsService, SiteSettings } from '@/services/settings'

export default function Contato() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings()
      if (data) {
        setSettings(data)
      }
    } catch (err) {
      console.warn('Contato: erro ao carregar configurações de contato:', err)
    }
  }

  const address =
    settings?.address || 'Av. Pref. Luis Latorre, 4501 - Loja A - Retiro, Jundiaí - SP, 13209-430'
  const phone = settings?.phone || '(11) 4839-1010'
  const contactEmail = settings?.contact_email || 'contato@euromotorsmotorrad.com.br'
  const websiteUrl = settings?.website_url || 'https://jundiai.bmwmotorrad.euromotors.com.br'
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, '')
  const phoneHref = `tel:${phone.replace(/\D/g, '')}`
  const mapQuery = encodeURIComponent(address)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Informe seu nome.'
    if (!form.email.trim()) {
      e.email = 'Informe seu e-mail.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'E-mail inválido.'
    }
    if (!form.subject.trim()) e.subject = 'Informe o assunto.'
    if (!form.message.trim()) e.message = 'Escreva sua mensagem.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    toast({
      title: 'Mensagem enviada',
      description: 'Recebemos sua mensagem. Em breve entraremos em contato.',
    })
    setForm({ name: '', email: '', subject: '', message: '' })
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-[#05070d] text-[#e2e8f0] font-sans selection:bg-[#0066FF] selection:text-white">
      <Header />

      <main className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero */}
        <section className="relative w-full rounded-xl overflow-hidden bg-[#060812] border border-[#131d30] shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img
              src="https://img.usecurling.com/p/1600/400?q=motorcycle,road,sunset,blue"
              alt="Contato PG PRIME CLUB"
              className="w-full h-full object-cover object-center saturate-[1.1] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/90 via-[#05070d]/55 to-[#05070d]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070d]/85 via-transparent to-black/20" />
          </div>
          <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-12 lg:py-16">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#0066FF] uppercase tracking-widest block font-montserrat">
                PG PRIME CLUB
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] uppercase font-montserrat drop-shadow-2xl">
                CONTATO
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Fale com a nossa equipe. Estamos prontos para tirar suas dúvidas e receber você na
                nossa comunidade.
              </p>
              <div className="pt-2">
                <Link to="/club">
                  <Button className="bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-7 py-3 h-auto rounded-sm uppercase shadow-xl shadow-blue-950/60 transition-all gap-2">
                    CONHEÇA O CLUBE <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Conteúdo: contato + formulário */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações de contato */}
          <div className="bg-[#060a14] border border-[#121c2e] rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-sm font-extrabold text-slate-400 tracking-widest uppercase font-montserrat">
                INFORMAÇÕES
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visite-nos ou entre em contato pelos canais abaixo.
              </p>
            </div>

            <div className="space-y-5">
              <ContactItem icon={<MapPin className="w-4 h-4" />} label="Endereço" value={address} />
              <ContactItem
                icon={<Phone className="w-4 h-4" />}
                label="Telefone"
                value={phone}
                href={phoneHref}
              />
              <ContactItem
                icon={<Mail className="w-4 h-4" />}
                label="E-mail"
                value={contactEmail}
                href={`mailto:${contactEmail}`}
              />
              <ContactItem
                icon={<Globe className="w-4 h-4" />}
                label="Site oficial"
                value={websiteDisplay}
                href={websiteUrl}
                external
              />
            </div>

            {/* Mapa */}
            <div className="pt-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-montserrat mb-2">
                COMO CHEGAR
              </h3>
              <div className="rounded-lg overflow-hidden border border-[#1c2538] h-64">
                <iframe
                  title="Mapa PG PRIME"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(0.3) invert(0.9) hue-rotate(180deg)' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-[#060a14] border border-[#121c2e] rounded-xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-400 tracking-widest uppercase font-montserrat">
                ENVIE SUA MENSAGEM
              </h2>
              <p className="text-xs text-slate-500 mt-1">Retornaremos o mais breve possível.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-300 font-medium">Nome *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
                />
                {errors.name && <p className="text-[10px] text-red-400">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-300 font-medium">E-mail *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu.email@exemplo.com"
                  className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
                />
                {errors.email && <p className="text-[10px] text-red-400">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-300 font-medium">Assunto *</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Sobre o que deseja falar?"
                  className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 h-10"
                />
                {errors.subject && <p className="text-[10px] text-red-400">{errors.subject}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-slate-300 font-medium">Mensagem *</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  placeholder="Escreva sua mensagem..."
                  className="bg-[#141b27] border-[#222c3f] text-white text-xs placeholder:text-slate-500 resize-none"
                />
                {errors.message && <p className="text-[10px] text-red-400">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider h-11 gap-2 uppercase"
              >
                <Send className="w-4 h-4" /> Enviar Mensagem
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

const ContactItem: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  href?: string
  external?: boolean
}> = ({ icon, label, value, href, external }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-full bg-[#061022]/80 border border-[#0066FF]/50 flex items-center justify-center text-[#0066FF] flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-xs text-slate-200 hover:text-white transition-colors break-words"
        >
          {value}
        </a>
      ) : (
        <p className="text-xs text-slate-200 break-words">{value}</p>
      )}
    </div>
  </div>
)
