import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesConjuntos.css";

const InstrucoesConjuntos = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre os conjuntos no Numix</h1>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            Os conjuntos permitem que você crie grupos com outros usuários e veja rankings
            específicos apenas dos elementos daquele conjunto. É ideal para criar competições
            personalizadas!
          </p>
          <img
            src="/instrucoes/conjuntos.png"
            alt="Página de conjuntos mostrando lista de conjuntos"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Para que servem os conjuntos?</h2>
          <p>
            A grande vantagem é que você pode <strong>comparar seus resultados no Numix com pessoas do
            mesmo nível</strong> que você.
          </p>
          <p>
            Com os conjuntos você pode comparar seus resultados em cada tipo de operação com
            grupos específicos de pessoas:
          </p>
          <ul>
            <li>- <strong>Família:</strong> incentive o aprendizado entre familiares;</li>
            <li>- <strong>Amigos:</strong> compare desempenho com colegas de trabalho ou escola;</li>
            <li>- <strong>Alunos:</strong> professores podem acompanhar o progresso da turma.</li>
          </ul>
        </section>

        <section className="instrucao-secao">
          <h2>Como criar um conjunto</h2>
          <p>
            Para criar um novo conjunto, clique no botão <strong>"+ Criar conjunto" </strong>
            no topo da página. Você precisará:
          </p>
          <div className="instrucao-item">
            <h3>1. Dar um nome ao conjunto</h3>
            <p>
              Escolha um nome que identifique o grupo, como "Família Silva", "Turma 5A",
              "Amigos do Numix", etc.
            </p>
          </div>
          <div className="instrucao-item">
            <h3>2. Adicionar membros</h3>
            <p>
              Digite os <strong>e-mails dos usuários</strong> que você deseja convidar para
              participar do conjunto. Os usuários convidados receberão um convite e, ao aceitarem,
              poderão visualizar o ranking apenas dos elementos do conjunto.
            </p>
          </div>
          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> visitantes não podem criar nem participar de conjuntos, você precisa de um login para isso.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Convites para conjuntos</h2>
          <p>
            Ao ser convidado para um conjunto no Numix, verá um <strong>aviso no item
            Conjuntos do menu</strong>.
          </p>
          <img
            src="/instrucoes/conviteconjuntos.png"
            alt="Menu lateral mostrando convites pendentes"
            className="instrucao-imagem"
          />
          <p>
            Na página de conjuntos, os convites pendentes aparecem no topo e você pode aceitar ou recusar o convite.
          </p>
          <img
            src="/instrucoes/conviteconjuntos2.png"
            alt="Menu lateral mostrando convites pendentes"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> dependendo do seu nível no Numix, você tem um <strong>limite de conjuntos </strong>
            que pode criar ou participar.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Visualizar rankings de conjuntos</h2>
          <p>
            Para ver o ranking de um conjunto específico acesse a página de <strong>Rankings</strong> e
            no filtro <strong>"Conjunto"</strong>, selecione o conjunto que deseja ver.
            Você verá o ranking apenas com os membros daquele conjunto.
          </p>
          <p>
            Você pode alternar entre o ranking global (todos os usuários) e o ranking de um
            conjunto a qualquer momento.
          </p>
          <img
            src="/instrucoes/filtroconjuntos.png"
            alt="Filtro de conjunto na página de rankings"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Sair de um conjunto</h2>
          <p>
            Você pode sair de um conjunto a qualquer momento. Ao sair:
          </p>
          <ul>
            <li>- Você não aparecerá mais nos rankings daquele conjunto;</li>
            <li>- Não poderá mais ver os rankings do conjunto;</li>
            <li>- Seus recordes gerais não são afetados;</li>
            <li>- Você pode ser convidado novamente no futuro.</li>
          </ul>
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para criar seu conjunto?</h2>
          <p>
            Agora que já sabe como funciona, volte para a página de conjuntos crie seu primeiro conjunto!
          </p>
          <div className="instrucao-acoes">
            <button onClick={() => navigate("/conjuntos")} className="btn-comecar-treino">
              Ver conjuntos
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesConjuntos;
