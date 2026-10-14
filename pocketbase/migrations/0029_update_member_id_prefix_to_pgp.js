migrate(
  (app) => {
    // 1. Atualizar member_id que comecem com 'EMC-' para 'PGP-', mantendo o número/sufixo
    try {
      app
        .db()
        .newQuery(`
        UPDATE users
        SET member_id = 'PGP-' || SUBSTR(member_id, 5)
        WHERE member_id LIKE 'EMC-%'
      `)
        .execute()
    } catch (err) {
      console.log('Migration 0029 update users member_id note: ' + err)
    }

    // Caso haja member_id com prefixo 'EMC' sem traço (ex.: 'EMC02458'), atualiza para 'PGP'
    try {
      app
        .db()
        .newQuery(`
        UPDATE users
        SET member_id = 'PGP' || SUBSTR(member_id, 4)
        WHERE member_id LIKE 'EMC%' AND member_id NOT LIKE 'EMC-%'
      `)
        .execute()
    } catch (err) {
      console.log('Migration 0029 update users member_id no-dash note: ' + err)
    }

    // 2. Atualizar textos remanescentes em announcements com "Euro Motors"
    try {
      app
        .db()
        .newQuery(`
        UPDATE announcements
        SET title = REPLACE(title, 'Euro Motors', 'PG PRIME'),
            content = REPLACE(REPLACE(content, 'Euro Motors Club', 'PG PRIME CLUB'), 'Euro Motors', 'PG PRIME')
        WHERE title LIKE '%Euro Motors%' OR content LIKE '%Euro Motors%'
      `)
        .execute()
    } catch (err) {
      console.log('Migration 0029 announcements note: ' + err)
    }

    // 3. Atualizar parceiro Porto Seguro Motos (Euro Motors Corretora -> PG PRIME Corretora)
    try {
      app
        .db()
        .newQuery(`
        UPDATE partners
        SET description = REPLACE(description, 'Euro Motors Corretora', 'PG PRIME Corretora')
        WHERE description LIKE '%Euro Motors%'
      `)
        .execute()
    } catch (err) {
      console.log('Migration 0029 partners note: ' + err)
    }

    // 4. Atualizar galeria antiga remanescente com "Euro Motors"
    try {
      app
        .db()
        .newQuery(`
        UPDATE galleries
        SET title = REPLACE(title, 'Euro Motors', 'PG PRIME'),
            description = REPLACE(description, 'Euro Motors', 'PG PRIME')
        WHERE title LIKE '%Euro Motors%' OR description LIKE '%Euro Motors%'
      `)
        .execute()
    } catch (err) {
      console.log('Migration 0029 galleries note: ' + err)
    }

    // 5. Atualizar nome ou garupa de usuários que contenham "Euro Motors" ou "Patrícia Euro"
    try {
      app
        .db()
        .newQuery(`
        UPDATE users
        SET pillion_name = REPLACE(pillion_name, 'Patrícia Euro', 'Patrícia Prime')
        WHERE pillion_name LIKE '%Patrícia Euro%'
      `)
        .execute()
    } catch (err) {
      console.log('Migration 0029 pillion_name note: ' + err)
    }
  },
  (app) => {
    // Rollback: reverter PGP- para EMC- caso necessário
    try {
      app
        .db()
        .newQuery(`
        UPDATE users
        SET member_id = 'EMC-' || SUBSTR(member_id, 5)
        WHERE member_id LIKE 'PGP-%'
      `)
        .execute()
    } catch (_) {}
  },
)
