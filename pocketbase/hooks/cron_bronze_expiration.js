// CronJob diário (Parte 1):
// - Recalcular meses_desde_ultima_passagem para todos os Bronze
// - Se >= 5 meses -> status_membro = "ATENCAO"
// - Se > 6 meses  -> status_membro = "INATIVO", categoria_clube = "" (sem categoria ativa)
// Observação: PRATA, GOLD e PLATINUM são sempre ATIVO (nunca perdem categoria por falta de passagem).
//
// NOTA: PocketBase JSVM executa callbacks em um pool de VMs separado — funções declaradas
// no escopo top-level do arquivo NÃO são acessíveis dentro do callback. Por isso toda a
// lógica auxiliar está definida DENTRO do callback.
cronAdd('daily_bronze_check', '0 3 * * *', () => {
  console.log('[CRON] Iniciando verificação diária de membros Bronze (Parte 1)...')

  // ---- helper: meses cheios entre duas datas ----
  const mesesEntreDatas = (data, agora) => {
    let meses = (agora.getFullYear() - data.getFullYear()) * 12
    meses += agora.getMonth() - data.getMonth()
    if (agora.getDate() < data.getDate()) {
      meses -= 1
    }
    return meses < 0 ? 0 : meses
  }

  // ---- helper: registra histórico de categoria ----
  const registrarHistorico = (memberId, anterior, nova, motivo) => {
    try {
      const histCol = $app.findCollectionByNameOrId('historico_categoria')
      const histRec = new Record(histCol)
      histRec.set('membro_id', memberId)
      histRec.set('categoria_anterior', anterior)
      histRec.set('categoria_nova', nova)
      histRec.set('data_alteracao', new Date().toISOString())
      histRec.set('motivo', motivo)
      histRec.set('origem', 'automatico')
      $app.save(histRec)
    } catch (_) {}
  }

  try {
    // Bronze = categoria_clube == 'BRONZE'
    const bronzeMembers = $app.findRecordsByFilter(
      '_pb_users_auth_',
      "categoria_clube = 'BRONZE'",
      '',
      500,
      0,
    )

    const now = new Date()
    let updatedCount = 0

    bronzeMembers.forEach((member) => {
      const motos = member.getInt('quantidade_motos_compradas') || 0
      // Se tem motos >= 1 (PRATA/GOLD/PLATINUM), não deveria ser Bronze — respeitamos.
      if (motos > 0) return

      const oficinaDateStr =
        member.getString('data_ultima_passagem_valida') ||
        member.getString('data_ultima_passagem_oficina') ||
        ''
      const currentStatus = member.getString('status_membro') || 'ATIVO'

      if (!oficinaDateStr) {
        // Sem data de passagem válida -> INATIVO
        member.set('categoria_clube', '')
        member.set('categoria', 'INATIVO')
        member.set('status_membro', 'INATIVO')
        member.set('motivo_categoria', 'BRONZE_EXPIRADO')
        member.set('meses_desde_ultima_passagem', 99)
        member.set('data_categoria_atualizada', new Date().toISOString())
        member.set('data_ultimo_calculo', new Date().toISOString())
        $app.save(member)
        registrarHistorico(member.id, 'BRONZE', 'INATIVO', 'BRONZE_EXPIRADO')
        updatedCount++
        return
      }

      const oficinaDate = new Date(oficinaDateStr)
      if (isNaN(oficinaDate.getTime())) return

      const meses = mesesEntreDatas(oficinaDate, now)
      member.set('meses_desde_ultima_passagem', meses)

      if (meses > 6) {
        // Vencido (> 6 meses) -> INATIVO, sem categoria
        member.set('categoria_clube', '')
        member.set('categoria', 'INATIVO')
        member.set('status_membro', 'INATIVO')
        member.set('motivo_categoria', 'BRONZE_EXPIRADO')
        member.set('data_categoria_atualizada', new Date().toISOString())
        member.set('data_ultimo_calculo', new Date().toISOString())
        $app.save(member)
        registrarHistorico(member.id, 'BRONZE', 'INATIVO', 'BRONZE_EXPIRADO')
        updatedCount++
      } else if (meses >= 5) {
        // Faltando ~30 dias para vencer (entre 5 e 6 meses) -> ATENCAO
        if (currentStatus !== 'ATENCAO') {
          member.set('status_membro', 'ATENCAO')
          member.set('motivo_categoria', 'BRONZE_PROXIMO_VENCIMENTO')
          member.set('data_categoria_atualizada', new Date().toISOString())
          member.set('data_ultimo_calculo', new Date().toISOString())
          $app.save(member)
          updatedCount++
        }
      } else {
        // Ativo normalmente
        if (currentStatus !== 'ATIVO' && currentStatus !== 'PRE_CADASTRADO') {
          member.set('status_membro', 'ATIVO')
          member.set('data_categoria_atualizada', new Date().toISOString())
          member.set('data_ultimo_calculo', new Date().toISOString())
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
