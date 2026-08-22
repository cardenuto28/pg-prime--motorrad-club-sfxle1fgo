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
 * Normaliza CPF: remove pontos, traços e espaços.
 * Exemplo: "123.456.789-00" -> "12345678900"
 */
export function normalizeCPF(cpfRaw: string | undefined | null): string {
  if (!cpfRaw) return ''
  return String(cpfRaw).replace(/[.\-\s]/g, '')
}

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatCPF(cpfRaw: string | undefined | null): string {
  if (!cpfRaw) return ''
  const clean = normalizeCPF(cpfRaw)
  if (clean.length !== 11) return cpfRaw as string
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
  // Campos legados (compatibilidade com UI existente)
  categoria: MemberCategory
  status_membro: MemberStatusType
  motivo: string
  diasParaVencerBronze?: number
  // Novos campos (Parte 1)
  tem_moto_comprada: 'SIM' | 'NÃO'
  total_veiculos_elegiveis: number
  categoria_clube: '' | 'BRONZE' | 'PRATA' | 'GOLD' | 'PLATINUM'
  data_ultima_passagem_valida: string
  meses_desde_ultima_passagem: number
  dias_desde_venda: number
  meses_desde_venda: number
}

/**
 * Calcula a diferença em meses cheios entre duas datas (data -> hoje).
 */
export function mesesEntre(data: Date, agora: Date): number {
  let meses = (agora.getFullYear() - data.getFullYear()) * 12
  meses += agora.getMonth() - data.getMonth()
  if (agora.getDate() < data.getDate()) {
    meses -= 1
  }
  return meses < 0 ? 0 : meses
}

/**
 * Calcula a diferença em dias entre uma data e hoje.
 */
