import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesRankings.css";

const InstrucoesRankings = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre os rankings no Numix</h1>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            Na página de rankings você tem os recordes no Numix
            para cada tipo de treino (operação + limite + sistema).
          </p>
          <img
            src="/instrucoes/ranking.png"
            alt="Página Rankings mostrando a tabela com os usuários"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> salve seu treino preferido no seu perfil e ao entrar na página de rankings, ele será carregado por padrão.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Sua posição no ranking</h2>
          <p>
            No topo da página há um quadro mostrando sua posição atual no ranking filtrado, junto com o total de participantes.
          </p>
          <img
            src="/instrucoes/posicao.png"
            alt="Quadro mostrando a posição do usuário no ranking"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> visitantes não aparecem no ranking, pois seus recordes
            não são salvos no sistema.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Filtros de ranking</h2>
          <p>
            Na parte superior da página você encontra filtros para escolher qual ranking deseja visualizar.
            Você precisa escolher uma operação, um limite e um sistema.
          </p>
          <p>
            Ao participar de pelo menos um conjunto, também verá um filtro de conjuntos para esclolher entre
            ver apenas os elementos desse conjunto ou o ranking global do Numix.
          </p>
          <img
            src="/instrucoes/filtrosrankings.png"
            alt="Filtros de rankings"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Observação:</strong> nos filtros aparecem todas as opções existentes no Numix,
            mesmo que seu nível atual não tenha acesso a alguma delas. Isso permite que você veja
            rankings de configurações mais avançadas.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Critérios de desempate</h2>
          <p>
            Quando dois usuários possuem a mesma pontuação, o desempate é feito usando os
            seguintes critérios, nesta ordem:
          </p>
          <div className="instrucao-item">
            <h3>1. Quantidade de erros</h3>
            <p>
              O usuário com <strong>menos erros</strong> realizados fica em posição melhor.
            </p>
          </div>
          <div className="instrucao-item">
            <h3>2. Quantidade de treinos</h3>
            <p>
              O usuário com <strong>menos treinos</strong> realizados fica em posição melhor.
            </p>
          </div>
          <div className="instrucao-item">
            <h3>3. Data do recorde</h3>
            <p>
              Se ainda houver empate, o recorde <strong>mais antigo</strong> é
              recompensado por ter alcançado a pontuação primeiro.
            </p>
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Ver recordes de outros usuários no Numix</h2>
          <p>
            Ao clicar no <strong>nome de um usuário</strong> no ranking, você será redirecionado
            para a página de recordes dele. Isso permite:
          </p>
          <ul>
            <li>- Ver todas as configurações que ele já treinou;</li>
            <li>- Comparar seus recordes com os dele;</li>
            <li>- Descobrir novas configurações de treino para tentar;</li>
            <li>- Aprender com os melhores praticantes.</li>
          </ul>
        </section>

        <section className="instrucao-secao">
          <h2>Privacidade no ranking</h2>
          <p>
            Você pode configurar seu perfil para <strong>não mostrar seus recordes no ranking global</strong>.
            Quando essa opção está ativada:
          </p>
          <ul>
            <li>- Seus recordes não aparecem nos rankings globais;</li>
            <li>- Você ainda pode ver os rankings de outros usuários;</li>
            <li>- Seus recordes continuam salvos normalmente;</li>
            <li>- Você ainda aparece em rankings de conjuntos dos quais participa.</li>
          </ul>
          <p>
            Para ativar essa opção, acesse seu perfil e configure a preferência de privacidade.
          </p>
          <img
            src="/instrucoes/rankingperfil.png"
            alt="Parte da página de perfil de usuário mostrando a opção de privacidade"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para competir?</h2>
          <p>
            Agora que já sabe como funciona, volte para a página de rankings e veja sua posição!
          </p>
          <div className="instrucao-acoes">
            <button onClick={() => navigate("/rankings")} className="btn-comecar-treino">
              Ver rankings
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesRankings;
