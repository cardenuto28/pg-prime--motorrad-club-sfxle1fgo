import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'
import logoImage from '@/assets/logo-e67e1.jpeg'

export const Footer: React.FC = () => {
  return (
    <footer
      id="contato"
      className="bg-[#05070d] border-t border-[#121c2e] text-slate-400 text-xs py-6"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-slate-500 font-medium tracking-wider font-montserrat">
        © 2025 EUROMOTORS MOTORRAD CLUB. TODOS OS DIREITOS RESERVADOS.
      </div>
    </footer>
  )
}
