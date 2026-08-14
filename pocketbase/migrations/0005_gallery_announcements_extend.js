migrate(
  (app) => {
    const ridesCol = app.findCollectionByNameOrId('rides')

    // --- 1. Extend `galleries` collection with type / featured / sort_order ---
    const galleries = app.findCollectionByNameOrId('galleries')

    if (!galleries.fields.getByName('type')) {
      galleries.fields.add(
        new SelectField({
          name: 'type',
          values: ['photo', 'video'],
          maxSelect: 1,
        }),
      )
    }
    if (!galleries.fields.getByName('featured')) {
      galleries.fields.add(new BoolField({ name: 'featured' }))
    }
    if (!galleries.fields.getByName('sort_order')) {
      galleries.fields.add(new NumberField({ name: 'sort_order' }))
    }

    galleries.addIndex('idx_galleries_ride', false, 'ride', '')
    galleries.addIndex('idx_galleries_sort', false, 'sort_order', '')
    app.save(galleries)

    // --- 2. Extend `announcements` collection ---
    const announcements = app.findCollectionByNameOrId('announcements')

    if (!announcements.fields.getByName('priority')) {
      announcements.fields.add(
        new SelectField({
          name: 'priority',
          values: ['normal', 'important', 'urgent'],
          maxSelect: 1,
        }),
      )
    }
    if (!announcements.fields.getByName('active')) {
      announcements.fields.add(new BoolField({ name: 'active' }))
    }
    if (!announcements.fields.getByName('publish_at')) {
      announcements.fields.add(new DateField({ name: 'publish_at' }))
    }
    if (!announcements.fields.getByName('expires_at')) {
      announcements.fields.add(new DateField({ name: 'expires_at' }))
    }

    announcements.addIndex('idx_announcements_active_priority', false, 'active,priority', '')
    app.save(announcements)

    // --- 3. Backfill data ---
    // galleries: default type=photo, featured=false, sort_order=0
    app.db().newQuery("UPDATE galleries SET type='photo' WHERE type IS NULL OR type=''").execute()
    app.db().newQuery('UPDATE galleries SET featured=0 WHERE featured IS NULL').execute()
    app.db().newQuery('UPDATE galleries SET sort_order=0 WHERE sort_order IS NULL').execute()

    // announcements: default priority=normal, active=1, publish_at=date
    app
      .db()
      .newQuery("UPDATE announcements SET priority='normal' WHERE priority IS NULL OR priority=''")
      .execute()
    app.db().newQuery('UPDATE announcements SET active=1 WHERE active IS NULL').execute()
    app
      .db()
      .newQuery(
        "UPDATE announcements SET publish_at=date WHERE (publish_at IS NULL OR publish_at='') AND date IS NOT NULL AND date!=''",
      )
      .execute()

    // --- 4. Seed sample gallery items (idempotent by title) ---
    const gallerySeeds = [
      {
        title: 'Serra do Rio do Rastro 2025',
        category: 'passeios',
        type: 'photo',
        cover_image: 'https://img.usecurling.com/p/800/560?q=motorcycle,serra,mountain,road',
        images_json:
          '[{"url":"https://img.usecurling.com/p/800/560?q=motorcycle,serra,mountain,road"},{"url":"https://img.usecurling.com/p/800/1000?q=bmw,motorcycle,curve,serra"},{"url":"https://img.usecurling.com/p/800/600?q=riders,group,motorcycle,sunset"}]',
        description: 'Registro das curvas e paisagens da Serra do Rio do Rastro.',
        event_date: '07/06/2025',
        featured: true,
        sort_order: 1,
      },
      {
        title: 'Caminhos da Mantiqueira',
        category: 'passeios',
        type: 'photo',
        cover_image: 'https://img.usecurling.com/p/800/500?q=bmw,motorcycle,serra,forest',
        images_json:
          '[{"url":"https://img.usecurling.com/p/800/500?q=bmw,motorcycle,serra,forest"},{"url":"https://img.usecurling.com/p/800/900?q=motorcycle,road,pine,trees"},{"url":"https://img.usecurling.com/p/800/620?q=group,riders,motorcycle,mountain"}]',
        description: 'Rodagem pela Mantiqueira com paradas em Campos do Jordão.',
        event_date: '21/06/2025',
        featured: true,
        sort_order: 2,
      },
      {
        title: 'Litoral Norte Experience',
        category: 'viagens',
        type: 'photo',
        cover_image: 'https://img.usecurling.com/p/800/450?q=ocean,coast,motorcycle,beach',
        images_json:
          '[{"url":"https://img.usecurling.com/p/800/450?q=ocean,coast,motorcycle,beach"},{"url":"https://img.usecurling.com/p/800/700?q=bmw,motorcycle,beach,sunset"},{"url":"https://img.usecurling.com/p/800/1100?q=riders,motorcycle,coast,road"}]',
        description: 'Costão da Litoral Norte, curvas e mar aberto.',
        event_date: '05/07/2025',
        featured: true,
        sort_order: 3,
      },
      {
        title: 'Encontro Euro Motors — Edição Aniversário',
        category: 'encontros',
        type: 'photo',
        cover_image: 'https://img.usecurling.com/p/800/520?q=motorcycle,club,meetup,event',
        images_json:
          '[{"url":"https://img.usecurling.com/p/800/520?q=motorcycle,club,meetup,event"},{"url":"https://img.usecurling.com/p/800/620?q=bmw,motorcycles,parked,showroom"}]',
        description: 'Confraternização com a família Euro Motors.',
        event_date: '15/03/2025',
        featured: false,
        sort_order: 4,
      },
      {
        title: 'Vídeo — Resumo Serra do Rio do Rastro',
        category: 'videos',
        type: 'video',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        cover_image: 'https://img.usecurling.com/p/800/450?q=motorcycle,video,serra',
        images_json: '[]',
        description: 'Compilação em vídeo do passeio pela Serra.',
        event_date: '07/06/2025',
        featured: true,
        sort_order: 5,
      },
    ]

    gallerySeeds.forEach(function (seed) {
      try {
        app.findFirstRecordByData('galleries', 'title', seed.title)
      } catch (_) {
        const rec = new Record(galleries)
        rec.set('title', seed.title)
        rec.set('category', seed.category)
        rec.set('type', seed.type)
        rec.set('featured', !!seed.featured)
        rec.set('sort_order', seed.sort_order || 0)
        if (seed.cover_image) rec.set('cover_image', seed.cover_image)
        if (seed.video_url) rec.set('video_url', seed.video_url)
        if (seed.description) rec.set('description', seed.description)
        if (seed.event_date) rec.set('event_date', seed.event_date)
        rec.set('images_json', seed.images_json || '[]')
        app.save(rec)
      }
    })

    // Link featured gallery items to rides by event_date (best effort)
    try {
      const allRides = app.findRecordsByFilter('rides', 'id != ""', '-date', 100, 0)
      const byDate = {}
      allRides.forEach(function (r) {
        const d = r.getString('date')
        if (d) byDate[d] = r.id
      })
      const allGalleries = app.findRecordsByFilter('galleries', 'id != ""', 'sort_order', 100, 0)
      allGalleries.forEach(function (g) {
        const d = g.getString('event_date')
        if (d && byDate[d] && !g.getString('ride')) {
          g.set('ride', byDate[d])
          app.save(g)
        }
      })
    } catch (_) {}

    // --- 5. Seed sample announcements (idempotent by title) ---
    const now = new Date()
    const isoNow = now.toISOString()

    const announcementSeeds = [
      {
        title: 'Calendário 2025 de Passeios disponível',
        content:
          'Confira o calendário completo de passeios da temporada 2025. Inscrições abertas para membros ativos no menu "Próximos Passeios". Vagas limitadas!',
        priority: 'normal',
        important: false,
        active: true,
        publish_at: isoNow,
        date: isoNow,
      },
      {
        title: 'Reunião obrigatória de briefed — Serra do Rio do Rastro',
        content:
          'Todos os inscritos no passeio da Serra do Rio do Rastro devem participar do briefing de segurança na véspera, às 19h, na Euro Motors. Equipamentos completos obrigatórios.',
        priority: 'important',
        important: true,
        active: true,
        publish_at: isoNow,
        date: isoNow,
      },
      {
        title: 'URGENTE: Passeio adiado por previsão de chuva',
        content:
          'Devido à previsão de chuva forte no litoral norte, o passeio deste final de semana foi adiado. Novas datas serão divulgadas em breve. Contato: (11) 99999-2025.',
        priority: 'urgent',
        important: true,
        active: true,
        publish_at: isoNow,
        date: isoNow,
      },
    ]

    announcementSeeds.forEach(function (seed) {
      try {
        app.findFirstRecordByData('announcements', 'title', seed.title)
      } catch (_) {
        const rec = new Record(announcements)
        rec.set('title', seed.title)
        rec.set('content', seed.content)
        rec.set('priority', seed.priority)
        rec.set('important', !!seed.important)
        rec.set('active', seed.active)
        rec.set('publish_at', seed.publish_at)
        rec.set('date', seed.date)
        app.save(rec)
      }
    })
  },
  (app) => {
    // down — remove added fields (best effort)
    try {
      const g = app.findCollectionByNameOrId('galleries')
      ;['type', 'featured', 'sort_order'].forEach(function (n) {
        const f = g.fields.getByName(n)
        if (f) g.fields.remove(f)
      })
      app.save(g)
    } catch (_) {}
    try {
      const a = app.findCollectionByNameOrId('announcements')
      ;['priority', 'active', 'publish_at', 'expires_at'].forEach(function (n) {
        const f = a.fields.getByName(n)
        if (f) a.fields.remove(f)
      })
      app.save(a)
    } catch (_) {}
  },
)
