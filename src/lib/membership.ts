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

// ============================================================================
// PARTE 2 — SCORE DE OFICINA, TAGS INTELIGENTES E PRÓXIMA MELHOR AÇÃO
// ============================================================================

/**
 * Faixa de pontos baseada em valor (R$).
 * min e max são inclusivos no intervalo [min, max].
 */
export interface ScoreValorRange {
  min: number
  max: number
  points: number
}

/**
 * Faixa de pontos baseada em número de passagens na oficina.
 * min e max são inclusivos no intervalo [min, max].
 */
export interface ScoreFrequenciaRange {
  min: number
  max: number
  points: number
}

/**
 * Faixas padrão de VALOR (0–70 pontos).
 * Usadas quando não houver configuração salva no `settings`.
 */
export const DEFAULT_SCORE_VALOR_RANGES: ScoreValorRange[] = [
  { min: 0, max: 0, points: 0 },
  { min: 0.01, max: 2500, points: 10 },
  { min: 2500.01, max: 5000, points: 20 },
  { min: 5000.01, max: 10000, points: 35 },
  { min: 10000.01, max: 20000, points: 50 },
  { min: 20000.01, max: 35000, points: 60 },
  { min: 35000.01, max: 99999999, points: 70 },
]

/**
 * Faixas padrão de FREQUÊNCIA (0–30 pontos).
 * Usadas quando não houver configuração salva no `settings`.
 */
export const DEFAULT_SCORE_FREQUENCIA_RANGES: ScoreFrequenciaRange[] = [
  { min: 0, max: 0, points: 0 },
  { min: 1, max: 2, points: 5 },
  { min: 3, max: 5, points: 10 },
  { min: 6, max: 10, points: 20 },
  { min: 11, max: 99999, points: 30 },
]

export interface ScoreOficinaResult {
  score_oficina: number
  score_valor_oficina: number
  score_frequencia: number
  nivel_relacionamento: string
}

/**
 * Mapeia score (0–100) para nível de relacionamento textual.
 *
 * 0–29: BAIXO RELACIONAMENTO
 * 30–49: RELACIONAMENTO MODERADO
 * 50–69: RELACIONAMENTO ATIVO
 * 70–84: RELACIONAMENTO FORTE
 * 85–100: RELACIONAMENTO EXCEPCIONAL
 */
export function nivelRelacionamentoPorScore(score: number): string {
  const s = Math.max(0, Math.min(100, Math.round(score)))
  if (s <= 29) return 'BAIXO RELACIONAMENTO'
  if (s <= 49) return 'RELACIONAMENTO MODERADO'
  if (s <= 69) return 'RELACIONAMENTO ATIVO'
  if (s <= 84) return 'RELACIONAMENTO FORTE'
  return 'RELACIONAMENTO EXCEPCIONAL'
}

/**
 * Calcula o Score de Oficina de um membro (PARTE 2).
 *
 * score_oficina = score_valor + score_frequencia (máx 100)
 *
 * @param params.total_liquido_oficina Valor total líquido gasto na oficina (R$)
 * @param params.numero_passagens_oficina Quantidade de passagens na oficina
 * @param params.valorRanges Faixas configuráveis de valor (opcional — usa padrão)
 * @param params.frequenciaRanges Faixas configuráveis de frequência (opcional — usa padrão)
 */
