import React, { useMemo, useState } from 'react'
import {
  Printer,
  QrCode,
  Store,
  ExternalLink,
  Copy,
  Sparkles,
  ShieldCheck,
  Download,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import logoImage from '@/assets/logo-e67e1.jpeg'
import memberCardLogo from '@/assets/image-ae9a6.png'

export const AdminStoreQrCode: React.FC = () => {
  const { toast } = useToast()
  const [styleMode, setStyleMode] = useState<'dark' | 'print-clean'>('dark')

  // URL exata especificada no briefing
  const targetUrl = 'https://euromotorsclub.goskip.app/checkin-loja'

  // Geração do QR Code em alta resolução
  const qrCodeImageUrl = useMemo(() => {
    const encoded = encodeURIComponent(targetUrl)
    // 600x600 px para impressão nítida
    return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encoded}&bgcolor=ffffff&color=0a1120&margin=2`
  }, [targetUrl])

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl)
      toast({
        title: 'Link copiado!',
        description: 'URL do check-in copiada para a área de transferência.',
      })
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header com ações (oculto na impressão) */}
      <section className="bg-gradient-to-br from-[#0f131c] to-[#0a0d14] border border-[#1d2638] rounded-md p-5 sm:p-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-montserrat">
              Painel Administrativo
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-montserrat tracking-tight mt-1 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-500" />
              QR Code da Loja para Impressão
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Placa oficial para balcão/recepção da concessionária Euro Motors. Membros escaneiam
              para acumular +10 pontos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="border-[#222c3f] bg-[#101622] text-slate-300 hover:text-white text-xs gap-1.5 font-montserrat font-bold"
            >
              <Copy className="w-3.5 h-3.5" /> COPIAR LINK
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider font-montserrat px-5 py-2 shadow-lg shadow-blue-950/60 gap-2"
            >
              <Printer className="w-4 h-4" /> 🖨️ IMPRIMIR
            </Button>
          </div>
        </div>
      </section>

      {/* Orientações rápidas de uso no balcão */}
      <section className="bg-[#0e131d] border border-[#1c2538] rounded-md p-4 flex items-start gap-3 print:hidden text-xs text-slate-300">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white font-montserrat uppercase tracking-wider text-[11px]">
            Dica para recepção e balcão:
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Imprima esta folha em tamanho A4 ou formato display de mesa. Ao escanear a placa com a
            câmera do smartphone, o membro ativo é autenticado e pontua <strong>+10 pontos</strong>{' '}
            automaticamente (limite de 1 check-in de loja por dia por membro).
          </p>
          <div className="pt-1 text-[11px] text-blue-400 font-mono flex items-center gap-1">
            Destino do QR Code: <strong>{targetUrl}</strong>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DISPLAY OFICIAL DE IMPRESSÃO - ESTILO DARK PREMIUM EURO MOTORS */}
      {/* ========================================================================= */}
      <div className="flex justify-center my-4">
        <div
          id="printable-display"
          className="relative w-full max-w-[580px] bg-[#07090e] border-2 border-[#1e2a3f] rounded-3xl p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-center space-y-7 select-none overflow-hidden print:shadow-none print:border-black print:rounded-none print:max-w-none print:w-full print:p-8"
        >
          {/* Fundo com texturas e iluminação premium */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#0066FF 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* 1. Header do Display com Logotipo */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <img
                src={logoImage}
                alt="Euro Motors Motorrad Club"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-600/50 text-blue-300 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] font-montserrat shadow-md shadow-blue-950/50">
              <Store className="w-3.5 h-3.5 text-blue-400" /> CONCESSIONÁRIA OFICIAL
            </div>

            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-white font-montserrat uppercase tracking-tight">
                Check-in de Visita na Loja
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium font-montserrat">
                Ganhe <span className="text-blue-400 font-bold">+10 pontos</span> no ranking do Euro
                Motors Club
              </p>
            </div>
          </div>

          {/* 2. QR Code GRANDE emoldurado em branco/azul */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative p-5 sm:p-6 bg-white rounded-2xl shadow-[0_0_35px_rgba(0,102,255,0.4)] border-4 border-blue-500/60 transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={qrCodeImageUrl}
                alt="QR Code Check-in Loja Euro Motors"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-lg block"
              />

              {/* Mini badge central no QR Code */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-[#090d15] border-2 border-blue-500 shadow-2xl flex items-center justify-center p-1.5">
                  <img
                    src={memberCardLogo}
                    alt="Logo Motorrad"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Instruções e Marca Euro Motors */}
          <div className="relative z-10 space-y-4 pt-1">
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-extrabold text-white font-montserrat uppercase tracking-wider flex items-center justify-center gap-2">
                <span>📱</span> Escaneie para registrar sua visita
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Abra a câmera do seu celular, aponte para o QR Code e confirme sua presença na loja.
              </p>
            </div>

            {/* Rodapé com detalhes de benefícios */}
            <div className="pt-4 border-t border-[#1a2538] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 font-montserrat uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>EXCLUSIVO PARA MEMBROS ATIVOS</span>
              </div>
              <div className="text-blue-400 font-bold">1 CHECK-IN POR DIA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminStoreQrCode
