// 0015 — Adiciona campo `daily_token_secret` na coleção `settings`
migrate(
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')
    if (!settingsCol.fields.getByName('daily_token_secret')) {
      settingsCol.fields.add(
        new TextField({
          name: 'daily_token_secret',
        }),
      )
      app.save(settingsCol)
    }

    // Inicializa valor padrão no registro 'site' se estiver vazio
    try {
      const rec = app.findFirstRecordByData('settings', 'key', 'site')
      if (!rec.getString('daily_token_secret')) {
        rec.set('daily_token_secret', 'EUROMOTORS2026')
        app.save(rec)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const settingsCol = app.findCollectionByNameOrId('settings')
      const field = settingsCol.fields.getByName('daily_token_secret')
      if (field) {
        settingsCol.fields.remove(field)
        app.save(settingsCol)
      }
    } catch (_) {}
  },
)
