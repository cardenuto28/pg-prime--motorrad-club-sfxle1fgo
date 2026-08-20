import React from 'react'
import type { Ride } from '@/services/api'

export type RideStatus = Ride['status']

export const RIDE_STATUS_META: Record<
  RideStatus,
  { label: string; className: string; dot: string }
> = {
  rascunho: {
    label: 'Rascunho',
    className: 'bg-slate-800/70 text-slate-300 border-slate-600/50',
    dot: 'bg-slate-400',
  },
  inscricoes_abertas: {
    label: 'Inscrições abertas',
    className: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  lotado: {
    label: 'Lotado',
    className: 'bg-orange-950/70 text-orange-300 border-orange-700/50',
    dot: 'bg-orange-400',
  },
  inscricoes_encerradas: {
    label: 'Inscrições encerradas',
    className: 'bg-blue-950/70 text-blue-300 border-blue-700/50',
    dot: 'bg-blue-400',
  },
  realizado: {
    label: 'Realizado',
    className: 'bg-purple-950/70 text-purple-300 border-purple-700/50',
    dot: 'bg-purple-400',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-950/70 text-red-300 border-red-700/50',
    dot: 'bg-red-400',
  },
}

export const RIDE_STATUS_ORDER: RideStatus[] = [
  'rascunho',
  'inscricoes_abertas',
  'lotado',
  'inscricoes_encerradas',
  'realizado',
  'cancelado',
]

export const rideStatusLabels: Record<RideStatus, string> = RIDE_STATUS_ORDER.reduce(
  (acc, s) => {
    acc[s] = RIDE_STATUS_META[s].label
    return acc
  },
  {} as Record<RideStatus, string>,
)

export function RideStatusBadge({ status }: { status: RideStatus }) {
  const meta = RIDE_STATUS_META[status] || RIDE_STATUS_META.rascunho
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border whitespace-nowrap ${meta.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

export const REG_STATUS_META: Record<
  'confirmada' | 'cancelada' | 'pendente',
  { label: string; className: string; dot: string }
> = {
  confirmada: {
    label: 'Confirmada',
    className: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    dot: 'bg-emerald-400',
  },
  cancelada: {
    label: 'Cancelada',
    className: 'bg-red-950/70 text-red-300 border-red-700/50',
    dot: 'bg-red-400',
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    dot: 'bg-amber-400',
  },
}

export function RegStatusBadge({ status }: { status: 'confirmada' | 'cancelada' | 'pendente' }) {
  const meta = REG_STATUS_META[status] || REG_STATUS_META.pendente
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase border whitespace-nowrap ${meta.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

export const RIDE_TYPE_META: Record<
  'bate_e_volta' | 'bate_e_fica',
  { label: string; className: string }
> = {
  bate_e_volta: {
    label: 'Bate e Volta',
    className: 'bg-blue-950/70 text-blue-300 border-blue-700/50',
  },
  bate_e_fica: {
    label: 'Bate e Fica',
    className: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
  },
}

export function RideTypeBadge({ type }: { type?: 'bate_e_volta' | 'bate_e_fica' }) {
  if (!type) return null
  const meta = RIDE_TYPE_META[type] || RIDE_TYPE_META.bate_e_volta
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase border whitespace-nowrap ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

/** Formats a text date for display (handles DD/MM/YYYY or ISO). */
export function formatRideDate(value?: string): string {
  if (!value) return 'A definir'
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value
  const d = new Date(value)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  return value
}
