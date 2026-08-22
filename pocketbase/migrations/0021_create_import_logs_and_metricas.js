// PARTE 3 — Collections para Histórico de Importações e Histórico de Métricas do Membro.
//
// 1. import_logs         — um registro por upload de planilha (resumo da importação).
// 2. historico_metricas_membro — snapshot das métricas de um membro a cada importação que o afetou.
//
// Ambas as coleções são administrativas (somente admin lista/visualiza; auth cria).
migrate(
  (app) => {
    // 1. import_logs
    const importLogs = new Collection({
      name: 'import_logs',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'nome_arquivo', type: 'text', required: true },
        { name: 'data', type: 'date', required: false },
        { name: 'hora', type: 'text', required: false },
        { name: 'linhas_processadas', type: 'number', required: false, onlyInt: true, min: 0 },
        { name: 'clientes_criados', type: 'number', required: false, onlyInt: true, min: 0 },
        { name: 'clientes_atualizados', type: 'number', required: false, onlyInt: true, min: 0 },
        // erros armazenado como JSON array string: [{ linha, cpf, erro, motivo }]
        { name: 'erros', type: 'text', required: false },
        { name: 'status', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_import_logs_created ON import_logs (created DESC)'],
    })
    app.save(importLogs)

    // 2. historico_metricas_membro
    const histMetricas = new Collection({
      name: 'historico_metricas_membro',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
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
        { name: 'data_importacao', type: 'date', required: false },
        { name: 'categoria', type: 'text', required: false },
        { name: 'score_oficina', type: 'number', required: false, min: 0 },
        { name: 'total_compras', type: 'number', required: false, onlyInt: true, min: 0 },
        { name: 'total_valor_vendido', type: 'number', required: false, min: 0 },
        { name: 'numero_passagens', type: 'number', required: false, onlyInt: true, min: 0 },
        { name: 'total_liquido_oficina', type: 'number', required: false, min: 0 },
        { name: 'status', type: 'text', required: false },
        { name: 'nivel_relacionamento', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_histmetricas_membro ON historico_metricas_membro (membro_id, created DESC)',
      ],
    })
    app.save(histMetricas)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('import_logs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('historico_metricas_membro'))
    } catch (_) {}
  },
)
