import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesRecordes.css";

const InstrucoesRecordes = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre os recordes no Numix</h1>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            Na página de recordes aparecem todos os treinos que você já fez pelo
            menos uma vez no Numix. Cada cartão mostra sua melhor pontuação para
            aquela configuração específica de treino (operação + limite +
            sistema).
          </p>
          <img
            src="/instrucoes/recordes.png"
            alt="Página Recordes mostrando os cartões"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Informações nos cartões</h2>
          <p>
            Cada cartão de recorde exibe informações importantes sobre seu
            desempenho:
          </p>
          <ul>
            <li>
              - <strong>Nome da operação</strong> e tipo (soma, subtração,
              etc.);
            </li>
            <li>
              - <strong>Maior pontuação</strong> alcançada e tempo médio por
              conta;
            </li>
            <li>
              - <strong>Limite de tempo</strong>;
            </li>
            <li>
              - <strong>Sistema numérico</strong>;
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
            src="/instrucoes/recordecartao.png"
            alt="Cartão de recorde mostrando as informações"
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
              treino com as mesmas configurações daquele recorde (mesma
              operação, limite e sistema).
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
              nela, você será redirecionado para a página de rankings filtrada
              para aquela configuração específica de treino, permitindo comparar
              seu desempenho com outros usuários.
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
            Na parte superior da página você encontra diversos filtros para
            encontrar recordes específicos:
          </p>
          <ul>
            <li>
              - <strong>Tipo:</strong> mostra apenas um tipo de operação (soma,
              subtração, etc.);
            </li>
            <li>
              - <strong>Operação:</strong> filtra pelo nome da operação;
            </li>
            <li>
              - <strong>Limite e sistema:</strong> filtram por limite de tempo e
              sistema numérico;
            </li>
            <li>
              - <strong>Nível:</strong> filtra as operações que foram
              acrescentadas naquele nível.
            </li>
          </ul>
          <img
            src="/instrucoes/filtrosrecordes.png"
            alt="Filtros de recordes"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> ao atualizar a página (F5), todos os filtros
            são removidos e você volta a ver todos os seus recordes.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Limite de exibição</h2>
          <p>
            A página mostra no máximo <strong>40 recordes por vez</strong>. Se
            você tiver mais de 40 recordes, aparecerá uma indicação mostrando
            quantos estão sendo exibidos do total.
          </p>
          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> para ver outros recordes quando você
            tiver mais de 40, use os filtros na parte superior para reduzir a
            quantidade de resultados. Isso permitirá que recordes diferentes
            apareçam na lista.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Ver recordes de outros usuários</h2>
          <p>
            Você pode ver os recordes de outro usuário no Numix ao clicar no
            nome dele em qualquer ranking.
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>Últimos recordes batidos no Numix</h2>
          <p>
            Na parte de baixo da página há uma seção com os 20{" "}
            <strong>últimos recordes batidos no Numix</strong>. Ao clicar no
            nome do usuário de um recorde, você é levado à página de recordes
            daquela pessoa.
          </p>
          <img
            src="/instrucoes/ultimosRecordes.png"
            alt="Últimos recordes batidos no Numix"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> clicando no ícone de treino você inicia um
            treino igual ao do recorde (mesma operação, limite e sistema).
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para treinar?</h2>
          <p>
            Agora que já sabe como funciona, volte para a página de recordes e
            comece a melhorar suas pontuações!
          </p>
          <div className="instrucao-acoes">
            <button
              onClick={() => navigate("/recordes")}
              className="btn-comecar-treino"
            >
              Ver meus recordes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesRecordes;
