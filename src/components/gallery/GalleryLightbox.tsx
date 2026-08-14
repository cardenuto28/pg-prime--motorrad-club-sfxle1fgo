import React, { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Gallery } from '@/services/api'
import { resolveFileUrl, getVideoEmbedUrl } from '@/lib/member'

export interface LightboxItem {
  /** Image url (empty when the item is a video embed). */
  url: string
  title: string
  type: 'photo' | 'video'
  videoUrl?: string
}

export interface GalleryLightboxProps {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

/**
 * Modal lightbox com overlay escuro, navegação anterior/próxima, botão fechar,
 * suporte a teclas ← → e ESC, e suporte a vídeos (YouTube/Vimeo embed).
 */
export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  items,
  index,
  onClose,
  onNavigate,
}) => {
  const open = index !== null && index >= 0 && index < items.length

  const goNext = useCallback(() => {
    if (!open) return
    onNavigate(((index as number) + 1) % items.length)
  }, [open, index, items.length, onNavigate])

  const goPrev = useCallback(() => {
    if (!open) return
    onNavigate(((index as number) - 1 + items.length) % items.length)
  }, [open, index, items.length, onNavigate])

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    },
    [open, onClose, goNext, goPrev],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, handleKey])

  if (!open) return null

  const current = items[index as number]

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev */}
      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          className="absolute left-3 sm:left-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div
        className="relative max-w-[92vw] max-h-[88vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === 'video' && current.videoUrl ? (
          <div className="w-full max-w-5xl aspect-video bg-black rounded-md overflow-hidden">
            <iframe
              src={getVideoEmbedUrl(current.videoUrl)}
              title={current.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            src={resolveFileUrl(current.url)}
            alt={current.title}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-md"
          />
        )}

        {/* Caption */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center bg-black/60 backdrop-blur px-4 py-1.5 rounded-md">
          <p className="text-xs text-white font-montserrat tracking-wide line-clamp-1">
            {current.title}
          </p>
          <p className="text-[10px] text-slate-400">
            {(index as number) + 1} / {items.length}
          </p>
        </div>
      </div>

      {/* Next */}
      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          className="absolute right-3 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Próxima"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

/** Helper: builds a flat list of LightboxItem from Gallery records. */
export function galleryToLightboxItems(galleries: Gallery[]): LightboxItem[] {
  const out: LightboxItem[] = []
  galleries.forEach((g) => {
    if (g.type === 'video' || (!g.images_json && g.video_url)) {
      if (g.video_url) {
        out.push({
          url: '',
          title: g.title,
          type: 'video',
          videoUrl: g.video_url,
        })
      }
      return
    }
    // photos
    let arr: unknown = g.images_json
    if (typeof arr === 'string') {
      try {
        arr = JSON.parse(arr)
      } catch {
        arr = []
      }
    }
    if (Array.isArray(arr) && arr.length > 0) {
      arr.forEach((it) => {
        const url = typeof it === 'string' ? it : (it as any)?.url || (it as any)?.src
        if (url) out.push({ url: resolveFileUrl(url), title: g.title, type: 'photo' })
      })
    } else if (g.cover_image) {
      out.push({ url: resolveFileUrl(g.cover_image), title: g.title, type: 'photo' })
    }
  })
  return out
}

/** Re-export Play icon for convenience used by grids. */
export { Play }
