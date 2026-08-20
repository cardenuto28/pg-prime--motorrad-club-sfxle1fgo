// CronJob diário para recalcular categoria de membros Bronze (verifica expiração de 6 meses)
cronAdd('daily_bronze_check', '0 3 * * *', () => {
  console.log('[CRON] Iniciando verificação diária de membros Bronze...')

  try {
    const bronzeMembers = $app.findRecordsByFilter(
      '_pb_users_auth_',
      "categoria = 'BRONZE'",
      '',
      500,
      0,
    )

    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const fiveMonthsAgo = new Date(now)
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5)

    let updatedCount = 0

    bronzeMembers.forEach((member) => {
      const motos = member.getInt('quantidade_motos_compradas') || 0
      // Se tem motos >= 1, a categoria nem deveria ser bronze, mas respeitamos
      if (motos > 0) return

      const oficinaDateStr = member.getString('data_ultima_passagem_oficina') || ''
      const currentStatus = member.getString('status_membro') || 'ATIVO'

      if (!oficinaDateStr) {
        // Sem oficina => inativo
        member.set('categoria', 'INATIVO')
        member.set('status_membro', 'INATIVO')
        member.set('motivo_categoria', 'BRONZE_EXPIRADO')
        member.set('data_categoria_atualizada', new Date().toISOString())
        $app.save(member)

        try {
          const histCol = $app.findCollectionByNameOrId('historico_categoria')
          const histRec = new Record(histCol)
          histRec.set('membro_id', member.id)
          histRec.set('categoria_anterior', 'BRONZE')
          histRec.set('categoria_nova', 'INATIVO')
          histRec.set('data_alteracao', new Date().toISOString())
          histRec.set('motivo', 'BRONZE_EXPIRADO')
          histRec.set('origem', 'automatico')
          $app.save(histRec)
        } catch (_) {}

        updatedCount++
        return
      }

      const oficinaDate = new Date(oficinaDateStr)
      if (isNaN(oficinaDate.getTime())) return

      if (oficinaDate < sixMonthsAgo) {
        // Vencido (> 6 meses)
        member.set('categoria', 'INATIVO')
        member.set('status_membro', 'INATIVO')
        member.set('motivo_categoria', 'BRONZE_EXPIRADO')
        member.set('data_categoria_atualizada', new Date().toISOString())
        $app.save(member)

        try {
          const histCol = $app.findCollectionByNameOrId('historico_categoria')
          const histRec = new Record(histCol)
          histRec.set('membro_id', member.id)
          histRec.set('categoria_anterior', 'BRONZE')
          histRec.set('categoria_nova', 'INATIVO')
          histRec.set('data_alteracao', new Date().toISOString())
          histRec.set('motivo', 'BRONZE_EXPIRADO')
          histRec.set('origem', 'automatico')
          $app.save(histRec)
        } catch (_) {}

        updatedCount++
      } else if (oficinaDate < fiveMonthsAgo) {
        // Faltando <= 30 dias para vencer (entre 5 e 6 meses)
        if (currentStatus !== 'ATENCAO') {
          member.set('status_membro', 'ATENCAO')
          member.set('data_categoria_atualizada', new Date().toISOString())
          $app.save(member)
          updatedCount++
        }
      } else {
        // Ativo normalmente
        if (currentStatus !== 'ATIVO' && currentStatus !== 'PRE_CADASTRADO') {
          member.set('status_membro', 'ATIVO')
          member.set('data_categoria_atualizada', new Date().toISOString())
          $app.save(member)
          updatedCount++
        }
      }
    })

    console.log('[CRON] Verificação concluída. ' + updatedCount + ' membros atualizados.')
  } catch (err) {
    console.log('[CRON] Erro na verificação diária de Bronze:', err)
  }
})
