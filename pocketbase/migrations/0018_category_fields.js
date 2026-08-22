// Parte 1 — Novos campos de categoria, veículos elegíveis, métricas de recência e scores (preparação Parte 2).
// status_membro já existe (migration 0012) — não recriado.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const addText = (name) => {
      if (!users.fields.getByName(name)) {
        users.fields.add(new TextField({ name, required: false }))
      }
    }
    const addNumber = (name, onlyInt, min) => {
      if (!users.fields.getByName(name)) {
        users.fields.add(new NumberField({ name, required: false, onlyInt: !!onlyInt, min: min }))
      }
    }

    // 1. tem_moto_comprada — "SIM" / "NÃO"
    addText('tem_moto_comprada')

    // 2. total_veiculos_elegiveis — integer, min 0
    addNumber('total_veiculos_elegiveis', true, 0)

    // 3. categoria_clube — "BRONZE" | "PRATA" | "GOLD" | "PLATINUM" | ""
    addText('categoria_clube')

    // 4. status_membro — JÁ EXISTE (0012). Ignorado.

    // 5. data_ultima_passagem_valida — ISO date da última passagem válida
    addText('data_ultima_passagem_valida')

    // 6. meses_desde_ultima_passagem
    addNumber('meses_desde_ultima_passagem', true, 0)

    // 7. dias_desde_venda
    addNumber('dias_desde_venda', true, 0)

    // 8. meses_desde_venda
    addNumber('meses_desde_venda', true, 0)

    // 9. score_oficina — 0-100 (populado na Parte 2)
    addNumber('score_oficina', false, 0)

    // 10. score_valor_oficina — 0-70 (populado na Parte 2)
    addNumber('score_valor_oficina', false, 0)

    // 11. score_frequencia — 0-30 (populado na Parte 2)
    addNumber('score_frequencia', false, 0)

    // 12. nivel_relacionamento — texto (populado na Parte 2)
    addText('nivel_relacionamento')

    // 13. data_ultimo_calculo — ISO date
    addText('data_ultimo_calculo')

    // 14. proxima_melhor_acao — texto (populado na Parte 2)
    addText('proxima_melhor_acao')

    // 15. tags — JSON array como string (populado na Parte 2)
    addText('tags')

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const toRemove = [
      'tem_moto_comprada',
      'total_veiculos_elegiveis',
      'categoria_clube',
      'data_ultima_passagem_valida',
      'meses_desde_ultima_passagem',
      'dias_desde_venda',
      'meses_desde_venda',
      'score_oficina',
      'score_valor_oficina',
      'score_frequencia',
      'nivel_relacionamento',
      'data_ultimo_calculo',
      'proxima_melhor_acao',
      'tags',
    ]
    toRemove.forEach((f) => {
      if (users.fields.getByName(f)) {
        users.fields.removeByName(f)
      }
    })
    app.save(users)
  },
)
