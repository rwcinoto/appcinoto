import React from "react";
import { useAuth } from "../context/AuthContext";
import "./NovoTreino.css";

const NovoTreino = () => {
  const { usuario } = useAuth();

  return (
    <div className="novo-treino-container">
      <div className="novo-treino-header">
        <h1>Novo Treino</h1>
        <div className="user-info">
          <span>Olá, {usuario?.nome}</span>
        </div>
      </div>
      <div className="novo-treino-content">
        <p>Página de novo treino - em desenvolvimento</p>
      </div>
    </div>
  );
};

export default NovoTreino;
