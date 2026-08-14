import React from 'react'
import { Play } from 'lucide-react'
import { Gallery } from '@/services/api'
import { resolveFileUrl, getVideoThumb } from '@/lib/member'

export interface GalleryTile {
  /** Id único do tile (gallery.id + index). */
  key: string
  /** URL da imagem exibida no grid (thumbnail). */
  thumb: string
  /** URL da imagem em tamanho cheio para o lightbox (vazia para vídeos). */
  fullUrl: string
  title: string
  type: 'photo' | 'video'
  videoUrl?: string
  galleryId: string
  rideId?: string
  /** Altura variável para masonry (px). */
  height: number
}

/** Alturas variadas para efeito masonry. */
const HEIGHTS = [220, 280, 320, 260, 340, 240, 300]

/** Constrói a lista de tiles a partir das galerias. */
export function galleriesToTiles(galleries: Gallery[]): GalleryTile[] {
  const tiles: GalleryTile[] = []
  let hIdx = 0
  galleries.forEach((g) => {
    if (g.type === 'video' || (!g.images_json && g.video_url)) {
      if (g.video_url) {
        const thumb = g.cover_image
          ? resolveFileUrl(g.cover_image)
          : getVideoThumb(g.video_url) || 'https://img.usecurling.com/p/800/500?q=video,motorcycle'
        tiles.push({
          key: `${g.id}-vid`,
          thumb,
          fullUrl: '',
          title: g.title,
          type: 'video',
          videoUrl: g.video_url,
          galleryId: g.id,
          rideId: g.ride,
          height: HEIGHTS[hIdx++ % HEIGHTS.length],
        })
      }
      return
    }

    let arr: unknown = g.images_json
    if (typeof arr === 'string') {
      try {
        arr = JSON.parse(arr)
      } catch {
        arr = []
      }
    }
    const imgs: string[] = []
    if (Array.isArray(arr)) {
      arr.forEach((it) => {
        const url = typeof it === 'string' ? it : (it as any)?.url || (it as any)?.src
        if (url) imgs.push(resolveFileUrl(url))
      })
    }
    if (imgs.length === 0 && g.cover_image) {
      imgs.push(resolveFileUrl(g.cover_image))
    }
    imgs.forEach((url, i) => {
      tiles.push({
        key: `${g.id}-${i}`,
        thumb: url,
        fullUrl: url,
        title: g.title,
        type: 'photo',
        galleryId: g.id,
        rideId: g.ride,
        height: HEIGHTS[hIdx++ % HEIGHTS.length],
      })
    })
  })
  return tiles
}

export interface GalleryGridProps {
  tiles: GalleryTile[]
  /** Número de colunas: default 2 mobile, 3 tablet, 4 desktop. */
  onOpen: (index: number) => void
  /** Permite Sobrescrever classes do grid. */
  className?: string
  /** Se true, usa grid masonry com alturas variáveis; se false, altura fixa (para a galeria do passeio). */
  masonry?: boolean
}

/**
 * Grid responsivo de galeria (2 colunas mobile, 3 tablet, 4 desktop).
 * Suporta layout masonry (alturas variáveis) via CSS columns.
 */
export const GalleryGrid: React.FC<GalleryGridProps> = ({
  tiles,
  onOpen,
  className = '',
  masonry = true,
}) => {
  if (masonry) {
    return (
      <div
        className={`columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance] ${className}`}
      >
        {tiles.map((tile, idx) => (
          <button
            key={tile.key}
            onClick={() => onOpen(idx)}
            className="relative w-full mb-3 rounded-md overflow-hidden border border-[#1c2538] group cursor-pointer block break-inside-avoid"
            style={{ height: tile.height }}
          >
            <img
              src={tile.thumb}
              alt={tile.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors" />
            {tile.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-white truncate text-left">{tile.title}</p>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
      {tiles.map((tile, idx) => (
        <button
          key={tile.key}
          onClick={() => onOpen(idx)}
          className="relative h-28 sm:h-32 rounded-md overflow-hidden border border-[#1c2538] group cursor-pointer"
        >
          <img
            src={tile.thumb}
            alt={tile.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-colors" />
          {tile.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/30 flex items-center justify-center text-white">
                <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
