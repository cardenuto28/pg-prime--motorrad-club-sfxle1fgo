migrate(
  (app) => {
    try {
      const settingsRec = app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec) {
        settingsRec.set(
          'address',
          'BMW João Pessoa: Rodovia BR-230, Quadra 09 Loja 19 A - Parque Esperança, Cabedelo - PB | BMW Natal: Avenida Dão Silveira, 3712, Loja A - Candelária, Natal - RN',
        )
        settingsRec.set('phone', '(83) 3194-1800')
        settingsRec.set('whatsapp_number', '558330228726')
        app.save(settingsRec)
      }
    } catch (err) {
      console.log('Migration 0025 update dealerships note: ' + err)
    }
  },
  (app) => {
    try {
      const settingsRec = app.findFirstRecordByData('settings', 'key', 'site')
      if (settingsRec) {
        settingsRec.set(
          'address',
          'Av. Pref. Luis Latorre, 4501 - Lj A - Retiro, Jundiaí - SP, 13209-430',
        )
        settingsRec.set('phone', '(11) 4839-1010')
        settingsRec.set('whatsapp_number', '551148391010')
        app.save(settingsRec)
      }
    } catch (_) {}
  },
)
