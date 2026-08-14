import React from 'react'
import { Construction } from 'lucide-react'

interface AdminPlaceholderProps {
  title: string
  description?: string
}

/** Placeholder page for admin sections still under development. */
const AdminPlaceholder: React.FC<AdminPlaceholderProps> = ({ title, description }) => (
  <div className="space-y-6">
    <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
        Painel Administrativo
      </p>
      <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1">
        {title}
      </h1>
    </section>

    <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-12 sm:p-16 text-center">
      <div className="w-14 h-14 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-4">
        <Construction className="w-6 h-6" />
      </div>
      <h2 className="text-sm font-bold text-white font-montserrat tracking-wide uppercase">
        Funcionalidade em desenvolvimento
      </h2>
      <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
        {description ||
          `A seção "${title}" estará disponível em breve. Estamos trabalhando para liberá-la o quanto antes.`}
      </p>
    </div>
  </div>
)

export default AdminPlaceholder
