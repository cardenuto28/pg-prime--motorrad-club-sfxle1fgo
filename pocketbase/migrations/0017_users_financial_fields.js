migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. total_valor_vendido — valor total em reais das motos vendidas ao membro
    if (!users.fields.getByName('total_valor_vendido')) {
      users.fields.add(
        new NumberField({
          name: 'total_valor_vendido',
          required: false,
          min: 0,
        }),
      )
    }

    // 2. numero_passagens_oficina — quantidade de visitas à oficina
    if (!users.fields.getByName('numero_passagens_oficina')) {
      users.fields.add(
        new NumberField({
          name: 'numero_passagens_oficina',
          required: false,
          onlyInt: true,
          min: 0,
        }),
      )
    }

    // 3. total_liquido_oficina — valor total gasto em oficina (reais)
    if (!users.fields.getByName('total_liquido_oficina')) {
      users.fields.add(
        new NumberField({
          name: 'total_liquido_oficina',
          required: false,
          min: 0,
        }),
      )
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const toRemove = ['total_valor_vendido', 'numero_passagens_oficina', 'total_liquido_oficina']
    toRemove.forEach((f) => {
      if (users.fields.getByName(f)) {
        users.fields.removeByName(f)
      }
    })
    app.save(users)
  },
)
