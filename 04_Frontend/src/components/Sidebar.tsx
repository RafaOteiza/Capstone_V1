import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Me } from "../api/me";
import { getBadgeCounts, BadgeCounts } from "../api/badges";
import { 
  LayoutDashboard, Users, PlusSquare, 
  Microscope, Monitor, Cpu, FileBarChart, 
  CheckCircle, Package, Settings, ShieldCheck, Wrench, ChevronDown, ChevronRight,
  Truck, FlaskConical, ArrowDownToLine, Search, Brain
} from "lucide-react";

export default function Sidebar({ me }: { me: Me | null }) {
  const rol = me?.rol;
  const location = useLocation();
  const [openRepuestos, setOpenRepuestos] = useState(false);
  const [openOperaciones, setOpenOperaciones] = useState(false);
  const [badges, setBadges] = useState<BadgeCounts>({ lab: 0, lab_dispatch: 0, bodega: 0, qa: 0 });

  const fetchBadges = async () => {
    try {
        const counts = await getBadgeCounts();
        setBadges(counts);
    } catch (e) {
        console.error("Error fetching badges:", e);
    }
  };

  useEffect(() => {
    if (location.pathname.startsWith('/bodega/repuestos')) {
      setOpenRepuestos(true);
    }
    if (location.pathname.startsWith('/bodega') && !location.pathname.startsWith('/bodega/dashboard') && !location.pathname.startsWith('/bodega/modulos') && !location.pathname.startsWith('/bodega/repuestos')) {
      setOpenOperaciones(true);
    }
  }, [location.pathname]);

  // Fetch badges on mount and every 60s
  useEffect(() => {
    if (me) {
        fetchBadges();
        const timer = setInterval(fetchBadges, 60000);
        return () => clearInterval(timer);
    }
  }, [me]);

  // --- Badge Component Helper ---
  const Badge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
        <span style={{
            backgroundColor: '#EF4444', 
            color: 'white', 
            fontSize: '0.7rem', 
            fontWeight: 'bold',
            minWidth: '18px',
            height: '18px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            marginLeft: 'auto'
        }}>
            {count > 99 ? '99+' : count}
        </span>
    );
  };

  // --- DEFINICIÓN DE PERMISOS POR MÓDULO ---
  
  // Admin Total: Ve todo lo de configuración
  const esAdmin = rol === 'admin';
  
  // Jefatura: Ve Dashboard, reportes y supervisa áreas
  const esJefe = rol === 'jefe_taller' || esAdmin;
  
  // Módulo Terreno: Solo para técnicos de terreno (y admin para pruebas)
  const esTerreno = rol === 'tecnico_terreno'; // Admin NO hereda Terreno: no opera en campo

  // Módulo Laboratorio: Para técnicos de lab y jefes
  const esLab = rol === 'tecnico_laboratorio' || esJefe;

  // Módulo QA: Para encargados de calidad y jefes
  const esQa = rol === 'qa' || esJefe;

  // Módulo Bodega: Para logística/bodega y jefes
  const esBodega = rol === 'logistica' || rol === 'bodega' || esJefe;

  // Lógica de redirección del Dashboard:
  // Si eres técnico de lab, tu "Home" es tu dashboard personal (/lab/dashboard).
  // Si eres cualquier otro (Jefe, Admin, QA, etc.), tu "Home" es el dashboard global (/).
  const rutaDashboard = rol === 'tecnico_laboratorio' ? '/lab/dashboard' : (rol === 'logistica' ? '/bodega' : '/');

  return (
    <aside className="sidebar">
      {/* BRAND / LOGO */}
      <div className="sb-brand">
        <div className="sb-logo">
            <Cpu size={20} color="white"/> 
        </div>
        <span>PMP Suite</span>
      </div>

      <div className="sb-nav">
        
        {/* 1. SECCIÓN GENERAL (Dashboard) */}
        {/* Ocultar para Logistica: tienen su propio dashboard en la section LOGISTICA */}
        {rol !== 'logistica' && (
            <div className="sb-section">
                <div className="sb-section-title">GENERAL</div>
                <NavLink to={rutaDashboard} className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`} end>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>
                {esJefe && (
                    <NavLink to="/equipos-operativos" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                        <Cpu size={18} />
                        <span>Equipos en Operación</span>
                    </NavLink>
                )}
            </div>
        )}

        {/* 2. SECCIÓN ADMINISTRACIÓN (Solo Admin) */}
        {esAdmin && (
            <div className="sb-section">
                <div className="sb-section-title">ADMINISTRACIÓN</div>
                <NavLink to="/admin/users" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <ShieldCheck size={18} />
                    <span>Admin Usuarios</span>
                    <span className="badge">admin</span>
                </NavLink>
                <NavLink to="/admin/despacho" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Package size={18} />
                    <span>Control de Salida</span>
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
                        <Badge count={badges.lab} />
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
                    <>
                    <NavLink to="/lab/reportes" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                        <FileBarChart size={18} />
                        <span>Reportes</span>
                    </NavLink>
                    <NavLink to="/lab/despacho-qa" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                        <Package size={18} />
                        <span>Enviar a Bodega</span>
                        <Badge count={badges.lab_dispatch} />
                    </NavLink>
                    </>
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
                    <Badge count={badges.qa} />
                </NavLink>
            </div>
        )}

        {/* 6. MÓDULO BODEGA */}
        {esBodega && (
            <div className="sb-section">
                <div className="sb-section-title">LOGÍSTICA</div>
                <NavLink to="/bodega/dashboard" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>
                {/* MENÚ OPERACIONES CON SUB-OPCIONES */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={`sb-link ${(location.pathname === '/bodega' || location.pathname.startsWith('/bodega/op')) ? 'active' : ''}`}
                    onClick={() => setOpenOperaciones(!openOperaciones)}
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', paddingRight: '10px' }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Package size={18} />
                      <span>Operaciones</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Badge count={badges.bodega} />
                      {openOperaciones ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    maxHeight: openOperaciones ? '200px' : '0px',
                    opacity: openOperaciones ? 1 : 0,
                    paddingLeft: '28px',
                    marginTop: openOperaciones ? '4px' : '0px',
                    gap: '2px'
                  }}>
                    <NavLink to="/bodega?tab=transito" className={() => `sb-link ${location.pathname==='/bodega' && (location.search==='?tab=transito'||location.search==='') ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <ArrowDownToLine size={14} color="#F59E0B" />
                      <span>Recepcionar</span>
                    </NavLink>
                    <NavLink to="/bodega?tab=para-lab" className={() => `sb-link ${location.search==='?tab=para-lab' ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <Truck size={14} color="#EF4444" />
                      <span>Para Laboratorio</span>
                    </NavLink>
                    <NavLink to="/bodega?tab=para-qa" className={() => `sb-link ${location.search==='?tab=para-qa' ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <FlaskConical size={14} color="#10B981" />
                      <span>Para Control QA</span>
                    </NavLink>
                  </div>
                </div>
                <NavLink to="/bodega/modulos" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Cpu size={18} />
                    <span>Módulos</span>
                </NavLink>
                <NavLink to="/equipos-operativos" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Monitor size={18} />
                    <span>Equipos en Operación</span>
                </NavLink>
                {/* MENÚ REPUESTOS CON SUB-OPCIONES */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div 
                    className={`sb-link ${location.pathname === '/bodega/repuestos' ? "active" : ""}`}
                    onClick={() => setOpenRepuestos(!openRepuestos)}
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', paddingRight: '10px' }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Wrench size={18} />
                      <span>Repuestos</span>
                    </div>
                    {openRepuestos ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden', 
                    transition: 'all 0.3s ease',
                    maxHeight: openRepuestos ? '200px' : '0px',
                    opacity: openRepuestos ? 1 : 0,
                    paddingLeft: '28px',
                    marginTop: openRepuestos ? '4px' : '0px',
                    gap: '2px'
                  }}>
                    <NavLink to="/bodega/repuestos?tab=solicitudes" className={({ isActive }) => `sb-link ${location.search === '?tab=solicitudes' || (!location.search && location.pathname === '/bodega/repuestos') ? "active" : ""}`} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <span>Solicitudes</span>
                    </NavLink>
                    <NavLink to="/bodega/repuestos?tab=validador" className={({ isActive }) => `sb-link ${location.search === '?tab=validador' ? "active" : ""}`} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <span>Inv. Validador</span>
                    </NavLink>
                    <NavLink to="/bodega/repuestos?tab=consola" className={({ isActive }) => `sb-link ${location.search === '?tab=consola' ? "active" : ""}`} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      <span>Inv. Consola</span>
                    </NavLink>
                  </div>
                </div>
                
                <NavLink to="/trazabilidad" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Search size={18} />
                    <span>Trazabilidad O.S.</span>
                </NavLink>
            </div>
        )}

        {/* 7. SECCIÓN IA (Admin y Logística) */}
        {(esAdmin || rol === 'logistica') && (
            <div className="sb-section">
                <div className="sb-section-title">INTELIGENCIA ARTIFICIAL</div>
                <NavLink to="/ia/predicciones" className={({ isActive }) => `sb-link ${isActive ? "active" : ""}`}>
                    <Brain size={18} color="#A78BFA" />
                    <span style={{ color: '#DDD6FE', fontWeight: 'bold' }}>Mantenimiento Predictivo</span>
                </NavLink>
            </div>
        )}

      </div>
    </aside>
  );
}