import { MemberCategory, MemberStatusType, UserProfile } from '@/services/api'

/**
 * Validação de CPF brasileiro (algoritmo dos dígitos verificadores)
 */
export function isValidCPF(cpfRaw: string | undefined | null): boolean {
  if (!cpfRaw) return false
  const cpf = cpfRaw.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  // CPFs com todos os dígitos iguais são inválidos
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  let remainder: number

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10), 10)) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11), 10)) return false

  return true
}

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatCPF(cpfRaw: string | undefined | null): string {
  if (!cpfRaw) return ''
  const clean = cpfRaw.replace(/\D/g, '')
  if (clean.length !== 11) return cpfRaw
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Converte data em formato DD/MM/AAAA ou ISO para objeto Date seguro
 */
export function parseDateFlexible(dateStr: string | undefined | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const trimmed = dateStr.trim()
  if (!trimmed) return null

  // Formato DD/MM/AAAA ou DD/MM/AA
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmed)) {
    const parts = trimmed.split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    let year = parseInt(parts[2], 10)
    if (year < 100) year += 2000
    const d = new Date(year, month, day)
    return isNaN(d.getTime()) ? null : d
  }

  // Formato AAAA-MM-DD
  const iso = new Date(trimmed)
  return isNaN(iso.getTime()) ? null : iso
}

export interface CategoryCalculationResult {
  categoria: MemberCategory
  status_membro: MemberStatusType
  motivo: string
  diasParaVencerBronze?: number
}

/**
 * Função central de cálculo de categoria e status do Euro Motors Club.
 * Regras:
 * - PLATINUM: >= 5 motos
 * - GOLD: 3 ou 4 motos
 * - PRATA (SILVER): 1 ou 2 motos
 * - BRONZE: 0 motos E oficina nos últimos 6 meses (se entre 5-6 meses -> ATENÇÃO)
 * - INATIVO: Bronze com oficina > 6 meses ou sem oficina
 */
export function calcularCategoriaMembro(params: {
  quantidade_motos_compradas?: number
  data_ultima_passagem_oficina?: string | Date | null
  status_membro_atual?: string
  // Novos campos financeiros/de oficina — disponíveis para futuras regras de categorização
  total_valor_vendido?: number
  numero_passagens_oficina?: number
  total_liquido_oficina?: number
}): CategoryCalculationResult {
  const motos = Number(params.quantidade_motos_compradas || 0)
  const isPreCadastrado =
    params.status_membro_atual?.toUpperCase() === 'PRE_CADASTRADO' ||
    params.status_membro_atual?.toLowerCase() === 'pendente'

  if (motos >= 5) {
    return {
      categoria: 'PLATINUM',
      status_membro: isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO',
      motivo: 'QUINTA_COMPRA',
    }
  }

  if (motos >= 3) {
    return {
      categoria: 'GOLD',
      status_membro: isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO',
      motivo: 'TERCEIRA_COMPRA',
    }
  }

  if (motos >= 1) {
    return {
      categoria: 'SILVER',
      status_membro: isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO',
      motivo: 'PRIMEIRA_COMPRA',
    }
  }

  // 0 motos: valida data da última passagem de oficina
  const rawDate = params.data_ultima_passagem_oficina
  const oficinaDate =
    rawDate instanceof Date
      ? rawDate
      : parseDateFlexible(typeof rawDate === 'string' ? rawDate : null)

  if (!oficinaDate) {
    return {
      categoria: 'INATIVO',
      status_membro: 'INATIVO',
      motivo: 'BRONZE_EXPIRADO',
    }
  }

  const now = new Date()

  // Data de validade dos 6 meses corridos a partir da oficina
  const expirationDate = new Date(oficinaDate)
  expirationDate.setMonth(expirationDate.getMonth() + 6)

  // Data de alerta (30 dias antes de vencer)
  const alertDate = new Date(expirationDate)
  alertDate.setDate(alertDate.getDate() - 30)

  const diffMs = expirationDate.getTime() - now.getTime()
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (now > expirationDate) {
    return {
      categoria: 'INATIVO',
      status_membro: 'INATIVO',
      motivo: 'BRONZE_EXPIRADO',
      diasParaVencerBronze: diasRestantes,
    }
  }

  if (now >= alertDate) {
    return {
      categoria: 'BRONZE',
      status_membro: isPreCadastrado ? 'PRE_CADASTRADO' : 'ATENCAO',
      motivo: 'NOVA_PASSAGEM_OFICINA',
      diasParaVencerBronze: Math.max(0, diasRestantes),
    }
  }

  return {
    categoria: 'BRONZE',
    status_membro: isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO',
    motivo: 'NOVA_PASSAGEM_OFICINA',
    diasParaVencerBronze: diasRestantes,
  }
}

/**
 * Normaliza categoria do membro para padronização
 */
export function normalizeCategory(cat?: string | null): MemberCategory {
  if (!cat) return 'INATIVO'
  const upper = cat.trim().toUpperCase()
  if (upper.includes('PLATIN')) return 'PLATINUM'
  if (upper.includes('GOLD') || upper.includes('OURO')) return 'GOLD'
  if (upper.includes('SILVER') || upper.includes('PRATA')) return 'SILVER'
  if (upper.includes('BRONZ')) return 'BRONZE'
  if (upper.includes('INATIV')) return 'INATIVO'
  return 'SILVER'
}
