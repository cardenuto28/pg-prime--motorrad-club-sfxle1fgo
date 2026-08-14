import React, { useEffect, useState, useMemo } from 'react'
import { Images, X, Calendar } from 'lucide-react'
import { Gallery, galleryService } from '@/services/api'
import { resolveFileUrl, parseGalleryImages, coverFallback, formatDate } from '@/lib/member'

const MemberGaleria: React.FC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<{ urls: string[]; index: number; title: string } | null>(
    null,
  )

  useEffect(() => {
    const load = async () => {
      try {
        const data = await galleryService.getAllGalleries()
        setGalleries(data)
      } catch (e) {
        console.error('Erro ao carregar galeria:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Build a flat grid of {url, title, event_date} tiles from all galleries.
  const tiles = useMemo(() => {
    const out: { url: string; title: string; date?: string }[] = []
    galleries.forEach((g) => {
      const imgs = parseGalleryImages(g.images_json, 'motorcycle')
      const cover = resolveFileUrl(g.cover_image)
      if (imgs.length === 0 && cover) {
        out.push({ url: cover, title: g.title, date: g.event_date })
      }
      imgs.forEach((url) => out.push({ url, title: g.title, date: g.event_date }))
    })
    return out
  }, [galleries])

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

      {tiles.length === 0 ? (
        <div className="bg-[#0e131d] border border-dashed border-[#1c2538] rounded-md p-10 text-center">
          <Images className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhuma foto publicada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tiles.map((tile, idx) => (
            <button
              key={idx}
              onClick={() =>
                setActive({
                  urls: tiles.map((t) => t.url),
                  index: idx,
                  title: tile.title,
                })
              }
              className="relative h-28 sm:h-32 rounded-md overflow-hidden border border-[#1c2538] group cursor-pointer"
            >
              <img
                src={tile.url}
                alt={tile.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-white truncate text-left">{tile.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
            onClick={() => setActive(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={active.urls[active.index]}
            alt={active.title}
            className="max-w-full max-h-[85vh] object-contain rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-white font-montserrat tracking-wide">{active.title}</p>
            <p className="text-[10px] text-slate-400">
              {active.index + 1} / {active.urls.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberGaleria
