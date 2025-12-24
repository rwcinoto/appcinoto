import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

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
