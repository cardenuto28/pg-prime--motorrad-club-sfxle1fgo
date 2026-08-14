migrate(
  (app) => {
    // 1. Update users collection
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('role')) {
      users.fields.add(new SelectField({ name: 'role', values: ['admin', 'member'], maxSelect: 1 }))
    }
    if (!users.fields.getByName('phone')) {
      users.fields.add(new TextField({ name: 'phone' }))
    }
    if (!users.fields.getByName('cpf')) {
      users.fields.add(new TextField({ name: 'cpf' }))
    }
    if (!users.fields.getByName('city')) {
      users.fields.add(new TextField({ name: 'city' }))
    }
    if (!users.fields.getByName('bike_brand')) {
      users.fields.add(new TextField({ name: 'bike_brand' }))
    }
    if (!users.fields.getByName('bike_model')) {
      users.fields.add(new TextField({ name: 'bike_model' }))
    }
    if (!users.fields.getByName('bike_year')) {
      users.fields.add(new NumberField({ name: 'bike_year' }))
    }
    if (!users.fields.getByName('pillion_name')) {
      users.fields.add(new TextField({ name: 'pillion_name' }))
    }
    if (!users.fields.getByName('pillion_phone')) {
      users.fields.add(new TextField({ name: 'pillion_phone' }))
    }
    if (!users.fields.getByName('status')) {
      users.fields.add(
        new SelectField({
          name: 'status',
          values: ['pendente', 'ativo', 'inativo', 'bloqueado'],
          maxSelect: 1,
        }),
      )
    }

    users.listRule = ''
    users.viewRule = ''
    users.createRule = ''
    users.updateRule = ''
    app.save(users)

    // 2. Rides collection
    const rides = new Collection({
      name: 'rides',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'cover_image', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'meeting_time', type: 'text' },
        { name: 'departure_time', type: 'text' },
        { name: 'meeting_point', type: 'text' },
        { name: 'destination', type: 'text' },
        { name: 'route', type: 'text' },
        { name: 'distance_km', type: 'number' },
        { name: 'estimated_time', type: 'text' },
        { name: 'max_bikes', type: 'number' },
        { name: 'allow_pillion', type: 'bool' },
        { name: 'price', type: 'number' },
        { name: 'important_info', type: 'text' },
        { name: 'whats_included', type: 'text' },
        { name: 'rules', type: 'text' },
        { name: 'map_link', type: 'text' },
        { name: 'registration_deadline', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: [
            'rascunho',
            'inscricoes_abertas',
            'lotado',
            'inscricoes_encerradas',
            'realizado',
            'cancelado',
          ],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(rides)

    // 3. Registrations collection
    const ridesCol = app.findCollectionByNameOrId('rides')
    const registrations = new Collection({
      name: 'registrations',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'ride',
          type: 'relation',
          required: true,
          collectionId: ridesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'has_pillion', type: 'bool' },
        { name: 'pillion_name', type: 'text' },
        { name: 'pillion_phone', type: 'text' },
        { name: 'emergency_contact_name', type: 'text' },
        { name: 'emergency_contact_phone', type: 'text' },
        { name: 'accepted_rules', type: 'bool' },
        { name: 'accepted_terms', type: 'bool' },
        {
          name: 'status',
          type: 'select',
          values: ['confirmada', 'cancelada', 'pendente'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(registrations)

    // 4. Benefits collection
    const benefits = new Collection({
      name: 'benefits',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'image', type: 'text' },
        { name: 'partner', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'exclusive_condition', type: 'text' },
        { name: 'valid_until', type: 'text' },
        { name: 'how_to_use', type: 'text' },
        { name: 'contact_link', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(benefits)

    // 5. Partners collection
    const partners = new Collection({
      name: 'partners',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          values: [
            'hoteis',
            'restaurantes',
            'equipamentos',
            'vestuario',
            'turismo',
            'seguros',
            'servicos',
            'outros',
          ],
          maxSelect: 1,
        },
        { name: 'logo', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'discount_info', type: 'text' },
        { name: 'website', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(partners)

    // 6. Galleries collection
    const galleries = new Collection({
      name: 'galleries',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'ride', type: 'relation', collectionId: ridesCol.id, maxSelect: 1 },
        {
          name: 'category',
          type: 'select',
          values: ['passeios', 'videos', 'eventos', 'viagens', 'encontros'],
          maxSelect: 1,
        },
        { name: 'cover_image', type: 'text' },
        { name: 'images_json', type: 'json' },
        { name: 'video_url', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'event_date', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(galleries)

    // 7. Announcements collection
    const announcements = new Collection({
      name: 'announcements',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'important', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(announcements)
  },
  (app) => {
    // down migration
  },
)
