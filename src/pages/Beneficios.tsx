import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gift, Store, Tag, CalendarClock, ChevronRight, Bike, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Benefit, benefitService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { resolveFileUrl, coverFallback, formatDate } from '@/lib/member'

const PublicBeneficios: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await benefitService.getActiveBenefits()
        setBenefits(data)
      } catch (e) {
        console.error('Erro ao carregar benefícios:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#141a26]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1400/500?q=bmw,motorcycle,vip,luxury"
            alt="Benefícios do Club"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-[#07090e]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/90 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-300 bg-blue-950/60 border border-blue-700/50 px-2.5 py-1 rounded uppercase tracking-widest font-montserrat">
              <Gift className="w-3.5 h-3.5" /> Vantagens Exclusivas
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-montserrat tracking-tight uppercase leading-none drop-shadow-md">
              Benefícios do ClubE
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Condições exclusivas e descontos especiais com nossos parceiros credenciados,
              disponíveis apenas para membros do Euro Motors Motorrad Club.
            </p>
            {user ? (
              <Button
                onClick={() => navigate('/member/beneficios')}
                className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-6 py-3 h-auto rounded-sm gap-2 uppercase"
              >
                <Bike className="w-4 h-4" /> Ver meus benefícios{' '}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/#cadastro-form')}
                className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-6 py-3 h-auto rounded-sm gap-2 uppercase"
              >
                <ShieldCheck className="w-4 h-4" /> Quero fazer parte{' '}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : benefits.length === 0 ? (
          <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-12 text-center">
            <Gift className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Nenhum benefício disponível no momento. Volte em breve!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => {
              const img = resolveFileUrl(b.image) || coverFallback('discount,store,benefit')
              return (
                <div
                  key={b.id}
                  className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden flex flex-col group hover:border-blue-600/50 transition-all duration-300"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={img}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/40 to-transparent" />
                    {b.partner && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold text-blue-300 bg-blue-950/80 border border-blue-700/50 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <Store className="w-3 h-3" /> {b.partner}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-3 flex-1">
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase font-montserrat">
                      {b.title}
                    </h3>
                    {b.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {b.description}
                      </p>
                    )}

                    {b.exclusive_condition && (
                      <div className="flex items-start gap-2 bg-[#121824] border border-[#1c2538] rounded-sm p-2.5">
                        <Tag className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                            Condição exclusiva
                          </p>
                          <p className="text-[11px] text-slate-300 line-clamp-2">
                            {b.exclusive_condition}
                          </p>
                        </div>
                      </div>
                    )}

                    {b.valid_until && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          <span className="text-slate-500">Validade: </span>
                          {formatDate(b.valid_until)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 pt-0">
                    {user ? (
                      <Link
                        to="/member/beneficios"
                        className="w-full flex items-center justify-center gap-1.5 border border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase transition-all"
                      >
                        Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Button
                        onClick={() => navigate('/#cadastro-form')}
                        className="w-full bg-blue-600/90 hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase"
                      >
                        Seja membro para utilizar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA底部 */}
        {!user && benefits.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-6 sm:p-8 text-center">
            <h2 className="text-lg font-extrabold text-white font-montserrat tracking-tight uppercase">
              Faça parte do Euro Motors Motorrad Club
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
              Acesse todos os benefícios exclusivos, participe de passeios e conecte-se com a
              comunidade BMW Motorrad Euro Motors Jundiaí.
            </p>
            <Button
              onClick={() => navigate('/#cadastro-form')}
              className="mt-4 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-6 py-3 h-auto rounded-sm gap-2 uppercase"
            >
              QUERO FAZER PARTE <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default PublicBeneficios
