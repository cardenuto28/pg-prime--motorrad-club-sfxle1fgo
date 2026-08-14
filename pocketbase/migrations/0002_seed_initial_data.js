migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const rides = app.findCollectionByNameOrId('rides')
    const registrations = app.findCollectionByNameOrId('registrations')
    const benefits = app.findCollectionByNameOrId('benefits')
    const partners = app.findCollectionByNameOrId('partners')
    const galleries = app.findCollectionByNameOrId('galleries')
    const announcements = app.findCollectionByNameOrId('announcements')

    // 1. Seed Admin User
    let adminRecord
    try {
      adminRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'ricardo@grupoeuromotors.com.br')
    } catch (_) {
      adminRecord = new Record(users)
      adminRecord.setEmail('ricardo@grupoeuromotors.com.br')
      adminRecord.setPassword('Skip@Pass')
      adminRecord.setVerified(true)
      adminRecord.set('name', 'Ricardo Euro Motors')
      adminRecord.set('role', 'admin')
      adminRecord.set('phone', '(11) 99876-5432')
      adminRecord.set('cpf', '123.456.789-00')
      adminRecord.set('city', 'São Paulo - SP')
      adminRecord.set('bike_brand', 'BMW')
      adminRecord.set('bike_model', 'R 1300 GS Option 719')
      adminRecord.set('bike_year', 2026)
      adminRecord.set('pillion_name', 'Patrícia Euro')
      adminRecord.set('pillion_phone', '(11) 99876-5433')
      adminRecord.set('status', 'ativo')
      app.save(adminRecord)
    }

    // 2. Seed Sample Members
    const member1 = new Record(users)
    member1.setEmail('joao.silva@cliente.com.br')
    member1.setPassword('Skip@Pass')
    member1.setVerified(true)
    member1.set('name', 'João Silva')
    member1.set('role', 'member')
    member1.set('phone', '(11) 98111-2233')
    member1.set('cpf', '234.567.890-11')
    member1.set('city', 'São José do Rio Preto - SP')
    member1.set('bike_brand', 'BMW')
    member1.set('bike_model', 'BMW R 1300 GS')
    member1.set('bike_year', 2026)
    member1.set('pillion_name', 'Maria Silva')
    member1.set('pillion_phone', '(11) 98111-2244')
    member1.set('status', 'ativo')
    app.save(member1)

    const member2 = new Record(users)
    member2.setEmail('carlos.souza@cliente.com.br')
    member2.setPassword('Skip@Pass')
    member2.setVerified(true)
    member2.set('name', 'Carlos Souza')
    member2.set('role', 'member')
    member2.set('phone', '(19) 97222-3344')
    member2.set('cpf', '345.678.901-22')
    member2.set('city', 'Campinas - SP')
    member2.set('bike_brand', 'BMW')
    member2.set('bike_model', 'BMW S 1000 RR')
    member2.set('bike_year', 2025)
    member2.set('pillion_name', '')
    member2.set('pillion_phone', '')
    member2.set('status', 'ativo')
    app.save(member2)

    const member3 = new Record(users)
    member3.setEmail('ana.costa@cliente.com.br')
    member3.setPassword('Skip@Pass')
    member3.setVerified(true)
    member3.set('name', 'Ana Costa')
    member3.set('role', 'member')
    member3.set('phone', '(16) 99333-4455')
    member3.set('cpf', '456.789.012-33')
    member3.set('city', 'Ribeirão Preto - SP')
    member3.set('bike_brand', 'BMW')
    member3.set('bike_model', 'BMW F 900 GS')
    member3.set('bike_year', 2024)
    member3.set('pillion_name', 'Lucas Costa')
    member3.set('pillion_phone', '(16) 99333-4466')
    member3.set('status', 'ativo')
    app.save(member3)

    const member4 = new Record(users)
    member4.setEmail('marcos.oliveira@cliente.com.br')
    member4.setPassword('Skip@Pass')
    member4.setVerified(true)
    member4.set('name', 'Marcos Oliveira')
    member4.set('role', 'member')
    member4.set('phone', '(11) 96444-5566')
    member4.set('cpf', '567.890.123-44')
    member4.set('city', 'São Paulo - SP')
    member4.set('bike_brand', 'BMW')
    member4.set('bike_model', 'BMW R 1250 GS Adventure')
    member4.set('bike_year', 2023)
    member4.set('pillion_name', '')
    member4.set('pillion_phone', '')
    member4.set('status', 'pendente')
    app.save(member4)

    // 3. Seed Rides
    const ride1 = new Record(rides)
    ride1.set('name', 'Passeio Serra Negra & Rota do Café')
    ride1.set('cover_image', 'https://img.usecurling.com/p/1200/600?q=motorcycle,bmw,mountain,road')
    ride1.set(
      'description',
      'Venha pilotar conosco pelas belas curvas da Serra Negra com parada especial para café da manhã em fazenda histórica e almoço exclusivo para o Euro Motors Club.',
    )
    ride1.set('date', '2026-04-18')
    ride1.set('meeting_time', '07:30')
    ride1.set('departure_time', '08:15')
    ride1.set('meeting_point', 'Euro Motors BMW Motorrad - Av. Presidente Juscelino, 1500')
    ride1.set('destination', 'Hotel Fazenda Dona Carolina - Itatiba / Serra Negra')
    ride1.set('route', 'Rod. dos Bandeirantes -> Rod. Dom Pedro I -> SP-360 Serra Negra')
    ride1.set('distance_km', 220)
    ride1.set('estimated_time', '3h 30min de pilotagem + paradas')
    ride1.set('max_bikes', 50)
    ride1.set('allow_pillion', true)
    ride1.set('price', 150)
    ride1.set(
      'important_info',
      'Chegar com tanque cheio. Equipamentos de proteção completos obrigatórios (capacete, jaqueta com proteção, calça e luva).',
    )
    ride1.set(
      'whats_included',
      'Café da manhã de recepção na concessionária, carro de apoio com mecânico credenciado Euro Motors, hidratação no percurso e almoço buffet especial.',
    )
    ride1.set(
      'rules',
      'Mantenha a formação em escalonado. Respeite os limites de velocidade e os batedores do evento. Não realize ultrapassagens sem sinalização.',
    )
    ride1.set('map_link', 'https://maps.google.com')
    ride1.set('registration_deadline', '2026-04-15')
    ride1.set('status', 'inscricoes_abertas')
    app.save(ride1)

    const ride2 = new Record(rides)
    ride2.set('name', 'Rally das Serras - Campos do Jordão')
    ride2.set('cover_image', 'https://img.usecurling.com/p/1200/600?q=bmw,motorcycle,serra,curvas')
    ride2.set(
      'description',
      'Um passeio inesquecível rumo ao clima das montanhas de Campos do Jordão com vista para a Mantiqueira e almoço no Vila Chã.',
    )
    ride2.set('date', '2026-05-16')
    ride2.set('meeting_time', '07:00')
    ride2.set('departure_time', '07:45')
    ride2.set('meeting_point', 'Concessionária Euro Motors')
    ride2.set('destination', 'Campos do Jordão - SP')
    ride2.set('route', 'Rodovia Ayrton Senna -> Rodovia Floriano Rodrigues Pinheiro')
    ride2.set('distance_km', 310)
    ride2.set('estimated_time', '4h 00min')
    ride2.set('max_bikes', 40)
    ride2.set('allow_pillion', true)
    ride2.set('price', 180)
    ride2.set('important_info', 'Trazer agasalho térmico adicional para a serra.')
    ride2.set(
      'whats_included',
      'Kit piloto Euro Motors, carro de resgate, almoço premium e fotógrafo profissional no circuito.',
    )
    ride2.set(
      'rules',
      'Uso obrigatório de equipamento completo. Respeitar as orientações do capitão de estrada.',
    )
    ride2.set('map_link', 'https://maps.google.com')
    ride2.set('registration_deadline', '2026-05-12')
    ride2.set('status', 'inscricoes_abertas')
    app.save(ride2)

    const ride3 = new Record(rides)
    ride3.set('name', 'Encontro Euro Motors - Serra do Japi & Café da Manhã')
    ride3.set('cover_image', 'https://img.usecurling.com/p/1200/600?q=motorcycle,group,ride')
    ride3.set(
      'description',
      'Passeio matinal rápido seguido de um brunch especial na Fazenda Montanhas do Japi.',
    )
    ride3.set('date', '2026-03-08')
    ride3.set('meeting_time', '08:00')
    ride3.set('departure_time', '08:30')
    ride3.set('meeting_point', 'Euro Motors Motorrad')
    ride3.set('destination', 'Serra do Japi - Jundiaí')
    ride3.set('route', 'Rodovia Anhanguera km 60')
    ride3.set('distance_km', 110)
    ride3.set('estimated_time', '1h 45min')
    ride3.set('max_bikes', 30)
    ride3.set('allow_pillion', true)
    ride3.set('price', 0)
    ride3.set('important_info', 'Evento gratuito exclusivo para clientes com revisões em dia.')
    ride3.set('whats_included', 'Brunch colonial completo, fotos do passeio.')
    ride3.set('rules', 'Respeite as normas de trânsito.')
    ride3.set('map_link', 'https://maps.google.com')
    ride3.set('registration_deadline', '2026-03-05')
    ride3.set('status', 'realizado')
    app.save(ride3)

    // 4. Seed Registrations
    const reg1 = new Record(registrations)
    reg1.set('ride', ride1.id)
    reg1.set('user', member1.id) // João Silva
    reg1.set('has_pillion', true)
    reg1.set('pillion_name', 'Maria Silva')
    reg1.set('pillion_phone', '(11) 98111-2244')
    reg1.set('emergency_contact_name', 'Fernando Silva')
    reg1.set('emergency_contact_phone', '(11) 98111-9999')
    reg1.set('accepted_rules', true)
    reg1.set('accepted_terms', true)
    reg1.set('status', 'confirmada')
    app.save(reg1)

    const reg2 = new Record(registrations)
    reg2.set('ride', ride1.id)
    reg2.set('user', member2.id) // Carlos Souza
    reg2.set('has_pillion', false)
    reg2.set('pillion_name', '')
    reg2.set('pillion_phone', '')
    reg2.set('emergency_contact_name', 'Roberto Souza')
    reg2.set('emergency_contact_phone', '(19) 97222-8888')
    reg2.set('accepted_rules', true)
    reg2.set('accepted_terms', true)
    reg2.set('status', 'confirmada')
    app.save(reg2)

    const reg3 = new Record(registrations)
    reg3.set('ride', ride1.id)
    reg3.set('user', member3.id) // Ana Costa
    reg3.set('has_pillion', true)
    reg3.set('pillion_name', 'Lucas Costa')
    reg3.set('pillion_phone', '(16) 99333-4466')
    reg3.set('emergency_contact_name', 'Clara Costa')
    reg3.set('emergency_contact_phone', '(16) 99333-7777')
    reg3.set('accepted_rules', true)
    reg3.set('accepted_terms', true)
    reg3.set('status', 'confirmada')
    app.save(reg3)

    const reg4 = new Record(registrations)
    reg4.set('ride', ride3.id)
    reg4.set('user', member1.id)
    reg4.set('has_pillion', true)
    reg4.set('pillion_name', 'Maria Silva')
    reg4.set('pillion_phone', '(11) 98111-2244')
    reg4.set('emergency_contact_name', 'Fernando Silva')
    reg4.set('emergency_contact_phone', '(11) 98111-9999')
    reg4.set('accepted_rules', true)
    reg4.set('accepted_terms', true)
    reg4.set('status', 'confirmada')
    app.save(reg4)

    // 5. Seed Benefits
    const ben1 = new Record(benefits)
    ben1.set('title', '15% OFF em Acessórios & Jaquetas BMW Motorrad')
    ben1.set('image', 'https://img.usecurling.com/p/600/400?q=jacket,bmw,helmet')
    ben1.set('partner', 'Boutique Euro Motors')
    ben1.set(
      'description',
      'Desconto de 15% na compra de vestuário oficial BMW Motorrad, jaquetas, luvas, capacetes e botas na concessionária.',
    )
    ben1.set(
      'exclusive_condition',
      'Válido para membros ativos apresentando a carteirinha virtual no app/site.',
    )
    ben1.set('valid_until', '2026-12-31')
    ben1.set(
      'how_to_use',
      'Apresente seu CPF no balcão de vendas de peças e acessórios Euro Motors.',
    )
    ben1.set('contact_link', '(11) 3000-1000')
    app.save(ben1)

    const ben2 = new Record(benefits)
    ben2.set('title', 'Lavagem Detalhada Cortesia nas Revisões')
    ben2.set('image', 'https://img.usecurling.com/p/600/400?q=bmw,motorcycle,wash')
    ben2.set('partner', 'Oficina Euro Motors Motorrad')
    ben2.set(
      'description',
      'Ao agendar e realizar a revisão periódica da sua moto na Euro Motors, ganhe uma lavagem técnica detalhada com aplicação de cera protetora.',
    )
    ben2.set(
      'exclusive_condition',
      'Incluso automaticamente na ordem de serviço de membros do Club.',
    )
    ben2.set('valid_until', '2026-12-31')
    ben2.set(
      'how_to_use',
      'Informe ao seu consultor técnico que você é membro Euro Motors Club ao deixar a moto.',
    )
    ben2.set('contact_link', 'https://euromotors.com.br/agendamento')
    app.save(ben2)

    const ben3 = new Record(benefits)
    ben3.set('title', '20% de Desconto Hospedagem Hotel Fazenda Dona Carolina')
    ben3.set('image', 'https://img.usecurling.com/p/600/400?q=hotel,resort,resort')
    ben3.set('partner', 'Hotel Fazenda Dona Carolina')
    ben3.set(
      'description',
      'Desconto especial em diárias para membros do clube com estacionamento coberto e seguro para motocicletas.',
    )
    ben3.set('exclusive_condition', 'Cupom exclusivo: EUROMOTORS20')
    ben3.set('valid_until', '2026-11-30')
    ben3.set(
      'how_to_use',
      'Utilize o cupom pelo site do hotel ou informe por WhatsApp no momento da reserva.',
    )
    ben3.set('contact_link', 'https://donacarolina.com.br')
    app.save(ben3)

    // 6. Seed Partners
    const part1 = new Record(partners)
    part1.set('name', 'Hotel Fazenda Dona Carolina')
    part1.set('category', 'hoteis')
    part1.set('logo', 'https://img.usecurling.com/p/300/200?q=hotel,resort')
    part1.set(
      'description',
      'Hotel de luxo em fazenda histórica com excelente infraestrutura para motociclistas.',
    )
    part1.set('discount_info', '20% de desconto em hospedagem')
    part1.set('website', 'https://donacarolina.com.br')
    part1.set('phone', '(11) 4534-9000')
    part1.set('city', 'Itatiba / Serra Negra - SP')
    app.save(part1)

    const part2 = new Record(partners)
    part2.set('name', 'Restaurante Vila Chã Campos do Jordão')
    part2.set('category', 'restaurantes')
    part2.set('logo', 'https://img.usecurling.com/p/300/200?q=restaurant,gourmet')
    part2.set(
      'description',
      'Culinária portuguesa autêntica na serra com recepção diferenciada para grupos de motociclistas.',
    )
    part2.set('discount_info', 'Drink ou sobremesa cortesia para membros')
    part2.set('website', 'https://vilacha.com.br')
    part2.set('phone', '(12) 3663-1234')
    part2.set('city', 'Campos do Jordão - SP')
    app.save(part2)

    const part3 = new Record(partners)
    part3.set('name', 'Porto Seguro Motos')
    part3.set('category', 'seguros')
    part3.set('logo', 'https://img.usecurling.com/p/300/200?q=insurance,shield')
    part3.set(
      'description',
      'Condições especiais e guincho ilimitado em passeios para motos BMW contratadas com a Euro Motors Corretora.',
    )
    part3.set('discount_info', 'Até 10% de desconto e franquia reduzida')
    part3.set('website', 'https://portoseguro.com.br')
    part3.set('phone', '0800 727 0800')
    part3.set('city', 'Nacional')
    app.save(part3)

    // 7. Seed Gallery
    const gal1 = new Record(galleries)
    gal1.set('title', 'Fotos - Passeio Serra do Japi & Brunch')
    gal1.set('ride', ride3.id)
    gal1.set('category', 'passeios')
    gal1.set('cover_image', 'https://img.usecurling.com/p/800/500?q=bmw,motorcycle,group,serra')
    gal1.set(
      'images_json',
      JSON.stringify([
        'https://img.usecurling.com/p/800/600?q=bmw,motorcycle,1',
        'https://img.usecurling.com/p/800/600?q=bmw,motorcycle,2',
        'https://img.usecurling.com/p/800/600?q=bmw,motorcycle,3',
        'https://img.usecurling.com/p/800/600?q=bmw,motorcycle,4',
      ]),
    )
    gal1.set(
      'description',
      'Confira os melhores momentos do nosso encontro na Serra do Japi realizado no início deste mês com mais de 25 motos BMW presente!',
    )
    gal1.set('event_date', '2026-03-08')
    app.save(gal1)

    const gal2 = new Record(galleries)
    gal2.set('title', 'Expedição Serra do Rio do Rastro 2025')
    gal2.set('category', 'viagens')
    gal2.set('cover_image', 'https://img.usecurling.com/p/800/500?q=serra,road,motorcycle,mountain')
    gal2.set(
      'images_json',
      JSON.stringify([
        'https://img.usecurling.com/p/800/600?q=serra,road,1',
        'https://img.usecurling.com/p/800/600?q=serra,road,2',
        'https://img.usecurling.com/p/800/600?q=serra,road,3',
      ]),
    )
    gal2.set(
      'description',
      'Uma incrível viagem de 4 dias cobrindo mais de 1.800 km rumo às curvas mais famosas do Brasil.',
    )
    gal2.set('event_date', '2025-11-20')
    app.save(gal2)

    // 8. Seed Announcements
    const ann1 = new Record(announcements)
    ann1.set('title', 'Passeio Serra Negra – Informações importantes de concentração')
    ann1.set(
      'content',
      'Atenção membros inscritos no Passeio Serra Negra: a concentração começará às 07:30 na concessionária com café da manhã reforçado. O briefing de segurança acontecerá impreterivelmente às 08:00 com saída pontual às 08:15.',
    )
    ann1.set('date', '2026-04-10')
    ann1.set('category', 'Passeios')
    ann1.set('important', true)
    app.save(ann1)

    const ann2 = new Record(announcements)
    ann2.set('title', 'Lançamento Nova BMW R 1300 GS Adventure na Euro Motors')
    ann2.set(
      'content',
      'Convidamos todos os membros do Euro Motors Club para o coquetel exclusivo de apresentação da nova BMW R 1300 GS Adventure na próxima quinta-feira às 19:30.',
    )
    ann2.set('date', '2026-03-25')
    ann2.set('category', 'Eventos')
    ann2.set('important', false)
    app.save(ann2)
  },
  (app) => {
    // down
  },
)
