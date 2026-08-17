import React from 'react'
import { ChevronLeft, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  /** Onde o erro aconteceu (ex.: "área administrativa"). */
  context?: string
}

interface State {
  hasError: boolean
  message?: string
}

/**
 * Error boundary genérico para o tema dark do site.
 *
 * Captura erros de renderização em uma subárvore (ex.: uma página do admin)
 * sem derrubar a aplicação inteira, evitando telas em branco. Sem ele, um
 * erro de runtime em uma página faria o React Router "perder" a rota e o
 * usuário enxergaria a página 404 como se a rota não existisse.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : undefined
    return { hasError: true, message }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('ErrorBoundary capturou erro de renderização:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: undefined })
  }

  render() {
    if (this.state.hasError) {
      const ctx = this.props.context || 'esta página'
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md w-full">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-white font-montserrat tracking-tight uppercase mb-2">
              Algo deu errado
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Não foi possível carregar {ctx}. Tente novamente em instantes.
            </p>
            {this.state.message && (
              <p className="text-[10px] text-slate-600 leading-relaxed mb-6 break-words">
                {this.state.message}
              </p>
            )}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-md transition-all font-montserrat"
              >
                Tentar novamente
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border border-[#232d3f] bg-[#101622] hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-md transition-all font-montserrat"
              >
                <ChevronLeft className="w-4 h-4" /> Início
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
