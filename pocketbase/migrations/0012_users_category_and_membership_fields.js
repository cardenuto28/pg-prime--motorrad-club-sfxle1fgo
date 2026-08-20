migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. quantidade_motos_compradas
    if (!users.fields.getByName('quantidade_motos_compradas')) {
      users.fields.add(
        new NumberField({
          name: 'quantidade_motos_compradas',
          required: false,
          onlyInt: true,
          min: 0,
        }),
      )
    }

    // 2. data_primeira_compra
    if (!users.fields.getByName('data_primeira_compra')) {
      users.fields.add(
        new DateField({
          name: 'data_primeira_compra',
          required: false,
        }),
      )
    }

    // 3. data_ultima_compra
    if (!users.fields.getByName('data_ultima_compra')) {
      users.fields.add(
        new DateField({
          name: 'data_ultima_compra',
          required: false,
        }),
      )
    }

    // 4. data_ultima_passagem_oficina
    if (!users.fields.getByName('data_ultima_passagem_oficina')) {
      users.fields.add(
        new DateField({
          name: 'data_ultima_passagem_oficina',
          required: false,
        }),
      )
    }

    // 5. categoria (PLATINUM, GOLD, SILVER, BRONZE)
    if (!users.fields.getByName('categoria')) {
      users.fields.add(
        new TextField({
          name: 'categoria',
          required: false,
        }),
      )
    }

    // 6. status_membro (ATIVO, INATIVO, ATENCAO, PENDENTE, PRE_CADASTRADO)
    if (!users.fields.getByName('status_membro')) {
      users.fields.add(
        new TextField({
          name: 'status_membro',
          required: false,
        }),
      )
    }

    // 7. data_categoria_atualizada
    if (!users.fields.getByName('data_categoria_atualizada')) {
      users.fields.add(
        new DateField({
          name: 'data_categoria_atualizada',
          required: false,
        }),
      )
    }

    // 8. motivo_categoria
    if (!users.fields.getByName('motivo_categoria')) {
      users.fields.add(
        new TextField({
          name: 'motivo_categoria',
          required: false,
        }),
      )
    }

    app.save(users)

    // Add unique index on cpf if not present
    try {
      users.addIndex('idx_users_cpf', false, 'cpf', '')
      app.save(users)
    } catch (e) {
      console.log('Index idx_users_cpf error:', e)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const toRemove = [
      'quantidade_motos_compradas',
      'data_primeira_compra',
      'data_ultima_compra',
      'data_ultima_passagem_oficina',
      'categoria',
      'status_membro',
      'data_categoria_atualizada',
      'motivo_categoria',
    ]
    toRemove.forEach((f) => {
      if (users.fields.getByName(f)) {
        users.fields.removeByName(f)
      }
    })
    try {
      users.removeIndex('idx_users_cpf')
    } catch (_) {}
    app.save(users)
  },
)
