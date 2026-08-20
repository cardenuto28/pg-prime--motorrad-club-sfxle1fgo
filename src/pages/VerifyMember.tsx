import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  User,
  Crown,
  Calendar,
  Bike,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react'
import { UserProfile, userService } from '@/services/api'
import { formatMemberId, getMemberCategory } from '@/lib/member'
import { Button } from '@/components/ui/button'
import logoImage from '@/assets/logo-e67e1.jpeg'

export const VerifyMember: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadMember()
  }, [id])

  const loadMember = async () => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setNotFound(false)
    try {
      const user = await userService.getUserById(id)
      if (user) {
        setMember(user)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      console.error('Erro ao verificar membro:', err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const isAtivo = member && (member.status === 'ativo' || member.role === 'admin')
  const isPendente = member && member.status === 'pendente'
  const isBloqueadoOuInativo =
    member && (member.status === 'inativo' || member.status === 'bloqueado')

  return (
    <div className="min-h-screen bg-[#05070e] text-[#e2e8f0] flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Brand Bar */}
      <header className="border-b border-[#182335] bg-[#070a12]/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="Euro Motors Motorrad Club"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-400 font-montserrat border border-blue-500/30 bg-blue-950/40 px-2.5 py-1 rounded">
              VERIFICADOR OFICIAL
            </span>
          </div>
        </div>
      </header>

      {/* Main Card Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {loading ? (
          <div className="bg-[#0b101a] border border-[#1d293d] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium font-montserrat">
              Consultando registro oficial no Euro Motors Club...
            </p>
          </div>
        ) : notFound || !member ? (
          <div className="bg-[#0b101a] border border-red-900/50 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-red-950/70 border-2 border-red-700/60 flex items-center justify-center text-red-400 mx-auto">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black tracking-[0.2em] text-red-400 uppercase font-montserrat">
                VALIDAÇÃO FALHOU
              </span>
              <h1 className="text-2xl font-black text-white uppercase font-montserrat">
                CARTEIRINHA NÃO ENCONTRADA
              </h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Não foi possível encontrar nenhum registro ativo com o identificador fornecido. O
                código pode estar inválido ou o membro foi removido da base oficial.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/">
                <Button
                  variant="outline"
                  className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Ir para a Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0e17] border border-[#1c273a] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {/* Status Header Banner */}
            <div
              className={`p-6 text-center space-y-2 border-b ${
                isAtivo
                  ? 'bg-gradient-to-b from-emerald-950/60 to-emerald-950/20 border-emerald-800/50'
                  : isPendente
                    ? 'bg-gradient-to-b from-amber-950/60 to-amber-950/20 border-amber-800/50'
                    : 'bg-gradient-to-b from-red-950/60 to-red-950/20 border-red-800/50'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center border-2 shadow-lg ${
                  isAtivo
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300 shadow-emerald-950/50'
                    : isPendente
                      ? 'bg-amber-900/60 border-amber-500 text-amber-300 shadow-amber-950/50'
                      : 'bg-red-900/60 border-red-500 text-red-300 shadow-red-950/50'
                }`}
              >
                {isAtivo ? (
                  <CheckCircle2 className="w-9 h-9" />
                ) : isPendente ? (
                  <AlertTriangle className="w-9 h-9" />
                ) : (
                  <XCircle className="w-9 h-9" />
                )}
              </div>

              <div className="space-y-1">
                <span
                  className={`text-[10px] font-black tracking-[0.25em] uppercase font-montserrat ${
                    isAtivo ? 'text-emerald-400' : isPendente ? 'text-amber-400' : 'text-red-400'
                  }`}
                >
                  STATUS OFICIAL
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-montserrat">
                  {isAtivo
                    ? 'MEMBRO ATIVO'
                    : isPendente
                      ? 'CADASTRO PENDENTE'
                      : 'ACESSO NEGADO / INATIVO'}
                </h1>
                <p className="text-xs text-slate-300">
                  {isAtivo
                    ? 'Carteirinha digital válida para acesso e benefícios do clube.'
                    : isPendente
                      ? 'O cadastro deste membro ainda está aguardando aprovação da administração.'
                      : 'O cadastro deste membro está suspenso, bloqueado ou inativo.'}
                </p>
              </div>
            </div>

            {/* Member Card Details */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Nome e ID */}
              <div className="bg-[#0f1422] border border-[#202c42] rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg flex-shrink-0">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                      NOME DO MEMBRO
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold text-white truncate font-montserrat">
                      {member.name}
                    </h2>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                    ID OFICIAL
                  </span>
                  <span className="text-xs sm:text-sm font-black text-blue-400 font-mono tracking-wider">
                    {formatMemberId(member)}
                  </span>
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Categoria */}
                <div className="bg-[#0f1422] border border-[#202c42] rounded-lg p-3 flex items-start gap-3">
                  <Crown className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                      CATEGORIA
                    </span>
                    <span className="text-xs font-bold text-white uppercase font-montserrat">
                      {getMemberCategory(member)}
                    </span>
                  </div>
                </div>

                {/* Validade */}
                <div className="bg-[#0f1422] border border-[#202c42] rounded-lg p-3 flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                      VALIDADE
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase font-montserrat">
                      {isAtivo ? 'Membro Ativo' : 'Indisponível'}
                    </span>
                  </div>
                </div>

                {/* Moto */}
                {((member.bike_brand && member.bike_model) || member.bike_model) && (
                  <div className="sm:col-span-2 bg-[#0f1422] border border-[#202c42] rounded-lg p-3 flex items-start gap-3">
                    <Bike className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                        MOTOCICLETA REGISTRADA
                      </span>
                      <span className="text-xs font-bold text-white uppercase font-montserrat">
                        {[member.bike_brand, member.bike_model, member.bike_year]
                          .filter(Boolean)
                          .join(' ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé de autenticação */}
              <div className="pt-4 border-t border-[#1c273a] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-montserrat">
                    EURO MOTORS MOTORRAD CLUB JUNDIAÍ
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Autenticado via Skip Cloud PocketBase Security
                  </p>
                </div>
                <Link to="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-[11px] gap-1"
                  >
                    Site Oficial <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#182335] bg-[#070a12] py-4 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
          ESTRADA • LIBERDADE • IRMANDADE — EUROMOTORS MOTORRAD CLUB
        </p>
      </footer>
    </div>
  )
}

export default VerifyMember
