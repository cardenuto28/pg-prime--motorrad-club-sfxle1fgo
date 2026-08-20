migrate(
  (app) => {
    const storeVisits = new Collection({
      name: 'store_visits',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
          required: true,
        },
        { name: 'notes', type: 'text', required: false },
        { name: 'created_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_store_visits_user ON store_visits (user, created DESC)',
        'CREATE INDEX idx_store_visits_created ON store_visits (created)',
      ],
    })
    app.save(storeVisits)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('store_visits')
      app.delete(col)
    } catch (_) {}
  },
)
