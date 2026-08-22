import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  Info,
  RefreshCw,
  UserPlus,
  CheckCircle,
} from 'lucide-react'
import {
  isValidDocumento,
  formatDocumento,
  detectTipoDocumento,
  parseDateFlexible,
  calcularCategoriaMembro,
  calcularScoreCompleto,
  parseTags,
  nivelRelacionamentoMeta,
  tagBadgeClass,
} from '@/lib/membership'
import pb from '@/lib/pocketbase/client'
import { CategoryBadge } from '@/components/CategoryBadge'
import { useToast } from '@/hooks/use-toast'
import { settingsService } from '@/services/settings'
import { importLogService, historicoMetricasService } from '@/services/api'

/**
 * Tipo de operação que será realizada para cada linha da planilha.
 * - CREATE  : CPF/CNPJ não existe no banco → novo pré-cadastro
 * - UPDATE  : CPF/CNPJ já existe no banco   → atualização dos dados
 * - IGNORE  : CPF/CNPJ em branco ou inválido → linha ignorada com aviso
 */
type RowAction = 'CREATE' | 'UPDATE' | 'IGNORE'

interface ImportRow {
  rowIndex: number
  nome: string
  cpf: string
  cpfClean: string
  tipoDoc: 'CPF' | 'CNPJ' | ''
  telefone: string
  email: string
  cidade: string
  bike_brand: string
  bike_model: string
  bike_year: number
  bike_chassi: string
  data_primeira_compra: string
  quantidade_motos_compradas: number
  total_valor_vendido: number
  numero_passagens_oficina: number
  total_liquido_oficina: number
  data_ultima_passagem_oficina: string
  categoriaCalculada: string
  statusCalculado: string
  // PARTE 1 — novos campos calculados
  temMotoComprada: 'SIM' | 'NÃO'
  totalVeiculosElegiveis: number
  categoriaClube: string
  dataUltimaPassagemValida: string
  mesesDesdeUltimaPassagem: number
  diasDesdeVenda: number
  mesesDesdeVenda: number
  // PARTE 2 — Score, tags e ação
  scoreOficina: number
  scoreValorOficina: number
  scoreFrequencia: number
  nivelRelacionamento: string
  tags: string[]
  proximaMelhorAcao: string
  errors: string[]
  isValid: boolean
  action: RowAction
  existingId?: string
  existingUser?: any
}

