import React from 'react'
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Globe } from 'lucide-react'
import logoImage from '@/assets/logo-e67e1.jpeg'

export const Footer: React.FC = () => {
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
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[#1c2538] bg-[#0a0d14] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] hover:bg-[#0066FF]/10 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-[#1c2538] bg-[#0a0d14] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] hover:bg-[#0066FF]/10 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
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
              src={logoImage}
              alt="EUROMOTORS MOTORRAD CLUB"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Direita: Slogan */}
          <div className="flex flex-col items-center md:items-end gap-1 order-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-montserrat">
              MAIS QUE UM CLUBE.
            </span>
            <span className="text-sm font-black text-white uppercase tracking-tight font-montserrat">
              UMA TRIBO.
            </span>
          </div>
        </div>

        {/* Linha de contato / endereço */}
        <div className="mt-8 pt-6 border-t border-[#121c2e] grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px]">
          <div className="flex items-start gap-2 justify-center sm:justify-start">
            <MapPin className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0 mt-0.5" />
            <span className="text-slate-400 leading-relaxed">
              Av. Pref. Luis Latorre, 4501 - Loja A - Retiro,
              <br />
              Jundiaí - SP, 13209-430
            </span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Phone className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
            <a
              href="tel:+551148391010"
              className="text-slate-400 hover:text-white transition-colors"
            >
              (11) 4839-1010
            </a>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <Globe className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
            <a
              href="https://jundiai.bmwmotorrad.euromotors.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors truncate"
            >
              jundiai.bmwmotorrad.euromotors.com.br
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#121c2e] py-5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-slate-500 font-medium tracking-wider font-montserrat uppercase">
          © 2025 EUROMOTORS MOTORRAD CLUB. TODOS OS DIREITOS RESERVADOS.
        </div>
      </div>
    </footer>
  )
}
