import React from 'react'
import { Gallery } from '@/services/api'

export interface GalleryFilterOption {
  /** 'all' ou o gallery.id (álbum) ou rideId. */
  value: string
  label: string
}

export interface GalleryFilterProps {
  options: GalleryFilterOption[]
  value: string
  onChange: (value: string) => void
}

/**
 * Pills de filtro por álbum/passeio.
 */
export const GalleryFilter: React.FC<GalleryFilterProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`text-[11px] font-bold tracking-wider uppercase font-montserrat px-3.5 py-1.5 rounded-md border transition-all ${
              active
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                : 'bg-[#0e131d] border-[#1c2538] text-slate-400 hover:text-white hover:border-blue-600/50'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** Constrói opções de filtro a partir das galerias: Todos + cada álbum (título). */
export function buildFilterOptions(galleries: Gallery[]): GalleryFilterOption[] {
  const opts: GalleryFilterOption[] = [{ value: 'all', label: 'Todos' }]
  galleries.forEach((g) => {
    opts.push({ value: g.id, label: g.title })
  })
  return opts
}
