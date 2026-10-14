// Hook endpoint para obter o QR Code / Token Diário da Loja (Apenas Administradores)
routerAdd(
  'GET',
  '/backend/v1/club/store-daily-token',
  (e) => {
    const authRecord = e.auth
    if (!authRecord) {
      return e.json(401, { error: 'Não autorizado. Faça login como administrador.' })
    }

    const role = authRecord.getString('role')
    if (role !== 'admin') {
      return e.json(403, { error: 'Acesso restrito a administradores.' })
    }

    // 1. Busca segredo da coleção settings
    let secret = $os.getenv('PGPRIME_STORE_TOKEN_SECRET') || 'PGPRIME2026'
    try {
      const settingsRec = $app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec && settingsRec.getString('daily_token_secret')) {
        secret = settingsRec.getString('daily_token_secret')
      }
    } catch (_) {}

    // 2. Data atual (YYYY-MM-DD)
    // Calcula considerando fuso de Brasília / UTC (ou UTC direto para sincronia perfeita)
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    // 3. Calcula hash HMAC-SHA256
    // hs256(dateStr, secret) gera hex hash hmac-sha256
    const fullHash = $security.hs256(dateStr, secret)
    const token = fullHash.substring(0, 12).toUpperCase()

    const targetUrl = `https://pgprime.club/checkin-loja?token=${token}`

    return e.json(200, {
      date: dateStr,
      token: token,
      targetUrl: targetUrl,
    })
  },
  $apis.requireAuth(),
)
