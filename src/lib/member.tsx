import React from 'react'
import pb from '@/lib/pocketbase/client'
import type { UserProfile } from '@/services/api'

/** Resolves a possibly-relative file url (PocketBase) into an absolute url. */
export function resolveFileUrl(value: string | undefined | null): string {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    if (value.startsWith('/')) return pb.baseUrl + value
    return value
  }
  // maybe a relative api file path
  if (value.startsWith('api/')) return pb.baseUrl + '/' + value
  return value
}

/** Fallback cover image for rides/benefits. */
export function coverFallback(query: string, w = 600, h = 400): string {
  return `https://img.usecurling.com/p/${w}/${h}?q=${encodeURIComponent(query)}`
}

/** Parses galleries.images_json (string or array) into a list of url strings. */
export function parseGalleryImages(raw: unknown, fallbackQuery = 'motorcycle'): string[] {
  if (!raw) return []
  let arr: unknown = raw
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw)
    } catch {
      // maybe a single url
      return [resolveFileUrl(raw)]
    }
  }
  if (Array.isArray(arr)) {
    return arr
      .map((it) => (typeof it === 'string' ? it : (it as any)?.url || (it as any)?.src))
      .filter(Boolean)
      .map(resolveFileUrl)
  }
  return []
}

const STATUS_META: Record<
  UserProfile['status'],
  { label: string; className: string; dot: string }
> = {
  ativo: {
    label: 'Ativo',
    className: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    dot: 'bg-amber-400',
  },
  inativo: {
    label: 'Inativo',
    className: 'bg-slate-800/70 text-slate-300 border-slate-600/50',
    dot: 'bg-slate-400',
  },
  bloqueado: {
    label: 'Bloqueado',
    className: 'bg-red-950/70 text-red-300 border-red-700/50',
    dot: 'bg-red-400',
  },
}

export const StatusBadge: React.FC<{ status: UserProfile['status'] }> = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pendente
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border ${meta.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

export function statusLabel(status: UserProfile['status']): string {
  return (STATUS_META[status] || STATUS_META.pendente).label
}

/** Formats a ride.date which is stored as text (e.g. "07/06/2025" or ISO). */
export function formatDate(value?: string): string {
  if (!value) return 'A definir'
  // already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value
  const d = new Date(value)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  return value
}

/** Returns true when a ride date (text) is in the past. */
export function isRidePast(date?: string): boolean {
  if (!date) return false
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [d, m, y] = date.split('/').map(Number)
    return new Date(y, m - 1, d).getTime() < Date.now()
  }
  const d = new Date(date)
  return !isNaN(d.getTime()) && d.getTime() < Date.now()
}
