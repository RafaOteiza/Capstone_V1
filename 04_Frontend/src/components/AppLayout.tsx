import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { loadMeOrNull, getCachedMe } from "../app/session";
import { Me } from "../api/me";

export default function AppLayout() {
  const [me, setMe] = useState<Me | null>(getCachedMe()); // Estado inicial desde caché

  useEffect(() => {
    async function init() {
      const user = await loadMeOrNull();
      if (user) {
        setMe(user); // Actualizamos estado reactivo
      }
    }
    init();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar me={me} />
      <div className="app-main">
        <TopBar me={me} />
        <div className="app-content">
          <Outlet context={me} />
        </div>
      </div>
    </div>
  );
}
