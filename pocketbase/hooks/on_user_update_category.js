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

  const newMotos = record.getInt('quantidade_motos_compradas') || 0
  const newOficina = record.getString('data_ultima_passagem_oficina') || ''
  const newBikeBrand = record.getString('bike_brand') || ''
  const newBikeModel = record.getString('bike_model') || ''
  const newVenda = record.getString('data_primeira_compra') || ''

  // Recalcula sempre que motos, oficina, veículo ou venda mudarem
  if (
    origMotos !== newMotos ||
    origOficina !== newOficina ||
    origBikeBrand !== newBikeBrand ||
    origBikeModel !== newBikeModel ||
    origVenda !== newVenda
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
  }

  e.next()
}, 'users')
