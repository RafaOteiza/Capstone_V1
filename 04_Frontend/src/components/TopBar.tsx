import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { clearToken } from "../app/token";
import { getCachedMe } from "../app/session";
import { toggleTheme } from "../app/theme";

export default function TopBar() {
  const nav = useNavigate();
  const me = getCachedMe();

  const logout = () => {
    clearToken();
    localStorage.removeItem("pmp_me_cache");
    nav("/login");
  };

  const displayName = useMemo(() => {
    if (!me) return "Sesión";
    const full = `${me.nombre ?? ""} ${me.apellido ?? ""}`.trim();
    return full || me.correo || "Sesión";
  }, [me]);

  const isDark = (document.documentElement.getAttribute("data-theme") || "dark") === "dark";

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="search">
          <span className="small">⌕</span>
          <input placeholder="Buscar OS / Usuario / Ticket..." />
        </div>
      </div>

      <div className="topbar-right">
        <div className="session-name">{displayName}</div>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn ghost" onClick={logout}>Salir</button>
      </div>
    </div>
  );
}
