import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { loadMeOrNull } from "../app/session";

export default function AppLayout() {
  useEffect(() => {
    loadMeOrNull(); // carga /api/auth/me y cachea roles
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
