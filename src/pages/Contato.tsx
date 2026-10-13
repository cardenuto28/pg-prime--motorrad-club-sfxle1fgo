import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Phone, Mail, MapPin, Globe, Send, ChevronRight, MessageCircle } from 'lucide-react'
import { settingsService, SiteSettings } from '@/services/settings'
import { DEALERSHIP_UNITS } from '@/lib/dealerships'

export default function Contato() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [activeUnitId, setActiveUnitId] = useState<string>(DEALERSHIP_UNITS[0].id)
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

  const contactEmail = settings?.contact_email || 'motorradclub@euromotors.com.br'
  const websiteUrl = settings?.website_url || 'https://jundiai.bmwmotorrad.euromotors.com.br'
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, '')

  const currentUnit = DEALERSHIP_UNITS.find((u) => u.id === activeUnitId) || DEALERSHIP_UNITS[0]
  const currentMapQuery = encodeURIComponent(
    `${currentUnit.name}, ${currentUnit.address}, ${currentUnit.cityState}`,
  )

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
                NOSSAS CONCESSIONÁRIAS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visite nossas concessionárias ou fale diretamente com a equipe de cada unidade.
              </p>
            </div>

            {/* Cards das duas unidades */}
            <div className="space-y-4">
              {DEALERSHIP_UNITS.map((unit) => {
                const isSelected = unit.id === activeUnitId
                return (
                  <div
                    key={unit.id}
                    className={`rounded-xl border p-5 transition-all ${
                      isSelected
                        ? 'border-[#0066FF] bg-[#071124] ring-1 ring-[#0066FF]/40'
                        : 'border-[#172236] bg-[#080d19] hover:border-[#1f304f]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase font-montserrat tracking-wide">
                          {unit.name}
                        </h3>
                        <p className="text-[11px] text-[#0066FF] font-semibold mt-0.5">
                          {unit.cityState}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveUnitId(unit.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-colors ${
                          isSelected
                            ? 'bg-[#0066FF] text-white'
                            : 'bg-[#121c2e] text-slate-400 hover:text-white hover:bg-[#1a273f]'
                        }`}
                      >
                        {isSelected ? 'Mapa Ativo' : 'Ver no Mapa'}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-200">{unit.address}</p>
                          <p className="text-[11px] text-slate-400">{unit.cityState}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#141e30]">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-500 uppercase block font-medium">
                              Contato
                            </span>
                            <a
                              href={unit.phoneHref}
                              className="text-xs font-semibold text-white hover:text-[#0066FF] hover:underline transition-colors"
                            >
                              {unit.phone}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-500 uppercase block font-medium">
                              WhatsApp
                            </span>
                            <a
                              href={unit.whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                            >
                              {unit.whatsapp}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Canais gerais */}
            <div className="pt-2 border-t border-[#121c2e] space-y-4">
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

            {/* Mapa da concessionária selecionada */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-montserrat">
                  COMO CHEGAR — {currentUnit.name.toUpperCase()}
                </h3>
                <span className="text-[10px] text-slate-500">{currentUnit.shortName}</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-[#1c2538] h-64">
                <iframe
                  title={`Mapa ${currentUnit.name}`}
                  src={`https://www.google.com/maps?q=${currentMapQuery}&output=embed`}
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
