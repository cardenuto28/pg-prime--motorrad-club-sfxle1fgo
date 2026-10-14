import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Images, Calendar, ChevronRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Gallery, galleryService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/member'
import { GalleryGrid, galleriesToTiles, type GalleryTile } from '@/components/gallery/GalleryGrid'
import {
  GalleryLightbox,
  galleryToLightboxItems,
  type LightboxItem,
} from '@/components/gallery/GalleryLightbox'
import { GalleryFilter, buildFilterOptions } from '@/components/gallery/GalleryFilter'

const GaleriaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRide = searchParams.get('ride') || ''

  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await galleryService.getAll()
        setGalleries(data)
        // Pré-seleciona filtro por ride se vier na query string
        if (initialRide) {
          const match = data.find((g) => g.ride === initialRide)
          if (match) setFilter(match.id)
        }
      } catch (e) {
        console.error('Erro ao carregar galeria:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialRide])

  const filteredGalleries = useMemo(() => {
    if (filter === 'all') return galleries
    return galleries.filter((g) => g.id === filter)
  }, [galleries, filter])

  const tiles: GalleryTile[] = useMemo(
    () => galleriesToTiles(filteredGalleries),
    [filteredGalleries],
  )

  const lightboxItems: LightboxItem[] = useMemo(
    () => galleryToLightboxItems(filteredGalleries),
    [filteredGalleries],
  )

  const filterOptions = useMemo(() => buildFilterOptions(galleries), [galleries])

  const handleFilterChange = (v: string) => {
    setFilter(v)
    // Limpa o ride da URL ao trocar manualmente
    if (searchParams.get('ride')) {
      searchParams.delete('ride')
      setSearchParams(searchParams, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-blue-500" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-montserrat">
              Galeria
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-montserrat tracking-tight uppercase">
            Galeria de Momentos
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Reviva os melhores momentos dos nossos passeios, viagens, eventos e encontros do PG
            PRIME CLUB.
          </p>
        </div>

        {/* Filter */}
        {galleries.length > 0 && (
          <div className="mb-8">
            <GalleryFilter options={filterOptions} value={filter} onChange={handleFilterChange} />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tiles.length === 0 ? (
          <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-16 text-center">
            <Images className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-sm text-slate-500">
              Nenhuma foto ou vídeo publicado ainda nesta galeria.
            </p>
          </div>
        ) : (
          <>
            <GalleryGrid tiles={tiles} onOpen={(i) => setLightboxIndex(i)} />

            {/* Album info */}
            {filter !== 'all' && (
              <div className="mt-8 bg-[#0e131d] border border-[#1c2538] rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white font-montserrat tracking-wide uppercase">
                      {filteredGalleries[0]?.title}
                    </p>
                    {filteredGalleries[0]?.event_date && (
                      <p className="text-[11px] text-slate-400">
                        {formatDate(filteredGalleries[0].event_date)}
                      </p>
                    )}
                    {filteredGalleries[0]?.description && (
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
                        {filteredGalleries[0].description}
                      </p>
                    )}
                  </div>
                </div>
                {filteredGalleries[0]?.ride && (
                  <a href={`/passeios/${filteredGalleries[0].ride}`}>
                    <Button
                      variant="outline"
                      className="border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider uppercase gap-1.5"
                    >
                      Ver passeio <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <GalleryLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  )
}

export default GaleriaPage
