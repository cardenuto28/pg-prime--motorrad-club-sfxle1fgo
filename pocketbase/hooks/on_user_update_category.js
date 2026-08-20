// Hook users.update: recalcula categoria caso motos ou oficina tenham sido alterados
onRecordUpdate((e) => {
  const record = e.record
  if (!record) {
    e.next()
    return
  }

  const origMotos = record.original().getInt('quantidade_motos_compradas') || 0
  const origOficina = record.original().getString('data_ultima_passagem_oficina') || ''
  const origCategoria = record.original().getString('categoria') || ''
  const origStatusMembro = record.original().getString('status_membro') || ''

  const newMotos = record.getInt('quantidade_motos_compradas') || 0
  const newOficina = record.getString('data_ultima_passagem_oficina') || ''

  // Se houve alteração de motos ou oficina
  if (origMotos !== newMotos || origOficina !== newOficina) {
    let categoria = 'INATIVO'
    let statusMembro = record.getString('status_membro') || 'ATIVO'
    let motivo = 'AJUSTE_ADMINISTRATIVO'

    if (newMotos >= 5) {
      categoria = 'PLATINUM'
      statusMembro = origStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
      motivo = 'QUINTA_COMPRA'
    } else if (newMotos >= 3) {
      categoria = 'GOLD'
      statusMembro = origStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
      motivo = 'TERCEIRA_COMPRA'
    } else if (newMotos >= 1) {
      categoria = 'SILVER'
      statusMembro = origStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
      motivo = 'PRIMEIRA_COMPRA'
    } else {
      // 0 motos
      if (newOficina) {
        const oficinaDate = new Date(newOficina)
        if (!isNaN(oficinaDate.getTime())) {
          const now = new Date()
          const sixMonthsAgo = new Date(now)
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

          const fiveMonthsAgo = new Date(now)
          fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5)

          if (oficinaDate >= fiveMonthsAgo) {
            categoria = 'BRONZE'
            statusMembro = origStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATIVO'
            motivo = 'NOVA_PASSAGEM_OFICINA'
          } else if (oficinaDate >= sixMonthsAgo) {
            categoria = 'BRONZE'
            statusMembro = origStatusMembro === 'PRE_CADASTRADO' ? 'PRE_CADASTRADO' : 'ATENCAO'
            motivo = 'NOVA_PASSAGEM_OFICINA'
          } else {
            categoria = 'INATIVO'
            statusMembro = 'INATIVO'
            motivo = 'BRONZE_EXPIRADO'
          }
        } else {
          categoria = 'INATIVO'
          statusMembro = 'INATIVO'
          motivo = 'BRONZE_EXPIRADO'
        }
      } else {
        categoria = 'INATIVO'
        statusMembro = 'INATIVO'
        motivo = 'BRONZE_EXPIRADO'
      }
    }

    record.set('categoria', categoria)
    record.set('status_membro', statusMembro)
    record.set('motivo_categoria', motivo)
    record.set('data_categoria_atualizada', new Date().toISOString())

    // Se a categoria mudou, grava no histórico
    if (origCategoria !== categoria) {
      try {
        const histCol = $app.findCollectionByNameOrId('historico_categoria')
        const histRec = new Record(histCol)
        histRec.set('membro_id', record.id)
        histRec.set('categoria_anterior', origCategoria || null)
        histRec.set('categoria_nova', categoria)
        histRec.set('data_alteracao', new Date().toISOString())
        histRec.set('motivo', motivo)
        histRec.set('origem', 'automatico')
        $app.save(histRec)
      } catch (err) {
        console.log('Erro ao salvar historico_categoria no update hook:', err)
      }
    }
  }

  e.next()
}, 'users')
