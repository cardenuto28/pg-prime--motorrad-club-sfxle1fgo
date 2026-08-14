import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070a] border-t border-[#141a26] text-slate-400 text-xs pt-12 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#141a26]">
          {/* Coluna 1: Logo */}
          <div className="lg:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2 group">
              <svg
                width="36"
                height="28"
                viewBox="0 0 100 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M10 20 L40 20 L25 50 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <path
                  d="M35 10 L85 10 L60 60 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <path d="M45 25 L95 25 L80 45 Z" fill="currentColor" opacity="0.8" />
              </svg>
              <div className="flex flex-col">
                <span className="font-bold tracking-[0.2em] text-sm text-white font-montserrat">
                  EUROMOTORS
                </span>
                <span className="text-[9px] tracking-[0.2em] text-slate-400 font-semibold">
                  MOTORRAD CLUB
                </span>
              </div>
            </Link>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-montserrat">
              NAVEGAÇÃO
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
              <a href="/club" className="hover:text-white transition-colors">
                Sobre o Clube
              </a>
              <a href="#o-club" className="hover:text-white transition-colors">
                O Club
              </a>
              <a href="#galeria" className="hover:text-white transition-colors">
                Galeria
              </a>
              <a href="#proximos-passeios" className="hover:text-white transition-colors">
                Passeios
              </a>
              <a href="#contato" className="hover:text-white transition-colors">
                Contato
              </a>
              <a href="#vantagens" className="hover:text-white transition-colors">
                Benefícios
              </a>
            </div>
          </div>

          {/* Coluna 3: Contato */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-montserrat">
              CONTATO
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>(11) 99999-2025</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>contato@euromotorsmc.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>São Paulo - SP</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Siga-nos */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-montserrat">
              SIGA-NOS
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#101522] border border-[#1d273a] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#101522] border border-[#1d273a] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#101522] border border-[#1d273a] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#101522] border border-[#1d273a] flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coluna 5: Slogan */}
          <div className="flex flex-col justify-center items-start lg:items-end">
            <p className="font-montserrat font-extrabold text-sm sm:text-base text-slate-400 uppercase tracking-widest leading-snug">
              MAIS QUE UMA MOTOCICLETA.
            </p>
            <p className="font-montserrat font-extrabold text-sm sm:text-base text-white uppercase tracking-widest leading-snug">
              UMA COMUNIDADE.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 text-center text-[10px] text-slate-500 font-medium">
          © 2025 EUROMOTORS MOTORRAD CLUB. TODOS OS DIREITOS RESERVADOS.
        </div>
      </div>
    </footer>
  )
}
