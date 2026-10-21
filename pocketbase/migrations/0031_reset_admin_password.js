migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const targetEmail = 'ricardo@pgprime.club'
    const newPassword = 'PgPrime@2026'

    let record
    try {
      record = app.findAuthRecordByEmail('_pb_users_auth_', targetEmail)
    } catch (_) {
      record = null
    }

    if (record) {
      // Usuário já existe: atualizar senha, role admin, verificado e garantir status ativo
      record.setPassword(newPassword)
      record.setVerified(true)
      record.set('role', 'admin')
      if (!record.getString('name')) {
        record.set('name', 'RICARDO PG PRIME')
      }
      record.set('status', 'ativo')
      app.save(record)
    } else {
      // Usuário não existe: criar novo admin completo
      record = new Record(users)
      record.setEmail(targetEmail)
      record.setPassword(newPassword)
      record.setVerified(true)
      record.set('name', 'RICARDO PG PRIME')
      record.set('role', 'admin')
      record.set('status', 'ativo')
      record.set('category', 'PLATINUM')
      record.set('categoria', 'PLATINUM')
      record.set('status_membro', 'ATIVO')
      app.save(record)
    }
  },
  (app) => {
    // down - idempotente/noop para não travar rollback
  },
)
