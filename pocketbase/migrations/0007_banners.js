// 0007 — Cria a coleção `banners` para gestão de banners/imagens do site no admin.
// Cada banner pode exibir título, subtítulo, descrição, imagem (URL ou upload),
// botão com texto/link, ordem, ativo/inativo e página destino (home, club, passeios...).
migrate(
  (app) => {
    let bannersCol
    try {
      bannersCol = app.findCollectionByNameOrId('banners')
    } catch (_) {
      bannersCol = new Collection({
        name: 'banners',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          // Texto principal do banner
          { name: 'title', type: 'text', required: true },
          // Subtítulo / linha secundária
          { name: 'subtitle', type: 'text' },
          // Descrição longa
          { name: 'description', type: 'text' },
          // URL da imagem (modo legado / externo)
          { name: 'image', type: 'text' },
          // Texto do botão de ação
          { name: 'button_text', type: 'text' },
          // Link de destino do botão
          { name: 'button_link', type: 'text' },
          // Ordem de exibição
          { name: 'sort_order', type: 'number' },
          // Ativo / inativo
          { name: 'active', type: 'bool' },
          // Página onde aparece (home, club, passeios, etc.)
          { name: 'page', type: 'text' },
          // Upload de imagem (campo file)
          {
            name: 'image_file',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          },
          // autodate
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [],
      })
      app.save(bannersCol)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('banners')
      app.delete(col)
    } catch (_) {}
  },
)
