import React, { useEffect, useRef, useState } from "react";
import { formatarDataTexto, formatarDataNumeros } from "../../utils/formatarDataCalendario";
import TecladoCalendario from "./TecladoCalendario";
import "./ListaContas.css";

const ListaDatas = ({
  datas,
  formatoVisualizacao = "texto",
  tipoResposta = "numeros",
  onAcerto,
  onErro,
  inputComErro = false,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const manterFocoRef = useRef(false);
  const processandoRef = useRef(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    manterFocoRef.current = !disabled;
  }, [disabled]);

  useEffect(() => {
    if (inputComErro && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.classList.add("errado");
      processandoRef.current = false;
    }
  }, [inputComErro]);

  const primeiraDataId = datas?.length > 0 && datas[0]
    ? `${datas[0].ano}-${datas[0].mes}-${datas[0].dia}` : null;
  useEffect(() => {
    if (primeiraDataId && !inputComErro && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.classList.remove("errado");
      processandoRef.current = false;
    }
  }, [primeiraDataId, inputComErro]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current && !disabled && inputRef.current.offsetParent !== null) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [datas, disabled, inputComErro]);

  const formatarData = (data) => {
    if (!data) return "";
    return formatoVisualizacao === "numeros"
      ? formatarDataNumeros(data)
      : formatarDataTexto(data);
  };

  const submeterResposta = (resposta) => {
    const valor = String(resposta || "").trim();
    if (!valor || processandoRef.current || disabled) return;
    processandoRef.current = true;
    if (onAcerto) onAcerto(valor);
  };

  const handleKeyDown = (e) => {
    if (!e.isTrusted) return;
    if (e.key === "Enter") {
      e.preventDefault();
      submeterResposta(inputRef.current?.value);
    }
  };

  const handleChange = (e) => {
    if (!e.isTrusted) return;
    const valor = e.target.value;
    if (tipoResposta === "numeros") {
      const filtrado = valor.replace(/[^0-7]/g, "").slice(0, 1);
      e.target.value = filtrado;
      if (filtrado.length === 1) {
        submeterResposta(filtrado);
      }
    } else {
      e.target.value = valor.toLowerCase().replace(/[^a-záàâãéêíóôõú]/g, "");
    }
  };

  const handleTecladoKeyPress = (evento) => {
    if (!inputRef.current || disabled) return;
    if (evento.key === "Backspace") {
      inputRef.current.value = "";
    } else if (tipoResposta === "numeros") {
      if (/^[0-7]$/.test(evento.key)) {
        inputRef.current.value = evento.key;
        submeterResposta(evento.key);
      }
    } else {
      const v = inputRef.current.value + evento.key;
      inputRef.current.value = v;
    }
  };

  if (!datas || datas.length === 0) {
    return (
      <div className="lista-contas-container">
        <p className="sem-contas">Nenhuma data disponível</p>
      </div>
    );
  }

  const dataAtual = datas[0];
  const proximaData = datas[1];
  const dataAtualFormatada = formatarData(dataAtual);
  const proximaFormatada = proximaData ? formatarData(proximaData) : null;

  return (
    <div className="lista-contas-container">
      <div className="lista-contas">
        <div className="conta-item atual">
          <div className="conta-expressao">
            <span className="parcela data-formatada">{dataAtualFormatada}</span>
            <span className="igual">=</span>
            <input
              ref={inputRef}
              type="text"
              inputMode={isMobile ? "none" : tipoResposta === "numeros" ? "numeric" : "text"}
              maxLength={tipoResposta === "numeros" ? 1 : undefined}
              className={`conta-input-resultado${inputComErro ? " errado" : ""}`}
              disabled={disabled}
              placeholder="?"
              autoComplete="off"
              autoFocus={!isMobile}
              onFocus={(e) => {
                if (isMobile) setTimeout(() => e.target.blur(), 0);
              }}
              onTouchStart={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  e.target.blur();
                }
              }}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              aria-label="Dia da semana da data exibida"
            />
          </div>
        </div>
        {proximaFormatada && (
          <>
            <div className="lista-contas-divisor">
              <span className="divisor-texto">Próxima:</span>
            </div>
            <div className="conta-item">
              <div className="conta-expressao">
                <span className="parcela data-formatada">{proximaFormatada}</span>
              </div>
            </div>
          </>
        )}
        {isMobile && (
          <TecladoCalendario
            tipoResposta={tipoResposta}
            onKeyPress={handleTecladoKeyPress}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

export default ListaDatas;
