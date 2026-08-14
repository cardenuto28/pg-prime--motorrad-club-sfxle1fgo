import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Images } from 'lucide-react'
import { Gallery, galleryService } from '@/services/api'
import { GalleryGrid, galleriesToTiles, type GalleryTile } from '@/components/gallery/GalleryGrid'
import {
  GalleryLightbox,
  galleryToLightboxItems,
  type LightboxItem,
} from '@/components/gallery/GalleryLightbox'
import { GalleryFilter, buildFilterOptions } from '@/components/gallery/GalleryFilter'

const MemberGaleria: React.FC = () => {
  const [searchParams] = useSearchParams()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight flex items-center gap-2">
          <Images className="w-5 h-5 text-blue-500" /> Galeria do Clube
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Reviva os melhores momentos dos nossos passeios e eventos.
        </p>
      </div>

      {galleries.length > 0 && (
        <GalleryFilter options={filterOptions} value={filter} onChange={setFilter} />
      )}

      {tiles.length === 0 ? (
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-10 text-center">
          <Images className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhuma foto publicada ainda.</p>
        </div>
      ) : (
        <GalleryGrid tiles={tiles} onOpen={(i) => setLightboxIndex(i)} />
      )}

      <GalleryLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  )
}

export default MemberGaleria
