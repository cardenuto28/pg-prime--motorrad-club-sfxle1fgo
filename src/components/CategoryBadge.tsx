import React from 'react'
import { Award, Crown, Diamond, Shield, Star, AlertTriangle } from 'lucide-react'
import { normalizeCategory } from '@/lib/membership'
import { MemberCategory } from '@/services/api'

export interface CategoryTheme {
  name: string
  label: string
  badgeBg: string
  badgeText: string
  borderColor: string
  hexColor: string
  cardBgGradient: string
  icon: React.ReactNode
  description: string
}

export const CATEGORY_THEMES: Record<MemberCategory, CategoryTheme> = {
  PLATINUM: {
    name: 'PLATINUM',
    label: 'Platinum',
    badgeBg: 'bg-[#0f172a] text-[#60a5fa] border-[#1e3a8a]',
    badgeText: 'text-[#93c5fd]',
    borderColor: '#2563eb',
    hexColor: '#1a365d',
    cardBgGradient: 'from-slate-950 via-slate-900 to-blue-950',
    icon: <Diamond className="w-3.5 h-3.5" />,
    description: 'Nível máximo de reconhecimento do PG PRIME Club (5+ motocicletas).',
  },
  GOLD: {
    name: 'GOLD',
    label: 'Gold',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-600/70',
    badgeText: 'text-amber-300',
    borderColor: '#d97706',
    hexColor: '#b7791f',
    cardBgGradient: 'from-slate-950 via-amber-950/30 to-slate-900',
    icon: <Crown className="w-3.5 h-3.5" />,
    description: '3 ou 4 motocicletas adquiridas na PG PRIME.',
  },
  SILVER: {
    name: 'SILVER',
    label: 'Prata',
    badgeBg: 'bg-slate-800 text-slate-200 border-slate-600',
    badgeText: 'text-slate-300',
    borderColor: '#94a3b8',
    hexColor: '#6b7280',
    cardBgGradient: 'from-slate-950 via-slate-900 to-slate-800/40',
    icon: <Star className="w-3.5 h-3.5" />,
    description: '1 ou 2 motocicletas adquiridas na PG PRIME.',
  },
  BRONZE: {
    name: 'BRONZE',
    label: 'Bronze',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
    badgeText: 'text-orange-300',
    borderColor: '#c2410c',
    hexColor: '#92400e',
    cardBgGradient: 'from-slate-950 via-orange-950/20 to-slate-900',
    icon: <Shield className="w-3.5 h-3.5" />,
    description: 'Revisões em dia na oficina nos últimos 6 meses.',
  },
  INATIVO: {
    name: 'INATIVO',
    label: 'Inativo',
    badgeBg: 'bg-slate-900 text-slate-400 border-slate-700',
    badgeText: 'text-slate-400',
    borderColor: '#475569',
    hexColor: '#9ca3af',
    cardBgGradient: 'from-slate-950 via-slate-900 to-black',
    icon: <Shield className="w-3.5 h-3.5 opacity-50" />,
    description: 'Bronze com oficina há mais de 6 meses.',
  },
}

export const CategoryBadge: React.FC<{
  category?: string | null
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ category, showIcon = true, className = '', size = 'md' }) => {
  const norm = normalizeCategory(category)
  const theme = CATEGORY_THEMES[norm] || CATEGORY_THEMES.SILVER

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size]

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wider rounded-md border shadow-sm ${theme.badgeBg} ${sizeClasses} ${className}`}
      style={{ borderColor: theme.hexColor }}
    >
      {showIcon && <span className="shrink-0">{theme.icon}</span>}
      <span>{theme.label.toUpperCase()}</span>
    </span>
  )
}

/**
 * Mensagens motivacionais baseadas na categoria e quantidade de motos
 */
export function getCategoryMessage(params: {
  category?: string | null
  motos?: number
  diasParaVencerBronze?: number
  isAtencao?: boolean
}): { title: string; message: string; type: 'info' | 'warning' | 'success' } {
  const norm = normalizeCategory(params.category)
  const motos = Number(params.motos || 0)

  if (norm === 'PLATINUM' || motos >= 5) {
    return {
      title: 'PLATINUM MEMBER',
      message:
        'Você atingiu o nível máximo de reconhecimento do PG PRIME Club. 5+ motocicletas adquiridas conosco.',
      type: 'success',
    }
  }

  if (norm === 'GOLD' || motos === 4) {
    if (motos === 4) {
      return {
        title: 'Você é membro GOLD',
        message: 'Mais uma motocicleta e você alcança o nível máximo do PG PRIME Club.',
        type: 'info',
      }
    }
    return {
      title: 'Você é membro GOLD',
      message:
        'Parabéns pela sua fidelidade! Com mais 1 ou 2 motocicletas você alcança a categoria Platinum.',
      type: 'info',
    }
  }

  if (norm === 'SILVER' || motos === 2) {
    if (motos === 2) {
      return {
        title: 'Você é membro PRATA',
        message: 'Com mais uma motocicleta adquirida conosco, você alcança a categoria GOLD.',
        type: 'info',
      }
    }
    return {
      title: 'Você é membro PRATA',
      message:
        'Você possui 1 motocicleta adquirida conosco. Aproveite todos os benefícios do Club!',
      type: 'info',
    }
  }

  if (norm === 'BRONZE') {
    if (
      params.isAtencao ||
      (params.diasParaVencerBronze !== undefined && params.diasParaVencerBronze <= 30)
    ) {
      return {
        title: 'Renovação Bronze Necessária',
        message:
          'Sua condição de membro Bronze está próxima da renovação. Mantenha seu relacionamento com a PG PRIME para continuar aproveitando os benefícios do Club.',
        type: 'warning',
      }
    }
    return {
      title: 'Você é membro BRONZE',
      message:
        'Mantenha seu relacionamento com a PG PRIME realizando suas revisões periódicas para continuar aproveitando os benefícios do Club.',
      type: 'info',
    }
  }

  return {
    title: 'Membro Inativo',
    message:
      'Realize uma passagem na oficina ou adquira uma nova motocicleta na PG PRIME para reativar seu acesso.',
    type: 'warning',
  }
}
