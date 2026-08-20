migrate(
  (app) => {
    // 1. Update users collection with accepted_image_at (DateField)
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('accepted_image_at')) {
      users.fields.add(
        new DateField({
          name: 'accepted_image_at',
          required: false,
        }),
      )
    }
    app.save(users)

    // 2. Update rides collection with ride_type (SelectField: bate_e_volta | bate_e_fica)
    const rides = app.findCollectionByNameOrId('rides')
    if (!rides.fields.getByName('ride_type')) {
      rides.fields.add(
        new SelectField({
          name: 'ride_type',
          required: false,
          values: ['bate_e_volta', 'bate_e_fica'],
          maxSelect: 1,
        }),
      )
    }
    app.save(rides)

    // 3. Update registrations collection to support non-member guest registration fields
    const registrations = app.findCollectionByNameOrId('registrations')

    // Make user relation optional so guests/non-members can register without an auth account
    const userField = registrations.fields.getByName('user')
    if (userField) {
      userField.required = false
    }

    if (!registrations.fields.getByName('is_guest')) {
      registrations.fields.add(
        new BoolField({
          name: 'is_guest',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_name')) {
      registrations.fields.add(
        new TextField({
          name: 'guest_name',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_phone')) {
      registrations.fields.add(
        new TextField({
          name: 'guest_phone',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_email')) {
      registrations.fields.add(
        new EmailField({
          name: 'guest_email',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_cpf')) {
      registrations.fields.add(
        new TextField({
          name: 'guest_cpf',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_city')) {
      registrations.fields.add(
        new TextField({
          name: 'guest_city',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_bike_brand')) {
      registrations.fields.add(
        new TextField({
          name: 'guest_bike_brand',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_bike_model')) {
      registrations.fields.add(
        new TextField({
          name: 'guest_bike_model',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('guest_bike_year')) {
      registrations.fields.add(
        new NumberField({
          name: 'guest_bike_year',
          required: false,
        }),
      )
    }
    if (!registrations.fields.getByName('accepted_privacy_at')) {
      registrations.fields.add(
        new DateField({
          name: 'accepted_privacy_at',
          required: false,
        }),
      )
    }

    app.save(registrations)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.fields.getByName('accepted_image_at')) {
      users.fields.removeByName('accepted_image_at')
    }
    app.save(users)

    const rides = app.findCollectionByNameOrId('rides')
    if (rides.fields.getByName('ride_type')) {
      rides.fields.removeByName('ride_type')
    }
    app.save(rides)

    const registrations = app.findCollectionByNameOrId('registrations')
    const guestFieldNames = [
      'is_guest',
      'guest_name',
      'guest_phone',
      'guest_email',
      'guest_cpf',
      'guest_city',
      'guest_bike_brand',
      'guest_bike_model',
      'guest_bike_year',
      'accepted_privacy_at',
    ]
    for (const f of guestFieldNames) {
      if (registrations.fields.getByName(f)) {
        registrations.fields.removeByName(f)
      }
    }
    app.save(registrations)
  },
)