export function diasEntre(data: Date, agora: Date): number {
  const ms = agora.getTime() - data.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function toISODate(d: Date | null): string {
  if (!d) return ''
  return d.toISOString()
}

/**
 * Função central de cálculo de categoria e status do Euro Motors Club (PARTE 1).
 *
 * Regra de veículos elegíveis:
 * - Elegível: motocicleta OU automóvel adquirido na Euro Motors.
 * - Condição obrigatória: cliente precisa ter >= 1 MOTOCICLETA BMW comprada na Euro Motors Jundiaí.
 * - Sem essa condição, carros NÃO geram evolução de categoria.
 *
 * tem_moto_comprada = SIM quando bike_brand contém "BMW" e (quantidade_motos_compradas >= 1 ou bike_model preenchido).
 * total_veiculos_elegiveis:
 *   - SIM: quantidade_motos_compradas (motos + carros contam)
 *   - NÃO: 0
 *
 * categoria_clube:
 *   - PLATINUM: tem_moto SIM e total >= 5
 *   - GOLD:     tem_moto SIM e 3 <= total <= 4
 *   - PRATA:    tem_moto SIM e 1 <= total <= 2
 *   - BRONZE:   tem_moto NÃO e passagem válida na oficina nos últimos 6 meses
 *   - "" (vazio): tem_moto NÃO e sem passagem válida -> INATIVO
 *
 * status_membro:
 *   - PRATA/GOLD/PLATINUM: sempre ATIVO
 *   - BRONZE: ATIVO (meses <= 5), ATENCAO (5 < meses <= 6), INATIVO (meses > 6)
 *
 * data_ultima_passagem_valida: data_ultima_passagem_oficina se preenchida.
 * Se vazia mas NUMERO_PASSAGENS > 0, considerar antiga -> INATIVO (sem data recente).
 */
export function calcularCategoriaMembro(params: {
  quantidade_motos_compradas?: number | string
  data_ultima_passagem_oficina?: string | Date | null
  status_membro_atual?: string
  // Novos campos financeiros/de oficina
  total_valor_vendido?: number | string
  numero_passagens_oficina?: number | string
  total_liquido_oficina?: number | string
  // Campos de veículo (Parte 1)
  bike_brand?: string
  bike_model?: string
  data_primeira_compra?: string | Date | null
}): CategoryCalculationResult {
  const motos = Number(params.quantidade_motos_compradas || 0)
  const passagensOficina = Number(params.numero_passagens_oficina || 0)
  const totalLiquidoOficina = Number(params.total_liquido_oficina || 0)

  const bikeBrand = (params.bike_brand || '').trim().toUpperCase()
  const bikeModel = (params.bike_model || '').trim()
  const temBMW = bikeBrand.includes('BMW')

  // 1. tem_moto_comprada
  const temMotoComprada: 'SIM' | 'NÃO' =
    temBMW && (motos >= 1 || bikeModel.length > 0) ? 'SIM' : 'NÃO'

  // 2. total_veiculos_elegiveis
  const totalVeiculosElegiveis = temMotoComprada === 'SIM' ? motos : 0

  // 3. data_ultima_passagem_valida + meses_desde_ultima_passagem
  const rawOficina = params.data_ultima_passagem_oficina
  const oficinaDate =
    rawOficina instanceof Date
      ? rawOficina
      : parseDateFlexible(typeof rawOficina === 'string' ? rawOficina : null)

  // Se ULTIMA_DATA_OFICINA vazia mas NUMERO_PASSAGENS > 0 -> histórico existe, mas sem data recente -> INATIVO
  const temHistoricoOficina = passagensOficina > 0 || totalLiquidoOficina > 0
  const dataUltimaPassagemValida = oficinaDate

  const agora = new Date()
  let mesesDesdeUltimaPassagem = 0
  if (dataUltimaPassagemValida) {
    mesesDesdeUltimaPassagem = mesesEntre(dataUltimaPassagemValida, agora)
  } else if (temHistoricoOficina) {
    // Sem data recente conhecida -> trata como antigo (INATIVO)
    mesesDesdeUltimaPassagem = 99
  }

  // 4. dias/meses desde venda (DATA_VENDA = data_primeira_compra)
  const rawVenda = params.data_primeira_compra
  const vendaDate =
    rawVenda instanceof Date
      ? rawVenda
      : parseDateFlexible(typeof rawVenda === 'string' ? rawVenda : null)

  let diasDesdeVenda = 0
  let mesesDesdeVenda = 0
  if (vendaDate) {
    diasDesdeVenda = diasEntre(vendaDate, agora)
    mesesDesdeVenda = mesesEntre(vendaDate, agora)
  }

  const isPreCadastrado =
    params.status_membro_atual?.toUpperCase() === 'PRE_CADASTRADO' ||
    params.status_membro_atual?.toLowerCase() === 'pendente'

  // 5. categoria_clube
  let categoriaClube: CategoryCalculationResult['categoria_clube'] = ''
  let categoriaLegacy: MemberCategory = 'INATIVO'
  let motivo = ''
  let diasParaVencerBronze: number | undefined
  let statusMembro: MemberStatusType = isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO'

  if (temMotoComprada === 'SIM') {
    if (totalVeiculosElegiveis >= 5) {
      categoriaClube = 'PLATINUM'
      categoriaLegacy = 'PLATINUM'
      motivo = 'QUINTA_COMPRA'
      statusMembro = isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO'
    } else if (totalVeiculosElegiveis >= 3) {
      categoriaClube = 'GOLD'
      categoriaLegacy = 'GOLD'
      motivo = 'TERCEIRA_COMPRA'
      statusMembro = isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO'
    } else if (totalVeiculosElegiveis >= 1) {
      categoriaClube = 'PRATA'
      // Mapeia PRATA -> SILVER para compatibilidade com a UI legada (categoria)
      categoriaLegacy = 'SILVER'
      motivo = 'PRIMEIRA_COMPRA'
      statusMembro = isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO'
    } else {
      // tem BMW mas quantidade 0 (não deveria acontecer) -> sem categoria ativa
      categoriaClube = ''
      categoriaLegacy = 'INATIVO'
      motivo = 'SEM_COMPRA_REGISTRADA'
      statusMembro = isPreCadastrado ? 'PRE_CADASTRADO' : 'INATIVO'
    }
  } else {
    // tem_moto_comprada = NÃO -> regra do Bronze
    if (dataUltimaPassagemValida && mesesDesdeUltimaPassagem <= 6) {
      categoriaClube = 'BRONZE'
      categoriaLegacy = 'BRONZE'

      // Status do Bronze
      if (mesesDesdeUltimaPassagem > 5) {
        statusMembro = isPreCadastrado ? 'PRE_CADASTRADO' : 'ATENCAO'
        motivo = 'BRONZE_PROXIMO_VENCIMENTO'
      } else {
        statusMembro = isPreCadastrado ? 'PRE_CADASTRADO' : 'ATIVO'
        motivo = 'NOVA_PASSAGEM_OFICINA'
      }

      // Dias para vencer (6 meses a partir da passagem)
      const validade = new Date(dataUltimaPassagemValida)
      validade.setMonth(validade.getMonth() + 6)
      const diffMs = validade.getTime() - agora.getTime()
      diasParaVencerBronze = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    } else {
      // Sem moto e sem oficina recente (ou passagens antigas) -> INATIVO / sem categoria
      categoriaClube = ''
      categoriaLegacy = 'INATIVO'
      motivo = temHistoricoOficina ? 'OFICINA_EXPIRADA' : 'SEM_RELACIONAMENTO'
      statusMembro = isPreCadastrado ? 'PRE_CADASTRADO' : 'INATIVO'
    }
  }

  return {
    categoria: categoriaLegacy,
    status_membro: statusMembro,
    motivo,
    diasParaVencerBronze,
    tem_moto_comprada: temMotoComprada,
    total_veiculos_elegiveis: totalVeiculosElegiveis,
    categoria_clube: categoriaClube,
    data_ultima_passagem_valida: toISODate(dataUltimaPassagemValida),
    meses_desde_ultima_passagem: mesesDesdeUltimaPassagem,
    dias_desde_venda: diasDesdeVenda,
    meses_desde_venda: mesesDesdeVenda,
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
