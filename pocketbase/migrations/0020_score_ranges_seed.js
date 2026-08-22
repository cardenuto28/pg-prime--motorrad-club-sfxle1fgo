// PARTE 2 — Semeia as faixas configuráveis do Score de Oficina como documentos
// separados na coleção `settings` (key='score_valor_ranges' e
// key='score_frequencia_ranges'), cada um com o array JSON em `json_data`.
// Remove o documento 'score' intermediário criado pela 0019 (substituído pelos dois acima).
migrate(
  (app) => {
    const parseArr = (s) => {
      try {
        const a = JSON.parse(s)
        return Array.isArray(a) ? a : null
      } catch (_) {
        return null
      }
    }

    const defaultValorRanges = [
      { min: 0, max: 0, points: 0 },
      { min: 0.01, max: 2500, points: 10 },
      { min: 2500.01, max: 5000, points: 20 },
      { min: 5000.01, max: 10000, points: 35 },
      { min: 10000.01, max: 20000, points: 50 },
      { min: 20000.01, max: 35000, points: 60 },
      { min: 35000.01, max: 99999999, points: 70 },
    ]
    const defaultFrequenciaRanges = [
      { min: 0, max: 0, points: 0 },
      { min: 1, max: 2, points: 5 },
      { min: 3, max: 5, points: 10 },
      { min: 6, max: 10, points: 20 },
      { min: 11, max: 99999, points: 30 },
    ]

    const ensureScoreDoc = (key, defaultArr) => {
      try {
        const existing = app.findFirstRecordByData('settings', 'key', key)
        // Já existe — só preenche json_data se estiver vazio
        const cur = existing.getString('json_data') || ''
        if (!cur || !parseArr(cur)) {
          existing.set('json_data', JSON.stringify(defaultArr))
          app.save(existing)
        }
      } catch (_) {
        const settings = app.findCollectionByNameOrId('settings')
        const rec = new Record(settings)
        rec.set('key', key)
        rec.set('json_data', JSON.stringify(defaultArr))
        app.save(rec)
      }
    }

    ensureScoreDoc('score_valor_ranges', defaultValorRanges)
    ensureScoreDoc('score_frequencia_ranges', defaultFrequenciaRanges)

    // Remove o documento 'score' intermediário criado pela 0019 (substituído).
    try {
      const stray = app.findFirstRecordByData('settings', 'key', 'score')
      app.delete(stray)
    } catch (_) {}
  },
  (app) => {
    // Reverte: remove os dois documentos de faixas de score.
    for (const key of ['score_valor_ranges', 'score_frequencia_ranges']) {
      try {
        const rec = app.findFirstRecordByData('settings', 'key', key)
        app.delete(rec)
      } catch (_) {}
    }
  },
)
