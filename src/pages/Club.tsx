import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  Ticket,
  Plane,
  Wrench,
  Droplets,
  GraduationCap,
  Scissors,
  Users,
  CreditCard,
  MessageCircle,
  Bike,
} from 'lucide-react'
import clubHeroBg from '@/assets/chatgpt-image-17-de-ago.de-2026-085401-36fe8.png'

const beneficios = [
  {
    icon: Ticket,
    titulo: 'Convites Preferenciais',
    descricao: 'Convites preferenciais para festas, lançamentos, cafés da manhã e passeios.',
  },
  {
    icon: Plane,
    titulo: 'Viagens Motorrad',
    descricao: 'Condições e descontos exclusivos em viagens Motorrad.',
  },
  {
    icon: Wrench,
    titulo: 'Pós-Vendas Prioritário',
    descricao: 'Prioridade na agenda e condições diferenciadas no pós-vendas.',
  },
  {
    icon: Droplets,
    titulo: 'Lavagem',
    descricao: 'Preço diferenciado na lavagem da moto.',
  },
  {
    icon: GraduationCap,
    titulo: 'Cursos e Experiências',
    descricao: 'Prioridade de inscrição em cursos, viagens e experiências com vagas limitadas.',
  },
  {
    icon: Scissors,
    titulo: 'Barbearia',
    descricao: 'Ações e promoções exclusivas na Barbearia.',
  },
]

export default function Club() {
  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-5xl mx-auto space-y-14 lg:space-y-20">
          {/* HERO BANNER - Exact match with reference visual */}
          <section className="relative rounded-xl overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-center p-6 sm:p-10 md:p-12 border border-[#1a2336] shadow-2xl group">
            {/* Background Image - Vibrant & Vivid without heavy opaque filters */}
            <div className="absolute inset-0 z-0">
              <img
                src={clubHeroBg}
                alt="Euromotors Motorrad Club"
                className="w-full h-full object-cover object-center saturate-[1.12] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
              />
              {/* Soft directional gradients preserving vivid background colors while ensuring readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/90 via-[#07090e]/50 to-transparent max-w-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/80 via-transparent to-black/20" />
            </div>

            {/* Banner Content matching reference image */}
            <div className="relative z-10 space-y-4 max-w-xl">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-white font-montserrat tracking-tight leading-[1.1] uppercase drop-shadow-xl">
                  FAÇA PARTE DO{' '}
                  <span className="block text-[#0066FF] drop-shadow-[0_0_20px_rgba(0,102,255,0.7)]">
                    EUROMOTORS
                  </span>
                  <span className="block text-[#0066FF] drop-shadow-[0_0_20px_rgba(0,102,255,0.7)]">
                    MOTORRAD CLUB
                  </span>
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed drop-shadow">
                Para participar do Euromotors Motorrad Club, você precisa ser cliente da{' '}
                <strong className="text-[#0066FF] font-extrabold">BMW Euro Motors Jundiaí</strong>.
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <span className="w-4 h-0.5 bg-[#0066FF] rounded-full shadow-[0_0_6px_rgba(0,102,255,0.8)]" />
                  <span className="w-3 h-0.5 bg-[#0066FF] rounded-full shadow-[0_0_6px_rgba(0,102,255,0.8)]" />
                  <span className="w-2 h-0.5 bg-[#0066FF] rounded-full shadow-[0_0_6px_rgba(0,102,255,0.8)]" />
                </div>
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug">
                  Venha ser nosso cliente e participe deste ecossistema de experiência Euro Motors.
                </span>
              </div>

              <div className="pt-2">
                <a href="/#cadastro-form">
                  <Button className="bg-[#081226]/90 hover:bg-[#0066FF] text-white font-black text-xs tracking-wider px-6 py-3.5 h-auto rounded-md border border-[#0066FF] shadow-[0_0_20px_rgba(0,102,255,0.4)] hover:shadow-[0_0_25px_rgba(0,102,255,0.8)] transition-all gap-2 uppercase font-montserrat group/btn">
                    <ChevronRight className="w-4 h-4 text-[#0066FF] group-hover/btn:text-white transition-colors" />
                    SEJA NOSSO CLIENTE
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* CONCEITO */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
              O CONCEITO
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Clube exclusivo para clientes Euromotors – Jundiaí, criado para proporcionar acesso
              privilegiado às experiências, eventos e benefícios oferecidos pela BMW Euromotors
              Jundiaí. Um espaço para quem vive a paixão por duas rodas e quer fazer parte de uma
              comunidade que compartilha da mesma direção.
            </p>
          </section>

          {/* QUEM PODE PARTICIPAR */}
          <section className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
                QUEM PODE PARTICIPAR
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                O Euromotors Motorrad Club é destinado a quem já faz parte da família BMW Motorrad
                Euro Motors Jundiaí. Confira os critérios de elegibilidade:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                  <Bike className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                    AQUISIÇÃO RECENTE
                  </h3>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Clientes que adquiriram motocicletas novas ou seminovas nos últimos 4 anos.
                  </p>
                </div>
              </div>
              <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                    RELACIONAMENTO NO PÓS-VENDAS
                  </h3>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Clientes com revisões ativas e relacionamento com o pós-vendas da
                    concessionária.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* BENEFÍCIOS */}
          <section className="space-y-5">
            <h2 className="text-xs font-bold text-slate-400 font-montserrat tracking-widest uppercase">
              BENEFÍCIOS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {beneficios.map(({ icon: Icon, titulo, descricao }) => (
                <div
                  key={titulo}
                  className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex items-start gap-4 hover:border-blue-600/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase font-montserrat tracking-wider">
                      {titulo.toUpperCase()}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CARTEIRINHA & WHATSAPP */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase font-montserrat tracking-wider">
                  CARTEIRINHA EXCLUSIVA E NUMERADA
                </h3>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Cada participante receberá uma carteirinha exclusiva e numerada, que será sua
                  identificação como membro do Euromotors Motorrad Club e deverá ser apresentada nas
                  inscrições para eventos, passeios, viagens, cursos e demais experiências do Clube.
                </p>
              </div>
            </div>
            <div className="bg-[#0e131d] border border-[#1c2538] rounded-md p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-sm bg-[#131b2b] border border-[#222e43] flex items-center justify-center text-blue-500">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase font-montserrat tracking-wider">
                  GRUPO EXCLUSIVO NO WHATSAPP
                </h3>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Os membros terão acesso a um grupo exclusivo no WhatsApp, criado para centralizar
                  todas as informações do Clube e garantir acesso antecipado e prioritário às
                  novidades, lançamentos, eventos, inscrições e experiências disponíveis.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative rounded-md overflow-hidden border border-[#1a2336] bg-gradient-to-r from-[#0b1220] to-[#0e1422] p-8 sm:p-12 text-center space-y-5">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-[#111724] border border-[#202b3f] flex items-center justify-center text-blue-500">
                <Users className="w-7 h-7" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-montserrat tracking-tight uppercase">
                FAÇA PARTE DO CLUBE
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Cliente BMW Motorrad Euro Motors Jundiaí? Solicite seu cadastro e receba sua
                carteirinha exclusiva para participar de todas as experiências do Clube.
              </p>
            </div>
            <div className="flex justify-center">
              <a href="/#cadastro-form">
                <Button className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-7 py-3 h-auto rounded-sm gap-2 shadow-lg shadow-blue-900/30 transition-all uppercase">
                  QUERO FAZER PARTE <ChevronRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
