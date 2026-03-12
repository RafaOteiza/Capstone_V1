import React from "react";
import { NavLink } from "react-router-dom";
import { getCachedMe } from "../app/session";
import { 
  LayoutDashboard, Users, PlusSquare, 
  Microscope, Monitor, Cpu, FileBarChart, 
  CheckCircle, Package, Settings, ShieldCheck
} from "lucide-react";

export default function Sidebar() {
  const me = getCachedMe(); // Obtenemos usuario actual
  const rol = me?.rol;      // Extraemos el rol para facilitar la lógica

  // --- DEFINICIÓN DE PERMISOS POR MÓDULO ---
  
  // Admin Total: Ve todo lo de configuración
  const esAdmin = rol === 'admin';
  
  // Jefatura: Ve Dashboard, reportes y supervisa áreas
  const esJefe = rol === 'jefe_taller' || esAdmin;
  
  // Módulo Terreno: Solo para técnicos de terreno (y admin para pruebas)
  const esTerreno = rol === 'tecnico_terreno' || esAdmin;

  // Módulo Laboratorio: Para técnicos de lab y jefes
  const esLab = rol === 'tecnico_laboratorio' || esJefe;

  // Módulo QA: Para encargados de calidad y jefes
  const esQa = rol === 'qa' || esJefe;

  // Módulo Bodega: Para logística/bodega y jefes
  const esBodega = rol === 'logistica' || rol === 'bodega' || esJefe;

  // Lógica de redirección del Dashboard:
  // Si eres técnico de lab, tu "Home" es tu dashboard personal (/lab/dashboard).
  // Si eres cualquier otro (Jefe, Admin, QA, etc.), tu "Home" es el dashboard global (/).
  const rutaDashboard = rol === 'tecnico_laboratorio' ? '/lab/dashboard' : '/';

  return (
    <aside className="sidebar">
      {/* BRAND / LOGO */}
      <div className="sb-brand">
        <div style={{
            width: 32, height: 32, 
            backgroundColor: '#F59E0B', 
            borderRadius: 8, 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Cpu size={20} color="white"/> 
        </div>
        <span>PMP Suite</span>
      </div>

      <div className="sb-nav">
        
        {/* 1. SECCIÓN GENERAL (Dashboard) */}
        {/* Esta sección ahora es visible para técnicos también, pero los lleva a SU dashboard */}
        <div className="sb-section">
            <div className="sb-section-title">GENERAL</div>
            <NavLink to={rutaDashboard} className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`} end>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
            </NavLink>
        </div>

        {/* 2. SECCIÓN ADMINISTRACIÓN (Solo Admin) */}
        {esAdmin && (
            <div className="sb-section">
                <div className="sb-section-title">ADMINISTRACIÓN</div>
                <NavLink to="/admin/users" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <ShieldCheck size={18} />
                    <span>Admin Usuarios</span>
                    <span className="badge">admin</span>
                </NavLink>
            </div>
        )}

        {/* 3. MÓDULO TERRENO (La "App" móvil) */}
        {esTerreno && (
            <div className="sb-section">
                <div className="sb-section-title">TERRENO</div>
                <NavLink to="/operacion/ingreso" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <PlusSquare size={18} />
                    <span>Ingreso OS</span>
                </NavLink>
            </div>
        )}

        {/* 4. MÓDULO LABORATORIO */}
        {esLab && (
            <div className="sb-section">
                <div className="sb-section-title">LABORATORIO</div>
                
                {/* Solo Jefes asignan */}
                {esJefe && (
                    <NavLink to="/lab/asignacion" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                        <Users size={18} />
                        <span>Asignar Carga</span>
                    </NavLink>
                )}

                {/* Técnicos trabajan aquí */}
                <NavLink to="/lab/validadores" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Cpu size={18} />
                    <span>Validadores</span>
                </NavLink>
                <NavLink to="/lab/consolas" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Monitor size={18} />
                    <span>Consolas</span>
                </NavLink>
                
                {/* Reportes solo para Jefes */}
                {esJefe && (
                    <NavLink to="/lab/reportes" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                        <FileBarChart size={18} />
                        <span>Reportes</span>
                    </NavLink>
                )}
            </div>
        )}

        {/* 5. MÓDULO QA */}
        {esQa && (
            <div className="sb-section">
                <div className="sb-section-title">CALIDAD</div>
                <NavLink to="/qa" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <CheckCircle size={18} />
                    <span>Control QA</span>
                </NavLink>
            </div>
        )}

        {/* 6. MÓDULO BODEGA */}
        {esBodega && (
            <div className="sb-section">
                <div className="sb-section-title">LOGÍSTICA</div>
                <NavLink to="/bodega" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Package size={18} />
                    <span>Bodega</span>
                </NavLink>
            </div>
        )}

        {/* SECCIÓN SISTEMA (Para todos) */}
        <div className="sb-section" style={{ marginTop: 'auto' }}>
            <div className="sb-section-title">SISTEMA</div>
            <NavLink to="/settings" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                <Settings size={18} />
                <span>Ajustes</span>
            </NavLink>
        </div>

      </div>
    </aside>
  );
}