import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ShieldCheck, FileText, Camera, CheckCircle2 } from 'lucide-react'

export default function Termos() {
  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-[#0066FF] selection:text-white flex flex-col justify-between">
      <Header />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header da Página */}
        <div className="mb-10 sm:mb-14 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] text-xs font-bold uppercase tracking-wider font-montserrat">
            <ShieldCheck className="w-4 h-4 text-[#0066FF]" />
            Documento Oficial
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-montserrat tracking-tight leading-tight uppercase">
            TERMO DE ADESÃO, PARTICIPAÇÃO E AUTORIZAÇÃO DE USO DE IMAGEM
          </h1>

          <div className="w-16 h-1 bg-[#0066FF] mx-auto rounded-full shadow-[0_0_12px_rgba(0,102,255,0.8)]" />
        </div>

        {/* Card Principal do Documento */}
        <div className="bg-[#0b0f19] border border-[#162033] rounded-xl p-6 sm:p-10 md:p-12 shadow-2xl space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          {/* Seção Principal */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              AUTORIZAÇÃO OBRIGATÓRIA DE USO DE IMAGEM E VOZ
            </h2>

            <p>
              A participação no <strong className="text-white font-bold">PG PRIME CLUB</strong>{' '}
              envolve passeios, viagens, encontros e experiências coletivas, nos quais poderão ser
              realizados registros fotográficos e audiovisuais do evento, do grupo e dos
              participantes.
            </p>

            <p>
              Em razão da natureza coletiva dessas experiências e da impossibilidade operacional de
              controlar individualmente quem poderá ou não aparecer nos registros realizados durante
              os eventos,{' '}
              <strong className="text-white font-bold">
                a autorização de uso de imagem e voz constitui condição para adesão e permanência no
                PG PRIME CLUB
              </strong>
              .
            </p>

            <p>
              Ao aderir ao Club, o participante autoriza, de forma gratuita, o uso de sua imagem e
              voz <strong className="text-white font-bold">exclusivamente</strong> nos registros
              produzidos no contexto das atividades do Club, incluindo:
            </p>

            {/* Lista 1 */}
            <ul className="space-y-2.5 pl-2 sm:pl-4 my-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-white font-semibold">fotos do passeio</strong>;
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-white font-semibold">fotos do grupo</strong>;
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>
                  <strong className="text-white font-semibold">vídeos do passeio</strong>;
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>
                  registros realizados em encontros, viagens, cafés da manhã, eventos e experiências
                  promovidas pelo PG PRIME CLUB.
                </span>
              </li>
            </ul>
          </div>

          {/* Seção de Divulgação e Meios */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <p>
              Essa autorização destina-se{' '}
              <strong className="text-white font-bold">exclusivamente</strong> à divulgação
              institucional e promocional das atividades do PG PRIME CLUB e da PG PRIME, podendo os
              registros ser utilizados em:
            </p>

            {/* Lista 2 */}
            <ul className="space-y-2.5 pl-2 sm:pl-4 my-4">
              <li className="flex items-start gap-3">
                <Camera className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>site institucional;</span>
              </li>
              <li className="flex items-start gap-3">
                <Camera className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>redes sociais;</span>
              </li>
              <li className="flex items-start gap-3">
                <Camera className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>materiais digitais;</span>
              </li>
              <li className="flex items-start gap-3">
                <Camera className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>vídeos institucionais;</span>
              </li>
              <li className="flex items-start gap-3">
                <Camera className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>campanhas de divulgação do Club;</span>
              </li>
              <li className="flex items-start gap-3">
                <Camera className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-1" />
                <span>
                  apresentações e comunicações relacionadas às atividades do PG PRIME CLUB.
                </span>
              </li>
            </ul>

            <p>
              Fica claro que esta autorização está limitada aos registros vinculados às atividades e
              experiências do Club,{' '}
              <strong className="text-white font-bold">
                não se estendendo a usos alheios a esse contexto
              </strong>
              .
            </p>
          </div>

          {/* Seção de Garantias e Ciente */}
          <div className="space-y-5">
            <p>
              A utilização da imagem deverá respeitar a honra, a dignidade e a reputação do
              participante, não podendo ocorrer de forma ilícita, ofensiva, vexatória,
              discriminatória ou incompatível com a finalidade institucional e promocional do Club.
            </p>

            <div className="bg-[#0f1523] border border-[#1d2b45] rounded-lg p-5 sm:p-6 text-slate-200">
              <p className="font-medium">
                O participante declara estar ciente de que, por se tratar de condição necessária
                para participação nas experiências coletivas do Club, a não concordância com esta
                autorização inviabiliza sua adesão e permanência no{' '}
                <strong className="text-[#0066FF] font-bold">PG PRIME CLUB</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
