import React, { useState, useEffect } from 'react'
import { Download, Share, X, Smartphone, WifiOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/use-pwa'
import appIcon from '@/assets/image-dadb6.png'

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isOnline, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  // Check if user previously dismissed banner in this session
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true'
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa_banner_dismissed', 'true')
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await promptInstall()
    } else if (isIOS) {
      setShowIOSModal(true)
    }
  }

  // Offline alert indicator (always high priority)
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 text-black px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold font-montserrat tracking-wider shadow-lg backdrop-blur-sm">
        <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
        <span>MODO OFFLINE — Você está navegando com os recursos em cache</span>
      </div>
    )
  }

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) {
    return null
  }

  // Show only on installable browsers or iOS devices that aren't standalone
  if (!isInstallable && !isIOS) {
    return null
  }

  return (
    <>
      {/* Floating Modern PWA Prompt */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-[#07090e]/95 backdrop-blur-xl border border-[#0066FF]/40 rounded-xl p-4 shadow-2xl shadow-blue-950/80 flex items-center gap-3.5 relative overflow-hidden">
          {/* Neon Glow accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066FF] to-transparent" />

          {/* App Icon */}
          <img
            src={appIcon}
            alt="PG PRIME CLUB"
            className="w-12 h-12 rounded-xl object-contain bg-black border border-[#1e2638] shadow-md shrink-0 p-1"
          />

          {/* Text Info */}
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-white text-xs font-extrabold font-montserrat tracking-wider uppercase truncate">
              PG PRIME CLUB App
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              Instale na tela de início para acesso rápido e offline
            </p>
          </div>

          {/* Action button */}
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-[#0066FF] hover:bg-blue-600 text-white font-extrabold text-[11px] font-montserrat uppercase tracking-wider px-3 py-1.5 h-8 shrink-0 rounded-lg shadow-lg shadow-blue-600/30 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar
          </Button>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Fechar aviso"
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Dialog */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b0e17] border border-[#1e2738] rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2333]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#0066FF]" />
                <h3 className="font-bold text-sm tracking-wider uppercase font-montserrat">
                  Instalar no iOS (iPhone/iPad)
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 bg-[#111624] p-3 rounded-lg border border-[#1b2333]">
                <div className="bg-[#0066FF]/20 text-[#0066FF] p-1.5 rounded font-bold shrink-0">
                  1
                </div>
                <div>
                  Toque no botão <strong className="text-white">Compartilhar</strong> (
                  <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" />) na barra inferior do
                  Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#111624] p-3 rounded-lg border border-[#1b2333]">
                <div className="bg-[#0066FF]/20 text-[#0066FF] p-1.5 rounded font-bold shrink-0">
                  2
                </div>
                <div>
                  Role para baixo e selecione{' '}
                  <strong className="text-white">"Adicionar à Tela de Início"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#111624] p-3 rounded-lg border border-[#1b2333]">
                <div className="bg-[#0066FF]/20 text-[#0066FF] p-1.5 rounded font-bold shrink-0">
                  3
                </div>
                <div>
                  Toque em <strong className="text-white">"Adicionar"</strong> no canto superior
                  direito.
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider font-montserrat py-2"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Entendi
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
