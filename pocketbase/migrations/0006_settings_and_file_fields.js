// 0006 — Cria a coleção `settings` (documento único) e adiciona campos `file`
// nas collections rides, benefits, partners e galleries para upload nativo de imagens.
migrate(
  (app) => {
    /* ------------------------------------------------------------------ */
    /* 1) Coleção `settings` (base, documento único chaveado por id fixo) */
    /* ------------------------------------------------------------------ */
    let settingsCol
    try {
      settingsCol = app.findCollectionByNameOrId('settings')
    } catch (_) {
      settingsCol = new Collection({
        name: 'settings',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          // Identificador legível do documento (ex.: "site")
          { name: 'key', type: 'text', required: true },
          // ---- Informações do Site ----
          { name: 'club_name', type: 'text' },
          { name: 'slogan', type: 'text' },
          { name: 'address', type: 'text' },
          { name: 'phone', type: 'text' },
          { name: 'contact_email', type: 'email' },
          { name: 'website_url', type: 'url' },
          // ---- Redes Sociais ----
          { name: 'instagram_url', type: 'url' },
          { name: 'facebook_url', type: 'url' },
          { name: 'youtube_url', type: 'url' },
          { name: 'whatsapp_number', type: 'text' },
          // ---- Critérios de Elegibilidade ----
          { name: 'eligibility_criteria', type: 'text' },
          // ---- E-mail de notificação do admin ----
          { name: 'admin_email', type: 'email' },
          // autodate
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [],
      })
      app.save(settingsCol)
    }

    // Seed do documento único "site" (idempotente)
    try {
      app.findFirstRecordByData('settings', 'key', 'site')
    } catch (_) {
      const rec = new Record(settingsCol)
      rec.set('key', 'site')
      rec.set('club_name', 'Euro Motors Motorrad Club')
      rec.set('slogan', 'Mais que um clube. Uma tribo.')
      rec.set('address', 'Av. Pref. Luis Latorre, 4501 - Lj A - Retiro, Jundiaí - SP, 13209-430')
      rec.set('phone', '(11) 4839-1010')
      rec.set('contact_email', 'motorradclub@euromotors.com.br')
      rec.set('website_url', 'https://jundiai.bmwmotorrad.euromotors.com.br')
      rec.set('instagram_url', 'https://instagram.com/euromotorsmotorrad')
      rec.set('facebook_url', 'https://facebook.com/euromotorsmotorrad')
      rec.set('youtube_url', 'https://youtube.com/@euromotorsmotorrad')
      rec.set('whatsapp_number', '551148391010')
      rec.set(
        'eligibility_criteria',
        'Podem participar do Euro Motors Motorrad Club clientes que adquiriram motocicletas novas ou seminovas nos últimos 4 anos na concessionária Euro Motors BMW Motorrad Jundiaí, bem como convidados indicados por membros ativos, sujeitos à aprovação da diretoria do clube.',
      )
      rec.set('admin_email', 'motorradclub@euromotors.com.br')
      app.save(rec)
    }

    /* ------------------------------------------------------------------ */
    /* 2) Campos `file` para upload nativo de imagens                     */
    /* ------------------------------------------------------------------ */

    // rides.cover_image_file  (1 imagem de capa)
    const ridesCol = app.findCollectionByNameOrId('rides')
    if (!ridesCol.fields.getByName('cover_image_file')) {
      ridesCol.fields.add(
        new FileField({
          name: 'cover_image_file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }
    app.save(ridesCol)

    // benefits.image_file  (1 imagem do benefício)
    const benefitsCol = app.findCollectionByNameOrId('benefits')
    if (!benefitsCol.fields.getByName('image_file')) {
      benefitsCol.fields.add(
        new FileField({
          name: 'image_file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }
    app.save(benefitsCol)

    // partners.logo_file  (1 logo)
    const partnersCol = app.findCollectionByNameOrId('partners')
    if (!partnersCol.fields.getByName('logo_file')) {
      partnersCol.fields.add(
        new FileField({
          name: 'logo_file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }
    app.save(partnersCol)

    // galleries.cover_image_file (1) + images_files (várias)
    const galleriesCol = app.findCollectionByNameOrId('galleries')
    if (!galleriesCol.fields.getByName('cover_image_file')) {
      galleriesCol.fields.add(
        new FileField({
          name: 'cover_image_file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }
    if (!galleriesCol.fields.getByName('images_files')) {
      galleriesCol.fields.add(
        new FileField({
          name: 'images_files',
          maxSelect: 30,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }
    app.save(galleriesCol)
  },
  (app) => {
    // Reverte: remove campos file e a coleção settings
    const collections = [
      ['rides', ['cover_image_file']],
      ['benefits', ['image_file']],
      ['partners', ['logo_file']],
      ['galleries', ['cover_image_file', 'images_files']],
    ]
    for (const [name, fields] of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        for (const f of fields) {
          const field = col.fields.getByName(f)
          if (field) col.fields.remove(field)
        }
        app.save(col)
      } catch (_) {}
    }
    try {
      const col = app.findCollectionByNameOrId('settings')
      app.delete(col)
    } catch (_) {}
  },
)
