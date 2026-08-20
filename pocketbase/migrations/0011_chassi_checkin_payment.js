migrate(
  (app) => {
    // 1. Add bike_chassi to users collection
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('bike_chassi')) {
      users.fields.add(
        new TextField({
          name: 'bike_chassi',
          required: false,
        }),
      )
    }
    app.save(users)

    // 2. Add checked_in, checked_in_at, payment_status, payment_notes to registrations collection
    const registrations = app.findCollectionByNameOrId('registrations')

    if (!registrations.fields.getByName('checked_in')) {
      registrations.fields.add(
        new BoolField({
          name: 'checked_in',
          required: false,
        }),
      )
    }

    if (!registrations.fields.getByName('checked_in_at')) {
      registrations.fields.add(
        new DateField({
          name: 'checked_in_at',
          required: false,
        }),
      )
    }

    if (!registrations.fields.getByName('payment_status')) {
      registrations.fields.add(
        new SelectField({
          name: 'payment_status',
          required: false,
          values: ['pendente', 'pago'],
          maxSelect: 1,
        }),
      )
    }

    if (!registrations.fields.getByName('payment_notes')) {
      registrations.fields.add(
        new TextField({
          name: 'payment_notes',
          required: false,
        }),
      )
    }

    app.save(registrations)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.fields.getByName('bike_chassi')) {
      users.fields.removeByName('bike_chassi')
    }
    app.save(users)

    const registrations = app.findCollectionByNameOrId('registrations')
    if (registrations.fields.getByName('checked_in')) {
      registrations.fields.removeByName('checked_in')
    }
    if (registrations.fields.getByName('checked_in_at')) {
      registrations.fields.removeByName('checked_in_at')
    }
    if (registrations.fields.getByName('payment_status')) {
      registrations.fields.removeByName('payment_status')
    }
    if (registrations.fields.getByName('payment_notes')) {
      registrations.fields.removeByName('payment_notes')
    }
    app.save(registrations)
  },
)
