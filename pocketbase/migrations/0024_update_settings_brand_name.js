migrate(
  (app) => {
    try {
      const settingsRec = app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec) {
        if (settingsRec.getString('club_name') === 'Euro Motors Motorrad Club') {
          settingsRec.set('club_name', 'PG PRIME CLUB')
        }
        const elig = settingsRec.getString('eligibility_criteria')
        if (elig && elig.includes('Euro Motors')) {
          settingsRec.set(
            'eligibility_criteria',
            elig
              .replace(/Euro Motors Motorrad Club/g, 'PG PRIME CLUB')
              .replace(/Euro Motors BMW Motorrad Jundiaí/g, 'PG PRIME')
              .replace(/Euro Motors/g, 'PG PRIME'),
          )
        }
        app.save(settingsRec)
      }
    } catch (err) {
      console.log('Migration 0024 settings update note: ' + err)
    }
  },
  (app) => {
    try {
      const settingsRec = app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec) {
        settingsRec.set('club_name', 'Euro Motors Motorrad Club')
        app.save(settingsRec)
      }
    } catch (_) {}
  },
)