interface ImportMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const ImportMembersModal: React.FC<ImportMembersModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [summary, setSummary] = useState<{
    total: number
    valid: number
    invalid: number
    updates: number
    creates: number
    importedCount?: number
  } | null>(null)
  const [filterTab, setFilterTab] = useState<'all' | 'create' | 'update' | 'invalid'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estado de progresso em tempo real da importação
  const [importProgress, setImportProgress] = useState<{
    status: 'idle' | 'processing' | 'completed'
    processedCount: number
    totalCount: number
    failCount: number
    percent: number
  }>({
    status: 'idle',
    processedCount: 0,
    totalCount: 0,
    failCount: 0,
    percent: 0,
  })

  // PARTE 3 — Resumo final de importação exibido em modal dedicado após a conclusão.
  // Contém os contadores detalhados (criados, atualizados, erros por linha, etc.)
  // e a lista de erros por linha, para o admin revisar.
  const [finalSummary, setFinalSummary] = useState<{
    nomeArquivo: string
    linhasProcessadas: number
    clientesCriados: number
    clientesAtualizados: number
    erros: number
    categoriasAlteradas: number
    scoresAtualizados: number
    linhasIgnoradas: number
    listaErros: Array<{ linha: number; cpf: string; erro: string; motivo: string }>
  } | null>(null)

  // PARTE 2 — Faixas configuráveis de score carregadas uma vez ao abrir o modal.
  // Variáveis `let` no escopo do componente (acessadas no handleFileChange e handleConfirmImport).
  let currentValorRanges: any[] | undefined
  let currentFrequenciaRanges: any[] | undefined

  const resetState = () => {
    setFile(null)
    setImportRows([])
    setSummary(null)
    setFinalSummary(null)
    setFilterTab('all')
    setImportProgress({
      status: 'idle',
      processedCount: 0,
      totalCount: 0,
      failCount: 0,
      percent: 0,
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Baixar modelo de exemplo (15 colunas)
  const handleDownloadTemplate = () => {
    const header = [
      'NOME',
      'TELEFONE',
      'EMAIL',
      'CPF/CNPJ',
      'CIDADE',
      'MARCA',
      'DESCRICAO_MODELO',
      'ANO_MODELO',
      'CHASSI',
      'DATA_VENDA',
      'TOTAL_COMPRAS',
      'TOTAL_VALOR_VENDIDO',
      'NUMERO_PASSAGENS',
      'TOTAL_LIQUIDO_OFICINA',
      'ULTIMA_DATA_OFICINA',
    ]

    const templateData = [
      header,
      [
        'Carlos Alberto Silva',
        '(11) 98765-4321',
        'carlos.silva@exemplo.com.br',
        '123.456.789-00',
        'Jundiaí - SP',
        'BMW Motorrad',
        'R 1300 GS',
        2024,
        '9BWHYJZ8X2024Z123456',
        '10/01/2020',
        3,
        89500.0,
        5,
        12780.5,
        '15/02/2025',
      ],
      [
        'Mariana Oliveira Santos',
        '(11) 97654-3210',
        'mariana.santos@exemplo.com.br',
        '987.654.321-99',
        'Campinas - SP',
        'BMW Motorrad',
        'F 900 R',
        2023,
        '9BWHYJZ8X2024Y654321',
        '15/03/2023',
        1,
        32500.0,
        2,
        4500.0,
        '20/01/2025',
      ],
      [
        'Roberto Mendes',
        '(11) 99887-6655',
        'roberto.mendes@exemplo.com.br',
        '111.222.333-44',
        'São Paulo - SP',
        'BMW Motorrad',
        'R 1250 GS Adventure',
        2022,
        '9BWHYJZ8X2024X987654',
        '',
        0,
        0.0,
        0,
        0.0,
        '',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Membros')
    XLSX.writeFile(wb, 'modelo_importacao_membros_euromotors.xlsx')
  }

  // Processar arquivo Excel / CSV
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setParsing(true)

    try {
      // PARTE 2 — Carrega as faixas configuradas de score (uma vez por parsing).
      const { valorRanges, frequenciaRanges } = await settingsService.getScoreRanges()
      currentValorRanges = valorRanges
      currentFrequenciaRanges = frequenciaRanges

      /**
       * Normaliza um documento (CPF/CNPJ) para uso como chave de UPSERT:
       * remove pontuação e, quando o Excel descartou o zero à esquerda,
       * completa novamente (10 → 11 dígitos para CPF, 13 → 14 para CNPJ).
       * Aplicado tanto na carga dos usuários existentes quanto nas linhas
       * da planilha, para que as chaves batam de forma simétrica.
       */
      const normalizarDocChave = (raw: string | number | undefined | null): string => {
        if (raw === undefined || raw === null) return ''
        const str = typeof raw === 'number' ? String(Math.round(raw)) : String(raw)
        const clean = str.replace(/\D/g, '')
        if (clean.length === 0) return ''
        if (clean.length <= 11) return clean.padStart(11, '0')
        if (clean.length <= 14) return clean.padStart(14, '0')
        return clean
      }

      // 1. Carrega todos os usuários do banco e monta um mapa de CPF/CNPJ (somente dígitos) → usuário completo.
      //    Precisamos dos campos cadastrais protegidos (NOME, TELEFONE, EMAIL, CIDADE) para o UPSERT.
      const existingUsers = await pb.collection('users').getFullList({
        fields: 'id,cpf,email,name,phone,city',
      })
      const existingCpfToUser = new Map<string, any>()
      existingUsers.forEach((u: any) => {
        if (u.cpf) {
          const clean = normalizarDocChave(u.cpf)
          if (clean) existingCpfToUser.set(clean, u)
        }
      })
      const existingCpfToId = new Map<string, string>()
      existingCpfToUser.forEach((u, _cpf) => existingCpfToId.set(_cpf, u.id))

      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // Converte para JSON (cabeçalho na primeira linha)
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: true,
        defval: '',
      })

      if (rawRows.length <= 1) {
        throw new Error('A planilha está vazia ou contém apenas o cabeçalho.')
      }

      const dataRows = rawRows.slice(1)
      const parsedRows: ImportRow[] = []

      dataRows.forEach((row, index) => {
        // Linha totalmente vazia → ignora silenciosamente
        if (!row || row.every((c: any) => !c || String(c).trim() === '')) return

        const errors: string[] = []

        // 15 colunas na ordem exata do modelo:
        // 0  NOME              -> nome
        // 1  TELEFONE          -> telefone
        // 2  EMAIL            -> email
        // 3  CPF              -> cpf (identificador único do UPSERT)
        // 4  CIDADE           -> cidade
        // 5  MARCA            -> bike_brand
        // 6  DESCRICAO_MODELO -> bike_model
        // 7  ANO_MODELO       -> bike_year
        // 8  CHASSI           -> bike_chassi
        // 9  DATA_VENDA       -> data_primeira_compra
        // 10 TOTAL_COMPRAS    -> quantidade_motos_compradas
        // 11 TOTAL_VALOR_VENDIDO -> total_valor_vendido
        // 12 NUMERO_PASSAGENS -> numero_passagens_oficina
        // 13 TOTAL_LIQUIDO_OFICINA -> total_liquido_oficina
        // 14 ULTIMA_DATA_OFICINA -> data_ultima_passagem_oficina
        const nome = String(row[0] || '').trim()
        const telefone = String(row[1] || '').trim()
        const email = String(row[2] || '').trim()
        const cpfRaw = String(row[3] || '').trim()
        const cidade = String(row[4] || '').trim()
        const bike_brand = String(row[5] || 'BMW Motorrad').trim()
        const bike_model = String(row[6] || '').trim()
        const bike_year =
          parseInt(
            typeof row[7] === 'number' ? String(Math.round(row[7])) : String(row[7] || ''),
            10,
          ) || new Date().getFullYear()
        const bike_chassi = String(row[8] || '').trim()
        const primeiraCompraRaw = String(row[9] || '').trim()
        const quantidade_motos =
          parseInt(
            typeof row[10] === 'number' ? String(Math.round(row[10])) : String(row[10] || ''),
            10,
          ) || 0
        const total_valor_vendido = parseFloat(
          typeof row[11] === 'number'
            ? row[11].toFixed(2)
            : String(row[11] || '0')
                .replace(/\./g, '')
                .replace(',', '.'),
        )
        const numero_passagens_oficina =
          parseInt(
            typeof row[12] === 'number' ? String(Math.round(row[12])) : String(row[12] || ''),
            10,
          ) || 0
        const total_liquido_oficina = parseFloat(
          typeof row[13] === 'number'
            ? row[13].toFixed(2)
            : String(row[13] || '0')
                .replace(/\./g, '')
                .replace(',', '.'),
        )
        const oficinaRaw = String(row[14] || '').trim()

        // Documento (CPF/CNPJ) — normaliza, autocorrige zero à esquerda perdido no
        // Excel (10 → 11 para CPF, 13 → 14 para CNPJ) e valida como CPF ou CNPJ.
        const cleanCpf = normalizarDocChave(row[3])
        const tipoDoc = detectTipoDocumento(cleanCpf)

        // Validação de documento — em branco ou inválido => linha ignorada com aviso
        // (não bloqueia a importação). CPFs/CNPJs válidos viram CREATE ou UPDATE.
        let action: RowAction = 'CREATE'
        let existingId: string | undefined
        let existingUser: any

        if (!cleanCpf) {
          errors.push('Documento (CPF/CNPJ) em branco — linha será ignorada')
          action = 'IGNORE'
        } else if (!isValidDocumento(cleanCpf)) {
          errors.push('Documento inválido (não é CPF nem CNPJ) — linha será ignorada')
          action = 'IGNORE'
        } else if (existingCpfToUser.has(cleanCpf)) {
          action = 'UPDATE'
          existingId = existingCpfToId.get(cleanCpf)
          existingUser = existingCpfToUser.get(cleanCpf)
        } else {
          action = 'CREATE'
        }

        // Validações de datas (apenas para linhas que não serão ignoradas)
        if (action !== 'IGNORE') {
          if (primeiraCompraRaw && !parseDateFlexible(primeiraCompraRaw)) {
            errors.push('Data de venda inválida (use DD/MM/AAAA)')
          }
          if (oficinaRaw && !parseDateFlexible(oficinaRaw)) {
            errors.push('Data da última oficina inválida (use DD/MM/AAAA)')
          }
        }

        // Cálculo da categoria (mesmo para CREATE e UPDATE) — usa a regra de veículos elegíveis + Bronze
        const oficinaDate = parseDateFlexible(oficinaRaw)
        const primeiraDate = parseDateFlexible(primeiraCompraRaw)
        const calc = calcularCategoriaMembro({
          quantidade_motos_compradas: quantidade_motos,
          data_ultima_passagem_oficina: oficinaDate,
          status_membro_atual: 'PRE_CADASTRADO',
          total_valor_vendido,
          numero_passagens_oficina,
          total_liquido_oficina,
          bike_brand,
          bike_model,
          data_primeira_compra: primeiraDate,
        })

        // PARTE 2 — Score, tags e próxima melhor ação
        const scoreCalc = calcularScoreCompleto({
          total_liquido_oficina: isNaN(total_liquido_oficina) ? 0 : total_liquido_oficina,
          numero_passagens_oficina: isNaN(numero_passagens_oficina) ? 0 : numero_passagens_oficina,
          categoria_clube: calc.categoria_clube,
          total_veiculos_elegiveis: calc.total_veiculos_elegiveis,
          data_primeira_compra: primeiraDate,
          data_ultima_passagem_oficina: oficinaDate,
          // Faixas configuradas (carregadas uma vez no handleFileChange)
          valorRanges: currentValorRanges,
          frequenciaRanges: currentFrequenciaRanges,
        })

        // ---- Proteção de campos cadastrais (Parte 1, seção 6) ----
        // Se o registro já existe e o campo vem vazio na planilha, manter o valor existente.
        // Campos protegidos: NOME, TELEFONE, EMAIL, CIDADE.
        // (Campos não protegidos são sempre sobrescritos — lógica na confirmação da importação.)
        const protectedNome =
          action === 'UPDATE' && existingUser && !nome ? String(existingUser.name || '') : nome
        const protectedTelefone =
          action === 'UPDATE' && existingUser && !telefone
            ? String(existingUser.phone || '')
            : telefone
        const protectedEmail =
          action === 'UPDATE' && existingUser && !email ? String(existingUser.email || '') : email
        const protectedCidade =
          action === 'UPDATE' && existingUser && !cidade ? String(existingUser.city || '') : cidade

        parsedRows.push({
          rowIndex: index + 2, // linha 1 é cabeçalho
          nome: protectedNome,
          cpf: formatDocumento(cleanCpf) || cpfRaw,
          cpfClean: cleanCpf,
          tipoDoc,
          telefone: protectedTelefone,
          email: protectedEmail,
          cidade: protectedCidade,
          bike_brand,
          bike_model,
          bike_year,
          bike_chassi,
          data_primeira_compra: primeiraCompraRaw,
          quantidade_motos_compradas: quantidade_motos,
          total_valor_vendido: isNaN(total_valor_vendido) ? 0 : total_valor_vendido,
          numero_passagens_oficina: isNaN(numero_passagens_oficina) ? 0 : numero_passagens_oficina,
          total_liquido_oficina: isNaN(total_liquido_oficina) ? 0 : total_liquido_oficina,
          data_ultima_passagem_oficina: oficinaRaw,
          categoriaCalculada: calc.categoria,
          statusCalculado: action === 'UPDATE' ? 'Atualizar' : 'Pré-cadastrado',
          // PARTE 1 — novos campos calculados
          temMotoComprada: calc.tem_moto_comprada,
          totalVeiculosElegiveis: calc.total_veiculos_elegiveis,
          categoriaClube: calc.categoria_clube,
          dataUltimaPassagemValida: calc.data_ultima_passagem_valida,
          mesesDesdeUltimaPassagem: calc.meses_desde_ultima_passagem,
          diasDesdeVenda: calc.dias_desde_venda,
          mesesDesdeVenda: calc.meses_desde_venda,
          // PARTE 2 — Score, tags e ação
          scoreOficina: scoreCalc.score_oficina,
          scoreValorOficina: scoreCalc.score_valor_oficina,
          scoreFrequencia: scoreCalc.score_frequencia,
          nivelRelacionamento: scoreCalc.nivel_relacionamento,
          tags: scoreCalc.tags,
          proximaMelhorAcao: scoreCalc.proxima_melhor_acao,
          errors,
          // Ignoradas não são válidas para importação; demais são válidas (erros de data só avisam)
          isValid: action !== 'IGNORE' && errors.length === 0,
          action,
          existingId,
          existingUser,
        })
      })

      const updatesCount = parsedRows.filter((r) => r.action === 'UPDATE' && r.isValid).length
      const createsCount = parsedRows.filter((r) => r.action === 'CREATE' && r.isValid).length
      const invalidCount = parsedRows.filter((r) => r.action === 'IGNORE' || !r.isValid).length
      const validCount = updatesCount + createsCount

      setImportRows(parsedRows)
      setSummary({
        total: parsedRows.length,
        valid: validCount,
        invalid: invalidCount,
        updates: updatesCount,
        creates: createsCount,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao processar arquivo',
        description: err.message || 'Arquivo inválido.',
        variant: 'destructive',
      })
      resetState()
    } finally {
      setParsing(false)
    }
  }

  // Confirmar e executar UPSERT dos registros válidos
  //
  // PARTE 3 — Tratamento de erros por linha:
  //   Uma linha com erro NÃO paralisa o arquivo inteiro. O erro é capturado,
  //   registrado na lista de erros (linha, CPF, erro, motivo) e exibido no
  //   resumo final. O processamento continua para as demais linhas.
  //
  // PARTE 3 — Snapshot de métricas:
  //   A cada membro atualizado/criado, um registro é salvo na collection
  //   `historico_metricas_membro` com o snapshot das métricas do momento da
  //   importação, permitindo evolutar o histórico do cliente ao longo do tempo.
  //
  // PARTE 3 — Log de importação:
  //   Ao final, um registro é salvo na collection `import_logs` com o resumo
  //   completo da importação (nome do arquivo, contadores, erros, status).
  const handleConfirmImport = async () => {
    const validRows = importRows.filter((r) => r.isValid)
    if (validRows.length === 0) return

    setLoading(true)
    const totalToProcess = validRows.length
    setImportProgress({
      status: 'processing',
      processedCount: 0,
      totalCount: totalToProcess,
      failCount: 0,
      percent: 0,
    })

    let createdCount = 0
    let updatedCount = 0
    let failCount = 0
    let categoriasAlteradasCount = 0
    let scoresAtualizadosCount = 0
    const errorsByLine: Array<{ linha: number; cpf: string; erro: string; motivo: string }> = []

    const today = new Date()
    const dataStr = today.toISOString().slice(0, 10) // YYYY-MM-DD
    const horaStr = today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    try {
      let processedIndex = 0
      for (const row of validRows) {
        try {
          const oficinaDate = parseDateFlexible(row.data_ultima_passagem_oficina)
          const primeiraDate = parseDateFlexible(row.data_primeira_compra)

          if (row.action === 'UPDATE' && row.existingId) {
            // ===== UPSERT: atualizar membro existente =====
            //
            // Regra de SUBSTITUIÇÃO (Parte 1, seção 7):
            //   TOTAL_COMPRAS, TOTAL_VALOR_VENDIDO, NUMERO_PASSAGENS, TOTAL_LIQUIDO_OFICINA
            //   já vêm consolidados da planilha — NÃO somar, SUBSTITUIR pelo valor mais recente.
            //
            // Regra de proteção de campos cadastrais (Parte 1, seção 6):
            //   NOME, TELEFONE, EMAIL, CIDADE — se a planilha vier vazia, manter o valor existente.
            //   (A proteção já foi aplicada no parsing — row.nome/telefone/email/cidade contêm o valor protegido.)
            //
            // Campos NÃO protegidos (sempre sobrescrever, mesmo vazio/zero):
            //   MARCA, DESCRICAO_MODELO, ANO_MODELO, CHASSI, DATA_VENDA, TOTAL_COMPRAS,
            //   TOTAL_VALOR_VENDIDO, NUMERO_PASSAGENS, TOTAL_LIQUIDO_OFICINA, ULTIMA_DATA_OFICINA.

            // PARTE 3 — Detecta mudanças para o resumo (categoria alterada / score atualizado)
            const oldCat = (row.existingUser?.categoria || row.existingUser?.category || '')
              .toString()
              .toUpperCase()
            const newCat = row.categoriaCalculada.toUpperCase()
            const catMudou = oldCat !== newCat
            const oldScore = Number(row.existingUser?.score_oficina || 0)
            const scoreMudou = oldScore !== row.scoreOficina

            await pb.collection('users').update(row.existingId, {
              name: row.nome || undefined,
              phone: row.telefone || undefined,
              city: row.cidade || undefined,
              email:
                row.email && row.email.includes('@') ? row.email.toLowerCase().trim() : undefined,
              bike_brand: row.bike_brand || 'BMW Motorrad',
              bike_model: row.bike_model || undefined,
              bike_year: row.bike_year || undefined,
              bike_chassi: row.bike_chassi || undefined,
              cpf: row.cpfClean,
              // Campos consolidados — SUBSTITUIR (não somar):
              quantidade_motos_compradas: row.quantidade_motos_compradas,
              total_valor_vendido: row.total_valor_vendido,
              numero_passagens_oficina: row.numero_passagens_oficina,
              total_liquido_oficina: row.total_liquido_oficina,
              data_primeira_compra: primeiraDate ? primeiraDate.toISOString() : null,
              data_ultima_passagem_oficina: oficinaDate ? oficinaDate.toISOString() : null,
              categoria: row.categoriaCalculada,
              category: row.categoriaCalculada,
              motivo_categoria: 'IMPORTACAO_ATUALIZACAO',
              data_categoria_atualizada: new Date().toISOString(),
              // PARTE 1 — campos calculados (recálculo automático pós-importação):
              tem_moto_comprada: row.temMotoComprada,
              total_veiculos_elegiveis: row.totalVeiculosElegiveis,
              categoria_clube: row.categoriaClube,
              data_ultima_passagem_valida: row.dataUltimaPassagemValida || null,
              meses_desde_ultima_passagem: row.mesesDesdeUltimaPassagem,
              dias_desde_venda: row.diasDesdeVenda,
              meses_desde_venda: row.mesesDesdeVenda,
              data_ultimo_calculo: new Date().toISOString(),
              // PARTE 2 — Score, tags e próxima melhor ação
              score_oficina: row.scoreOficina,
              score_valor_oficina: row.scoreValorOficina,
              score_frequencia: row.scoreFrequencia,
              nivel_relacionamento: row.nivelRelacionamento,
              tags: JSON.stringify(row.tags),
              proxima_melhor_acao: row.proximaMelhorAcao,
            })

            // Registra histórico de categoria quando a categoria muda
            if (catMudou) {
              categoriasAlteradasCount++
              try {
                await pb.collection('historico_categoria').create({
                  membro_id: row.existingId,
                  categoria_anterior: oldCat || null,
                  categoria_nova: row.categoriaCalculada,
                  data_alteracao: new Date().toISOString(),
                  motivo: 'IMPORTACAO_ATUALIZACAO',
                  origem: 'automatico',
                  justificativa: 'Atualização via importação de planilha (UPSERT por CPF)',
                })
              } catch {
                /* intentionally ignored */
              }
            }
            if (scoreMudou) {
              scoresAtualizadosCount++
            }

            // PARTE 3 — Salva snapshot das métricas do membro (historico_metricas_membro)
            await historicoMetricasService.create({
              membro_id: row.existingId,
              data_importacao: dataStr,
              categoria: row.categoriaCalculada,
              score_oficina: row.scoreOficina,
              total_compras: row.quantidade_motos_compradas,
              total_valor_vendido: row.total_valor_vendido,
              numero_passagens: row.numero_passagens_oficina,
              total_liquido_oficina: row.total_liquido_oficina,
              status: row.statusCalculado,
              nivel_relacionamento: row.nivelRelacionamento,
            })

            updatedCount++
          } else {
            // ===== UPSERT: criar novo pré-cadastro =====
            // Gera email fallback caso a planilha não tenha informado
            const emailToUse =
              row.email && row.email.includes('@')
                ? row.email.trim().toLowerCase()
                : `membro.${row.cpfClean || Math.random().toString(36).slice(2, 7)}@euromotors.club`

            // Senha temporária aleatória segura (membro definirá no /validar-cadastro)
            const randomPassword = 'EMC@' + Math.random().toString(36).slice(2, 10) + '2025'

            const createdUser = await pb.collection('users').create({
              name: row.nome,
              email: emailToUse,
              password: randomPassword,
              passwordConfirm: randomPassword,
              cpf: row.cpfClean,
              phone: row.telefone,
              city: row.cidade,
              bike_brand: row.bike_brand || 'BMW Motorrad',
              bike_model: row.bike_model,
              bike_year: row.bike_year,
              bike_chassi: row.bike_chassi,
              quantidade_motos_compradas: row.quantidade_motos_compradas,
              total_valor_vendido: row.total_valor_vendido,
              numero_passagens_oficina: row.numero_passagens_oficina,
              total_liquido_oficina: row.total_liquido_oficina,
              data_primeira_compra: primeiraDate ? primeiraDate.toISOString() : null,
              data_ultima_passagem_oficina: oficinaDate ? oficinaDate.toISOString() : null,
              categoria: row.categoriaCalculada,
              category: row.categoriaCalculada,
              status_membro: 'PRE_CADASTRADO',
              status: 'pendente',
              role: 'member',
              motivo_categoria: 'IMPORTACAO',
              data_categoria_atualizada: new Date().toISOString(),
              // PARTE 1 — campos calculados (recálculo automático pós-importação):
              tem_moto_comprada: row.temMotoComprada,
              total_veiculos_elegiveis: row.totalVeiculosElegiveis,
              categoria_clube: row.categoriaClube,
              data_ultima_passagem_valida: row.dataUltimaPassagemValida || null,
              meses_desde_ultima_passagem: row.mesesDesdeUltimaPassagem,
              dias_desde_venda: row.diasDesdeVenda,
              meses_desde_venda: row.mesesDesdeVenda,
              data_ultimo_calculo: new Date().toISOString(),
              // PARTE 2 — Score, tags e próxima melhor ação
              score_oficina: row.scoreOficina,
              score_valor_oficina: row.scoreValorOficina,
              score_frequencia: row.scoreFrequencia,
              nivel_relacionamento: row.nivelRelacionamento,
              tags: JSON.stringify(row.tags),
              proxima_melhor_acao: row.proximaMelhorAcao,
            })

            // Novo membro → categoria e score sempre "alterados" em relação ao estado anterior (inexistente)
            categoriasAlteradasCount++
            scoresAtualizadosCount++

            // Grava histórico de categoria
            try {
              await pb.collection('historico_categoria').create({
                membro_id: createdUser.id,
                categoria_anterior: null,
                categoria_nova: row.categoriaCalculada,
                data_alteracao: new Date().toISOString(),
                motivo: 'IMPORTACAO',
                origem: 'automatico',
                justificativa: 'Importação inicial de planilha em massa (UPSERT por CPF)',
              })
            } catch {
              /* intentionally ignored */
            }

            // Se tiver compra de moto registrada, grava histórico
            if (row.quantidade_motos_compradas > 0 && row.bike_model) {
              try {
                await pb.collection('historico_compras_motos').create({
                  membro_id: createdUser.id,
                  cpf: row.cpfClean,
                  modelo: row.bike_model,
                  ano: row.bike_year,
                  chassi: row.bike_chassi,
                  data_compra: primeiraDate ? primeiraDate.toISOString() : new Date().toISOString(),
                  status_venda: 'ENTREGUE',
                  created_at: new Date().toISOString(),
                })
              } catch {
                /* intentionally ignored */
              }
            }

            // Se tiver oficina registrada, grava histórico
            if (oficinaDate) {
              try {
                await pb.collection('historico_oficina').create({
                  membro_id: createdUser.id,
                  cpf: row.cpfClean,
                  data_passagem: oficinaDate.toISOString(),
                  tipo_servico: 'Revisão Periódica',
                  ordem_servico: 'IMPORT-01',
                  status: 'CONCLUIDA',
                  created_at: new Date().toISOString(),
                })
              } catch {
                /* intentionally ignored */
              }
            }

            // PARTE 3 — Salva snapshot das métricas do novo membro
            await historicoMetricasService.create({
              membro_id: createdUser.id,
              data_importacao: dataStr,
              categoria: row.categoriaCalculada,
              score_oficina: row.scoreOficina,
              total_compras: row.quantidade_motos_compradas,
              total_valor_vendido: row.total_valor_vendido,
              numero_passagens: row.numero_passagens_oficina,
              total_liquido_oficina: row.total_liquido_oficina,
              status: row.statusCalculado,
              nivel_relacionamento: row.nivelRelacionamento,
            })

            createdCount++
          }
        } catch (err: any) {
          // PARTE 3 — Tratamento de erros por linha: registra mas NÃO paralisa o arquivo.
          console.error('Erro ao importar linha', row.rowIndex, err)
          failCount++

          // Extrai detalhes de validação específicos de err.data (PocketBase response.data / err.data)
          const errorData = err?.data || err?.response?.data
          let specificDetails = ''
          if (errorData && typeof errorData === 'object') {
            const fieldMsgs: string[] = []
            for (const [field, detail] of Object.entries(errorData)) {
              if (
                detail &&
                typeof detail === 'object' &&
                'message' in detail &&
                typeof (detail as any).message === 'string'
              ) {
                fieldMsgs.push(`${field}: ${(detail as any).message}`)
              } else if (typeof detail === 'string') {
                fieldMsgs.push(`${field}: ${detail}`)
              }
            }
            if (fieldMsgs.length > 0) {
              specificDetails = fieldMsgs.join(', ')
            }
          }

          const actionPrefix = row.action === 'UPDATE' ? 'Falha ao atualizar' : 'Falha ao criar'

          const fallbackMsg = err?.message
            ? String(err.message).slice(0, 200)
            : row.action === 'UPDATE'
              ? 'Failed to update record.'
              : 'Failed to create record.'

          const formattedError = specificDetails || fallbackMsg

          errorsByLine.push({
            linha: row.rowIndex,
            cpf: row.cpf || row.cpfClean || '—',
            erro: formattedError,
            motivo: `${actionPrefix}: ${formattedError}`,
          })
        } finally {
          processedIndex++
          const currentPercent = Math.round((processedIndex / totalToProcess) * 100)
          setImportProgress({
            status: 'processing',
            processedCount: processedIndex,
            totalCount: totalToProcess,
            failCount,
            percent: currentPercent,
          })
        }
      }

      const ignoredCount = summary?.invalid ?? 0
      const totalProcessadas = createdCount + updatedCount + failCount + ignoredCount

      setSummary((prev) =>
        prev
          ? {
              ...prev,
              importedCount: createdCount + updatedCount,
            }
          : null,
      )

      // PARTE 3 — Salva o registro de log da importação na collection import_logs
      const statusLog =
        failCount === 0 ? 'CONCLUIDO' : failCount === validRows.length ? 'FALHOU' : 'PARCIAL'
      await importLogService.create({
        nome_arquivo: file?.name || 'planilha.xlsx',
        data: dataStr,
        hora: horaStr,
        linhas_processadas: totalProcessadas,
        clientes_criados: createdCount,
        clientes_atualizados: updatedCount,
        erros: JSON.stringify(errorsByLine),
        status: statusLog,
      })

      // PARTE 3 — Exibe o modal de resumo final detalhado
      setFinalSummary({
        nomeArquivo: file?.name || 'planilha.xlsx',
        linhasProcessadas: totalProcessadas,
        clientesCriados: createdCount,
        clientesAtualizados: updatedCount,
        erros: failCount,
        categoriasAlteradas: categoriasAlteradasCount,
        scoresAtualizados: scoresAtualizadosCount,
        linhasIgnoradas: ignoredCount,
        listaErros: errorsByLine,
      })

      setImportProgress({
        status: 'completed',
        processedCount: totalToProcess,
        totalCount: totalToProcess,
        failCount,
        percent: 100,
      })

      toast({
        title: 'Importação concluída',
        description: `${updatedCount} atualizados, ${createdCount} novos, ${ignoredCount} ignorados${
          failCount > 0 ? ` (${failCount} falharam)` : ''
        }.`,
      })

      onSuccess()
    } catch (err: any) {
      toast({
        title: 'Erro durante importação',
        description: err.message || 'Falha geral na importação.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = importRows.filter((r) => {
    if (filterTab === 'create') return r.isValid && r.action === 'CREATE'
    if (filterTab === 'update') return r.isValid && r.action === 'UPDATE'
    if (filterTab === 'invalid') return !r.isValid
    return true
  })

  // Contagem por tipo de documento (CPF/CNPJ) para os cards de resumo do preview.
  const updatesList = importRows.filter((r) => r.isValid && r.action === 'UPDATE')
  const createsList = importRows.filter((r) => r.isValid && r.action === 'CREATE')
  const invalidList = importRows.filter((r) => !r.isValid)
  const countTipo = (list: ImportRow[], tipo: string) =>
    list.filter((r) => r.tipoDoc === tipo).length

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetState()
          onOpenChange(v)
        }
      }}
    >
      <DialogContent className="max-w-5xl bg-slate-950 border-slate-800 text-white max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  Importação de Membros em Massa
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-0.5">
                  UPSERT por CPF/CNPJ — atualiza membros existentes e cria novos pré-cadastros.
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={loading}
              className="border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Baixar Modelo (.xlsx)
            </Button>
          </div>

          {/* Barra de Progresso no Topo do Modal (abaixo do título) */}
          {importProgress.status !== 'idle' && (
            <div
              className={`mt-4 rounded-xl border p-3.5 transition-all duration-300 ${
                importProgress.status === 'processing'
                  ? 'bg-blue-950/30 border-blue-500/30 shadow-lg shadow-blue-950/50'
                  : importProgress.failCount > 0
                    ? 'bg-amber-950/30 border-amber-500/30'
                    : 'bg-emerald-950/30 border-emerald-500/30'
              }`}
            >
              {/* Cabeçalho do Progresso: Status Geral e Contadores */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {importProgress.status === 'processing' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      PROCESSANDO...
                    </span>
                  ) : importProgress.failCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <AlertTriangle className="w-3 h-3" />
                      CONCLUÍDO COM ERROS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" />
                      FINALIZADO
                    </span>
                  )}

                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {importProgress.status === 'processing'
                      ? `Processando ${importProgress.percent}% — ${importProgress.processedCount.toLocaleString('pt-BR')} de ${importProgress.totalCount.toLocaleString('pt-BR')} registros`
                      : importProgress.failCount > 0
                        ? `Importação concluída com ${importProgress.failCount} ${importProgress.failCount === 1 ? 'falha' : 'falhas'}`
                        : `Importação concluída — ${importProgress.processedCount.toLocaleString('pt-BR')} processados`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {importProgress.status === 'processing' && importProgress.failCount > 0 && (
                    <span className="text-[11px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                      {importProgress.failCount}{' '}
                      {importProgress.failCount === 1 ? 'falha' : 'falhas'}
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold font-mono ${
                      importProgress.status === 'processing'
                        ? 'text-blue-400'
                        : importProgress.failCount > 0
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }`}
                  >
                    {importProgress.percent}%
                  </span>
                </div>
              </div>

              {/* Barra de Progresso com estilo refinado */}
              <div className="relative w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, importProgress.percent))}%`,
                    backgroundColor:
                      importProgress.status === 'processing'
                        ? '#0066FF'
                        : importProgress.failCount > 0
                          ? '#F59E0B'
                          : '#10B981',
                    boxShadow:
                      importProgress.status === 'processing'
                        ? '0 0 12px rgba(0, 102, 255, 0.6)'
                        : importProgress.failCount > 0
                          ? '0 0 12px rgba(245, 158, 11, 0.6)'
                          : '0 0 12px rgba(16, 185, 129, 0.6)',
                  }}
                />
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Upload Área */}
        {!summary ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/50 hover:bg-slate-900/80 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all w-full max-w-xl group">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={parsing}
              />
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                {parsing ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                {parsing
                  ? 'Processando e validando planilha...'
                  : 'Selecione ou arraste seu arquivo'}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Suporta planilhas Excel (.xlsx, .xls) ou CSV com as 15 colunas do modelo
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs text-blue-400 font-medium">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Selecionar Arquivo
              </span>
            </label>

            <div className="mt-6 max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" />
                Regras de UPSERT por CPF/CNPJ:
              </p>
              <p>
                • <strong>Documento já existe:</strong> atualiza todos os dados do membro (nome,
                moto, valores, oficinas...).
              </p>
              <p>
                • <strong>Documento não existe:</strong> cria novo pré-cadastro com todos os dados
                da planilha.
              </p>
              <p>
                • <strong>CPF (11 dígitos) ou CNPJ (14 dígitos):</strong> aceitos e detectados
                automaticamente. CPFs com zero à esquerda perdido no Excel (10 dígitos) são
                corrigidos automaticamente.
              </p>
              <p>
                • <strong>Documento em branco ou inválido:</strong> a linha é ignorada com aviso
                (não bloqueia a importação).
              </p>
              <p className="pt-1.5 border-t border-slate-800 mt-1.5">
                • <strong>Platinum:</strong> 5+ motos | <strong>Gold:</strong> 3 ou 4 motos |{' '}
                <strong>Prata:</strong> 1 ou 2 motos.
              </p>
              <p>
                • <strong>Bronze:</strong> 0 motos com passagem na oficina nos últimos 6 meses.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 pt-4">
            {/* Cards de Resumo — Atualizados / Criados / Ignorados */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-950/40 border border-blue-800/40 rounded-lg p-3">
                <div className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Serão ATUALIZADOS
                </div>
                <div className="text-2xl font-bold text-blue-300 mt-1">{summary.updates}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {countTipo(updatesList, 'CPF')} CPF · {countTipo(updatesList, 'CNPJ')} CNPJ
                </div>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3">
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  Serão CRIADOS
                </div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">{summary.creates}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {countTipo(createsList, 'CPF')} CPF · {countTipo(createsList, 'CNPJ')} CNPJ
                </div>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-3">
                <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Linhas IGNORADAS
                </div>
                <div className="text-2xl font-bold text-amber-300 mt-1">{summary.invalid}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {countTipo(invalidList, 'CPF')} CPF · {countTipo(invalidList, 'CNPJ')} CNPJ
                </div>
              </div>
            </div>

            {/* Abas de Filtro da Prévia */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    filterTab === 'all'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Todos ({summary.total})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('update')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    filterTab === 'update'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Atualizar ({summary.updates})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('create')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    filterTab === 'create'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Criar ({summary.creates})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('invalid')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    filterTab === 'invalid'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Ignorados ({summary.invalid})
                </button>
              </div>

              <span className="text-xs text-slate-400">
                Arquivo: <strong className="text-slate-200">{file?.name}</strong>
              </span>
            </div>

            {/* Tabela de Prévia */}
            <ScrollArea className="flex-1 border border-slate-800 rounded-lg bg-slate-900/60 h-[320px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Linha</th>
                    <th className="p-2.5">Nome</th>
                    <th className="p-2.5">CPF/CNPJ</th>
                    <th className="p-2.5">Motocicleta</th>
                    <th className="p-2.5 text-center">Motos</th>
                    <th className="p-2.5 text-center">Ação</th>
                    <th className="p-2.5 text-center">Categoria</th>
                    <th className="p-2.5 text-center">Score</th>
                    <th className="p-2.5">Nível Relac.</th>
                    <th className="p-2.5">Tags</th>
                    <th className="p-2.5">Status / Avisos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRows.map((row) => (
                    <tr
                      key={row.rowIndex}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        row.action === 'IGNORE' || !row.isValid
                          ? 'bg-amber-950/20'
                          : row.action === 'UPDATE'
                            ? 'bg-blue-950/10'
                            : ''
                      }`}
                    >
                      <td className="p-2.5 text-center text-slate-500 font-mono">{row.rowIndex}</td>
                      <td className="p-2.5 font-medium text-white">
                        {row.nome || <span className="text-amber-400 italic">Vazio</span>}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300">
                        {row.cpf ? (
                          <div className="flex flex-col gap-1">
                            <span>{row.cpf}</span>
                            {row.tipoDoc && (
                              <span className="inline-flex w-fit items-center rounded border border-slate-700 bg-slate-800 px-1 py-0 text-[9px] font-bold text-slate-300">
                                {row.tipoDoc}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-400 italic">Vazio</span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {row.bike_model ? (
                          `${row.bike_model} (${row.bike_year})`
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-400">
                        {row.quantidade_motos_compradas}
                      </td>
                      <td className="p-2.5 text-center">
                        {row.action === 'UPDATE' ? (
                          <span className="inline-flex items-center gap-1 text-blue-400 font-bold">
                            <RefreshCw className="w-3 h-3" />
                            Atualizar
                          </span>
                        ) : row.action === 'CREATE' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <UserPlus className="w-3 h-3" />
                            Criar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            Ignorar
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <CategoryBadge category={row.categoriaCalculada} size="sm" />
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`font-bold ${nivelRelacionamentoMeta(row.nivelRelacionamento).textColor}`}
                        >
                          {row.scoreOficina}/100
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                            nivelRelacionamentoMeta(row.nivelRelacionamento).badgeClass
                          }`}
                        >
                          {nivelRelacionamentoMeta(row.nivelRelacionamento).short}
                        </span>
                      </td>
                      <td className="p-2.5">
                        {row.tags.length === 0 ? (
                          <span className="text-slate-500 text-[11px]">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {row.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${tagBadgeClass(
                                  tag,
                                )}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {row.statusCalculado}
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            {row.errors.map((err, i) => (
                              <div
                                key={i}
                                className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium"
                              >
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {err}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}

        {/* Rodapé com botões de ação */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between mt-auto">
          {summary ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetState}
                disabled={loading}
                className="text-slate-400 hover:text-white"
              >
                Trocar Arquivo
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="border-slate-700 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={loading || summary.valid === 0}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando {summary.valid} membros...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Confirmar Importação ({summary.updates} upd + {summary.creates} novo)
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="border-slate-700 text-slate-300"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* PARTE 3 — Modal de resumo final exibido após a conclusão da importação. */}
      {finalSummary && (
        <Dialog
          open={!!finalSummary}
          onOpenChange={(v) => {
            if (!v) {
              setFinalSummary(null)
              onOpenChange(false)
              resetState()
            }
          }}
        >
          <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-white max-h-[90vh] flex flex-col p-6">
            <DialogHeader className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Importação concluída
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs mt-0.5">
                    {finalSummary.nomeArquivo}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-4 overflow-y-auto">
              {/* Cards de contadores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-400 font-medium">Registros processados</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {finalSummary.linhasProcessadas}
                  </div>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3">
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    Clientes criados
                  </div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1">
                    {finalSummary.clientesCriados}
                  </div>
                </div>
                <div className="bg-blue-950/40 border border-blue-800/40 rounded-lg p-3">
                  <div className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Clientes atualizados
                  </div>
                  <div className="text-2xl font-bold text-blue-300 mt-1">
                    {finalSummary.clientesAtualizados}
                  </div>
                </div>
                <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-3">
                  <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Erros
                  </div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">{finalSummary.erros}</div>
                </div>
                <div className="bg-purple-950/40 border border-purple-800/40 rounded-lg p-3">
                  <div className="text-xs text-purple-400 font-medium">Categorias alteradas</div>
                  <div className="text-2xl font-bold text-purple-300 mt-1">
                    {finalSummary.categoriasAlteradas}
                  </div>
                </div>
                <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-3">
                  <div className="text-xs text-indigo-400 font-medium">Scores atualizados</div>
                  <div className="text-2xl font-bold text-indigo-300 mt-1">
                    {finalSummary.scoresAtualizados}
                  </div>
                </div>
              </div>

              {/* Linhas ignoradas (CPF inválido / linha em branco) */}
              {finalSummary.linhasIgnoradas > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {finalSummary.linhasIgnoradas}
                  </span>{' '}
                  linha(s) ignorada(s) por CPF/CNPJ inválido ou em branco (não bloquearam a
                  importação).
                </div>
              )}

              {/* Lista de erros por linha */}
              {finalSummary.listaErros.length > 0 && (
                <div className="border border-red-900/50 bg-red-950/20 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Detalhe dos erros por linha
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {finalSummary.listaErros.map((e, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-red-300/90 bg-red-950/30 border border-red-900/30 rounded px-2 py-1 flex flex-wrap gap-x-2 gap-y-0.5"
                      >
                        <span className="font-mono text-red-200">Linha {e.linha}</span>
                        <span className="text-red-400/70">|</span>
                        <span>Doc: {e.cpf}</span>
                        <span className="text-red-400/70">|</span>
                        <span className="text-slate-400">{e.motivo}</span>
                        <span className="text-red-400/70">|</span>
                        <span className="text-red-300">{e.erro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setFinalSummary(null)
                  onOpenChange(false)
                  resetState()
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
