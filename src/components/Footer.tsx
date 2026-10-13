import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Instagram, Facebook, Youtube, Globe } from 'lucide-react'
import logoImage from '@/assets/logo-e67e1.jpeg'
import { settingsService, SiteSettings } from '@/services/settings'

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

  const address =
    settings?.address || 'Av. Pref. Luis Latorre, 4501 - Loja A - Retiro, Jundiaí - SP, 13209-430'
  const phone = settings?.phone || '(11) 4839-1010'
  const websiteUrl = settings?.website_url || 'https://jundiai.bmwmotorrad.euromotors.com.br'
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, '')
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/euromotorsmotorrad'
  const facebookUrl = settings?.facebook_url || 'https://facebook.com/euromotorsmotorrad'
  const youtubeUrl = settings?.youtube_url || 'https://youtube.com/@euromotorsmotorrad'
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
              src="/visual-edits/whatsapp-image-2026-10-13-at-17-22-31-6eb67bad.jpg"
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

        {/* Linha de contato / endereço */}
        <div className="mt-8 pt-6 border-t border-[#121c2e] grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px]">
          <div className="flex items-start gap-2 justify-center sm:justify-start">
            <MapPin className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <span className="text-slate-400 leading-relaxed whitespace-pre-line">{address}</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Phone className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
            <a
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {phone}
            </a>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
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
