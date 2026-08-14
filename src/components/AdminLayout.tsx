import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Gift,
  Handshake,
  Images,
  Megaphone,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logoImage from '@/assets/logo-e67e1.jpeg'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/members', label: 'Membros', icon: Users },
  { to: '/admin/rides', label: 'Passeios', icon: Calendar },
  { to: '/admin/registrations', label: 'Inscrições', icon: ClipboardList },
  { to: '/admin/benefits', label: 'Benefícios', icon: Gift },
  { to: '/admin/partners', label: 'Parceiros', icon: Handshake },
  { to: '/admin/gallery', label: 'Galeria', icon: Images },
  { to: '/admin/announcements', label: 'Comunicados', icon: Megaphone },
  { to: '/admin/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/admin/settings', label: 'Configurações', icon: Settings },
]

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur border-b border-[#181f2f]">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-300 hover:text-white"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <img
                src={logoImage}
                alt="EUROMOTORS MOTORRAD CLUB"
                className="h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="text-[10px] tracking-[0.2em] text-blue-400 font-bold uppercase font-montserrat border-l border-slate-700 pl-3">
                ADMIN
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-bold text-white uppercase tracking-wider">
                {user?.name}
              </span>
              <span className="text-[10px] text-blue-400 uppercase font-semibold">
                Administrador
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-[#232d3f] bg-[#101622] hover:bg-slate-800 px-3 py-1.5 rounded-md"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Layout Body */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <div className="sticky top-24 space-y-4">
              <AdminSidebarContent />
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 xl:col-span-10 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0d14] border-r border-[#1c2436] p-4 overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest text-white uppercase font-montserrat">
                Menu Admin
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

const AdminSidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="space-y-4">
      {/* User card */}
      {user && (
        <div className="bg-[#0f131c] border border-[#1d2638] rounded-md p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-blue-400 truncate uppercase font-semibold">
                Administrador
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="bg-[#0f131c] border border-[#1d2638] rounded-md p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase font-montserrat transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-white border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-[#141b27] border-l-2 border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase font-montserrat text-red-300 hover:text-red-200 border border-red-900/50 bg-red-950/30 hover:bg-red-950/50 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sair da Conta
      </button>

      <Link
        to="/member/dashboard"
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase font-montserrat text-slate-300 hover:text-white border border-[#232d3f] bg-[#101622] hover:bg-slate-800 transition-colors"
      >
        <User className="w-4 h-4" /> Área do Membro
      </Link>

      <Link
        to="/"
        className="block text-center text-[10px] text-slate-500 hover:text-slate-300 pt-1"
      >
        ← Voltar para o site público
      </Link>
    </div>
  )
}
