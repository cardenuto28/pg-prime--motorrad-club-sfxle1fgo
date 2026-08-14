import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'
import logoImage from '@/assets/logo-e67e1.jpeg'

export const Footer: React.FC = () => {
  return (
    <footer
      id="contato"
      className="bg-[#030509] border-t border-[#121c2e] text-slate-400 text-xs py-8"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#121c2e]">
          {/* Seção SIGA-NOS à esquerda */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold text-slate-400 tracking-widest uppercase font-montserrat">
              SIGA-NOS
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#081329] border border-[#1a2b48] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#081329] border border-[#1a2b48] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#081329] border border-[#1a2b48] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#0066FF] transition-all"
                aria-label="Youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Logo centralizado */}
          <div className="flex items-center justify-center">
            <Link to="/">
              <img
                src={logoImage}
                alt="EUROMOTORS MOTORRAD CLUB"
                className="h-10 sm:h-12 w-auto object-contain transition-opacity hover:opacity-90"
              />
            </Link>
          </div>

          {/* Slogan à direita */}
          <div className="text-center md:text-right">
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase font-montserrat leading-tight">
              MAIS QUE UM CLUBE.
            </p>
            <p className="text-sm font-black text-white tracking-widest uppercase font-montserrat leading-tight">
              UMA TRIBO.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 text-center text-[10px] text-slate-500 font-medium tracking-wider font-montserrat">
          © 2025 EUROMOTORS MOTORRAD CLUB. TODOS OS DIREITOS RESERVADOS.
        </div>
      </div>
    </footer>
  )
}
