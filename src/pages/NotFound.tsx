/* 404 Page - Displays when a user attempts to access a non-existent route */
import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Compass, ChevronLeft } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-white font-sans selection:bg-blue-600 selection:text-white px-4">
      <div className="text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#0066FF]/15 border border-[#0066FF]/30 flex items-center justify-center text-[#3b82f6]">
            <Compass className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-6xl sm:text-7xl font-black text-white font-montserrat tracking-tight mb-3">
          404
        </h1>
        <p className="text-base sm:text-lg text-slate-300 font-semibold mb-2">
          Oops! Página não encontrada
        </p>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-8">
          A página que você procura não existe ou foi movida. Verifique o endereço ou volte para a
          página inicial do Euro Motors Motorrad Club.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs tracking-wider uppercase px-7 py-3.5 rounded-md shadow-lg shadow-blue-900/30 transition-all font-montserrat"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}

export default NotFound
