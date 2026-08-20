// 0016 — Limpeza de dados de teste (usuários de teste e registros relacionados)
migrate(
  (app) => {
    // IDs dos 4 usuários de teste a serem excluídos
    const testUserIds = [
      'jkuk5z92fns9adg', // João Silva
      'dhmom41vdpmk73i', // Carlos Souza
      '5m2s6o4z3iv4f4u', // Ana Costa
      '4dq1j7kv6sr6ns0', // Marcos Oliveira
    ]

    // Emails dos usuários de teste (para busca defensiva caso o ID varie)
    const testEmails = [
      'joao.silva@cliente.com.br',
      'carlos.souza@cliente.com.br',
      'ana.costa@cliente.com.br',
      'marcos.oliveira@cliente.com.br',
    ]

    // 1. Deletar registros relacionados aos usuários de teste

    // 1.1 Registrations (campo `user`)
    testUserIds.forEach((userId) => {
      try {
        const regs = app.findRecordsByFilter('registrations', `user = '${userId}'`, '', 0, 0)
        regs.forEach((reg) => {
          app.delete(reg)
        })
      } catch (_) {}
    })

    // 1.2 Store Visits (campo `user`)
    if (app.hasTable('store_visits')) {
      testUserIds.forEach((userId) => {
        try {
          const visits = app.findRecordsByFilter('store_visits', `user = '${userId}'`, '', 0, 0)
          visits.forEach((v) => {
            app.delete(v)
          })
        } catch (_) {}
      })
    }

    // 1.3 Histórico de Categoria (campo `membro_id`)
    if (app.hasTable('historico_categoria')) {
      testUserIds.forEach((userId) => {
        try {
          const hist = app.findRecordsByFilter(
            'historico_categoria',
            `membro_id = '${userId}'`,
            '',
            0,
            0,
          )
          hist.forEach((h) => {
            app.delete(h)
          })
        } catch (_) {}
      })
    }

    // 1.4 Histórico de Compras de Motos (campo `membro_id`)
    if (app.hasTable('historico_compras_motos')) {
      testUserIds.forEach((userId) => {
        try {
          const compras = app.findRecordsByFilter(
            'historico_compras_motos',
            `membro_id = '${userId}'`,
            '',
            0,
            0,
          )
          compras.forEach((c) => {
            app.delete(c)
          })
        } catch (_) {}
      })
    }

    // 1.5 Histórico de Oficina (campo `membro_id`)
    if (app.hasTable('historico_oficina')) {
      testUserIds.forEach((userId) => {
        try {
          const oficina = app.findRecordsByFilter(
            'historico_oficina',
            `membro_id = '${userId}'`,
            '',
            0,
            0,
          )
          oficina.forEach((o) => {
            app.delete(o)
          })
        } catch (_) {}
      })
    }

    // 2. Deletar os usuários de teste (por ID ou por email)
    testUserIds.forEach((userId) => {
      try {
        const user = app.findRecordById('_pb_users_auth_', userId)
        app.delete(user)
      } catch (_) {}
    })

    testEmails.forEach((email) => {
      try {
        const user = app.findAuthRecordByEmail('_pb_users_auth_', email)
        app.delete(user)
      } catch (_) {}
    })
  },
  (app) => {
    // Reversão não é necessária para dados de teste deletados
  },
)
