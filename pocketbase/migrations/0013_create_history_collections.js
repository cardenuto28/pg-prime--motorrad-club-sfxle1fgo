migrate(
  (app) => {
    // 1. historico_categoria
    const histCat = new Collection({
      name: 'historico_categoria',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'membro_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        { name: 'categoria_anterior', type: 'text', required: false },
        { name: 'categoria_nova', type: 'text', required: true },
        { name: 'data_alteracao', type: 'date', required: false },
        { name: 'motivo', type: 'text', required: true },
        { name: 'origem', type: 'text', required: true }, // 'automatico' | 'admin'
        { name: 'justificativa', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_histcat_membro ON historico_categoria (membro_id, created DESC)'],
    })
    app.save(histCat)

    // 2. historico_compras_motos
    const histCompras = new Collection({
      name: 'historico_compras_motos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'membro_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
          required: false,
        },
        { name: 'cpf', type: 'text', required: false },
        { name: 'modelo', type: 'text', required: false },
        { name: 'ano', type: 'number', required: false },
        { name: 'chassi', type: 'text', required: false },
        { name: 'data_compra', type: 'date', required: false },
        { name: 'status_venda', type: 'text', required: false }, // FATURADA, ENTREGUE, CANCELADA
        { name: 'created_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_histcomp_membro ON historico_compras_motos (membro_id)',
        'CREATE INDEX idx_histcomp_cpf ON historico_compras_motos (cpf)',
      ],
    })
    app.save(histCompras)

    // 3. historico_oficina
    const histOficina = new Collection({
      name: 'historico_oficina',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'membro_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
          required: false,
        },
        { name: 'cpf', type: 'text', required: false },
        { name: 'data_passagem', type: 'date', required: false },
        { name: 'tipo_servico', type: 'text', required: false },
        { name: 'ordem_servico', type: 'text', required: false },
        { name: 'status', type: 'text', required: false }, // CONCLUIDA, CANCELADA
        { name: 'created_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_histofic_membro ON historico_oficina (membro_id)',
        'CREATE INDEX idx_histofic_cpf ON historico_oficina (cpf)',
      ],
    })
    app.save(histOficina)
  },
  (app) => {
    try {
      const c1 = app.findCollectionByNameOrId('historico_categoria')
      app.delete(c1)
    } catch (_) {}
    try {
      const c2 = app.findCollectionByNameOrId('historico_compras_motos')
      app.delete(c2)
    } catch (_) {}
    try {
      const c3 = app.findCollectionByNameOrId('historico_oficina')
      app.delete(c3)
    } catch (_) {}
  },
)
