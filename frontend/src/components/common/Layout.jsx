import React from "react";
import { Outlet } from "react-router-dom";
import "./Layout.css";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
