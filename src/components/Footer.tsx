import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Instagram, Facebook, Youtube, Globe, MessageCircle } from 'lucide-react'
import { PG_PRIME_LOGO_URL } from '@/lib/branding'
import { settingsService, SiteSettings } from '@/services/settings'
import { DEALERSHIP_UNITS } from '@/lib/dealerships'

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    settingsService
      .getSettings()
      .then((res) => {
        if (res) setSettings(res)
      })
      .catch(() => {})
  }, [])

  const websiteUrl = settings?.website_url || 'https://pgprime.club'
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, '')
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/pgprime'
  const facebookUrl = settings?.facebook_url || 'https://facebook.com/pgprime'
  const youtubeUrl = settings?.youtube_url || 'https://youtube.com/@pgprime'
  const slogan = settings?.slogan || 'Mais que um clube. Uma tribo.'

  return (
    <footer id="contato" className="bg-[#05070d] border-t border-[#121c2e] text-slate-400">
      {/* Linha superior com 3 colunas */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          {/* Esquerda: SIGA-NOS */}
          <div className="flex flex-col items-center md:items-start gap-3 order-2 md:order-1">
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-widest font-montserrat">
              SIGA-NOS
            </span>
            <div className="flex items-center gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[#1c2538] bg-[#0a0d14] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] hover:bg-[#0066FF]/10 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-[#1c2538] bg-[#0a0d14] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] hover:bg-[#0066FF]/10 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-[#1c2538] bg-[#0a0d14] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] hover:bg-[#0066FF]/10 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Centro: Logo */}
          <div className="flex items-center justify-center order-1 md:order-2">
            <img
              src={PG_PRIME_LOGO_URL}
              alt="PG PRIME CLUB"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Direita: Slogan */}
          <div className="flex flex-col items-center md:items-end gap-1 order-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-montserrat">
              {slogan.includes('.') ? slogan.split('.')[0] + '.' : slogan}
            </span>
            <span className="text-sm font-black text-white uppercase tracking-tight font-montserrat">
              {slogan.includes('.')
                ? slogan.split('.').slice(1).join('.').trim() || 'UMA TRIBO.'
                : 'UMA TRIBO.'}
            </span>
          </div>
        </div>

        {/* Cards das duas unidades oficiais PG PRIME */}
        <div className="mt-8 pt-6 border-t border-[#121c2e]">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-widest font-montserrat">
              NOSSAS CONCESSIONÁRIAS
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <Globe className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors truncate"
              >
                {websiteDisplay}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            {DEALERSHIP_UNITS.map((unit) => (
              <div
                key={unit.id}
                className="rounded-lg border border-[#1a2436] bg-[#070b14]/80 p-4 hover:border-[#0066FF]/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#141d2e]">
                  <span className="font-bold text-white font-montserrat tracking-wide">
                    {unit.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#0066FF] bg-[#0066FF]/10 px-2 py-0.5 rounded border border-[#0066FF]/20">
                    {unit.cityState}
                  </span>
                </div>

                <div className="space-y-2 text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {unit.address} — {unit.cityState}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
                      <span className="text-slate-500 font-medium">Tel:</span>
                      <a
                        href={unit.phoneHref}
                        className="text-slate-200 hover:text-white hover:underline transition-colors font-medium"
                      >
                        {unit.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-500 font-medium">WhatsApp:</span>
                      <a
                        href={unit.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-medium"
                      >
                        {unit.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright e Links Legais */}
      <div className="border-t border-[#121c2e] py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[10px] text-slate-500 font-medium tracking-wider font-montserrat uppercase">
          <div>© 2025 PG PRIME CLUB. TODOS OS DIREITOS RESERVADOS.</div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/termos" className="hover:text-[#0066FF] transition-colors">
              Termos
            </Link>
            <span className="text-slate-700">•</span>
            <Link to="/politica-de-privacidade" className="hover:text-[#0066FF] transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
