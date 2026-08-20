// Rota pública para ativar o cadastro pré-existente criando senha e gravando consentimentos
routerAdd('POST', '/api/club/activate-pre-registration', (e) => {
  const body = e.requestInfo().body || {}
  const memberId = (body.memberId || '').trim()
  const password = body.password || ''
  const acceptImage = body.acceptImage === true
  const acceptTerms = body.acceptTerms === true

  if (!memberId) {
    return e.json(400, { error: 'Identificador do membro é obrigatório.' })
  }
  if (!password || password.length < 8) {
    return e.json(400, { error: 'A senha deve ter no mínimo 8 caracteres.' })
  }
  if (!acceptImage || !acceptTerms) {
    return e.json(400, {
      error: 'É obrigatório autorizar o uso de imagem/voz e aceitar os termos de adesão.',
    })
  }

  try {
    const member = $app.findFirstRecordByData('_pb_users_auth_', 'id', memberId)
    if (!member) {
      return e.json(404, { error: 'Membro não encontrado.' })
    }

    const nowIso = new Date().toISOString()
    member.setPassword(password)
    member.set('status', 'ativo')
    member.set('status_membro', 'ATIVO')
    member.set('accepted_privacy_at', nowIso)
    member.set('accepted_image_at', nowIso)

    // Se a categoria ainda não foi preenchida, calcula
    const motos = member.getInt('quantidade_motos_compradas') || 0
    const oficinaDateStr = member.getString('data_ultima_passagem_oficina') || ''
    if (!member.getString('categoria')) {
      if (motos >= 5) member.set('categoria', 'PLATINUM')
      else if (motos >= 3) member.set('categoria', 'GOLD')
      else if (motos >= 1) member.set('categoria', 'SILVER')
      else if (oficinaDateStr) member.set('categoria', 'BRONZE')
      else member.set('categoria', 'INATIVO')
    }

    $app.save(member)

    return e.json(200, {
      success: true,
      email: member.getString('email'),
      message: 'Cadastro ativado com sucesso!',
    })
  } catch (err) {
    return e.json(500, { error: 'Erro ao ativar cadastro: ' + err.message })
  }
})
