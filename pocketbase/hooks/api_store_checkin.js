// Hook endpoint para realizar o check-in presencial na loja usando o token diário
routerAdd(
  'POST',
  '/backend/v1/club/store-checkin',
  (e) => {
    const authRecord = e.auth
    if (!authRecord) {
      return e.json(401, { error: 'Faça login para realizar o check-in na loja.' })
    }

    const userId = authRecord.id
    const body = e.requestInfo().body || {}
    const rawToken = (body.token || e.requestInfo().query?.token || '')
      .toString()
      .trim()
      .toUpperCase()

    if (!rawToken) {
      return e.json(400, {
        error: 'QR Code inválido ou ausente. Escaneie o QR Code na loja PG PRIME.',
        code: 'TOKEN_MISSING',
      })
    }

    // 1. Busca segredo da coleção settings
    let secret = $os.getenv('PGPRIME_STORE_TOKEN_SECRET') || 'PGPRIME2026'
    try {
      const settingsRec = $app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec && settingsRec.getString('daily_token_secret')) {
        secret = settingsRec.getString('daily_token_secret')
      }
    } catch (_) {}

    // 2. Calcula token esperado para a data de hoje (YYYY-MM-DD)
    // Suporta tolerância de fusos: checa hoje (local do servidor) e hoje (UTC)
    const now = new Date()

    // Local date
    const locYear = now.getFullYear()
    const locMonth = String(now.getMonth() + 1).padStart(2, '0')
    const locDay = String(now.getDate()).padStart(2, '0')
    const locDateStr = `${locYear}-${locMonth}-${locDay}`
    const validTokenLocal = $security.hs256(locDateStr, secret).substring(0, 12).toUpperCase()

    // UTC date
    const utcYear = now.getUTCFullYear()
    const utcMonth = String(now.getUTCMonth() + 1).padStart(2, '0')
    const utcDay = String(now.getUTCDate()).padStart(2, '0')
    const utcDateStr = `${utcYear}-${utcMonth}-${utcDay}`
    const validTokenUtc = $security.hs256(utcDateStr, secret).substring(0, 12).toUpperCase()

    if (rawToken !== validTokenLocal && rawToken !== validTokenUtc) {
      return e.json(400, {
        error: 'QR Code inválido ou expirado. Escaneie o QR Code atualizado na loja PG PRIME.',
        code: 'TOKEN_INVALID',
      })
    }

    // 3. Validação do membro (status ativo)
    const role = authRecord.getString('role')
    const status = authRecord.getString('status')
    const statusMembro = authRecord.getString('status_membro')
    const categoria = authRecord.getString('categoria') || authRecord.getString('category') || ''

    const isSuper = role === 'admin'
    const isStatusAtivo =
      status === 'ativo' || statusMembro === 'ATIVO' || statusMembro === 'ATENCAO'
    const isInactive =
      status === 'inativo' ||
      status === 'bloqueado' ||
      statusMembro === 'INATIVO' ||
      categoria.toUpperCase() === 'INATIVO'

    if (!isSuper && (isInactive || !isStatusAtivo)) {
      if (
        status === 'pendente' ||
        statusMembro === 'PRE_CADASTRADO' ||
        statusMembro === 'PENDENTE'
      ) {
        return e.json(400, {
          error:
            'Seu cadastro ainda está em aprovação. O check-in na loja é exclusivo para membros ativos.',
          code: 'MEMBER_PENDING',
        })
      }
      return e.json(400, {
        error:
          'Seu cadastro não está ativo no momento. Regularize sua situação para acumular pontos de visita na loja.',
        code: 'MEMBER_INACTIVE',
      })
    }

    // 4. Validação anti-fraude: Apenas 1 check-in de loja por dia por membro
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
        return e.json(400, {
          error:
            'Você já fez check-in na loja hoje. É permitido apenas 1 check-in de visita por dia.',
          code: 'ALREADY_CHECKED',
        })
      }
    } catch (err) {
      if (err && err.message && err.message.includes('já fez check-in')) {
        return e.json(400, {
          error:
            'Você já fez check-in na loja hoje. É permitido apenas 1 check-in de visita por dia.',
          code: 'ALREADY_CHECKED',
        })
      }
    }

    // 5. Cria o registro de visita em store_visits
    const storeVisitsCol = $app.findCollectionByNameOrId('store_visits')
    const visitRecord = new Record(storeVisitsCol)
    visitRecord.set('user', userId)
    visitRecord.set('notes', 'Check-in presencial validado via QR Code diário')
    visitRecord.set('created_at', now.toISOString())

    $app.save(visitRecord)

    // 6. Retorna sucesso e dados
    return e.json(200, {
      success: true,
      pointsAwarded: 10,
      visitId: visitRecord.id,
      message: 'Check-in presencial confirmado com sucesso! +10 pontos adicionados.',
    })
  },
  $apis.requireAuth(),
)
