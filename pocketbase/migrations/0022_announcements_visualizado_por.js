migrate(
  (app) => {
    const announcements = app.findCollectionByNameOrId('announcements')

    if (!announcements.fields.getByName('visualizado_por')) {
      announcements.fields.add(
        new RelationField({
          name: 'visualizado_por',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          minSelect: 0,
          maxSelect: 10000,
        }),
      )
    }

    app.save(announcements)
  },
  (app) => {
    try {
      const announcements = app.findCollectionByNameOrId('announcements')
      const f = announcements.fields.getByName('visualizado_por')
      if (f) {
        announcements.fields.remove(f)
        app.save(announcements)
      }
    } catch (_) {}
  },
)
