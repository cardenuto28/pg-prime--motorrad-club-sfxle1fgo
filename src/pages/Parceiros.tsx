import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Handshake, MapPin, Globe, Phone, Tag, ChevronRight, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Partner, partnerService } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import {
  resolveFileUrl,
  coverFallback,
  PartnerCategoryBadge,
  partnerCategoryLabel,
  PARTNER_CATEGORIES,
  type PartnerCategory,
} from '@/lib/member'

const PublicParceiros: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await partnerService.getActivePartners()
        setPartners(data)
      } catch (e) {
        console.error('Erro ao carregar parceiros:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (activeCat === 'all') return partners
    return partners.filter((p) => p.category === activeCat)
  }, [partners, activeCat])

  // Conta por categoria para mostrar apenas as relevantes nos pills
  const catsWithCount = useMemo(() => {
    const map = new Map<string, number>()
    partners.forEach((p) => {
      const k = p.category || 'outros'
      map.set(k, (map.get(k) || 0) + 1)
    })
    return map
  }, [partners])

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#141a26]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1400/500?q=bmw,motorcycle,hotel,resort"
            alt="Parceiros"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-[#07090e]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/90 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-300 bg-blue-950/60 border border-blue-700/50 px-2.5 py-1 rounded uppercase tracking-widest font-montserrat">
              <Handshake className="w-3.5 h-3.5" /> Rede Credenciada
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-montserrat tracking-tight uppercase leading-none drop-shadow-md">
              Parceiros
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Hotéis, restaurantes, seguros e muito mais. Conheça os parceiros credenciados que
              oferecem condições especiais para os membros do PG PRIME CLUB.
            </p>
          </div>
        </div>
      </section>

      {/* Filtros + Grid */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Pills de categoria */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <CategoryPill
            label="Todos"
            count={partners.length}
            active={activeCat === 'all'}
            onClick={() => setActiveCat('all')}
          />
          {PARTNER_CATEGORIES.filter((c) => (catsWithCount.get(c) || 0) > 0).map((c) => (
            <CategoryPill
              key={c}
              label={partnerCategoryLabel(c)}
              count={catsWithCount.get(c) || 0}
              active={activeCat === c}
              onClick={() => setActiveCat(c)}
            />
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-12 text-center">
            <Handshake className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Nenhum parceiro encontrado nesta categoria no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const logo = resolveFileUrl(p.logo) || coverFallback('partner,store,brand', 400, 300)
              return (
                <div
                  key={p.id}
                  className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden flex flex-col group hover:border-blue-600/50 transition-all duration-300"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={logo}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/40 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <PartnerCategoryBadge category={p.category} />
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1">
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase font-montserrat">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {p.description}
                      </p>
                    )}

                    {p.discount_info && (
                      <div className="flex items-start gap-2 bg-[#121824] border border-[#1c2538] rounded-sm p-2.5">
                        <Tag className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                            Condição para membros
                          </p>
                          <p className="text-[11px] text-slate-300">{p.discount_info}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 text-[11px] text-slate-400">
                      {p.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.city}</span>
                        </div>
                      )}
                      {p.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.phone}</span>
                        </div>
                      )}
                      {p.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 truncate"
                          >
                            {p.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {p.website && (
                    <div className="p-4 pt-0">
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 border border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase transition-all"
                      >
                        Visitar parceiro <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        {!user && partners.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-6 sm:p-8 text-center">
            <h2 className="text-lg font-extrabold text-white font-montserrat tracking-tight uppercase">
              Aproveite as vantagens desses parceiros
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
              Faça parte do PG PRIME CLUB e tenha acesso a condições exclusivas em toda a nossa rede
              credenciada.
            </p>
            <Button
              onClick={() => navigate('/#cadastro-form')}
              className="mt-4 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-6 py-3 h-auto rounded-sm gap-2 uppercase"
            >
              <ShieldCheck className="w-4 h-4" /> QUERO FAZER PARTE{' '}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

const CategoryPill: React.FC<{
  label: string
  count: number
  active: boolean
  onClick: () => void
}> = ({ label, count, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-full border uppercase font-montserrat transition-colors ${
      active
        ? 'bg-blue-600 text-white border-blue-500'
        : 'bg-[#0e131d] text-slate-400 border-[#1c2538] hover:text-white hover:border-blue-600/50'
    }`}
  >
    {label}
    <span
      className={`text-[9px] px-1.5 py-0.5 rounded-full ${
        active ? 'bg-white/20 text-white' : 'bg-[#1c2538] text-slate-500'
      }`}
    >
      {count}
    </span>
  </button>
)

export default PublicParceiros