export function calcularScoreOficina(params: {
  total_liquido_oficina?: number | string
  numero_passagens_oficina?: number | string
  valorRanges?: ScoreValorRange[]
  frequenciaRanges?: ScoreFrequenciaRange[]
}): ScoreOficinaResult {
  const valor = Number(params.total_liquido_oficina || 0)
  const passagens = Math.max(0, parseInt(String(params.numero_passagens_oficina || 0), 10) || 0)

  const valorRanges =
    params.valorRanges && params.valorRanges.length > 0
      ? params.valorRanges
      : DEFAULT_SCORE_VALOR_RANGES
  const freqRanges =
    params.frequenciaRanges && params.frequenciaRanges.length > 0
      ? params.frequenciaRanges
      : DEFAULT_SCORE_FREQUENCIA_RANGES

  // Encontra a faixa de valor cujo [min, max] contém `valor`.
  // Critério de desempate: a primeira faixa que satisfaz min <= valor <= max.
  let scoreValor = 0
  for (const r of valorRanges) {
    const min = Number(r.min)
    const max = Number(r.max)
    const pts = Number(r.points) || 0
    if (valor >= min && valor <= max) {
      scoreValor = pts
      break
    }
  }
  // Se nenhuma faixa capturou (ex: valor negativo), pontos = 0.
  // Se o valor ultrapassou o máximo de todas as faixas, atribui a maior faixa.
  if (valor > 0 && scoreValor === 0) {
    const maxPts = valorRanges.reduce((m, r) => Math.max(m, Number(r.points) || 0), 0)
    scoreValor = maxPts
  }

  // Faixa de frequência
  let scoreFrequencia = 0
  for (const r of freqRanges) {
    const min = Number(r.min)
    const max = Number(r.max)
    const pts = Number(r.points) || 0
    if (passagens >= min && passagens <= max) {
      scoreFrequencia = pts
      break
    }
  }
  if (passagens > 0 && scoreFrequencia === 0) {
    const maxPts = freqRanges.reduce((m, r) => Math.max(m, Number(r.points) || 0), 0)
    scoreFrequencia = maxPts
  }

  // Limite máximo por componente (70 / 30)
  if (scoreValor > 70) scoreValor = 70
  if (scoreFrequencia > 30) scoreFrequencia = 30

  const scoreTotal = Math.min(100, scoreValor + scoreFrequencia)
  const nivel = nivelRelacionamentoPorScore(scoreTotal)

  return {
    score_oficina: scoreTotal,
    score_valor_oficina: scoreValor,
    score_frequencia: scoreFrequencia,
    nivel_relacionamento: nivel,
  }
}

/**
 * Lista de todas as tags inteligentes possíveis (para uso em filtros/UI).
 */
export const TODAS_AS_TAGS = [
  'VIP ATIVO',
  'VIP AFASTADO',
  'ALTO VALOR PÓS-VENDAS',
  'PRÓXIMO DO GOLD',
  'PRÓXIMO DO PLATINUM',
  'PRIMEIRA PASSAGEM PENDENTE',
] as const

export type TagInteligente = (typeof TODAS_AS_TAGS)[number]

export interface TagsParams {
  score_oficina: number
  categoria_clube: string
  total_veiculos_elegiveis: number
  data_primeira_compra?: string | Date | null
  data_ultima_passagem_oficina?: string | Date | null
  numero_passagens_oficina?: number | string
}

/**
 * Calcula as Tags Inteligentes de um membro (PARTE 2).
 *
 * | Tag | Condição |
 * | VIP ATIVO | categoria_clube = GOLD ou PLATINUM E score_oficina >= 70 |
 * | VIP AFASTADO | categoria_clube = GOLD ou PLATINUM E score_oficina < 30 |
 * | ALTO VALOR PÓS-VENDAS | score_oficina >= 85 (qualquer categoria) |
 * | PRÓXIMO DO GOLD | categoria_clube = PRATA E total_veiculos_elegiveis = 2 |
 * | PRÓXIMO DO PLATINUM | categoria_clube = GOLD E total_veiculos_elegiveis = 4 |
 * | PRIMEIRA PASSAGEM PENDENTE | data_primeira_compra preenchida E data_ultima_passagem_oficina vazia E (numero_passagens_oficina = 0 ou null) |
 */
