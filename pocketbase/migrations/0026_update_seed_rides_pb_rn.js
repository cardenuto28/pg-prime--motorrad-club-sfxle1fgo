migrate(
  (app) => {
    const rides = app.findCollectionByNameOrId('rides')

    // 1. Atualizar o passeio id "3851ftplje9iw8y" que possui inscrições reais/de teste vinculadas,
    // transformando-o no grande passeio do Litoral Sul da Paraíba (Cabedelo/JP -> Praia de Tabatinga e Camaçari)
    try {
      const existingRide = app.findFirstRecordByData('rides', 'id', '3851ftplje9iw8y')
      existingRide.set('name', 'Passeio Litoral Sul da Paraíba & Mirantes de Tabatinga')
      existingRide.set(
        'description',
        'Uma experiência incrível pelas falésias e mirantes do Litoral Sul paraibano. Saída da concessionária BMW João Pessoa rumo à Praia de Tabatinga e Camaçari, com paradas fotográficas nas falésias e almoço exclusivo com frutos do mar à beira-mar para a confraternização dos membros do PG PRIME Club.',
      )
      existingRide.set('destination', 'Praia de Tabatinga & Camaçari - Conde / PB')
      existingRide.set(
        'meeting_point',
        'BMW João Pessoa - Rod. BR-230, Qd 09 Loja 19 A (Cabedelo-PB)',
      )
      existingRide.set('meeting_time', '07:00')
      existingRide.set('departure_time', '07:30')
      existingRide.set('date', '2026-05-16')
      existingRide.set('registration_deadline', '2026-05-13')
      existingRide.set('distance_km', 140)
      existingRide.set('estimated_time', '2h 15min de pilotagem + paradas')
      existingRide.set('max_bikes', 45)
      existingRide.set('allow_pillion', true)
      existingRide.set('price', 160)
      existingRide.set('ride_type', 'bate_e_volta')
      existingRide.set('status', 'inscricoes_abertas')
      existingRide.set(
        'route',
        'Concessionária BMW Cabedelo -> BR-230 -> PB-008 -> Praia de Carapibus -> Mirante de Tabatinga -> Camaçari',
      )
      existingRide.set(
        'important_info',
        'Apresentar-se com tanque de combustível cheio e pneus calibrados. Equipamento completo de proteção obrigatório (capacete integral/modular afivelado, jaqueta com proteções, calça apropriada, botas e luvas). CNH e CRLV da moto válidos e em dia.',
      )
      existingRide.set(
        'whats_included',
        'Café da manhã de recepção na BMW João Pessoa, carro de apoio e suporte mecânico especializado, batedores PG PRIME, hidratação no percurso e almoço especial exclusivo para o grupo.',
      )
      existingRide.set(
        'rules',
        'Pilotagem em formação escalonada obrigatória. Respeite as orientações dos road captains e batedores. Não realize ultrapassagens perigosas nem trocas de posição no pelotão sem autorização.',
      )
      existingRide.set('map_link', 'https://maps.google.com/?q=Praia+de+Tabatinga+Conde+PB')
      app.save(existingRide)
    } catch (err) {
      console.log('Update existing ride 3851ftplje9iw8y note: ' + err)
    }

    // 2. Atualizar ou recriar os demais passeios com rotas representativas de PB e RN
    // IDs do PocketBase possuem no máximo 15 caracteres alfanuméricos
    const pbRnRides = [
      {
        id: 'i6jj9u9ymxzleta',
        name: 'Rota do Brejo Paraibano & Serra de Bananeiras',
        cover_image: 'https://img.usecurling.com/p/1200/600?q=motorcycle,bmw,mountain,road',
        description:
          'Suba as curvas da serra paraibana em direção ao Brejo dos engenhos e casarios históricos. Um passeio com clima ameno, curvas sinuosas pela serra, parada para café colonial e almoço gastronômico especial em Bananeiras.',
        destination: 'Areia & Bananeiras - PB',
        meeting_point: 'BMW João Pessoa - Rod. BR-230, Qd 09 Loja 19 A (Cabedelo-PB)',
        meeting_time: '06:30',
        departure_time: '07:00',
        date: '2026-06-20',
        registration_deadline: '2026-06-17',
        distance_km: 290,
        estimated_time: '4h 00min de pilotagem + paradas',
        max_bikes: 40,
        allow_pillion: true,
        price: 220,
        ride_type: 'bate_e_volta',
        status: 'inscricoes_abertas',
        route:
          'BMW Cabedelo -> BR-230 sentido Campina Grande -> PB-079 via Alagoa Grande -> Areia -> PB-105 Bananeiras',
        important_info:
          'Subida de serra com temperatura mais amena: recomenda-se forro corta-vento ou capa de chuva leve. Tanque cheio na partida em Cabedelo. Equipamento de segurança completo obrigatório.',
        whats_included:
          'Café da manhã de boas-vindas na concessionária, veículo de apoio com ferramental técnico BMW Motorrad, água e isotônico, visita guiada e almoço buffet regional no restaurante de serra.',
        rules:
          'Manter velocidade compatível com as curvas da serra. Proibida ultrapassagem em curvas cegas ou faixa contínua. Seguir o ritmo marcado pelo líder de estrada PG PRIME.',
        map_link: 'https://maps.google.com/?q=Bananeiras+PB',
      },
      {
        id: 'cni9d8wz98yttqy',
        name: 'Expedição Rota do Sol & Falésias da Pipa (RN)',
        cover_image: 'https://img.usecurling.com/p/1200/600?q=bmw,motorcycle,serra,curvas',
        description:
          'Pilote pelas belíssimas paisagens do litoral sul potiguar ao longo da Rota do Sol. Encontro na BMW Natal com destino a Tibau do Sul e Praia da Pipa, com visual panorâmico das falésias do Chapadão e almoço premium para o clube.',
        destination: 'Praia da Pipa & Tibau do Sul - RN',
        meeting_point: 'BMW Natal - Av. Dão Silveira, 3712, Loja A - Candelária (Natal-RN)',
        meeting_time: '07:00',
        departure_time: '07:30',
        date: '2026-07-18',
        registration_deadline: '2026-07-15',
        distance_km: 170,
        estimated_time: '2h 30min de pilotagem + paradas',
        max_bikes: 50,
        allow_pillion: true,
        price: 190,
        ride_type: 'bate_e_volta',
        status: 'inscricoes_abertas',
        route:
          'BMW Natal -> Rota do Sol (RN-063) -> Barreira do Inferno -> Pirangi do Norte -> Tibau do Sul -> Pipa',
        important_info:
          'Revisão preventiva e calibragem dos pneus antes do evento. Protetor solar e viseira solar/óculos recomendados para pilotagem litorânea. Tanque cheio.',
        whats_included:
          'Recepção com café da manhã reforçado na BMW Natal, carro esteira de suporte técnico PG PRIME, fotógrafo oficial dedicado, hidratação gelada e almoço completo à la carte na praia.',
        rules:
          'Formação escalonada na rodovia e fila simples em perímetros urbanos praianos. Respeitar ciclistas e pedestres nos trechos turísticos da Rota do Sol.',
        map_link: 'https://maps.google.com/?q=Praia+da+Pipa+Tibau+do+Sul+RN',
      },
      {
        id: 'h4te9l0y4n3l3go',
        name: 'Rota do Litoral Norte Potiguar & São Miguel do Gostoso',
        cover_image: 'https://img.usecurling.com/p/1200/600?q=motorcycle,group,ride',
        description:
          'Passeio marcante pelo Litoral Norte do Rio Grande do Norte rumo a São Miguel do Gostoso, onde o vento e o asfalto convidam à pura sensação de liberdade BMW Motorrad. Parada com brunch exclusivo e fotos nas dunas e praias.',
        destination: 'São Miguel do Gostoso - RN',
        meeting_point: 'BMW Natal - Av. Dão Silveira, 3712, Loja A - Candelária (Natal-RN)',
        meeting_time: '07:00',
        departure_time: '07:30',
        date: '2026-03-21',
        registration_deadline: '2026-03-18',
        distance_km: 230,
        estimated_time: '3h 15min de pilotagem',
        max_bikes: 35,
        allow_pillion: true,
        price: 0,
        ride_type: 'bate_e_volta',
        status: 'realizado',
        route:
          'BMW Natal -> Ponte Newton Navarro -> BR-101 Norte via Touros -> RN-221 até São Miguel do Gostoso',
        important_info:
          'Evento exclusivo para membros do clube. Saída com abastecimento completo na concessionária BMW Natal.',
        whats_included:
          'Café de largada na BMW Natal, suporte mecânico de resgate, hidratação durante todo o percurso e brunch rústico em Gostoso.',
        rules:
          'Atenção às rajadas de vento laterais típicas do litoral norte. Mantenha distância segura de dois segundos entre motos.',
        map_link: 'https://maps.google.com/?q=Sao+Miguel+do+Gostoso+RN',
      },
      {
        id: 'pbrnserido00001',
        name: 'Grande Expedição Seridó & Caicó dos Sabores',
        cover_image: 'https://img.usecurling.com/p/1200/600?q=motorcycle,bmw,mountain,road',
        description:
          'Uma imersão na cultura e estradas do sertão potiguar pelo coração do Seridó. Saindo de Natal via Currais Novos com destino a Caicó, vivenciando a culinária sertaneja, paisagens rochosas e o autêntico espírito aventureiro BMW.',
        destination: 'Currais Novos & Caicó - RN',
        meeting_point: 'BMW Natal - Av. Dão Silveira, 3712, Loja A - Candelária (Natal-RN)',
        meeting_time: '06:00',
        departure_time: '06:30',
        date: '2026-08-22',
        registration_deadline: '2026-08-18',
        distance_km: 380,
        estimated_time: '5h 00min de pilotagem + paradas',
        max_bikes: 30,
        allow_pillion: true,
        price: 280,
        ride_type: 'bate_e_fica',
        status: 'inscricoes_abertas',
        route:
          'BMW Natal -> BR-226 sentido Santa Cruz (Santuário Santa Rita) -> Currais Novos -> BR-427 até Caicó',
        important_info:
          'Trajeto de maior quilometragem pelo interior potiguar: hidratação constante obrigatória. Chegar descansado e com pneus em perfeito estado de conservação.',
        whats_included:
          'Café da manhã de largada na concessionária, veículo 4x4 de resgate e mecânico BMW Motorrad com peças sobressalentes, almoço tradicional sertanejo com carne de sol e queijo de coalho, brinde exclusivo da expedição.',
        rules:
          'Obrigatório uso de vestuário ventilado próprio para motociclismo. Paradas a cada 100km para reabastecimento e hidratação obrigatória de todos os pilotos.',
        map_link: 'https://maps.google.com/?q=Caico+RN',
      },
      {
        id: 'pbrntraicao0001',
        name: 'Circuito Litoral Norte Paraibano & Baía da Traição',
        cover_image: 'https://img.usecurling.com/p/1200/600?q=ocean,coast,motorcycle,beach',
        description:
          'Desbravando o litoral norte da Paraíba saindo de Cabedelo por estradas cênicas que cortam canaviais e reservas até as águas calmas e falésias da Baía da Traição. Parada gastronômica com pescados frescos e história da região.',
        destination: 'Baía da Traição & Lucena - PB',
        meeting_point: 'BMW João Pessoa - Rod. BR-230, Qd 09 Loja 19 A (Cabedelo-PB)',
        meeting_time: '07:00',
        departure_time: '07:30',
        date: '2026-09-19',
        registration_deadline: '2026-09-16',
        distance_km: 195,
        estimated_time: '3h 00min de pilotagem',
        max_bikes: 40,
        allow_pillion: true,
        price: 150,
        ride_type: 'bate_e_volta',
        status: 'inscricoes_abertas',
        route:
          'BMW Cabedelo -> BR-230 -> BR-101 Norte -> PB-041 via Rio Tinto e Marcação -> Baía da Traição',
        important_info:
          'Verificar pressão dos pneus e óleo antes da partida. Levar capa de chuva leve e documentos pessoais/do veículo.',
        whats_included:
          'Café da manhã na BMW João Pessoa, apoio móvel PG PRIME, água mineral e frutas nas paradas técnicas, almoço à beira da enseada.',
        rules:
          'Velocidade controlada em trechos com comunidades litorâneas. Sinalização clara de obstáculos e buracos para os pilotos que vêm atrás.',
        map_link: 'https://maps.google.com/?q=Baia+da+Traicao+PB',
      },
    ]

    pbRnRides.forEach((item) => {
      let rec
      try {
        rec = app.findFirstRecordByData('rides', 'id', item.id)
      } catch (_) {
        rec = new Record(rides)
        rec.set('id', item.id)
      }

      rec.set('name', item.name)
      rec.set('cover_image', item.cover_image)
      rec.set('description', item.description)
      rec.set('destination', item.destination)
      rec.set('meeting_point', item.meeting_point)
      rec.set('meeting_time', item.meeting_time)
      rec.set('departure_time', item.departure_time)
      rec.set('date', item.date)
      rec.set('registration_deadline', item.registration_deadline)
      rec.set('distance_km', item.distance_km)
      rec.set('estimated_time', item.estimated_time)
      rec.set('max_bikes', item.max_bikes)
      rec.set('allow_pillion', item.allow_pillion)
      rec.set('price', item.price)
      rec.set('ride_type', item.ride_type)
      rec.set('status', item.status)
      rec.set('route', item.route)
      rec.set('important_info', item.important_info)
      rec.set('whats_included', item.whats_included)
      rec.set('rules', item.rules)
      rec.set('map_link', item.map_link)

      app.save(rec)
    })

    // 3. Atualizar anúncios/comunicados que citavam Serra Negra ou outras cidades de fora para PB e RN
    try {
      const ann1 = app.findFirstRecordByData('announcements', 'id', 'mjhzl7gni9yiqh4')
      ann1.set('title', 'Passeio Litoral Sul da Paraíba – Concentração e Briefing')
      ann1.set(
        'content',
        'Atenção membros inscritos no Passeio Litoral Sul da Paraíba: a concentração começará às 07:00 na concessionária BMW João Pessoa (Cabedelo-PB) com café da manhã de boas-vindas. O briefing de segurança acontecerá impreterivelmente às 07:20 com saída pontual às 07:30.',
      )
      app.save(ann1)
    } catch (err) {
      console.log('Update announcement 1 note: ' + err)
    }

    try {
      const ann2 = app.findFirstRecordByData('announcements', 'id', 'clfs1w0wz14hqfi')
      ann2.set('title', 'Reunião de Briefing — Grande Expedição Seridó (RN)')
      ann2.set(
        'content',
        'Todos os membros confirmados na Expedição Seridó & Caicó devem comparecer ao briefing pré-passeio na concessionária BMW Natal na quinta-feira que antecede a partida, às 19h. Equipamentos completos e revisão da moto obrigatórios.',
      )
      app.save(ann2)
    } catch (err) {
      console.log('Update announcement 2 note: ' + err)
    }

    // 4. Atualizar galerias de exemplo que citavam Serra do Japi / Mantiqueira
    try {
      const galJapi = app.findFirstRecordByData('galleries', 'id', 'ee6p7xmd5seevxi')
      galJapi.set('title', 'Fotos — Passeio Costa das Falésias & Tabatinga')
      galJapi.set(
        'description',
        'Confira os melhores momentos do nosso passeio pelo Litoral Sul Paraibano com mais de 30 motocicletas BMW celebrando a amizade e a estrada.',
      )
      app.save(galJapi)
    } catch (err) {
      console.log('Update gallery Japi note: ' + err)
    }

    try {
      const galMantiqueira = app.findFirstRecordByData('galleries', 'id', 'dsfqtfv3j0ehjoe')
      galMantiqueira.set('title', 'Curvas do Brejo Paraibano')
      galMantiqueira.set(
        'description',
        'Registro fotográfico das belas serras e curvas que levam a Areia e Bananeiras pelo interior paraibano.',
      )
      app.save(galMantiqueira)
    } catch (err) {
      console.log('Update gallery Mantiqueira note: ' + err)
    }

    // 5. Atualizar parceiros de exemplo que estavam com endereços fora de PB/RN (Hotel Dona Carolina / Vila Chã)
    try {
      const part1 = app.findFirstRecordByData('partners', 'id', '53e3q5iz6gvvz1y')
      part1.set('name', 'Pousada & Spa dos Engenhos de Bananeiras')
      part1.set('city', 'Bananeiras - PB')
      part1.set(
        'description',
        'Hospedagem de charme na serra paraibana com estacionamento seguro e recepção especial para grupos de motociclistas BMW.',
      )
      part1.set('phone', '(83) 3367-1122')
      part1.set('website', 'https://bananeiras.tur.br')
      app.save(part1)
    } catch (err) {
      console.log('Update partner 1 note: ' + err)
    }

    try {
      const part2 = app.findFirstRecordByData('partners', 'id', '7kki58aecnqr7md')
      part2.set('name', 'Restaurante Mirante das Falésias de Pipa')
      part2.set('city', 'Tibau do Sul / Pipa - RN')
      part2.set(
        'description',
        'Gastronomia costeira requintada com vista panorâmica para o mar e desconto exclusivo para membros do PG PRIME Club.',
      )
      part2.set('phone', '(84) 3246-2000')
      part2.set('website', 'https://pipa.com.br')
      app.save(part2)
    } catch (err) {
      console.log('Update partner 2 note: ' + err)
    }
  },
  (app) => {
    // Revert / rollback não-destrutivo
  },
)
