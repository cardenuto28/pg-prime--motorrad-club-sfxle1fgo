migrate(
  (app) => {
    // 1. Update registrations collection with accepted_terms_at and accepted_image_at (DateField)
    const registrations = app.findCollectionByNameOrId('registrations')

    if (!registrations.fields.getByName('accepted_terms_at')) {
      registrations.fields.add(
        new DateField({
          name: 'accepted_terms_at',
          required: false,
        }),
      )
    }

    if (!registrations.fields.getByName('accepted_image_at')) {
      registrations.fields.add(
        new DateField({
          name: 'accepted_image_at',
          required: false,
        }),
      )
    }

    app.save(registrations)

    // 2. Update users collection with accepted_privacy_at (DateField)
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('accepted_privacy_at')) {
      users.fields.add(
        new DateField({
          name: 'accepted_privacy_at',
          required: false,
        }),
      )
    }

    app.save(users)
  },
  (app) => {
    const registrations = app.findCollectionByNameOrId('registrations')
    if (registrations.fields.getByName('accepted_terms_at')) {
      registrations.fields.removeByName('accepted_terms_at')
    }
    if (registrations.fields.getByName('accepted_image_at')) {
      registrations.fields.removeByName('accepted_image_at')
    }
    app.save(registrations)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.fields.getByName('accepted_privacy_at')) {
      users.fields.removeByName('accepted_privacy_at')
    }
    app.save(users)
  },
)
