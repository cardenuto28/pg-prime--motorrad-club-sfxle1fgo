// Corretivo do 0003: o backfill usou `WHERE active IS NULL`, mas o SQLite
// preencheu as linhas existentes com 0 (false) ao adicionar a coluna bool,
// então nenhuma linha foi atualizada. Aqui marcamos todos os benefícios e
// parceiros pré-existentes como ativos incondicionalmente.
migrate(
  (app) => {
    app.db().newQuery('UPDATE benefits SET active = 1').execute()
    app.db().newQuery('UPDATE partners SET active = 1').execute()
  },
  (app) => {
    // no-op
  },
)