export function calcularTagsInteligentes(params: TagsParams): string[] {
  const tags: string[] = []

  const cat = (params.categoria_clube || '').trim().toUpperCase()
  const score = Number(params.score_oficina || 0)
  const totalVeiculos = Number(params.total_veiculos_elegiveis || 0)
  const catIsVip = cat === 'GOLD' || cat === 'PLATINUM'

  // VIP ATIVO / VIP AFASTADO
  if (catIsVip) {
    if (score >= 70) tags.push('VIP ATIVO')
    else if (score < 30) tags.push('VIP AFASTADO')
  }

  // ALTO VALOR PÓS-VENDAS (qualquer categoria)
  if (score >= 85) {
    tags.push('ALTO VALOR PÓS-VENDAS')
  }

  // PRÓXIMO DO GOLD / PRÓXIMO DO PLATINUM
  if (cat === 'PRATA' && totalVeiculos === 2) {
    tags.push('PRÓXIMO DO GOLD')
  }
  if (cat === 'GOLD' && totalVeiculos === 4) {
    tags.push('PRÓXIMO DO PLATINUM')
  }

  // PRIMEIRA PASSAGEM PENDENTE
  const temPrimeiraCompra =
    params.data_primeira_compra instanceof Date
      ? !isNaN(params.data_primeira_compra.getTime())
      : !!(params.data_primeira_compra && String(params.data_primeira_compra).trim())
  const semOficina = params.data_ultima_passagem_oficina
    ? params.data_ultima_passagem_oficina instanceof Date
      ? isNaN(params.data_ultima_passagem_oficina.getTime())
      : !String(params.data_ultima_passagem_oficina).trim()
    : true
  const semPassagens =
    !params.numero_passagens_oficina || Number(params.numero_passagens_oficina) === 0

  if (temPrimeiraCompra && semOficina && semPassagens) {
    tags.push('PRIMEIRA PASSAGEM PENDENTE')
  }

  return tags
}

/**
 * Calcula a Próxima Melhor Ação com base nas tags do membro (PARTE 2).
 * Prioridade pela ordem definida na especificação.
 *
 * | Tag | Ação |
 * | PRIMEIRA PASSAGEM PENDENTE | CONTATAR PARA PRIMEIRA PASSAGEM |
 * | VIP AFASTADO | REATIVAR PÓS-VENDAS |
 * | PRÓXIMO DO GOLD | CLIENTE PRÓXIMO DO GOLD |
 * | PRÓXIMO DO PLATINUM | CLIENTE PRÓXIMO DO PLATINUM |
 * | ALTO VALOR PÓS-VENDAS | CLIENTE DE ALTO VALOR |
 * | VIP ATIVO | PRIORIDADE DE RELACIONAMENTO |
 * | Nenhuma tag se aplica | SEM AÇÃO |
 */
export function calcularProximaMelhorAcao(tags: string[]): string {
  if (!tags || tags.length === 0) return 'SEM AÇÃO'

  if (tags.includes('PRIMEIRA PASSAGEM PENDENTE')) return 'CONTATAR PARA PRIMEIRA PASSAGEM'
  if (tags.includes('VIP AFASTADO')) return 'REATIVAR PÓS-VENDAS'
  if (tags.includes('PRÓXIMO DO GOLD')) return 'CLIENTE PRÓXIMO DO GOLD'
  if (tags.includes('PRÓXIMO DO PLATINUM')) return 'CLIENTE PRÓXIMO DO PLATINUM'
  if (tags.includes('ALTO VALOR PÓS-VENDAS')) return 'CLIENTE DE ALTO VALOR'
  if (tags.includes('VIP ATIVO')) return 'PRIORIDADE DE RELACIONAMENTO'

  return 'SEM AÇÃO'
}

/**
 * Faz o parse seguro de um campo `tags` armazenado como JSON array (string).
 * Aceita tanto string JSON quanto array já parsed.
 */
export function parseTags(tags: unknown): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags as string[]
  if (typeof tags === 'string') {
    const trimmed = tags.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      return []
    }
  }
  return []
}

export interface ScoreCalcCompleto extends ScoreOficinaResult {
  tags: string[]
  proxima_melhor_acao: string
  data_ultimo_calculo: string
}

/**
 * Orquestra o cálculo completo do Score de Oficina (PARTE 2):
 * score + tags + próxima melhor ação + data_ultimo_calculo.
 * Reaproveita os campos já calculados em PARTE 1 (categoria_clube, total_veiculos_elegiveis).
 */
