// PARTE 2 — Adiciona campo JSON genérico na coleção `settings` para armazenar
// as faixas configuráveis do Score de Oficina (score_valor_ranges,
// score_frequencia_ranges). Também semeia as faixas padrão se não existirem.
migrate(
  (app) => {
    const settings = app.findCollectionByNameOrId('settings')

    // Campo JSON genérico para armazenar configurações variadas do clube.
    // Usado para: score_valor_ranges, score_frequencia_ranges, etc.
    if (!settings.fields.getByName('json_data')) {
      settings.fields.add(
        new JSONField({
          name: 'json_data',
          required: false,
          maxSize: 1048576, // 1MB
        }),
      )
    }
    app.save(settings)

    // Semeia as faixas padrão do Score de Oficina como documento único key='score'.
    // Estrutura do json_data:
    //   { score_valor_ranges: [{min,max,points}...], score_frequencia_ranges: [{min,max,points}...] }
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

    const scoreDoc = JSON.stringify({
      score_valor_ranges: defaultValorRanges,
      score_frequencia_ranges: defaultFrequenciaRanges,
    })

    try {
      app.findFirstRecordByData('settings', 'key', 'score')
      // já existe — não sobrescreve configuração personalizada
    } catch (_) {
      const rec = new Record(settings)
      rec.set('key', 'score')
      rec.set('json_data', scoreDoc)
      app.save(rec)
    }
  },
  (app) => {
    // Reverte: remove o campo json_data e o documento seed 'score'
    try {
      const settings = app.findCollectionByNameOrId('settings')
      const field = settings.fields.getByName('json_data')
      if (field) {
        settings.fields.remove(field)
        app.save(settings)
      }
    } catch (_) {}

    try {
      const rec = app.findFirstRecordByData('settings', 'key', 'score')
      app.delete(rec)
    } catch (_) {}
  },
)
