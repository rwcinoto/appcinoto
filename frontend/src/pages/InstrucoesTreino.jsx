import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesTreino.css";

const InstrucoesTreino = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre novos treinos no Numix</h1>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            Você pode começar um novo treino escolhendo um cartão de operação,
            um limite de tempo, um sistema numérico e clicando no botão "Começar
            treino".
          </p>
          <img
            src="/instrucoes/visaogeral.png"
            alt="Página Novo treino mostrando as seções"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> salve seu treino preferido no seu perfil e ao
            entrar na página de novo treino, ele será carregado por padrão.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Opções baseadas no seu nível no Numix</h2>
          <p>
            As opções estão disponíveis de acordo com seu nível. A cada nível
            aparecem novas operações, limites e sistemas.
          </p>
          <p>
            No primeiro nível (natural) você tem as operações soma, subtração,
            multiplicação e divisão. Tem também um tipo de operação aleatória
            que mistura todas as operações disponíveis.
          </p>
          <p>
            Nos próximos níveis vão aparecer as operações de raiz quadrada e
            conversão de sistemas. Você também poderá trabalhar com números
            inteiros, decimais, romanos, binários e hexadecimais. Além disso,
            você poderá ter limite de tempo de até 5 minutos.
          </p>
          <div className="instrucao-destaque">
            <strong>Dica:</strong> acesse{" "}
            <a
              href="https://cinoto.com.br/numix/ajuda"
              target="_blank"
              rel="noopener noreferrer"
            >
              cinoto.com.br/numix/ajuda
            </a>{" "}
            para mais detalhes sobre os níveis e as opções disponíveis.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Filtros disponíveis</h2>
          <p>
            Na parte superior da tela você encontra filtros que ajudam a
            personalizar sua experiência:
          </p>

          <div className="instrucao-item">
            <h3>Filtro de tipo</h3>
            <p>
              Use o filtro <strong>"Tipo"</strong> para encontrar mais rápido a
              operação que você quer treinar.
            </p>
          </div>

          <div className="instrucao-item">
            <h3>Limite de tempo</h3>
            <p>
              Define quanto tempo você terá para fazer o maior número de
              operações possíveis.
            </p>
          </div>

          <div className="instrucao-item">
            <h3>Sistema numérico</h3>
            <p>
              Escolha o sistema numérico em que deseja trabalhar: números
              naturais, inteiros, decimais, romanos, binários ou hexadecimais.
            </p>
            <img
              src="/instrucoes/filtrotipo.png"
              alt="Filtro de tipo"
              className="instrucao-imagem"
            />
          </div>
          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> no primeiro nível (natural) você tem
            apenas uma opção de limite de tempo (1 minuto) e apenas uma opção de
            sistema numérico (naturais).
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Escolhendo a operação</h2>
          <p>
            Selecione uma operação clicando no cartão correspondente. As
            operações são agrupadas por tipo e cada um tem uma cor específica
            para facilitar a identificação.
          </p>
          <img
            src="/instrucoes/operacoes.png"
            alt="Cartões de operações"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Sistemas especiais: romanos, binários e hexadecimais</h2>
          <p>
            Se você escolher um sistema <strong>romano</strong>,{" "}
            <strong>binário</strong> ou <strong>hexadecimal</strong>, após
            clicar em "Começar treino" aparecerá uma tela perguntando como você
            prefere dar suas respostas:
          </p>
          <ul>
            <li>
              <strong>- No sistema escolhido:</strong> você verá as questões e
              dará as respostas usando o sistema selecionado (ex: números
              romanos como IV, X, etc.);
            </li>
            <li>
              <strong>- Em números naturais:</strong> As questões serão
              mostradas no sistema escolhido, mas você poderá responder em
              números naturais (1, 2, 3, etc.).
            </li>
          </ul>
          <img
            src="/instrucoes/formato.png"
            alt="Modal de escolha do formato de resposta"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Começando o treino</h2>
          <p>
            Após escolhido o formato do treino, clique no botão{" "}
            <strong>"Começar treino"</strong>.
          </p>

          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> ao clicar em "Começar treino", uma
            contagem regressiva aparecerá e o treino já será contabilizado,
            mesmo que você pare antes de terminar o tempo limite.
          </div>
          <p>
            O sistema sempre mostra a conta atual e a próxima logo abaixo.
            Quando você digitar a resposta correta, já virá a próxima para
            responder, não precisa apertar a tecla enter. Quando você digitar
            algo errado, o sistema apaga tudo o que digitou e deixa a caixa de
            resposta vermelha para saber que errou. O sistema só apresentará a
            próxima conta quando você digitar a resposta correta, não tem como
            pular uma conta.
          </p>
          <img
            src="/instrucoes/erro.png"
            alt="Aviso de algarismo digitado errado"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Dicas para melhor desempenho no Numix</h2>

          <div className="instrucao-item">
            <h3>Para aprender</h3>
            <p>
              Comece com as operações mais simples. Conforme for se sentindo
              confortável, aumente gradualmente a dificuldade.
            </p>
          </div>

          <div className="instrucao-item">
            <h3>Para competir</h3>
            <p>
              Se além de aprender você quiser competir nos rankings,
              recomendamos treinar no
              <strong> computador</strong>, pois é possível ser mais rápido do
              que no celular devido à facilidade de digitação.
            </p>
          </div>
          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> se entrar como visitante, seus recordes
            não serão salvos.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para começar?</h2>
          <p>
            Agora que já sabe como funciona, pode clicar no botão abaixo para
            voltar e começar!
          </p>
          <div className="instrucao-acoes">
            <button
              onClick={() => navigate("/novo-treino")}
              className="btn-comecar-treino"
            >
              Fazer um treino
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesTreino;
