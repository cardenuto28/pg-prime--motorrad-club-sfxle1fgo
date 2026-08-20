// Hook para validar criação de registros em store_visits
// Garante segurança caso alguém tente chamar diretamente a API do PocketBase sem o endpoint /api/club/store-checkin
onRecordCreate((e) => {
  const record = e.record
  if (!record) {
    e.next()
    return
  }

  const userId = record.getString('user')
  if (!userId) {
    throw new BadRequestError('Membro não especificado.')
  }

  // Se a requisição veio de um admin, permite criar visita normalmente
  const authRecord = e.auth
  const isAdmin = authRecord && authRecord.getString('role') === 'admin'

  // 1. Busca os dados do usuário para verificar status
  let userRecord
  try {
    userRecord = $app.findRecordById('_pb_users_auth_', userId)
  } catch (_) {
    throw new BadRequestError('Usuário não encontrado.')
  }

  const role = userRecord.getString('role')
  const status = userRecord.getString('status')
  const statusMembro = userRecord.getString('status_membro')
  const categoria = userRecord.getString('categoria') || userRecord.getString('category') || ''

  // Validação de membro ativo
  const isSuper = role === 'admin' || isAdmin
  const isStatusAtivo = status === 'ativo' || statusMembro === 'ATIVO' || statusMembro === 'ATENCAO'
  const isInactive =
    status === 'inativo' ||
    status === 'bloqueado' ||
    statusMembro === 'INATIVO' ||
    categoria.toUpperCase() === 'INATIVO'

  if (!isSuper && (isInactive || !isStatusAtivo)) {
    if (status === 'pendente' || statusMembro === 'PRE_CADASTRADO' || statusMembro === 'PENDENTE') {
      throw new BadRequestError(
        'Seu cadastro ainda está em aprovação. O check-in na loja é exclusivo para membros ativos.',
      )
    }
    throw new BadRequestError(
      'Seu cadastro não está ativo no momento. Regularize sua situação para acumular pontos de visita na loja.',
    )
  }

  // 2. Validação de apenas 1 visita por dia
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const todayStartStr = `${year}-${month}-${day} 00:00:00.000Z`

  try {
    const existingToday = $app.findRecordsByFilter(
      'store_visits',
      'user = {:userId} && created >= {:todayStart}',
      '-created',
      1,
      0,
      {
        userId: userId,
        todayStart: todayStartStr,
      },
    )

    if (existingToday && existingToday.length > 0) {
      throw new BadRequestError('Você já fez check-in na loja hoje.')
    }
  } catch (err) {
    if (err && err.message && err.message.includes('Você já fez check-in na loja hoje')) {
      throw err
    }
  }

  // Preenche created_at se vazio
  if (!record.getString('created_at')) {
    record.set('created_at', new Date().toISOString())
  }

  e.next()
}, 'store_visits')
