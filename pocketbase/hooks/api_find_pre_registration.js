// Rota pública para busca de pré-cadastro por CPF ou últimos 7 dígitos do chassi
// e ativação direta pelo próprio membro.
routerAdd('POST', '/api/club/find-pre-registration', (e) => {
  const body = e.requestInfo().body || {}
  const search = (body.search || '').trim()

  if (!search) {
    return e.json(400, { error: 'Informe o CPF ou os últimos 7 dígitos do chassi.' })
  }

  const cleanSearch = search.replace(/\D/g, '')

  try {
    let member = null

    // 1. Tenta buscar por CPF
    if (cleanSearch.length >= 11) {
      try {
        const records = $app.findRecordsByFilter('_pb_users_auth_', 'cpf ~ {:cpf}', '', 1, 0, {
          cpf: cleanSearch,
        })
        if (records && records.length > 0) {
          member = records[0]
        }
      } catch (_) {}
    }

    // 2. Se não achou ou busca foi chassi, busca por chassi
    if (!member && search.length >= 6) {
      try {
        const records = $app.findRecordsByFilter(
          '_pb_users_auth_',
          'bike_chassi ~ {:chassi}',
          '',
          1,
          0,
          { chassi: search.toUpperCase() },
        )
        if (records && records.length > 0) {
          member = records[0]
        }
      } catch (_) {}
    }

    if (!member) {
      return e.json(404, {
        error: 'Cadastro não encontrado. Verifique o CPF ou chassi informado.',
      })
    }

    const statusMembro = member.getString('status_membro') || member.getString('status') || ''
    const isPreCadastrado =
      statusMembro.toUpperCase() === 'PRE_CADASTRADO' ||
      statusMembro.toUpperCase() === 'PENDENTE' ||
      member.getString('status') === 'pendente'

    if (
      !isPreCadastrado &&
      (statusMembro.toUpperCase() === 'ATIVO' || member.getString('status') === 'ativo')
    ) {
      return e.json(400, {
        error: 'Este cadastro já foi ativado. Faça login para acessar.',
        alreadyActive: true,
      })
    }

    // Retorna os dados para confirmação
    return e.json(200, {
      id: member.id,
      name: member.getString('name'),
      email: member.getString('email'),
      phone: member.getString('phone'),
      cpf: member.getString('cpf'),
      city: member.getString('city'),
      bike_brand: member.getString('bike_brand'),
      bike_model: member.getString('bike_model'),
      bike_year: member.getInt('bike_year'),
      bike_chassi: member.getString('bike_chassi'),
      categoria: member.getString('categoria'),
      status_membro: statusMembro,
    })
  } catch (err) {
    return e.json(500, { error: 'Erro interno ao consultar cadastro: ' + err.message })
  }
})
