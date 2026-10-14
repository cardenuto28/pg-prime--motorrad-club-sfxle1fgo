migrate(
  (app) => {
    // 1. Atualizar registro "site" de settings
    try {
      const settingsRec = app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec) {
        settingsRec.set('contact_email', 'contato@pgprime.club')
        settingsRec.set('admin_email', 'contato@pgprime.club')
        settingsRec.set('website_url', 'https://pgprime.club')
        settingsRec.set('instagram_url', 'https://instagram.com/pgprime')
        settingsRec.set('facebook_url', 'https://facebook.com/pgprime')
        settingsRec.set('youtube_url', 'https://youtube.com/@pgprime')
        settingsRec.set('daily_token_secret', 'PGPRIME2026')

        // Garantir que não restou nada de Jundiaí ou Euro Motors no endereço ou critérios
        const addr = settingsRec.getString('address')
        if (!addr || addr.includes('Jundiaí') || addr.includes('Retiro')) {
          settingsRec.set(
            'address',
            'BMW João Pessoa: Rodovia BR-230, Quadra 09 Loja 19 A - Parque Esperança, Cabedelo - PB | BMW Natal: Avenida Dão Silveira, 3712, Loja A - Candelária, Natal - RN',
          )
        }

        const elig = settingsRec.getString('eligibility_criteria')
        if (elig && (elig.includes('Euro Motors') || elig.includes('Jundiaí'))) {
          settingsRec.set(
            'eligibility_criteria',
            elig
              .replace(/Euro Motors Motorrad Club/g, 'PG PRIME CLUB')
              .replace(/Euro Motors BMW Motorrad Jundiaí/g, 'PG PRIME')
              .replace(/Euro Motors/g, 'PG PRIME')
              .replace(/Jundiaí/g, 'PG PRIME'),
          )
        }

        app.save(settingsRec)
      }
    } catch (err) {
      console.log('Migration 0027 settings update note: ' + err)
    }

    // 2. Atualizar em massa emails de usuários @euromotors.club e @grupoeuromotors.com.br
    try {
      app
        .db()
        .newQuery(`
        UPDATE users
        SET email = REPLACE(email, '@euromotors.club', '@pgprime.club')
        WHERE email LIKE '%@euromotors.club'
      `)
        .execute()

      app
        .db()
        .newQuery(`
        UPDATE users
        SET email = REPLACE(email, '@grupoeuromotors.com.br', '@pgprime.club')
        WHERE email LIKE '%@grupoeuromotors.com.br'
      `)
        .execute()
    } catch (err) {
      console.log('Migration 0027 users email update note: ' + err)
    }
  },
  (app) => {
    try {
      const settingsRec = app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec) {
        settingsRec.set('contact_email', 'motorradclub@euromotors.com.br')
        settingsRec.set('admin_email', 'motorradclub@euromotors.com.br')
        settingsRec.set('website_url', 'https://jundiai.bmwmotorrad.euromotors.com.br')
        settingsRec.set('instagram_url', 'https://instagram.com/euromotorsmotorrad')
        settingsRec.set('facebook_url', 'https://facebook.com/euromotorsmotorrad')
        app.save(settingsRec)
      }
    } catch (_) {}
  },
)
