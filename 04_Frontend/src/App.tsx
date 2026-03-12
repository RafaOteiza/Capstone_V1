import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getCachedMe } from "./app/session"; // <--- IMPORTANTE: Importar esto

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// Páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";       
import AdminUsersPage from "./pages/AdminUsersPage";
import IngresoOSPage from "./pages/IngresoOSPage";
import AdminDespachoPage from "./pages/AdminDespachoPage";

// Laboratorio
import LabDashboardPage from "./pages/LabDashboardPage"; 
import LabAsignacionPage from "./pages/LabAsignacionPage"; 
import LabValidadoresPage from "./pages/LabValidadoresPage";
import LabConsolasPage from "./pages/LabConsolasPage";
import LabReportesPage from "./pages/LabReportesPage";

import QaPage from "./pages/QaPage";
import BodegaPage from "./pages/BodegaPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

// --- COMPONENTE DE REDIRECCIÓN INTELIGENTE ---
const RootRedirector = () => {
  const me = getCachedMe();
  
  // Si es Técnico de Laboratorio, lo mandamos a SU dashboard
  if (me?.rol === 'tecnico_laboratorio') {
    return <Navigate to="/lab/dashboard" replace />;
  }

  // Si es Técnico de Terreno, lo mandamos directo al Ingreso
  if (me?.rol === 'tecnico_terreno') {
    return <Navigate to="/operacion/ingreso" replace />;
  }

  // Si es QA, lo mandamos a QA
  if (me?.rol === 'qa') {
    return <Navigate to="/qa" replace />;
  }

  // Si es Admin, Jefe o cualquier otro, mostramos el Dashboard General
  return <DashboardPage />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* USAMOS EL REDIRECTOR EN LA RUTA RAÍZ */}
        <Route path="/" element={<RootRedirector />} />

        {/* --- ADMINISTRACIÓN --- */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* --- OPERACIÓN --- */}
        <Route path="/operacion/ingreso" element={<IngresoOSPage />} />
        
        {/* --- LABORATORIO --- */}
        <Route path="/lab/dashboard" element={<LabDashboardPage />} />

        <Route 
          path="/lab/asignacion" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller']}>
              <LabAsignacionPage />
            </ProtectedRoute>
          } 
        />

        <Route path="/lab/validadores" element={<LabValidadoresPage />} />
        <Route path="/lab/consolas" element={<LabConsolasPage />} />
        <Route path="/lab/reportes" element={<LabReportesPage />} />
        <Route path="/admin/despacho" element={<AdminDespachoPage />} />
        
        {/* --- QA y BODEGA --- */}
        <Route path="/qa" element={<QaPage />} />
        <Route path="/bodega" element={<BodegaPage />} />
        
        {/* --- SISTEMA --- */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}