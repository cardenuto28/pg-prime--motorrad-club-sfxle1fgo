import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { rideService, type Ride } from '@/services/api'
import { formatDate, isRidePast, resolveFileUrl, coverFallback } from '@/lib/member'
import {
  Calendar,
  MapPin,
  Clock,
  Compass,
  Bike,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

type FilterKey = 'abertos' | 'realizados' | 'todos'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'abertos', label: 'Inscrições Abertas' },
  { key: 'realizados', label: 'Realizados' },
  { key: 'todos', label: 'Todos' },
]

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  inscricoes_abertas: 'Inscrições Abertas',
  lotado: 'Lotado',
  inscricoes_encerradas: 'Inscrições Encerradas',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
}

const Passeios: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<FilterKey>('abertos')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await rideService.getAllRides()
      setRides(data)
    } catch (e) {
      console.error('Erro ao carregar passeios:', e)
      setError(true)
      setRides([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const visible = rides.filter((r) => r.status !== 'rascunho' && r.status !== 'cancelado')
    if (filter === 'abertos') {
      return visible.filter(
        (r) =>
          r.status === 'inscricoes_abertas' &&
          !isRidePast(r.date) &&
          !(r.max_bikes > 0 && (r.bikes_registered || 0) >= r.max_bikes),
      )
    }
    if (filter === 'realizados') {
      return visible.filter((r) => r.status === 'realizado' || isRidePast(r.date))
    }
    return visible
  }, [rides, filter])

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        {/* Header da página */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-[3px] bg-[#0066FF] rounded-full" />
            <span className="text-[10px] font-extrabold text-[#0066FF] uppercase tracking-widest font-montserrat">
              Agenda de Passeios
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-montserrat tracking-tight uppercase leading-none">
            PASSEIOS
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Acompanhe a agenda oficial do PG PRIME CLUB. Inscreva-se nos passeios abertos e relembre
            os destinos que já percorremos juntos.
          </p>
        </section>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] font-bold uppercase tracking-wider font-montserrat px-4 py-2 rounded-sm border transition-all ${
                filter === f.key
                  ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-blue-950/40'
                  : 'bg-[#0a0f1a] border-[#1c2538] text-slate-400 hover:text-white hover:border-[#0066FF]/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs tracking-widest uppercase font-montserrat">
              Carregando passeios...
            </span>
          </div>
        ) : error ? (
          <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-10 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              Não foi possível carregar os passeios no momento.
            </p>
            <Button
              onClick={load}
              variant="outline"
              className="border-[#0066FF] hover:border-blue-400 text-white font-bold text-xs tracking-wider uppercase"
            >
              Tentar novamente
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-12 text-center">
            <Bike className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhum passeio encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ride) => {
              const img =
                resolveFileUrl(ride.cover_image) ||
                coverFallback('motorcycle,bmw,serra,road', 600, 400)
              const bikes = ride.bikes_registered || 0
              const maxBikes = ride.max_bikes || 0
              const participants = ride.participants_registered || 0
              const isFull = maxBikes > 0 && bikes >= maxBikes
              const past = isRidePast(ride.date) || ride.status === 'realizado'
              const isOpen = ride.status === 'inscricoes_abertas' && !past && !isFull

              return (
                <Link
                  key={ride.id}
                  to={`/passeios/${ride.id}`}
                  className="group bg-[#0a0f1a] border border-[#1c2538] rounded-md overflow-hidden flex flex-col hover:border-[#0066FF]/60 transition-all duration-300 shadow-lg"
                >
                  {/* Capa */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={img}
                      alt={ride.name}
                      className="w-full h-full object-cover saturate-[1.1] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />

                    {/* Status badge */}
                    <span
                      className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest font-montserrat px-2.5 py-1 rounded border ${
                        isOpen
                          ? 'text-emerald-300 bg-emerald-950/80 border-emerald-700/50'
                          : past
                            ? 'text-slate-300 bg-[#0d1422]/90 border-[#222e43]'
                            : 'text-amber-300 bg-amber-950/80 border-amber-700/50'
                      }`}
                    >
                      {isOpen
                        ? 'Inscrições Abertas'
                        : past
                          ? 'Realizado'
                          : STATUS_LABEL[ride.status] || ride.status}
                    </span>

                    {/* Data badge */}
                    {ride.date && (
                      <div className="absolute bottom-3 right-3 bg-[#0066FF] text-white rounded-sm px-2 py-1 text-center shadow-md">
                        <span className="block text-xs font-black leading-none font-montserrat">
                          {formatDate(ride.date).split('/')[0] || ''}
                        </span>
                        <span className="block text-[8px] font-extrabold uppercase tracking-wider font-montserrat">
                          {formatDate(ride.date).split('/')[1]
                            ? MONTHS[Number(formatDate(ride.date).split('/')[1]) - 1]
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Corpo */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-montserrat line-clamp-2 leading-tight">
                      {ride.name}
                    </h3>

                    <div className="space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{formatDate(ride.date)}</span>
                        {ride.meeting_time && (
                          <span className="text-slate-500">· {ride.meeting_time}</span>
                        )}
                      </div>
                      {ride.destination && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{ride.destination}</span>
                        </div>
                      )}
                      {ride.distance_km ? (
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>{ride.distance_km} km</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Vagas */}
                    {!past && (
                      <div className="mt-auto pt-2 border-t border-[#1c2538] flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Bike className="w-3.5 h-3.5 text-slate-500" />
                          {maxBikes > 0 ? (
                            <>
                              <strong className="text-white">{bikes}</strong>
                              <span className="text-slate-500">/ {maxBikes} motos</span>
                            </>
                          ) : (
                            <span>Vagas livres</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <strong className="text-emerald-300">{participants}</strong>
                        </span>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-1">
                      <span
                        className={`w-full inline-flex items-center justify-center gap-1.5 font-bold text-[11px] tracking-wider uppercase h-9 rounded-sm border transition-all ${
                          isOpen
                            ? 'bg-[#0066FF] hover:bg-blue-500 border-[#0066FF] text-white'
                            : 'bg-[#0c1524] hover:bg-[#0d1828] border-[#182847] text-slate-200'
                        }`}
                      >
                        {isOpen ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ver Detalhes
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Ver Detalhes
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export default Passeios
