import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [cadastrosAberto, setCadastrosAberto] = useState(false);

  const menuItems = [
    {
      path: "/novo-treino",
      label: "Novo Treino",
      icon: "🏃",
      exact: true,
    },
    {
      path: "/recordes",
      label: "Recordes",
      icon: "🏆",
    },
    {
      path: "/rankings",
      label: "Rankings",
      icon: "📊",
    },
    {
      path: "/conjuntos",
      label: "Conjuntos",
      icon: "👥",
    },
    {
      path: "/perfil",
      label: "Perfil",
      icon: "👤",
    },
    {
      path: "/usuarios",
      label: "Usuários",
      icon: "👨‍💼",
      adminOnly: true,
    },
  ];

  const cadastrosSubmenus = [
    {
      path: "/cadastros/planos",
      label: "Planos",
    },
    {
      path: "/cadastros/operacoes",
      label: "Operações",
    },
    {
      path: "/cadastros/limites",
      label: "Limites",
    },
    {
      path: "/cadastros/sistemas",
      label: "Sistemas",
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isCadastrosActive = cadastrosSubmenus.some((submenu) =>
    isActive(submenu.path)
  );

  // Auto-abrir/fechar submenu baseado na rota atual
  useEffect(() => {
    if (isCadastrosActive) {
      setCadastrosAberto(true);
    } else {
      setCadastrosAberto(false);
    }
  }, [location.pathname, isCadastrosActive]);

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && (!usuario || usuario.tipo !== "admin")) {
      return false;
    }
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Treino Matemático</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${
                  isActive(item.path, item.exact) ? "active" : ""
                }`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
          {usuario?.tipo === "admin" && (
            <li className="sidebar-menu-item-with-submenu">
              <button
                className={`sidebar-link sidebar-link-toggle ${
                  isCadastrosActive ? "active" : ""
                }`}
                onClick={() => setCadastrosAberto(!cadastrosAberto)}
              >
                <span className="sidebar-icon">📋</span>
                <span className="sidebar-label">Cadastros</span>
                <span
                  className={`sidebar-arrow ${cadastrosAberto ? "open" : ""}`}
                >
                  ▼
                </span>
              </button>
              {cadastrosAberto && (
                <ul className="sidebar-submenu">
                  {cadastrosSubmenus.map((submenu) => (
                    <li key={submenu.path}>
                      <Link
                        to={submenu.path}
                        className={`sidebar-sublink ${
                          isActive(submenu.path) ? "active" : ""
                        }`}
                      >
                        {submenu.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-name">{usuario?.nome}</span>
          <span className="sidebar-user-email">{usuario?.email}</span>
        </div>
        <button
          className="sidebar-logout"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
