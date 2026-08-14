// Etapa 6 — Adiciona campo `active` (bool, default true) às coleções
// `benefits` e `partners` para permitir ativar/desativar sem excluir.
// Mantém compatibilidade total com registros existentes (backfill = true).
migrate(
  (app) => {
    // --- benefits ---
    const benefits = app.findCollectionByNameOrId('benefits')
    if (!benefits.fields.getByName('active')) {
      benefits.fields.add(new BoolField({ name: 'active' }))
    }
    app.save(benefits)

    // --- partners ---
    const partners = app.findCollectionByNameOrId('partners')
    if (!partners.fields.getByName('active')) {
      partners.fields.add(new BoolField({ name: 'active' }))
    }
    app.save(partners)

    // Backfill: todos os registros pré-existentes passam a ser ativos.
    app.db().newQuery('UPDATE benefits SET active = 1 WHERE active IS NULL').execute()
    app.db().newQuery('UPDATE partners SET active = 1 WHERE active IS NULL').execute()
  },
  (app) => {
    // down — remove o campo active de ambas as coleções
    const benefits = app.findCollectionByNameOrId('benefits')
    const bActive = benefits.fields.getByName('active')
    if (bActive) benefits.fields.remove(bActive)
    app.save(benefits)

    const partners = app.findCollectionByNameOrId('partners')
    const pActive = partners.fields.getByName('active')
    if (pActive) partners.fields.remove(pActive)
    app.save(partners)
  },
)
