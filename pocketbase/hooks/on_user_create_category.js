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

  e.next()
}, 'users')
