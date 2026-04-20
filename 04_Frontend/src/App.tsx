import React from "react";
import { Routes, Route, Navigate, useOutletContext } from "react-router-dom";
import { getCachedMe } from "./app/session"; // <--- IMPORTANTE: Importar esto
import { Me } from "./api/me";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// Páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";       
import AdminUsersPage from "./pages/AdminUsersPage";
import IngresoOSPage from "./pages/IngresoOSPage";
import AdminDespachoPage from "./pages/AdminDespachoPage";
import TrazabilidadPage from "./pages/TrazabilidadPage";
import AIPredictionsPage from "./pages/AIPredictionsPage";

// Laboratorio
import LabDashboardPage from "./pages/LabDashboardPage"; 
import LabAsignacionPage from "./pages/LabAsignacionPage"; 
import LabValidadoresPage from "./pages/LabValidadoresPage";
import LabConsolasPage from "./pages/LabConsolasPage";
import LabReportesPage from "./pages/LabReportesPage";
import LabDespachoQaPage from "./pages/LabDespachoQaPage";

import QaPage from "./pages/QaPage";
import BodegaPage from "./pages/BodegaPage";
import BodegaModulosPage from "./pages/BodegaModulosPage";
import BodegaRepuestosPage from "./pages/BodegaRepuestosPage";
import BodegaDashboardPage from "./pages/BodegaDashboardPage";
import EquiposOperativosPage from "./pages/EquiposOperativosPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

// --- COMPONENTE DE REDIRECCIÓN INTELIGENTE ---
const RootRedirector = () => {
  const me = useOutletContext<Me | null>() || getCachedMe();
  
  // Si es Técnico de Laboratorio, lo mandamos a SU dashboard
  if (me?.rol === 'tecnico_laboratorio') {
    return <Navigate to="/lab/dashboard" replace />;
  }

  // Técnico de Terreno no usa el web: redirigir a /404 o Settings
  if (me?.rol === 'tecnico_terreno') {
    return <Navigate to="/settings" replace />;
  }

  // Si es QA, lo mandamos a QA
  if (me?.rol === 'qa') {
    return <Navigate to="/qa" replace />;
  }

  // Si es Logística, lo mandamos a Bodega
  if (me?.rol === 'logistica') {
    return <Navigate to="/bodega" replace />;
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
        <Route 
          path="/operacion/ingreso" 
          element={
            <ProtectedRoute roles={['admin']}>
              {/* Técnico de terreno opera SOLO desde la app móvil */}
              <IngresoOSPage />
            </ProtectedRoute>
          } 
        />
        
        {/* --- LABORATORIO --- */}
        <Route 
          path="/lab/dashboard" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'tecnico_laboratorio']}>
              <LabDashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/lab/asignacion" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller']}>
              <LabAsignacionPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/lab/validadores" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'tecnico_laboratorio']}>
              <LabValidadoresPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lab/consolas" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'tecnico_laboratorio']}>
              <LabConsolasPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lab/reportes" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller']}>
              <LabReportesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lab/despacho-qa" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller']}>
              <LabDespachoQaPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/despacho" element={<AdminDespachoPage />} />
        
        {/* --- QA y BODEGA --- */}
        <Route 
          path="/qa" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'qa']}>
              <QaPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bodega" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'logistica', 'bodega']}>
              <BodegaPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bodega/dashboard" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'logistica', 'bodega']}>
              <BodegaDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bodega/modulos" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'logistica', 'bodega']}>
              <BodegaModulosPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bodega/repuestos" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'logistica', 'bodega']}>
              <BodegaRepuestosPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/equipos-operativos" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'logistica', 'bodega']}>
              <EquiposOperativosPage />
            </ProtectedRoute>
          } 
        />
        {/* --- SISTEMA ESP --- */}
        <Route 
          path="/trazabilidad" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'logistica', 'bodega']}>
              <TrazabilidadPage />
            </ProtectedRoute>
          } 
        />
        
        {/* --- IA / PREDICCIONES --- */}
        <Route 
          path="/ia/predicciones" 
          element={
            <ProtectedRoute roles={['admin', 'jefe_taller', 'logistica', 'bodega', 'qa']}>
                <AIPredictionsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* --- SISTEMA --- */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}