import React, { useState } from 'react'
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Download,
  Info,
  Layers,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { BENEFITS_MATRIX_URL } from '@/lib/branding'

export const BENEFITS_MATRIX_IMAGE_URL = BENEFITS_MATRIX_URL

interface BenefitsMatrixSectionProps {
  className?: string
  compact?: boolean
  subtitle?: string
}

export const BenefitsMatrixSection: React.FC<BenefitsMatrixSectionProps> = ({
  className = '',
  compact: _compact = false,
  subtitle = 'Compare todas as categorias Bronze, Prata, Gold e Platinum e veja as vantagens exclusivas do PG PRIME CLUB.',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleOpen = () => {
    setZoomLevel(1)
    setIsOpen(true)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.3, 2.5))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.3, 0.7))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  return (
    <section className={`relative w-full ${className}`}>
      <div className="bg-[#0b0f17] border border-[#1a2333] rounded-xl overflow-hidden shadow-2xl relative group/card">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Cabeçalho da Seção */}
        <div className="relative z-10 p-5 sm:p-7 border-b border-[#161f2e] bg-[#0d131f]/80 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-blue-400 bg-blue-950/70 border border-blue-600/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-montserrat">
              <Layers className="w-3.5 h-3.5 text-[#0066FF]" /> Categorias & Vantagens
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-montserrat tracking-tight uppercase">
              Matriz de Benefícios por Categoria
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              onClick={handleOpen}
              className="bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs tracking-wider px-4 py-2.5 h-auto rounded-lg gap-2 uppercase shadow-lg shadow-blue-600/20 transition-all font-montserrat"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Ver em Tela Cheia</span>
            </Button>
          </div>
        </div>

        {/* Container da Imagem completo */}
        <div className="relative p-3 sm:p-6 bg-[#07090e]/90">
          <div
            onClick={handleOpen}
            className="relative cursor-pointer rounded-lg overflow-hidden border border-[#1b263a] bg-[#07090e] group/preview transition-all hover:border-[#0066FF]/60 hover:shadow-xl hover:shadow-[#0066FF]/10"
            title="Clique para abrir com controles de zoom em tela cheia"
          >
            {/* Imagem em tamanho natural / largura total */}
            <div className="relative w-full flex items-center justify-center bg-[#07090e]">
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0d131f] min-h-[300px]">
                  <div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={BENEFITS_MATRIX_IMAGE_URL}
                alt="Matriz de Benefícios por Categoria — PG PRIME Motorrad Club"
                className={`w-full h-auto block transition-all duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0 min-h-[200px]'
                }`}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
              />
            </div>

            {/* Hover overlay hint sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4 pointer-events-none">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0066FF]/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover/preview:translate-y-0 transition-transform duration-300 font-montserrat uppercase tracking-wider">
                <ZoomIn className="w-4 h-4" /> Clique para abrir em tela cheia com zoom
              </span>
            </div>

            {/* Badges de Categoria no topo */}
            <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-semibold text-slate-200 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bronze • Prata • Gold • Platinum</span>
            </div>
          </div>

          {/* Dica de usabilidade */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0066FF]" />
              Imagem completa da Matriz de Benefícios. Para zoom e detalhes adicionais, clique na
              imagem ou em "Ver em Tela Cheia".
            </span>
            <button
              type="button"
              onClick={handleOpen}
              className="text-[#0066FF] hover:text-blue-400 font-semibold underline underline-offset-2 tracking-wide"
            >
              Abrir visualizador com zoom
            </button>
          </div>
        </div>
      </div>

      {/* Dialog / Modal em Tela Cheia */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] w-full lg:max-w-6xl max-h-[92vh] h-[92vh] p-0 bg-[#07090e] border-[#1b263a] text-white flex flex-col overflow-hidden">
          {/* Header do Modal */}
          <DialogHeader className="px-5 py-3.5 border-b border-[#182030] bg-[#0c121e] flex flex-row items-center justify-between space-y-0 pr-12">
            <div>
              <DialogTitle className="text-base sm:text-lg font-black font-montserrat uppercase tracking-tight text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0066FF]" />
                Matriz de Benefícios por Categoria
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                PG PRIME CLUB — Níveis Bronze, Prata, Gold e Platinum
              </DialogDescription>
            </div>

            {/* Controles de Zoom */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#141d2d] border border-[#212f45] rounded-lg p-1 mr-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.7}
                className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-[#1f2d44]"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[11px] font-mono font-semibold text-blue-400 px-1.5 min-w-[45px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
                className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-[#1f2d44]"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-[#1f2d44]"
                title="Redefinir Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Área com Scroll e Zoom */}
          <div className="flex-1 overflow-auto bg-[#05070a] p-3 sm:p-6 flex items-center justify-center relative touch-pan-x touch-pan-y">
            <div
              className="transition-transform duration-200 ease-out flex items-center justify-center min-w-full"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
              }}
            >
              <img
                src={BENEFITS_MATRIX_IMAGE_URL}
                alt="Matriz de Benefícios por Categoria — PG PRIME Motorrad Club"
                className="max-w-full h-auto object-contain rounded shadow-2xl select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Rodapé com Ações */}
          <div className="px-4 sm:px-5 py-3 border-t border-[#182030] bg-[#0c121e] flex flex-wrap items-center justify-between gap-2">
            {/* Controles mobile de zoom */}
            <div className="flex sm:hidden items-center gap-1.5 bg-[#141d2d] border border-[#212f45] rounded-lg p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.7}
                className="h-7 w-7 p-0 text-slate-300"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[11px] font-mono font-semibold text-blue-400 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
                className="h-7 w-7 p-0 text-slate-300"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="h-7 w-7 p-0 text-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 hidden md:block">
              * Benefícios cumulativos e condições válidas para membros ativos do Club.
            </p>

            <div className="flex items-center gap-2 ml-auto">
              <a
                href={BENEFITS_MATRIX_IMAGE_URL}
                target="_blank"
                rel="noreferrer"
                download="matriz-beneficios-pg-prime.png"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#141d2d] hover:bg-[#1b263b] border border-[#212f45] px-3 py-1.5 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#0066FF]" />
                <span>Abrir Original</span>
              </a>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 h-auto rounded-md font-montserrat"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
