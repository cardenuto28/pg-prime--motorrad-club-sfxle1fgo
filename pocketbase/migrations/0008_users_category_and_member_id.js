migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('category')) {
      users.fields.add(
        new TextField({
          name: 'category',
          required: false,
        }),
      )
    }

    if (!users.fields.getByName('member_id')) {
      users.fields.add(
        new TextField({
          name: 'member_id',
          required: false,
        }),
      )
    }

    app.save(users)

    // Backfill existing users with default category "Membro Premium" if empty
    try {
      app
        .db()
        .newQuery(
          "UPDATE users SET category = 'Membro Premium' WHERE category IS NULL OR category = ''",
        )
        .execute()
    } catch (err) {
      console.log('Error backfilling users category:', err)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.fields.getByName('category')) {
      users.fields.removeByName('category')
    }
    if (users.fields.getByName('member_id')) {
      users.fields.removeByName('member_id')
    }
    app.save(users)
  },
)
