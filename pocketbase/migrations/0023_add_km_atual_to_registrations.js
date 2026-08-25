migrate(
  (app) => {
    const registrations = app.findCollectionByNameOrId('registrations')

    if (!registrations.fields.getByName('km_atual')) {
      registrations.fields.add(
        new NumberField({
          name: 'km_atual',
          required: false,
          min: 0,
        }),
      )
    }

    app.save(registrations)
  },
  (app) => {
    const registrations = app.findCollectionByNameOrId('registrations')
    if (registrations.fields.getByName('km_atual')) {
      registrations.fields.removeByName('km_atual')
    }
    app.save(registrations)
  },
)
