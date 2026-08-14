import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SidebarSignup } from '@/components/SidebarSignup'
import { SidebarMemberWidget } from '@/components/SidebarMemberWidget'
import { RideRegistrationModal } from '@/components/RideRegistrationModal'
import { useAuth } from '@/context/AuthContext'
import { Ride, Benefit, Gallery, rideService, benefitService, galleryService } from '@/services/api'
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Clock,
  UserPlus,
  Compass,
  Smile,
  Tag,
  Users,
  Star,
  Mountain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [rides, setRides] = useState<Ride[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)

  // Modal de Inscrição na Ride
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Modal de Login
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [ridesData, benefitsData, galleriesData] = await Promise.all([
        rideService.getAllRides(),
        benefitService.getAllBenefits(),
        galleryService.getAllGalleries(),
      ])

      setRides(ridesData)
      setBenefits(benefitsData)
      setGalleries(galleriesData)
    } catch (err) {
      console.error('Erro ao carregar dados da Home:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRegistration = (ride: Ride) => {
    if (!user) {
      toast({
        title: 'Área do Membro',
        description:
          'Faça login ou cadastre-se no formulário lateral para se inscrever nos passeios.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSelectedRide(ride)
    setModalOpen(true)
  }

  // Cards de Passeios da Referência
  const defaultRides = [
    {
      id: rides[0]?.id || 'r1',
      day: '07',
      month: 'JUN',
      name: 'SERRA DO RIO DO RASTRO',
      date: '07/06/2025',
      location: 'Lauro Müller - SC',
      time: 'Saída: 07h00',
      cover_image: 'https://img.usecurling.com/p/600/400?q=serra,road,motorcycle,mountain',
      rawRide: rides[0],
    },
    {
      id: rides[1]?.id || 'r2',
      day: '21',
      month: 'JUN',
      name: 'CAMINHOS DA MANTIQUEIRA',
      date: '21/06/2025',
      location: 'Campos do Jordão - SP',
      time: 'Saída: 08h00',
      cover_image: 'https://img.usecurling.com/p/600/400?q=bmw,motorcycle,serra,curvas',
      rawRide: rides[1],
    },
    {
      id: rides[2]?.id || 'r3',
      day: '05',
      month: 'JUL',
      name: 'LITORAL NORTE EXPERIENCE',
      date: '05/07/2025',
      location: 'Ubatuba - SP',
      time: 'Saída: 07h30',
      cover_image: 'https://img.usecurling.com/p/600/400?q=ocean,coast,motorcycle,beach',
      rawRide: rides[2],
    },
  ]

  // Galeria de Momentos da Referência
  const galleryPhotos = [
    'https://img.usecurling.com/p/400/280?q=bmw,motorcycle,riders,group',
    'https://img.usecurling.com/p/400/280?q=bmw,motorcycle,rider,front',
    'https://img.usecurling.com/p/400/280?q=bmw,motorcycles,mountain,sunset',
    'https://img.usecurling.com/p/400/280?q=bmw,motorcycle,riding,road',
    'https://img.usecurling.com/p/400/280?q=bmw,motorcycle,sunset,landscape',
  ]

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      {/* Cabeçalho */}
      <Header />

      {/* Hero Section & Main Layout Container */}
      <main id="inicio" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LADO ESQUERDO: Hero + Seções principais (col-span-8) */}
          <div className="lg:col-span-8 space-y-12 lg:space-y-16">
            {/* HERO SECTION */}
            <div className="relative rounded-md overflow-hidden min-h-[400px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 border border-[#1a2336] group">
              {/* Background Image com Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://img.usecurling.com/p/1200/700?q=bmw,gs1300,motorcycle,riders,road"
                  alt="Euro Motors Motorrad Club"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/90 via-transparent to-transparent" />
              </div>

              {/* Hero Content */}
              <div className="relative z-10 space-y-4 max-w-xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-montserrat tracking-tight leading-none uppercase drop-shadow-md">
                  EUROMOTORS
                  <span className="block text-white">MOTORRAD CLUB</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                  Estrada. Amizade. Liberdade.
                  <br />
                  Essa é a nossa direção.
                </p>
                <div className="pt-2">
                  <a href="#cadastro-form">
                    <Button className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-6 py-3 h-auto rounded-sm gap-2 shadow-lg shadow-blue-900/30 transition-all uppercase">
                      FAZER CADASTRO <ChevronRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* SEÇÃO 1: COMO FUNCIONA */}
            <section id="como-funciona" className="space-y-6">
              <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
                COMO FUNCIONA
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Passo 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#111724] border border-[#202b3f] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      1. FAÇA SEU CADASTRO
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Preencha seus dados e faça parte do Euromotors Motorrad Club.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#111724] border border-[#202b3f] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      2. ESCOLHA O PASSEIO
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Confira os próximos passeios e inscreva-se nos que quiser participar.
                    </p>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#111724] border border-[#202b3f] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      3. VIVA A EXPERIÊNCIA
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Participe de aventuras incríveis com segurança e boa companhia.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: PRÓXIMOS PASSEIOS (CARDS HORIZONTAIS) */}
            <section id="proximos-passeios" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
                  PRÓXIMOS PASSEIOS
                </h2>
                <div className="flex items-center gap-4">
                  <a
                    href="#passeios"
                    className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
                  >
                    VER TODOS <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded bg-[#101623] border border-[#1f2a3e] flex items-center justify-center text-slate-400 hover:text-white">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 rounded bg-[#101623] border border-[#1f2a3e] flex items-center justify-center text-slate-400 hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {defaultRides.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0e131d] border border-[#1c2538] rounded-md overflow-hidden flex flex-col justify-between group hover:border-blue-600/50 transition-all duration-300 shadow-xl"
                  >
                    <div>
                      {/* Image Header with Badge */}
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={item.cover_image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-transparent to-transparent" />

                        {/* Date Badge Top Left */}
                        <div className="absolute top-3 left-3 bg-[#0d1422]/90 backdrop-blur border border-blue-500/40 rounded-sm px-2.5 py-1 text-center shadow-lg">
                          <span className="block text-base font-extrabold text-white leading-none font-montserrat">
                            {item.day}
                          </span>
                          <span className="block text-[9px] font-bold text-blue-400 uppercase tracking-wider font-montserrat">
                            {item.month}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <h3 className="text-xs font-bold text-white tracking-wide uppercase font-montserrat line-clamp-1">
                          {item.name}
                        </h3>

                        <div className="space-y-1.5 text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="p-4 pt-0">
                      {item.rawRide ? (
                        <Link to={`/passeios/${item.rawRide.id}`}>
                          <Button
                            variant="outline"
                            className="w-full border-blue-600/60 hover:border-blue-500 bg-[#0d1524] hover:bg-blue-600 text-white font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase transition-all"
                          >
                            VER DETALHES
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full border-[#1c2538] bg-[#0d1524] text-slate-500 font-semibold text-[11px] tracking-wider h-9 rounded-sm uppercase cursor-not-allowed"
                        >
                          INDISPONÍVEL
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SEÇÃO 3: VANTAGENS DE SER EUROMOTORS */}
            <section id="vantagens" className="space-y-6">
              <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
                VANTAGENS DE SER EUROMOTORS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vantagem 1 */}
                <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      DESCONTOS EXCLUSIVOS
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Condições especiais em produtos, peças e acessórios com nossos parceiros
                      credenciados.
                    </p>
                  </div>
                </div>

                {/* Vantagem 2 */}
                <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      PARCEIROS PREMIUM
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Rede selecionada de parceiros que compartilham da nossa paixão por duas rodas.
                    </p>
                  </div>
                </div>

                {/* Vantagem 3 */}
                <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      EVENTOS EXCLUSIVOS
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Passeios, encontros e eventos exclusivos para membros do clube.
                    </p>
                  </div>
                </div>

                {/* Vantagem 4 */}
                <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Mountain className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      EXPERIÊNCIAS ÚNICAS
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Rotas incríveis, boa companhia e momentos que ficam para sempre na memória.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 4: GALERIA DE MOMENTOS */}
            <section id="galeria" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
                  GALERIA DE MOMENTOS
                </h2>
                <a
                  href="#galeria-completa"
                  className="text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 font-montserrat"
                >
                  VER GALERIA COMPLETA <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Grid 5 Colunas de Imagens */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {galleryPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative h-28 rounded-md overflow-hidden border border-[#1c2538] group cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={`Galeria de Momentos ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* LADO DIREITO: SIDEBAR (col-span-4) */}
          <aside id="cadastro-form" className="lg:col-span-4 space-y-8">
            {/* Form de Cadastro Sempre Visível */}
            <SidebarSignup onSuccess={loadData} />

            {/* Card da Área do Membro caso o usuário esteja logado ou demonstrativo */}
            <SidebarMemberWidget />
          </aside>
        </div>
      </main>

      {/* Rodapé */}
      <Footer />

      {/* Modal de Inscrição em Passeio */}
      <RideRegistrationModal
        ride={selectedRide}
        user={user}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  )
}
