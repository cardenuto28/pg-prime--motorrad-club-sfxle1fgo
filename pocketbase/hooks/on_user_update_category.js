// Hook users.update: recalcula categoria caso motos, oficina ou veículo tenham sido alterados.
// PARTE 1 — regra de veículos elegíveis + Bronze (espelha src/lib/membership.ts).
//
// NOTA: PocketBase JSVM executa callbacks em um pool de VMs separado — funções declaradas
// no escopo top-level do arquivo NÃO são acessíveis dentro do callback. Por isso toda a
// lógica auxiliar está definida DENTRO do callback.
onRecordUpdate((e) => {
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

  // ---- helper: registra histórico de categoria ----
  const registrarHistorico = (memberId, anterior, nova, motivo) => {
    try {
      const histCol = $app.findCollectionByNameOrId('historico_categoria')
      const histRec = new Record(histCol)
      histRec.set('membro_id', memberId)
      histRec.set('categoria_anterior', anterior || null)
      histRec.set('categoria_nova', nova)
      histRec.set('data_alteracao', new Date().toISOString())
      histRec.set('motivo', motivo)
      histRec.set('origem', 'automatico')
      $app.save(histRec)
    } catch (err) {
      console.log('Erro ao salvar historico_categoria no update hook:', err)
    }
  }

  const origMotos = record.original().getInt('quantidade_motos_compradas') || 0
  const origOficina = record.original().getString('data_ultima_passagem_oficina') || ''
  const origCategoria = record.original().getString('categoria') || ''
  const origBikeBrand = record.original().getString('bike_brand') || ''
  const origBikeModel = record.original().getString('bike_model') || ''
  const origVenda = record.original().getString('data_primeira_compra') || ''
  const origStatusMembro = record.original().getString('status_membro') || ''
  const origTotalLiquido = record.original().getFloat('total_liquido_oficina') || 0
  const origNumeroPassagens = record.original().getInt('numero_passagens_oficina') || 0

  const newMotos = record.getInt('quantidade_motos_compradas') || 0
  const newOficina = record.getString('data_ultima_passagem_oficina') || ''
  const newBikeBrand = record.getString('bike_brand') || ''
  const newBikeModel = record.getString('bike_model') || ''
  const newVenda = record.getString('data_primeira_compra') || ''
  const newTotalLiquido = record.getFloat('total_liquido_oficina') || 0
  const newNumeroPassagens = record.getInt('numero_passagens_oficina') || 0

  // Recalcula sempre que motos, oficina, veículo, venda ou valores de oficina mudarem
  if (
    origMotos !== newMotos ||
    origOficina !== newOficina ||
    origBikeBrand !== newBikeBrand ||
    origBikeModel !== newBikeModel ||
    origVenda !== newVenda ||
    origTotalLiquido !== newTotalLiquido ||
    origNumeroPassagens !== newNumeroPassagens
  ) {
    const passagensOficina = record.getInt('numero_passagens_oficina') || 0
    const totalLiquidoOficina = record.getFloat('total_liquido_oficina') || 0
    const bikeBrand = (newBikeBrand || '').toUpperCase()
    const temBMW = bikeBrand.includes('BMW')
    const bikeModel = (newBikeModel || '').trim()

    const temMotoComprada = temBMW && (newMotos >= 1 || bikeModel.length > 0) ? 'SIM' : 'NÃO'
    const totalVeiculosElegiveis = temMotoComprada === 'SIM' ? newMotos : 0

    const agora = new Date()
    let mesesDesdeUltimaPassagem = 0
    let dataUltimaPassagemValida = ''
    let oficinaDate = null
    if (newOficina) {
      oficinaDate = new Date(newOficina)
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
    if (newVenda) {
      vendaDate = new Date(newVenda)
      if (!isNaN(vendaDate.getTime())) {
        diasDesdeVenda = Math.floor((agora.getTime() - vendaDate.getTime()) / 86400000)
        mesesDesdeVenda = mesesEntreDatas(vendaDate, agora)
      }
    }

    let categoriaClube = ''
    let categoriaLegacy = 'INATIVO'
    let motivo = 'AJUSTE_ADMINISTRATIVO'
    let statusMembro = record.getString('status_membro') || 'ATIVO'
    const isPre = origStatusMembro === 'PRE_CADASTRADO' || origStatusMembro === 'pendente'

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

    record.set('categoria', categoriaLegacy)
    record.set('category', categoriaLegacy)
    record.set('status_membro', statusMembro)
    record.set('motivo_categoria', motivo)
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

    // Se a categoria mudou, grava no histórico
    if (origCategoria !== categoriaLegacy) {
      registrarHistorico(record.id, origCategoria, categoriaLegacy, motivo)
    }

    // PARTE 2 — Score de Oficina + Tags + Próxima Melhor Ação
    // (lógica replicada inline — PocketBase JSVM não compartilha módulos)
    // score_oficina = score_valor + score_frequencia (máx 100)
    // Usa totalLiquidoOficina e passagensOficina já lidos acima
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
    const temPrimeiraCompra = !!(newVenda && newVenda.trim())
    const temOficina = !!(newOficina && newOficina.trim())
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
    else if (tagsArr.indexOf('PRÓXIMO DO PLATINUM') >= 0)
      proximaAcao = 'CLIENTE PRÓXIMO DO PLATINUM'
    else if (tagsArr.indexOf('ALTO VALOR PÓS-VENDAS') >= 0) proximaAcao = 'CLIENTE DE ALTO VALOR'
    else if (tagsArr.indexOf('VIP ATIVO') >= 0) proximaAcao = 'PRIORIDADE DE RELACIONAMENTO'

    record.set('score_oficina', scoreTotal)
    record.set('score_valor_oficina', scoreValor)
    record.set('score_frequencia', scoreFrequencia)
    record.set('nivel_relacionamento', nivelRelacionamento)
    record.set('tags', JSON.stringify(tagsArr))
    record.set('proxima_melhor_acao', proximaAcao)
    record.set('data_ultimo_calculo', new Date().toISOString())
  }

  e.next()
}, 'users')
