import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import "./Sidebar.css";

const Sidebar = ({ aberto = true, onFechar }) => {
  const { usuario, logout } = useAuth();
  const { quantidadeConvitesPendentes } = useNotifications();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [cadastrosAberto, setCadastrosAberto] = useState(false);

  const menuItems = [
    {
      path: "/novo-treino",
      label: "Novo treino",
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
      path: "/calendario",
      label: "Calendário",
      icon: "📅",
    },
    {
      path: "/conjuntos",
      label: "Conjuntos",
      icon: "👥",
      showBadge: true,
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
    if (item.adminOnly && (!usuario || (usuario.tipo !== "admin" && usuario.tipo !== "profe"))) {
      return false;
    }
    return true;
  });

  const handleLinkClick = () => {
    // Fechar sidebar ao clicar em link (apenas no mobile)
    if (onFechar && window.innerWidth < 768) {
      onFechar();
    }
  };

  return (
    <aside className={`sidebar ${aberto ? "aberto" : "fechado"}`} aria-label="Menu de navegação principal">
      <div className="sidebar-header">
        <img 
          src="/logo-numix.svg" 
          alt="numix" 
          className="sidebar-logo" 
        />
      </div>
      <nav className="sidebar-nav" role="navigation" aria-label="Navegação principal">
        <ul className="sidebar-menu-main">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${
                  isActive(item.path, item.exact) ? "active" : ""
                }`}
                onClick={handleLinkClick}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                {item.showBadge && quantidadeConvitesPendentes > 0 && (
                  <span className="sidebar-badge">
                    {quantidadeConvitesPendentes}
                  </span>
                )}
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
                aria-expanded={cadastrosAberto}
                aria-label={`${cadastrosAberto ? "Fechar" : "Abrir"} submenu de cadastros`}
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
                        onClick={handleLinkClick}
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
        <ul className="sidebar-menu-theme">
          <li>
            <label className="theme-toggle-switch" aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
                className="theme-toggle-input"
                aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
              />
              <span className="theme-toggle-slider"></span>
            </label>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-name">{usuario?.nome}</span>
          {/* <span className="sidebar-user-email">{usuario?.email}</span> */}
          {usuario?.plano?.nome && (
            <span className="sidebar-user-plano">{usuario.plano.nome}</span>
          )}
        </div>
        <button
          className="sidebar-logout"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          aria-label="Sair da conta"
        >
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
