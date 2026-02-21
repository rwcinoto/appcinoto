import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesRecordes.css";

const InstrucoesCalendarioRecordes = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre os recordes de calendário no Numix</h1>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            Na página de recordes de calendário aparecem todos os treinos de
            calendário que você já fez pelo menos uma vez no Numix. Cada cartão
            mostra sua melhor pontuação para aquela configuração específica de
            treino (tipo + limite).
          </p>
          <img
            src="/instrucoes/recordesCalendario.png"
            alt="Página Recordes de Calendário mostrando os cartões"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Informações nos cartões</h2>
          <p>
            Cada cartão de recorde de calendário exibe informações importantes
            sobre seu desempenho:
          </p>
          <ul>
            <li>
              - <strong>Tipo de treino</strong> (Data 1582-2399, Dia, Mês,
              etc.);
            </li>
            <li>
              - <strong>Maior pontuação</strong> e tempo médio por resposta;
            </li>
            <li>
              - <strong>Limite de tempo</strong>;
            </li>
            <li>
              - <strong>Data</strong> do recorde;
            </li>
            <li>
              - <strong>Total de treinos</strong> realizados;
            </li>
            <li>
              - <strong>Posição no ranking global</strong>.
            </li>
          </ul>
          <img
            src="/instrucoes/recordeCalendarioCartao.png"
            alt="Exemplo de cartão de recorde de calendário com as informações"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Ações rápidas nos cartões</h2>

          <div className="instrucao-item">
            <h3>Iniciar treino com as mesmas configurações</h3>
            <p>
              No <strong>canto superior esquerdo</strong> de cada cartão há um
              ícone de treino. Clicando nele, você inicia imediatamente um novo
              treino de calendário com as mesmas configurações daquele recorde
              (mesmo tipo e limite).
            </p>
            <img
              src="/instrucoes/iconetreino.png"
              alt="Ícone de treino"
              className="instrucao-imagem"
            />
          </div>

          <div className="instrucao-item">
            <h3>Ver ranking global</h3>
            <p>
              A <strong>posição no ranking global</strong> é clicável. Ao clicar
              nela, você é levado à página de rankings de calendário filtrada
              para aquela configuração, onde pode comparar seu desempenho com
              outros usuários.
            </p>
            <img
              src="/instrucoes/posicaoglobal.png"
              alt="Posição no ranking global"
              className="instrucao-imagem"
            />
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Filtros de recordes</h2>
          <p>
            Na parte superior da página você encontra filtros para encontrar
            recordes específicos:
          </p>
          <ul>
            <li>
              - <strong>Tipo:</strong> mostra apenas um tipo de treino (Data
              1582-2399, Dia, Mês, etc.);
            </li>
            <li>
              - <strong>Limite:</strong> filtra pelo limite de tempo.
            </li>
          </ul>
          <img
            src="/instrucoes/filtrosRecordesCalendario.png"
            alt="Filtros de tipo e limite na página de recordes de calendário"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> ao atualizar a página (F5), todos os filtros
            são removidos e você volta a ver todos os seus recordes.
          </div>
        </section>

        {/* <section className="instrucao-secao">
          <h2>Limite de exibição</h2>
          <p>
            A página mostra no máximo <strong>40 recordes por vez</strong>. Se
            você tiver mais de 40 recordes, aparecerá uma indicação mostrando
            quantos estão sendo exibidos do total.
          </p>
          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> para ver outros recordes quando você
            tiver mais de 40, use os filtros na parte superior para reduzir a
            quantidade de resultados. Assim recordes diferentes poderão aparecer
            na lista.
          </div>
        </section> */}

        <section className="instrucao-secao">
          <h2>Ver recordes de outros usuários</h2>
          <p>
            Você pode ver os recordes de calendário de outro usuário no Numix ao
            clicar no nome dele em qualquer ranking de calendário.
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>Últimos recordes batidos no Numix</h2>
          <p>
            Na parte de baixo da página há uma seção com os 20{" "}
            <strong>últimos recordes de calendário batidos no Numix</strong>. Ao
            clicar no nome do usuário de um recorde, você é levado à página de
            recordes de calendário daquela pessoa.
          </p>
          <img
            src="/instrucoes/ultimosRecordesCalendario.png"
            alt="Últimos recordes de calendário batidos no Numix"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> clicando no ícone de treino você inicia um
            treino igual ao do recorde (mesmo tipo e limite).
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para treinar?</h2>
          <p>
            Agora que já sabe como funciona, volte para a página de recordes de
            calendário e comece a melhorar suas pontuações!
          </p>
          <div className="instrucao-acoes">
            <button
              onClick={() => navigate("/calendario")}
              className="btn-comecar-treino"
            >
              Ver meus recordes de calendário
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesCalendarioRecordes;
