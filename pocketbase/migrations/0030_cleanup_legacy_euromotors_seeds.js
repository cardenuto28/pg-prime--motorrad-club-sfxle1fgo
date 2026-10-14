migrate(
  (app) => {
    // Limpeza de registros legados de seed que pertenciam à marca antiga Euro Motors
    // e foram identificados na auditoria para exclusão permanente.

    // 1. Comunicado inativo antigo de seed de 2025 (ID 5x8tt0guab1wdea: "Lançamento Nova BMW R 1300 GS Adventure")
    // Originalmente inserido como "Lançamento Nova BMW R 1300 GS Adventure na Euro Motors" / "membros do Euro Motors Club".
    try {
      const annRec = app.findFirstRecordByData('announcements', 'id', '5x8tt0guab1wdea')
      if (annRec && annRec.getBool('active') === false) {
        app.delete(annRec)
        console.log('Migration 0030: Deleted inactive seed announcement 5x8tt0guab1wdea')
      }
    } catch (err) {
      console.log('Migration 0030 announcement delete note: ' + err)
    }

    // Também excluir por filtro de segurança caso o ID varie em ambientes de teste mas seja o comunicado inativo correspondente
    try {
      app
        .db()
        .newQuery(`
          DELETE FROM announcements
          WHERE active = 0
            AND (
              title LIKE '%Lançamento Nova BMW R 1300 GS Adventure%'
              OR content LIKE '%apresentação da nova BMW R 1300 GS Adventure%'
            )
        `)
        .execute()
    } catch (err) {
      console.log('Migration 0030 announcement query note: ' + err)
    }

    // 2. Álbum histórico de exemplo/seed com referência original a Euro Motors
    // Registro 21gh0xthtid4eyu ("Encontro PG PRIME — Edição Aniversário", inserido na migração 0005 como "Encontro Euro Motors — Edição Aniversário", data 15/03/2025).
    try {
      const galRec = app.findFirstRecordByData('galleries', 'id', '21gh0xthtid4eyu')
      if (galRec) {
        app.delete(galRec)
        console.log('Migration 0030: Deleted historical seed gallery 21gh0xthtid4eyu')
      }
    } catch (err) {
      console.log('Migration 0030 gallery delete note: ' + err)
    }

    // Também remover por query caso tenha sido recriado ou ID diferente com os mesmos metadados de seed
    try {
      app
        .db()
        .newQuery(`
          DELETE FROM galleries
          WHERE (title LIKE '%Encontro%Edição Aniversário%' OR event_date = '15/03/2025')
            AND (cover_image LIKE '%motorcycle,club,meetup,event%' OR description LIKE '%família Euro Motors%' OR description LIKE '%família PG PRIME%')
        `)
        .execute()
    } catch (err) {
      console.log('Migration 0030 gallery query note: ' + err)
    }

    // 3. Cupom na coleção de benefícios/cupons de parceiros com código EUROMOTORS20
    // Registro 6lwoij8slgjrxnz ("20% de Desconto Hospedagem Hotel Fazenda Dona Carolina", exclusive_condition "Cupom exclusivo: EUROMOTORS20").
    try {
      const benRec = app.findFirstRecordByData('benefits', 'id', '6lwoij8slgjrxnz')
      if (benRec) {
        app.delete(benRec)
        console.log('Migration 0030: Deleted seed coupon benefit 6lwoij8slgjrxnz (EUROMOTORS20)')
      }
    } catch (err) {
      console.log('Migration 0030 benefit delete note: ' + err)
    }

    // Também remover qualquer outro cupom/benefício com EUROMOTORS20 caso exista
    try {
      app
        .db()
        .newQuery(`
          DELETE FROM benefits
          WHERE exclusive_condition LIKE '%EUROMOTORS20%'
             OR description LIKE '%EUROMOTORS20%'
             OR title LIKE '%Hotel Fazenda Dona Carolina%'
        `)
        .execute()
    } catch (err) {
      console.log('Migration 0030 benefits query note: ' + err)
    }

    // Bônus defensivo: atualizar URL de agendamento legada "euromotors.com.br" que ainda restava no benefício da oficina
    try {
      app
        .db()
        .newQuery(`
          UPDATE benefits
          SET contact_link = 'https://pgprime.com.br/agendamento'
          WHERE contact_link LIKE '%euromotors.com.br%'
        `)
        .execute()
    } catch (err) {
      console.log('Migration 0030 benefits contact_link update note: ' + err)
    }
  },
  (app) => {
    // Exclusões de seed legadas — não há necessidade de re-inserir registros inválidos da marca antiga no rollback.
  },
)
