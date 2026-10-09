// Notifica o admin sobre novos cadastros pendentes.
// Dispara após o commit de um novo usuário (collection "users") com status "pendente".
onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (!record) {
    e.next()
    return
  }

  const name = record.getString('name') || record.getString('email') || 'sem nome'
  const email = record.getString('email') || ''
  const status = record.getString('status') || ''

  // Só notifica cadastros pendentes (default dos novos membros)
  if (status !== 'pendente') {
    e.next()
    return
  }

  // Log mínimo garantido no console do backend
  console.log('Novo cadastro pendente: ' + name + ' - ' + email)

  // Tenta ler o e-mail do admin configurado na coleção settings
  let adminEmail = ''
  try {
    const settings = $app.findFirstRecordByData('settings', 'key', 'site')
    if (settings) {
      adminEmail = settings.getString('admin_email') || settings.getString('contact_email') || ''
    }
  } catch (_) {
    // settings pode não existir — ignora
  }

  if (adminEmail) {
    try {
      $app.newMailClient().send({
        from: {
          address: $os.getenv('SMTP_FROM') || adminEmail,
          name: 'PG PRIME CLUB',
        },
        to: [{ address: adminEmail }],
        subject: 'Novo cadastro pendente: ' + name,
        html:
          '<p>Olá,</p>' +
          '<p>Um novo membro solicitou cadastro no PG PRIME CLUB e está pendente de aprovação.</p>' +
          '<p><strong>Nome:</strong> ' +
          name +
          '<br/>' +
          '<strong>E-mail:</strong> ' +
          email +
          '</p>' +
          '<p>Acesse o painel administrativo para revisar e aprovar o cadastro.</p>',
      })
    } catch (err) {
      console.log('Falha ao enviar e-mail de notificação de cadastro: ' + err)
    }
  }

  e.next()
}, 'users')
