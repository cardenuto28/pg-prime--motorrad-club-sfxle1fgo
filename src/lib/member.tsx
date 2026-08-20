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

/** Extrai o embed URL de um link YouTube/Vimeo. */
export function getVideoEmbedUrl(url: string | undefined | null): string {
  if (!url) return ''
  const u = url.trim()
  // YouTube
  const ytMatch =
    u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/) ||
    u.match(/[?&]v=([\w-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Vimeo
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return u
}

/** Retorna a thumbnail de um vídeo YouTube/Vimeo a partir da URL. */
export function getVideoThumb(url: string | undefined | null): string {
  if (!url) return ''
  const u = url.trim()
  const ytMatch =
    u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/) ||
    u.match(/[?&]v=([\w-]{11})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://img.usecurling.com/p/800/500?q=video,vimeo,motorcycle`
  }
  return ''
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

export const MemberStatusBadge: React.FC<{
  status?: string | null
  statusMembro?: string | null
}> = ({ status, statusMembro }) => {
  const norm = (statusMembro || status || 'pendente').toUpperCase()

  if (norm === 'PRE_CADASTRADO' || norm === 'PRÉ-CADASTRADO') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border bg-blue-950/70 text-blue-300 border-blue-700/50">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Pré-cadastrado
      </span>
    )
  }

  if (norm === 'ATENCAO' || norm === 'ATENÇÃO') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border bg-amber-950/80 text-amber-300 border-amber-600 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Atenção (Renovação)
      </span>
    )
  }

  if (norm === 'ATIVO') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border bg-emerald-950/70 text-emerald-300 border-emerald-700/50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Ativo
      </span>
    )
  }

  if (norm === 'INATIVO') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border bg-slate-800/70 text-slate-400 border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Inativo
      </span>
    )
  }

  const key = (status || 'pendente').toLowerCase() as UserProfile['status']
  const meta = STATUS_META[key] || STATUS_META.pendente
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border ${meta.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
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

/** Formats a member's visual ID, e.g. "EMC-02458" */
export function formatMemberId(user?: UserProfile | null): string {
  if (!user) return 'EMC-00000'
  if (user.member_id && user.member_id.trim()) {
    return user.member_id.toUpperCase().startsWith('EMC-')
      ? user.member_id.toUpperCase()
      : `EMC-${user.member_id.toUpperCase()}`
  }
  // Deterministic numeric ID generated from PocketBase user id
  let hash = 0
  const idStr = user.id || '0000'
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0
  }
  const numericCode = String((hash % 90000) + 10000).padStart(5, '0')
  return `EMC-${numericCode}`
}

/** Returns the member category name with fallback */
export function getMemberCategory(user?: UserProfile | null): string {
  if (!user) return 'Membro'
  if (user.categoria && user.categoria.trim()) return user.categoria.toUpperCase()
  if (user.category && user.category.trim()) return user.category.toUpperCase()
  return 'SILVER'
}

/* ---------- Partner category helpers ---------- */

export type PartnerCategory =
  | 'hoteis'
  | 'restaurantes'
  | 'equipamentos'
  | 'vestuario'
  | 'turismo'
  | 'seguros'
  | 'servicos'
  | 'outros'

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  'hoteis',
  'restaurantes',
  'equipamentos',
  'vestuario',
  'turismo',
  'seguros',
  'servicos',
  'outros',
]

const PARTNER_CATEGORY_META: Record<
  PartnerCategory,
  { label: string; className: string; dot: string }
> = {
  hoteis: {
    label: 'Hotéis',
    className: 'bg-blue-950/70 text-blue-300 border-blue-700/50',
    dot: 'bg-blue-400',
  },
  restaurantes: {
    label: 'Restaurantes',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    dot: 'bg-amber-400',
  },
  equipamentos: {
    label: 'Equipamentos',
    className: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  vestuario: {
    label: 'Vestuário',
    className: 'bg-purple-950/70 text-purple-300 border-purple-700/50',
    dot: 'bg-purple-400',
  },
  turismo: {
    label: 'Turismo',
    className: 'bg-cyan-950/70 text-cyan-300 border-cyan-700/50',
    dot: 'bg-cyan-400',
  },
  seguros: {
    label: 'Seguros',
    className: 'bg-red-950/70 text-red-300 border-red-700/50',
    dot: 'bg-red-400',
  },
  servicos: {
    label: 'Serviços',
    className: 'bg-indigo-950/70 text-indigo-300 border-indigo-700/50',
    dot: 'bg-indigo-400',
  },
  outros: {
    label: 'Outros',
    className: 'bg-slate-800/70 text-slate-300 border-slate-600/50',
    dot: 'bg-slate-400',
  },
}

export function partnerCategoryLabel(cat?: string): string {
  if (!cat) return 'Outros'
  return (PARTNER_CATEGORY_META[cat as PartnerCategory] || PARTNER_CATEGORY_META.outros).label
}

export const PartnerCategoryBadge: React.FC<{ category?: string }> = ({ category }) => {
  const meta =
    PARTNER_CATEGORY_META[(category as PartnerCategory) || 'outros'] || PARTNER_CATEGORY_META.outros
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border ${meta.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
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
