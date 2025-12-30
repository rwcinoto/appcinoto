import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import "./Layout.css";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarAberto, setSidebarAberto] = useState(false);

  const toggleSidebar = () => {
    setSidebarAberto(!sidebarAberto);
  };

  const fecharSidebar = () => {
    setSidebarAberto(false);
  };

  return (
    <div className="layout-container">
      <Sidebar aberto={sidebarAberto} onFechar={fecharSidebar} />
      <button 
        className="hamburger-menu" 
        onClick={toggleSidebar} 
        aria-label={sidebarAberto ? "Fechar menu" : "Abrir menu"}
        aria-expanded={sidebarAberto}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      {sidebarAberto && (
        <div className="sidebar-overlay" onClick={fecharSidebar}></div>
      )}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
