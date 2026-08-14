/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import RideDetail from './pages/RideDetail'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MemberLayout } from './components/MemberLayout'
import MemberDashboard from './pages/member/MemberDashboard'
import MemberPasseios from './pages/member/MemberPasseios'
import MemberInscricoes from './pages/member/MemberInscricoes'
import MemberBeneficios from './pages/member/MemberBeneficios'
import MemberGaleria from './pages/member/MemberGaleria'
import MemberComunicados from './pages/member/MemberComunicados'
import MemberPerfil from './pages/member/MemberPerfil'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES MUST BE ADDED HERE */}
          <Route path="/passeios/:id" element={<RideDetail />} />
        </Route>
        {/* Área do Membro (protegida) */}
        <Route
          path="/member"
          element={
            <ProtectedRoute>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MemberDashboard />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="passeios" element={<MemberPasseios />} />
          <Route path="inscricoes" element={<MemberInscricoes />} />
          <Route path="beneficios" element={<MemberBeneficios />} />
          <Route path="galeria" element={<MemberGaleria />} />
          <Route path="comunicados" element={<MemberComunicados />} />
          <Route path="perfil" element={<MemberPerfil />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
