migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    // Permite que o próprio usuário exclua a si mesmo OU qualquer usuário com role 'admin' exclua qualquer usuário
    users.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)
