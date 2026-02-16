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
  // Tipo específico do treino de calendário: data_geral, mes, ano, seculo, data_2021
  tipoTreinoCalendario,
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
    // Precisamos aceitar 0 como valor válido (especialmente em treinos de século),
    // por isso não podemos usar `resposta || ""`.
    const valor =
      resposta === 0
        ? "0"
        : String(resposta ?? "").trim();
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
      // Treinos de séculos, meses, dia e ano: aceitar inteiros de -7 a 7 (equivalentes módulo 7)
      if (
        tipoTreinoCalendario === "seculo" ||
        tipoTreinoCalendario === "mes" ||
        tipoTreinoCalendario === "dia" ||
        tipoTreinoCalendario === "ano"
      ) {
        const bruto = valor.replace(/\s+/g, "");
        // Permitir estado intermediário "-", "+" ou vazio sem enviar
        if (bruto === "" || bruto === "-" || bruto === "+") {
          e.target.value = bruto;
          return;
        }
        const num = parseInt(bruto, 10);
        if (Number.isNaN(num)) {
          return;
        }
        if (num < -7 || num > 7) {
          return;
        }
        e.target.value = String(num);
        submeterResposta(num);
      } else {
        // Demais treinos numéricos (dia da semana, ano, etc.): 0–7, 1 dígito
        const filtrado = valor.replace(/[^0-7]/g, "").slice(0, 1);
        e.target.value = filtrado;
        if (filtrado.length === 1) {
          submeterResposta(filtrado);
        }
      }
    } else {
      e.target.value = valor.toLowerCase().replace(/[^a-záàâãéêíóôõú]/g, "");
    }
  };

  const handleTecladoKeyPress = (evento) => {
    if (!inputRef.current || disabled) return;
    const atual = inputRef.current.value || "";

    if (evento.key === "Backspace") {
      if (
        tipoResposta === "numeros" &&
        (tipoTreinoCalendario === "seculo" ||
          tipoTreinoCalendario === "mes" ||
          tipoTreinoCalendario === "dia" ||
          tipoTreinoCalendario === "ano")
      ) {
        inputRef.current.value = atual.slice(0, -1);
      } else {
        inputRef.current.value = "";
      }
      return;
    }

    if (tipoResposta === "numeros") {
      if (
        tipoTreinoCalendario === "seculo" ||
        tipoTreinoCalendario === "mes" ||
        tipoTreinoCalendario === "dia" ||
        tipoTreinoCalendario === "ano"
      ) {
        // Construir número com sinal usando o teclado virtual
        let novo = atual;
        if (evento.key === "-") {
          // Permitir apenas um sinal no início
          if (!novo.startsWith("-") && novo.length === 0) {
            novo = "-";
          } else {
            return;
          }
        } else if (/^[0-9]$/.test(evento.key)) {
          novo = `${novo}${evento.key}`;
        } else {
          return;
        }

        const bruto = novo.replace(/\s+/g, "");
        if (bruto === "" || bruto === "-") {
          inputRef.current.value = bruto;
          return;
        }

        const num = parseInt(bruto, 10);
        if (Number.isNaN(num) || num < -7 || num > 7) {
          return;
        }
        inputRef.current.value = String(num);
        submeterResposta(num);
      } else {
        if (/^[0-7]$/.test(evento.key)) {
          inputRef.current.value = evento.key;
          submeterResposta(evento.key);
        }
      }
    } else {
      // Teclado de dias da semana envia o texto completo ("dom", "seg", etc.) em uma tecla
      const v = evento.key;
      inputRef.current.value = v;
      // Enviar a resposta para o backend (no celular o input fica sem foco, então precisa enviar aqui)
      submeterResposta(v);
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
              inputMode={
                isMobile ? "none" : tipoResposta === "numeros" ? "numeric" : "text"
              }
              maxLength={
                tipoResposta === "numeros" &&
                tipoTreinoCalendario !== "seculo" &&
                tipoTreinoCalendario !== "mes" &&
                tipoTreinoCalendario !== "dia" &&
                tipoTreinoCalendario !== "ano"
                  ? 1
                  : undefined
              }
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
