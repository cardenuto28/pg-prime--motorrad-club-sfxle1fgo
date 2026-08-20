import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Crown,
  Calendar,
  Shield,
  Lock,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatMemberId, getMemberCategory, statusLabel } from '@/lib/member'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import memberCardLogo from '@/assets/image-ae9a6.png'
import { CategoryBadge } from '@/components/CategoryBadge'
import { normalizeCategory } from '@/lib/membership'

export const MemberCard: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const memberIdFormatted = useMemo(() => formatMemberId(user), [user])
  const categoryFormatted = useMemo(() => getMemberCategory(user), [user])

  // URL pública de verificação
  const verifyUrl = useMemo(() => {
    if (typeof window !== 'undefined' && user?.id) {
      return `${window.location.origin}/verificar/${user.id}`
    }
    return `https://euromotorsmc.com.br/verificar/${user?.id || 'demo'}`
  }, [user])

  // QR Code URL via serviço estável e rápido de geração de QR Code
  const qrCodeUrl = useMemo(() => {
    const encoded = encodeURIComponent(verifyUrl)
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&bgcolor=ffffff&color=05070e&margin=2`
  }, [verifyUrl])

  const isAtivo = user?.status === 'ativo' || user?.role === 'admin'

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verifyUrl)
      toast({
        title: 'Link copiado!',
        description: 'O link público de validação da carteirinha foi copiado.',
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header com ações */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Área do Membro
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Carteirinha Digital de Membro
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Apresente esta carteirinha para usufruir de todos os benefícios exclusivos do clube.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar Link
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Alerta de Status se não estiver ativo */}
      {!isAtivo && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-md p-4 flex items-start gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 space-y-1">
            <p className="font-bold">
              Cadastro em análise ({statusLabel(user?.status || 'pendente')})
            </p>
            <p className="text-amber-300/80">
              Sua carteirinha está gerada com status pendente. Assim que a administração aprovar seu
              cadastro, o QR Code e a carteirinha validarão como MEMBRO ATIVO automaticamente.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CARTEIRINHA DIGITAL - DESIGN PREMIUM FIEL À IMAGEM DE REFERÊNCIA */}
      {/* ========================================================================= */}
      <div className="flex justify-center">
        <div
          id="digital-card"
          className="relative w-full max-w-[820px] rounded-2xl overflow-hidden bg-[#06080d] text-white border border-[#223049] shadow-[0_20px_60px_rgba(0,0,0,0.85)] select-none print:shadow-none print:border-slate-700"
          style={{
            aspectRatio: '16/10',
            minHeight: '440px',
          }}
        >
          {/* Background Textures & Lighting */}
          {/* Hexagonal mesh pattern top left */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Glowing blue accent flare top right / middle */}
          <div className="absolute -top-16 right-1/4 w-96 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -left-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mountains & Road silhouetted background texture at bottom/center */}
          <svg
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            viewBox="0 0 800 500"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Distant Mountain Peak Layer */}
            <path
              d="M0 380 L120 280 L220 330 L340 230 L440 310 L560 210 L680 290 L800 240 L800 500 L0 500 Z"
              fill="#0f1929"
              opacity="0.6"
            />
            {/* Foreground Mountain Layer */}
            <path
              d="M0 420 L150 320 L270 370 L400 290 L520 360 L650 300 L800 380 L800 500 L0 500 Z"
              fill="#080e18"
              opacity="0.9"
            />
            {/* Road curving into the horizon */}
            <path
              d="M380 320 Q400 400 420 500 L340 500 Q370 410 380 320 Z"
              fill="#1d283a"
              opacity="0.5"
            />
            <path
              d="M380 320 Q395 400 382 500"
              stroke="#0066FF"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.4"
            />
          </svg>

          {/* Outer Border Glow Ring */}
          <div className="absolute inset-0 rounded-2xl border border-blue-500/20 pointer-events-none" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/5 pointer-events-none" />

          {/* Inner Content Grid */}
          <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 z-10">
            {/* TOP HEADER: "CARTEIRINHA DIGITAL DE" + "MEMBRO" */}
            <div className="flex justify-end items-center pr-2 sm:pr-4">
              <div className="text-right">
                <p className="text-[9px] sm:text-[11px] font-black tracking-[0.25em] text-slate-300 uppercase font-montserrat">
                  CARTEIRINHA DIGITAL DE
                </p>
                <div className="relative inline-block">
                  <h2 className="text-2xl sm:text-4xl font-black tracking-[0.1em] text-white uppercase font-montserrat leading-none mt-0.5">
                    MEMBRO
                  </h2>
                  {/* Subtle bright blue line under MEMBRO */}
                  <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#0088ff] to-transparent mt-1 shadow-[0_0_8px_#0088ff]" />
                </div>
              </div>
            </div>

            {/* MAIN BODY: Logo Shield (Left) | User Details (Center) | QR Code (Right) */}
            <div className="grid grid-cols-12 gap-3 sm:gap-6 items-center my-auto py-2">
              {/* Left Col: Motorrad Club Shield (Col 4) */}
              <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-center">
                <div className="relative group transition-transform duration-300 hover:scale-105 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Subtle backglow */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full pointer-events-none" />
                    {/* Shield Logo Image */}
                    <img
                      src={memberCardLogo}
                      alt="Motorrad Club Euromotors"
                      className="relative w-36 sm:w-44 h-auto max-h-52 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
                    />
                  </div>
                </div>
              </div>

              {/* Center Col: Member Data Fields (Col 5) */}
              <div className="col-span-12 sm:col-span-5 space-y-3 sm:space-y-3.5 pl-1">
                {/* 1. Nome do Membro */}
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0d1522] border border-[#22334e] flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                      NOME DO MEMBRO
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-white tracking-wide truncate font-montserrat">
                      {user?.name || 'Membro do Clube'}
                    </p>
                  </div>
                </div>

                {/* 2. Categoria com Badge e Selo */}
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0d1522] border border-[#22334e] flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat mb-0.5">
                      CATEGORIA
                    </span>
                    <div className="flex items-center gap-2">
                      <CategoryBadge
                        category={user?.categoria || user?.category || categoryFormatted}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Status de Associação */}
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0d1522] border border-[#22334e] flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                      STATUS
                    </span>
                    <p
                      className={`text-xs sm:text-sm font-extrabold tracking-wider font-montserrat flex items-center gap-1.5 ${
                        isAtivo ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      <span>
                        {isAtivo
                          ? 'MEMBRO ATIVO'
                          : statusLabel(user?.status || 'pendente').toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 4. ID do Membro */}
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0d1522] border border-[#22334e] flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                      ID DO MEMBRO
                    </span>
                    <p className="text-xs sm:text-sm font-black text-white tracking-[0.12em] font-mono">
                      {memberIdFormatted}
                    </p>
                  </div>
                </div>

                {/* 5. Chassi da Moto (se cadastrado) */}
                {user?.bike_chassi && (
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0d1522] border border-[#22334e] flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase font-montserrat">
                        CHASSI
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-200 tracking-wider font-mono">
                        {user.bike_chassi}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Right Col: QR Code + Exclusive Tag (Col 3) */}
              <div className="col-span-12 sm:col-span-3 flex flex-col items-center justify-center space-y-2 border-t sm:border-t-0 sm:border-l border-[#1a2538] pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[8px] sm:text-[8.5px] font-black tracking-[0.15em] text-blue-400 uppercase font-montserrat text-center leading-tight">
                  ESCANEIE PARA
                  <br />
                  <span className="text-slate-300">VALIDAÇÃO / ACESSO</span>
                </span>

                {/* QR Code Container with subtle frame & mini logo in center */}
                <div className="relative p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] group cursor-pointer">
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir página de verificação"
                  >
                    <img
                      src={qrCodeUrl}
                      alt={`QR Code de validação de ${user?.name}`}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md block"
                    />
                    {/* Mini overlay logo inside QR */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 rounded bg-[#090d15] border border-blue-500/80 overflow-hidden flex items-center justify-center shadow-lg p-0.5">
                        <img
                          src={memberCardLogo}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </a>
                </div>

                {/* Exclusive badge at bottom right */}
                <div className="flex items-center gap-1.5 text-slate-400 text-center pt-0.5">
                  <Lock className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span className="text-[7.5px] sm:text-[8px] font-bold tracking-wider uppercase leading-tight font-montserrat text-slate-300">
                    ACESSO EXCLUSIVO
                    <br />
                    PARA MEMBROS ATIVOS
                  </span>
                </div>
              </div>
            </div>

            {/* BOTTOM FOOTER: EUROMOTORS + BMW MOTORRAD JUNDIAÍ (Left) | SLOGAN (Right) */}
            <div className="pt-3 border-t border-[#182335] flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Brand Logos */}
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-black tracking-[0.18em] text-white uppercase font-montserrat">
                  EUROMOTORS
                </span>

                <div className="h-4 w-[1px] bg-slate-700" />

                <div className="flex items-center gap-1.5">
                  {/* BMW Propeller Badge Sim */}
                  <div className="w-5 h-5 rounded-full border border-white/80 bg-white relative overflow-hidden flex items-center justify-center flex-shrink-0">
                    <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                      <div className="bg-[#0066FF]" />
                      <div className="bg-white" />
                      <div className="bg-white" />
                      <div className="bg-[#0066FF]" />
                    </div>
                    <div className="absolute inset-[1px] rounded-full border border-black/30" />
                  </div>
                  <div className="leading-none text-left">
                    <span className="block text-[8px] font-black tracking-wider text-white uppercase font-montserrat">
                      BMW MOTORRAD
                    </span>
                    <span className="block text-[7.5px] font-extrabold tracking-widest text-blue-400 uppercase font-montserrat">
                      JUNDIAÍ
                    </span>
                  </div>
                </div>
              </div>

              {/* Slogan & Racing Stripes */}
              <div className="flex items-center gap-3">
                <p className="text-[8px] sm:text-[9.5px] font-extrabold tracking-[0.25em] text-slate-300 uppercase font-montserrat">
                  ESTRADA <span className="text-blue-500">•</span> LIBERDADE{' '}
                  <span className="text-blue-500">•</span> IRMANDADE
                </p>

                {/* BMW M-style / Racing accent lines */}
                <div className="flex items-center gap-0.5">
                  <div className="w-1 h-3 -skew-x-12 bg-blue-500" />
                  <div className="w-1 h-3 -skew-x-12 bg-blue-400" />
                  <div className="w-1 h-3 -skew-x-12 bg-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções de Uso */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-5 space-y-3 print:hidden">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-montserrat flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Como utilizar sua carteirinha digital
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-[#141b27] border border-[#202b3d] rounded p-3 space-y-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block font-montserrat">
              1. Identificação Rápida
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Apresente o cartão direto na tela do seu smartphone nos passeios oficiais e eventos.
            </p>
          </div>
          <div className="bg-[#141b27] border border-[#202b3d] rounded p-3 space-y-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block font-montserrat">
              2. Parcerias e Descontos
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Mostre nos estabelecimentos parceiros para garantir suas condições e descontos
              exclusivos.
            </p>
          </div>
          <div className="bg-[#141b27] border border-[#202b3d] rounded p-3 space-y-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block font-montserrat">
              3. Validação em Tempo Real
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Qualquer parceiro pode escanear o QR Code para checar o status ativo instantaneamente.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-[#1c2538]">
          <span>Link público da sua validação:</span>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-mono text-[11px] flex items-center gap-1 truncate max-w-md"
          >
            {verifyUrl} <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      </section>
    </div>
  )
}

export default MemberCard
