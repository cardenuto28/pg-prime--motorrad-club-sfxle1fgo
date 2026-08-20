import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  ShieldCheck,
  Mail,
  Building2,
  UserCheck,
  Database,
  Target,
  Scale,
  Users,
  Share2,
  Bell,
  Lock,
  Archive,
  Award,
  RefreshCw,
} from 'lucide-react'

export default function PoliticaPrivacidade() {
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
            POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS
          </h1>

          <div className="text-sm sm:text-base font-bold text-slate-300 font-montserrat tracking-wide uppercase">
            EUROMOTORS MOTORRAD CLUB
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Última atualização: agosto de 2026
          </p>

          <div className="w-16 h-1 bg-[#0066FF] mx-auto rounded-full shadow-[0_0_12px_rgba(0,102,255,0.8)]" />
        </div>

        {/* Card Principal do Documento */}
        <div className="bg-[#0b0f19] border border-[#162033] rounded-xl p-6 sm:p-10 md:p-12 shadow-2xl space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          {/* Introdução */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <p>
              O <strong className="text-white font-bold">Euromotors Motorrad Club</strong> valoriza
              a privacidade, a segurança e a transparência no relacionamento com seus membros,
              clientes, acompanhantes e participantes de seus eventos e experiências.
            </p>
            <p>
              Esta Política de Privacidade explica como os dados pessoais são coletados, utilizados,
              armazenados, compartilhados e protegidos no âmbito do Euromotors Motorrad Club, em
              conformidade com a{' '}
              <strong className="text-white font-bold">
                Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD)
              </strong>
              .
            </p>
          </div>

          {/* 1. QUEM SOMOS */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              1. QUEM SOMOS
            </h2>
            <p>
              O Euromotors Motorrad Club é uma iniciativa de relacionamento da BMW Euro Motors
              Jundiaí destinada aos seus clientes, com o objetivo de promover experiências,
              passeios, viagens, eventos, benefícios, relacionamento e ações exclusivas ligadas ao
              universo Motorrad.
            </p>
          </div>

          {/* 2. DADOS PESSOAIS QUE PODERÃO SER COLETADOS */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              2. DADOS PESSOAIS QUE PODERÃO SER COLETADOS
            </h2>
            <p>
              Para realização do cadastro e participação nas atividades do Club, poderão ser
              tratados dados como:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-2 sm:pl-4 my-4">
              {[
                'Nome completo;',
                'CPF;',
                'Telefone e WhatsApp;',
                'E-mail;',
                'Cidade;',
                'Marca da motocicleta;',
                'Modelo da motocicleta;',
                'Ano da motocicleta;',
                'Identificação de membro;',
                'Histórico de inscrições e participação em passeios e eventos;',
                'Dados do acompanhante ou garupa quando informados;',
                'Informações necessárias à organização e segurança dos eventos;',
                'Fotografias, vídeos e demais registros audiovisuais, quando autorizados;',
                'Informações técnicas de acesso ao site, quando aplicável.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Somente serão solicitadas informações compatíveis com as finalidades do Euromotors
              Motorrad Club.
            </p>
          </div>

          {/* 3. PARA QUE UTILIZAMOS OS DADOS */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Target className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              3. PARA QUE UTILIZAMOS OS DADOS
            </h2>
            <p>Os dados pessoais poderão ser utilizados para:</p>
            <ul className="space-y-2.5 pl-2 sm:pl-4 my-4">
              {[
                'Realizar e administrar o cadastro no Euromotors Motorrad Club;',
                'Confirmar a condição de cliente e elegibilidade para participação no Club;',
                'Emitir e validar a carteirinha digital do membro;',
                'Administrar inscrições em passeios, viagens, cursos, encontros e eventos;',
                'Identificar piloto e eventual garupa;',
                'Controlar vagas e presença nas experiências promovidas pelo Club;',
                'Enviar informações operacionais sobre os eventos;',
                'Disponibilizar benefícios exclusivos;',
                'Manter histórico de participação do membro;',
                'Realizar atendimento ao cliente e suporte;',
                'Enviar comunicações relacionadas ao Club;',
                'Cumprir obrigações legais e regulatórias;',
                'Prevenir fraudes e garantir a segurança dos membros e da plataforma;',
                'Produzir registros institucionais e de comunicação, quando houver autorização aplicável.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. BASES LEGAIS */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              4. BASES LEGAIS
            </h2>
            <p>
              O tratamento dos dados pessoais será realizado de acordo com as bases legais previstas
              na LGPD aplicáveis a cada finalidade, incluindo, quando cabível:
            </p>
            <ul className="space-y-2.5 pl-2 sm:pl-4 my-4">
              {[
                'Execução de contrato ou procedimentos relacionados à adesão ao Club;',
                'Cumprimento de obrigação legal ou regulatória;',
                'Legítimo interesse, mediante avaliação adequada dos direitos e expectativas do titular;',
                'Exercício regular de direitos;',
                'Proteção da vida ou da integridade física quando aplicável;',
                'Consentimento do titular, nos casos em que essa seja a base legal apropriada.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              O consentimento não será utilizado de forma genérica quando outra base legal for mais
              adequada à finalidade do tratamento.
            </p>
          </div>

          {/* 5. DADOS DO GARUPA OU ACOMPANHANTE */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              5. DADOS DO GARUPA OU ACOMPANHANTE
            </h2>
            <p>
              O membro poderá cadastrar previamente um acompanhante ou informar os dados do garupa
              durante a inscrição em determinado passeio.
            </p>
            <p>
              Ao fornecer dados de terceiros, o membro declara que possui legitimidade para
              informá-los e que o acompanhante foi comunicado sobre a utilização de seus dados para
              organização do evento.
            </p>
            <p>
              A cada inscrição deverá ser informado obrigatoriamente se o participante comparecerá
              ou não com garupa.
            </p>
          </div>

          {/* 6. COMPARTILHAMENTO DE DADOS */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              6. COMPARTILHAMENTO DE DADOS
            </h2>
            <p>
              Os dados poderão ser compartilhados, quando necessário, com fornecedores e parceiros
              que auxiliem na realização das atividades do Club, como:
            </p>
            <ul className="space-y-2.5 pl-2 sm:pl-4 my-4">
              {[
                'Empresas responsáveis pela plataforma tecnológica;',
                'Prestadores de serviços de comunicação;',
                'Organizadores de eventos;',
                'Hotéis, restaurantes ou fornecedores envolvidos em viagens e experiências;',
                'Parceiros responsáveis por benefícios;',
                'Prestadores de serviços de tecnologia e segurança;',
                'Autoridades públicas, quando exigido por lei ou ordem competente.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>O compartilhamento será limitado às informações necessárias para cada finalidade.</p>
            <p>
              Os parceiros e fornecedores deverão tratar os dados pessoais de acordo com a
              legislação aplicável e com medidas adequadas de segurança.
            </p>
          </div>

          {/* 7. COMUNICAÇÕES */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              7. COMUNICAÇÕES
            </h2>
            <p>
              Os membros poderão receber comunicações relacionadas ao Euromotors Motorrad Club,
              incluindo:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-2 sm:pl-4 my-4">
              {[
                'Confirmações de inscrição;',
                'Informações sobre passeios;',
                'Alterações de horários ou trajetos;',
                'Comunicados operacionais;',
                'Convites para eventos;',
                'Benefícios;',
                'Experiências e ações do Club.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Comunicações de natureza promocional serão realizadas observando a legislação
              aplicável e as preferências do titular.
            </p>
          </div>

          {/* 8. SEGURANÇA DOS DADOS */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              8. SEGURANÇA DOS DADOS
            </h2>
            <p>
              Adotamos medidas administrativas, organizacionais e tecnológicas destinadas a proteger
              os dados pessoais contra situações como:
            </p>
            <ul className="space-y-2.5 pl-2 sm:pl-4 my-4">
              {[
                'Acesso não autorizado;',
                'Perda;',
                'Alteração indevida;',
                'Divulgação não autorizada;',
                'Destruição;',
                'Tratamento incompatível com esta Política.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Nenhum sistema é completamente imune a riscos. Por isso, as medidas de proteção são
              continuamente avaliadas e aprimoradas.
            </p>
          </div>

          {/* 9. ARMAZENAMENTO E RETENÇÃO */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Archive className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              9. ARMAZENAMENTO E RETENÇÃO
            </h2>
            <p>
              Os dados pessoais serão armazenados pelo período necessário para cumprir as
              finalidades descritas nesta Política, respeitando obrigações legais, regulatórias,
              contratuais e a necessidade de exercício regular de direitos.
            </p>
            <p>
              Após o encerramento das finalidades aplicáveis, os dados poderão ser eliminados,
              anonimizados ou mantidos quando houver fundamento legal para sua conservação.
            </p>
          </div>

          {/* 10. DIREITOS DO TITULAR */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              10. DIREITOS DO TITULAR
            </h2>
            <p>Nos termos da LGPD, o titular poderá solicitar, quando aplicável:</p>
            <ul className="space-y-2.5 pl-2 sm:pl-4 my-4">
              {[
                'Confirmação da existência de tratamento;',
                'Acesso aos seus dados pessoais;',
                'Correção de dados incompletos, inexatos ou desatualizados;',
                'Informações sobre compartilhamento;',
                'Anonimização, bloqueio ou eliminação de dados tratados em desconformidade com a legislação;',
                'Eliminação de dados tratados com base em consentimento, observadas as hipóteses legais de conservação;',
                'Revogação do consentimento;',
                'Informação sobre a possibilidade de não fornecer consentimento e as consequências dessa escolha;',
                'Demais direitos previstos pela legislação.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-[#0f1523] border border-[#1d2b45] rounded-lg p-5 sm:p-6 text-slate-200 space-y-3">
              <p>As solicitações deverão ser encaminhadas para:</p>
              <div className="flex items-center gap-2 text-white font-medium">
                <Mail className="w-4 h-4 text-[#0066FF] flex-shrink-0" />
                <span>
                  <strong>E-mail:</strong>{' '}
                  <a
                    href="mailto:eventos@grupoeuromotors.com.br"
                    className="text-[#0066FF] hover:underline"
                  >
                    eventos@grupoeuromotors.com.br
                  </a>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Poderá ser solicitada confirmação de identidade para garantir que as informações
                sejam disponibilizadas ao verdadeiro titular.
              </p>
            </div>
          </div>

          {/* 11. ALTERAÇÕES DESTA POLÍTICA */}
          <div className="space-y-4 border-b border-[#162033] pb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <RefreshCw className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              11. ALTERAÇÕES DESTA POLÍTICA
            </h2>
            <p>
              Esta Política poderá ser atualizada para refletir alterações legais, regulatórias,
              tecnológicas ou operacionais.
            </p>
            <p>
              A versão mais atual estará permanentemente disponível no site do Euromotors Motorrad
              Club.
            </p>
          </div>

          {/* 12. CONTATO */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-montserrat uppercase tracking-wide flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-[#0066FF] flex-shrink-0" />
              12. CONTATO
            </h2>
            <p>Em caso de dúvidas sobre esta Política ou sobre o tratamento de dados pessoais:</p>
            <div className="bg-[#0f1523] border border-[#1d2b45] rounded-lg p-5 sm:p-6 text-slate-200 space-y-2">
              <p className="font-bold text-white">
                Euromotors Motorrad Club / BMW Euro Motors Jundiaí
              </p>
              <div className="flex items-center gap-2 text-slate-200">
                <Mail className="w-4 h-4 text-[#0066FF] flex-shrink-0" />
                <span>
                  <strong>E-mail:</strong>{' '}
                  <a
                    href="mailto:eventos@grupoeuromotors.com.br"
                    className="text-[#0066FF] hover:underline"
                  >
                    eventos@grupoeuromotors.com.br
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
