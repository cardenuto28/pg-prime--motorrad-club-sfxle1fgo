// Hook central para validação de CPF e cálculo automático de categoria ao criar membro
onRecordCreate((e) => {
  const record = e.record
  if (!record) {
    e.next()
    return
  }

  // 1. Validação de CPF único se preenchido
  const cpfRaw = record.getString('cpf') || ''
  const cleanCpf = cpfRaw.replace(/\D/g, '')

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

  // 2. Cálculo inicial de categoria se não informada
  const motos = record.getInt('quantidade_motos_compradas') || 0
  const oficinaDateStr = record.getString('data_ultima_passagem_oficina') || ''
  const currentStatusMembro = record.getString('status_membro') || ''

  let categoria = 'INATIVO'
  let statusMembro = currentStatusMembro || 'ATIVO'
  let motivo = 'IMPORTACAO'

  if (motos >= 5) {
    categoria = 'PLATINUM'
    statusMembro = currentStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
    motivo = 'QUINTA_COMPRA'
  } else if (motos >= 3) {
    categoria = 'GOLD'
    statusMembro = currentStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
    motivo = 'TERCEIRA_COMPRA'
  } else if (motos >= 1) {
    categoria = 'SILVER'
    statusMembro = currentStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
    motivo = 'PRIMEIRA_COMPRA'
  } else {
    // 0 motos: verifica data de oficina
    if (oficinaDateStr) {
      const oficinaDate = new Date(oficinaDateStr)
      if (!isNaN(oficinaDate.getTime())) {
        const now = new Date()

        // 6 meses atrás
        const sixMonthsAgo = new Date(now)
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        // 5 meses atrás (últimos 30 dias de validade)
        const fiveMonthsAgo = new Date(now)
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5)

        if (oficinaDate >= fiveMonthsAgo) {
          categoria = 'BRONZE'
          statusMembro = currentStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
          motivo = 'NOVA_PASSAGEM_OFICINA'
        } else if (oficinaDate >= sixMonthsAgo) {
          categoria = 'BRONZE'
          statusMembro = currentStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATENCAO'
          motivo = 'NOVA_PASSAGEM_OFICINA'
        } else {
          categoria = 'INATIVO'
          statusMembro = 'INATIVO'
          motivo = 'BRONZE_EXPIRADO'
        }
      } else {
        categoria = 'INATIVO'
        statusMembro = 'INATIVO'
        motivo = 'BRONZE_EXPIRADO'
      }
    } else {
      categoria = 'INATIVO'
      statusMembro = 'INATIVO'
      motivo = 'BRONZE_EXPIRADO'
    }
  }

  // Preenche valores calculados se não vieram explicitamente definidos
  if (!record.getString('categoria')) {
    record.set('categoria', categoria)
  }
  if (!record.getString('status_membro')) {
    record.set('status_membro', statusMembro)
  }
  if (!record.getString('motivo_categoria')) {
    record.set('motivo_categoria', motivo)
  }
  record.set('data_categoria_atualizada', new Date().toISOString())

  e.next()
}, 'users')
