// Hook central: validação de CPF e cálculo automático de categoria ao criar membro.
// PARTE 1 — regra de veículos elegíveis + Bronze (mesma lógica de src/lib/membership.ts).
//
// NOTA: PocketBase JSVM executa callbacks em um pool de VMs separado — funções declaradas
// no escopo top-level do arquivo NÃO são acessíveis dentro do callback. Por isso toda a
// lógica auxiliar está definida DENTRO do callback.
onRecordCreate((e) => {
  const record = e.record
  if (!record) {
    e.next()
    return
  }

  // ---- helper: meses cheios entre duas datas ----
  const mesesEntreDatas = (data, agora) => {
    let meses = (agora.getFullYear() - data.getFullYear()) * 12
    meses += agora.getMonth() - data.getMonth()
    if (agora.getDate() < data.getDate()) {
      meses -= 1
    }
    return meses < 0 ? 0 : meses
  }

  // 1. Validação de CPF único se preenchido
  const cpfRaw = record.getString('cpf') || ''
  const cleanCpf = cpfRaw.replace(/[.\-\s]/g, '')

  if (cleanCpf) {
    try {
      const existing = $app.findRecordsByFilter('_pb_users_auth_', 'cpf ~ {:cpf}', '', 1, 0, {
        cpf: cleanCpf,
      })
      if (existing && existing.length > 0) {
        throw new BadRequestError('CPF já cadastrado no sistema.')
      }
    } catch (err) {
      if (err && err.message && err.message.includes('CPF já cadastrado')) {
        throw err
      }
      // Se não encontrou registros, tudo certo
    }
  }

  // 2. Cálculo (Parte 1) — espelha calcularCategoriaMembro de src/lib/membership.ts
  const motos = record.getInt('quantidade_motos_compradas') || 0
  const passagensOficina = record.getInt('numero_passagens_oficina') || 0
  const totalLiquidoOficina = record.getFloat('total_liquido_oficina') || 0
  const bikeBrand = (record.getString('bike_brand') || '').toUpperCase()
  const bikeModel = (record.getString('bike_model') || '').trim()
  const oficinaDateStr = record.getString('data_ultima_passagem_oficina') || ''
  const dataVendaStr = record.getString('data_primeira_compra') || ''
  const currentStatusMembro = record.getString('status_membro') || ''

  const temBMW = bikeBrand.includes('BMW')
  const temMotoComprada = temBMW && (motos >= 1 || bikeModel.length > 0) ? 'SIM' : 'NÃO'
  const totalVeiculosElegiveis = temMotoComprada === 'SIM' ? motos : 0

  const agora = new Date()
  let mesesDesdeUltimaPassagem = 0
  let dataUltimaPassagemValida = ''
  let oficinaDate = null
  if (oficinaDateStr) {
    oficinaDate = new Date(oficinaDateStr)
    if (!isNaN(oficinaDate.getTime())) {
      dataUltimaPassagemValida = oficinaDate.toISOString()
      mesesDesdeUltimaPassagem = mesesEntreDatas(oficinaDate, agora)
    }
  }
  const temHistoricoOficina = passagensOficina > 0 || totalLiquidoOficina > 0
  if (!oficinaDate && temHistoricoOficina) {
    mesesDesdeUltimaPassagem = 99
  }

  let diasDesdeVenda = 0
  let mesesDesdeVenda = 0
  let vendaDate = null
  if (dataVendaStr) {
    vendaDate = new Date(dataVendaStr)
    if (!isNaN(vendaDate.getTime())) {
      diasDesdeVenda = Math.floor((agora.getTime() - vendaDate.getTime()) / 86400000)
      mesesDesdeVenda = mesesEntreDatas(vendaDate, agora)
    }
  }

  let categoriaClube = ''
  let categoriaLegacy = 'INATIVO'
  let motivo = 'IMPORTACAO'
  let statusMembro = currentStatusMembro || 'ATIVO'
  const isPre = currentStatusMembro === 'PRE_CADASTRADO' || currentStatusMembro === 'pendente'

  if (temMotoComprada === 'SIM') {
    if (totalVeiculosElegiveis >= 5) {
      categoriaClube = 'PLATINUM'
      categoriaLegacy = 'PLATINUM'
      motivo = 'QUINTA_COMPRA'
      statusMembro = isPre ? 'PRE_CADASTRADO' : 'ATIVO'
    } else if (totalVeiculosElegiveis >= 3) {
      categoriaClube = 'GOLD'
      categoriaLegacy = 'GOLD'
      motivo = 'TERCEIRA_COMPRA'
      statusMembro = isPre ? 'PRE_CADASTRADO' : 'ATIVO'
    } else if (totalVeiculosElegiveis >= 1) {
      categoriaClube = 'PRATA'
      categoriaLegacy = 'SILVER'
      motivo = 'PRIMEIRA_COMPRA'
      statusMembro = isPre ? 'PRE_CADASTRADO' : 'ATIVO'
    } else {
      categoriaClube = ''
      categoriaLegacy = 'INATIVO'
      motivo = 'SEM_COMPRA_REGISTRADA'
      statusMembro = isPre ? 'PRE_CADASTRADO' : 'INATIVO'
    }
  } else {
    if (oficinaDate && mesesDesdeUltimaPassagem <= 6) {
      categoriaClube = 'BRONZE'
      categoriaLegacy = 'BRONZE'
      if (mesesDesdeUltimaPassagem > 5) {
        statusMembro = isPre ? 'PRE_CADASTRADO' : 'ATENCAO'
        motivo = 'BRONZE_PROXIMO_VENCIMENTO'
      } else {
        statusMembro = isPre ? 'PRE_CADASTRADO' : 'ATIVO'
        motivo = 'NOVA_PASSAGEM_OFICINA'
      }
    } else {
      categoriaClube = ''
      categoriaLegacy = 'INATIVO'
      motivo = temHistoricoOficina ? 'OFICINA_EXPIRADA' : 'SEM_RELACIONAMENTO'
      statusMembro = isPre ? 'PRE_CADASTRADO' : 'INATIVO'
    }
  }

  // Preenche valores calculados se não vieram explicitamente definidos
  if (!record.getString('categoria')) {
    record.set('categoria', categoriaLegacy)
  }
  if (!record.getString('category')) {
    record.set('category', categoriaLegacy)
  }
  if (!record.getString('status_membro')) {
    record.set('status_membro', statusMembro)
  }
  if (!record.getString('motivo_categoria')) {
    record.set('motivo_categoria', motivo)
  }
  record.set('data_categoria_atualizada', new Date().toISOString())

  // PARTE 1 — novos campos
  record.set('tem_moto_comprada', temMotoComprada)
  record.set('total_veiculos_elegiveis', totalVeiculosElegiveis)
  record.set('categoria_clube', categoriaClube)
  record.set('data_ultima_passagem_valida', dataUltimaPassagemValida || '')
  record.set('meses_desde_ultima_passagem', mesesDesdeUltimaPassagem)
  record.set('dias_desde_venda', diasDesdeVenda)
  record.set('meses_desde_venda', mesesDesdeVenda)
  record.set('data_ultimo_calculo', new Date().toISOString())

  // PARTE 2 — Score de Oficina + Tags + Próxima Melhor Ação
  // (lógica replicada inline — PocketBase JSVM não compartilha módulos)
  // score_oficina = score_valor + score_frequencia (máx 100)
  const valorLiquidoOficina = totalLiquidoOficina
  const passagensOficinaCalc = passagensOficina

  // Faixas padrão (espelho de DEFAULT_SCORE_VALOR_RANGES)
  const defaultValorRanges = [
    { min: 0, max: 0, points: 0 },
    { min: 0.01, max: 2500, points: 10 },
    { min: 2500.01, max: 5000, points: 20 },
    { min: 5000.01, max: 10000, points: 35 },
    { min: 10000.01, max: 20000, points: 50 },
    { min: 20000.01, max: 35000, points: 60 },
    { min: 35000.01, max: 99999999, points: 70 },
  ]
  const defaultFrequenciaRanges = [
    { min: 0, max: 0, points: 0 },
    { min: 1, max: 2, points: 5 },
    { min: 3, max: 5, points: 10 },
    { min: 6, max: 10, points: 20 },
    { min: 11, max: 99999, points: 30 },
  ]

  // Tenta carregar faixas configuradas (coleção settings) — fallback para padrão
  let valorRanges = defaultValorRanges
  let frequenciaRanges = defaultFrequenciaRanges
  try {
    const recValor = $app.findFirstRecordByData('settings', 'key', 'score_valor_ranges')
    const rawValor = recValor.getString('json_data') || ''
    if (rawValor) {
      const parsed = JSON.parse(rawValor)
      if (Array.isArray(parsed) && parsed.length > 0) {
        valorRanges = parsed
      }
    }
  } catch (_) {}
  try {
    const recFreq = $app.findFirstRecordByData('settings', 'key', 'score_frequencia_ranges')
    const rawFreq = recFreq.getString('json_data') || ''
    if (rawFreq) {
      const parsed = JSON.parse(rawFreq)
      if (Array.isArray(parsed) && parsed.length > 0) {
        frequenciaRanges = parsed
      }
    }
  } catch (_) {}

  // Calcula faixa de valor
  let scoreValor = 0
  for (let i = 0; i < valorRanges.length; i++) {
    const r = valorRanges[i]
    const min = Number(r.min)
    const max = Number(r.max)
    const pts = Number(r.points) || 0
    if (valorLiquidoOficina >= min && valorLiquidoOficina <= max) {
      scoreValor = pts
      break
    }
  }
  if (valorLiquidoOficina > 0 && scoreValor === 0) {
    let maxPts = 0
    for (let i = 0; i < valorRanges.length; i++) {
      const pts = Number(valorRanges[i].points) || 0
      if (pts > maxPts) maxPts = pts
    }
    scoreValor = maxPts
  }
  if (scoreValor > 70) scoreValor = 70

  // Calcula faixa de frequência
  let scoreFrequencia = 0
  for (let i = 0; i < frequenciaRanges.length; i++) {
    const r = frequenciaRanges[i]
    const min = Number(r.min)
    const max = Number(r.max)
    const pts = Number(r.points) || 0
    if (passagensOficinaCalc >= min && passagensOficinaCalc <= max) {
      scoreFrequencia = pts
      break
    }
  }
  if (passagensOficinaCalc > 0 && scoreFrequencia === 0) {
    let maxPts = 0
    for (let i = 0; i < frequenciaRanges.length; i++) {
      const pts = Number(frequenciaRanges[i].points) || 0
      if (pts > maxPts) maxPts = pts
    }
    scoreFrequencia = maxPts
  }
  if (scoreFrequencia > 30) scoreFrequencia = 30

  const scoreTotal = Math.min(100, scoreValor + scoreFrequencia)
  let nivelRelacionamento = 'BAIXO RELACIONAMENTO'
  if (scoreTotal <= 29) nivelRelacionamento = 'BAIXO RELACIONAMENTO'
  else if (scoreTotal <= 49) nivelRelacionamento = 'RELACIONAMENTO MODERADO'
  else if (scoreTotal <= 69) nivelRelacionamento = 'RELACIONAMENTO ATIVO'
  else if (scoreTotal <= 84) nivelRelacionamento = 'RELACIONAMENTO FORTE'
  else nivelRelacionamento = 'RELACIONAMENTO EXCEPCIONAL'

  // Calcula tags (mesma lógica de calcularTagsInteligentes)
  const catUpper = (categoriaClube || '').toUpperCase()
  const catIsVip = catUpper === 'GOLD' || catUpper === 'PLATINUM'
  const tagsArr = []
  if (catIsVip) {
    if (scoreTotal >= 70) tagsArr.push('VIP ATIVO')
    else if (scoreTotal < 30) tagsArr.push('VIP AFASTADO')
  }
  if (scoreTotal >= 85) tagsArr.push('ALTO VALOR PÓS-VENDAS')
  if (catUpper === 'PRATA' && totalVeiculosElegiveis === 2) tagsArr.push('PRÓXIMO DO GOLD')
  if (catUpper === 'GOLD' && totalVeiculosElegiveis === 4) tagsArr.push('PRÓXIMO DO PLATINUM')
  const temPrimeiraCompra = !!(dataVendaStr && dataVendaStr.trim())
  const temOficina = !!(oficinaDateStr && oficinaDateStr.trim())
  const semPassagens = !passagensOficinaCalc || passagensOficinaCalc === 0
  if (temPrimeiraCompra && !temOficina && semPassagens) {
    tagsArr.push('PRIMEIRA PASSAGEM PENDENTE')
  }

  // Próxima melhor ação (prioridade conforme especificação)
  let proximaAcao = 'SEM AÇÃO'
  if (tagsArr.indexOf('PRIMEIRA PASSAGEM PENDENTE') >= 0)
    proximaAcao = 'CONTATAR PARA PRIMEIRA PASSAGEM'
  else if (tagsArr.indexOf('VIP AFASTADO') >= 0) proximaAcao = 'REATIVAR PÓS-VENDAS'
  else if (tagsArr.indexOf('PRÓXIMO DO GOLD') >= 0) proximaAcao = 'CLIENTE PRÓXIMO DO GOLD'
  else if (tagsArr.indexOf('PRÓXIMO DO PLATINUM') >= 0) proximaAcao = 'CLIENTE PRÓXIMO DO PLATINUM'
  else if (tagsArr.indexOf('ALTO VALOR PÓS-VENDAS') >= 0) proximaAcao = 'CLIENTE DE ALTO VALOR'
  else if (tagsArr.indexOf('VIP ATIVO') >= 0) proximaAcao = 'PRIORIDADE DE RELACIONAMENTO'

  record.set('score_oficina', scoreTotal)
  record.set('score_valor_oficina', scoreValor)
  record.set('score_frequencia', scoreFrequencia)
  record.set('nivel_relacionamento', nivelRelacionamento)
  record.set('tags', JSON.stringify(tagsArr))
  record.set('proxima_melhor_acao', proximaAcao)
  record.set('data_ultimo_calculo', new Date().toISOString())

  e.next()
}, 'users')