export function calcularScoreCompleto(params: {
  total_liquido_oficina?: number | string
  numero_passagens_oficina?: number | string
  categoria_clube?: string
  total_veiculos_elegiveis?: number | string
  data_primeira_compra?: string | Date | null
  data_ultima_passagem_oficina?: string | Date | null
  valorRanges?: ScoreValorRange[]
  frequenciaRanges?: ScoreFrequenciaRange[]
}): ScoreCalcCompleto {
  const score = calcularScoreOficina({
    total_liquido_oficina: params.total_liquido_oficina,
    numero_passagens_oficina: params.numero_passagens_oficina,
    valorRanges: params.valorRanges,
    frequenciaRanges: params.frequenciaRanges,
  })

  const tags = calcularTagsInteligentes({
    score_oficina: score.score_oficina,
    categoria_clube: params.categoria_clube || '',
    total_veiculos_elegiveis: Number(params.total_veiculos_elegiveis || 0),
    data_primeira_compra: params.data_primeira_compra,
    data_ultima_passagem_oficina: params.data_ultima_passagem_oficina,
    numero_passagens_oficina: params.numero_passagens_oficina,
  })

  const acao = calcularProximaMelhorAcao(tags)

  return {
    ...score,
    tags,
    proxima_melhor_acao: acao,
    data_ultimo_calculo: new Date().toISOString(),
  }
}

/**
 * Classe Tailwind + rótulo curto para um nível de relacionamento.
 * Usado para padronizar cores de badges/barras de progresso em toda a UI.
 */
export function nivelRelacionamentoMeta(nivel: string): {
  label: string
  short: string
  color: string
  barColor: string
  textColor: string
  badgeClass: string
} {
  const n = (nivel || '').trim().toUpperCase()
  if (n.includes('EXCEPCIONAL')) {
    return {
      label: 'RELACIONAMENTO EXCEPCIONAL',
      short: 'EXCEPCIONAL',
      color: 'emerald',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',
    }
  }
  if (n.includes('FORTE')) {
    return {
      label: 'RELACIONAMENTO FORTE',
      short: 'FORTE',
      color: 'blue',
      barColor: 'bg-blue-500',
      textColor: 'text-blue-400',
      badgeClass: 'bg-blue-950/60 text-blue-300 border-blue-700/50',
    }
  }
  if (n.includes('ATIVO')) {
    return {
      label: 'RELACIONAMENTO ATIVO',
      short: 'ATIVO',
      color: 'cyan',
      barColor: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      badgeClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50',
    }
  }
  if (n.includes('MODERADO')) {
    return {
      label: 'RELACIONAMENTO MODERADO',
      short: 'MODERADO',
      color: 'amber',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-400',
      badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-700/50',
    }
  }
  // BAIXO (default)
  return {
    label: 'BAIXO RELACIONAMENTO',
    short: 'BAIXO',
    color: 'slate',
    barColor: 'bg-slate-500',
    textColor: 'text-slate-400',
    badgeClass: 'bg-slate-900/60 text-slate-400 border-slate-700/50',
  }
}

/**
 * Classe Tailwind (badge) para uma tag inteligente específica.
 */
export function tagBadgeClass(tag: string): string {
  const t = (tag || '').trim().toUpperCase()
  if (t === 'VIP ATIVO') return 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
  if (t === 'VIP AFASTADO') return 'bg-red-950/70 text-red-300 border-red-700/50'
  if (t === 'ALTO VALOR PÓS-VENDAS') return 'bg-amber-950/70 text-amber-300 border-amber-700/50'
  if (t === 'PRÓXIMO DO GOLD') return 'bg-blue-950/70 text-blue-300 border-blue-700/50'
  if (t === 'PRÓXIMO DO PLATINUM') return 'bg-purple-950/70 text-purple-300 border-purple-700/50'
  if (t === 'PRIMEIRA PASSAGEM PENDENTE')
    return 'bg-orange-950/70 text-orange-300 border-orange-700/50'
  return 'bg-slate-900/70 text-slate-300 border-slate-700/50'
}
