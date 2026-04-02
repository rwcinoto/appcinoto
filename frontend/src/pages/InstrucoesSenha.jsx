import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesCalendario.css";
import "./InstrucoesSenha.css";
import "./InstrucoesTreino.css";

const BolinhaCheia = () => (
  <span className="instrucoes-senha-feedback-correto" title="Posição correta">
    ●
  </span>
);

const BolinhaVazia = () => (
  <span
    className="instrucoes-senha-feedback-parcial"
    title="Dígito certo, posição errada"
  >
    ○
  </span>
);

const InstrucoesSenha = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre treinos de senha no Numix</h1>
        <p className="instrucoes-aviso-tutorial">
          Há um{" "}
          <a href="#exemplo-correcao" className="instrucoes-aviso-link">
            exemplo passo a passo
          </a>{" "}
          da correção de uma tentativa abaixo.
        </p>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            No menu Senha você vê o ranking do Numix para cada configuração
            (dígitos, tamanho e repetição). Ajuste os filtros e use o botão
            &quot;Iniciar este treino&quot;. Em &quot;Meus recordes&quot; você
            pode ver sua melhor pontuação em cada configuração.
          </p>
          <div className="instrucao-destaque">
            <strong>Dica:</strong> salve no seu perfil suas preferências de
            senha para a página carregar com esses valores por padrão.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Sua posição no ranking</h2>
          <p>
            No quadro acima da tabela aparecem sua posição no ranking e quantas
            pessoas já jogaram nessa configuração. O recorde é a{" "}
            <strong>quantidade de tentativas</strong> que você usou para acertar
            a senha; entre parênteses aparece o <strong>tempo</strong> gasto.
          </p>
          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> visitantes não entram no ranking, pois
            os recordes não são salvos.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Objetivo do treino</h2>
          <p>
            O sistema sorteia uma <strong>senha</strong>: uma sequência de 3, 4
            ou 5 algarismos (conforme o tamanho escolhido), usando o conjunto de
            dígitos permitido (conforme o número de dígitos escolhido). Você não
            vê a senha; precisa descobri-la fazendo até 20 tentativas. Cada
            tentativa é uma sequência do mesmo tamanho. Depois de cada envio, o
            sistema faz uma correção (as bolinhas ao lado) para você refinar a
            próxima tentativa.
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>O que significam as bolinhas (correção)</h2>
          <p>
            Ao lado de cada tentativa aparecem marcadores: primeiro todos os{" "}
            <strong>cheios</strong>, depois todos os <strong>vazios</strong>.
          </p>
          <ul>
            <li>
              <strong>
                Bolinha cheia (<BolinhaCheia />
                ):
              </strong>{" "}
              um algarismo que está na posição certa. Cada <BolinhaCheia />{" "}
              corresponde a uma posição da sua linha que coincide exatamente com
              a senha.
            </li>
            <li>
              <strong>
                Bolinha vazia (<BolinhaVazia />
                ):
              </strong>{" "}
              um algarismo que existe na senha, mas que você colocou na posição
              errada.
            </li>
          </ul>
          <p>
            As bolinhas <strong>não indicam qual posição</strong> está certa ou
            errada, só quantos acertos totais desse tipo existem na linha.
            Algarismos que não estão na senha, não aparecem na correção.
          </p>
          <div className="instrucao-destaque instrucao-importante">
            <strong>Repetição:</strong> com repetição permitida, o cálculo
            continua sendo o mesmo: primeiro conta os <BolinhaCheia />; depois,
            cada cópia do dígito na tentativa só casa com uma ocorrência
            disponível na senha.
          </div>
        </section>

        <section
          id="exemplo-correcao"
          className="instrucao-secao instrucao-secao-tutorial"
        >
          <h2>
            Exemplo: contar <BolinhaCheia /> e <BolinhaVazia />
          </h2>
          <p>
            Suponha que a senha secreta seja <strong>1 2 3 4</strong>.
          </p>
          <p>
            Você envia a tentativa <strong>3 2 4 5</strong>:
          </p>
          <div className="instrucao-item">
            <h3>
              Passo 1 — posições exatas (<BolinhaCheia />)
            </h3>
            <p>
              Só a segunda casa coincide (o 2). Então há{" "}
              <strong>
                1 <BolinhaCheia />
              </strong>
              .
            </p>
          </div>
          <div className="instrucao-item">
            <h3>
              Passo 2 — algarismo certo, lugar errado (<BolinhaVazia />)
            </h3>
            <p>
              Tirando o 2, sobram os dígitos 3, 4 e 5. O 3 e o 4 aparecem na
              senha; o 5 não. Isso dá{" "}
              <strong>
                2 <BolinhaVazia />
              </strong>
              .
            </p>
          </div>
          <p>
            Resumo: o feedback dessa linha é <BolinhaCheia />
            <BolinhaVazia />
            <BolinhaVazia />.
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>Tipos de configuração</h2>
          <p>
            Cada treino é definido por três opções. O que você pode escolher
            depende do seu <strong>nível</strong> no Numix.
          </p>

          <div className="instrucao-item">
            <h3>Dígitos</h3>
            <p>
              Quantos algarismos diferentes podem aparecer na senha. Por
              exemplo, &quot;6 dígitos&quot; significa que só entram algarismos
              de <strong>1 a 6</strong>. Com <strong>10 dígitos</strong>, entram{" "}
              <strong>0 a 9</strong> (e o zero pode aparecer em qualquer
              posição, inclusive na primeira).
            </p>
          </div>

          <div className="instrucao-item">
            <h3>Tamanho</h3>
            <p>
              Quantas casas tem a senha: <strong>3, 4 ou 5</strong> casas.
            </p>
          </div>

          <div className="instrucao-item">
            <h3>Repetição</h3>
            <p>
              <strong>Sem repetição:</strong> cada algarismo é diferente, você
              nunca verá o mesmo dígito duas vezes na senha.
            </p>
            <p>
              <strong>Com repetição:</strong> o mesmo dígito pode aparecer mais
              de uma vez, o jogo fica mais difícil.
            </p>
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Durante o treino na tela</h2>
          <p>
            Depois de iniciar, há uma <strong>contagem regressiva</strong>. O
            cronômetro inicia após essa contagem e vale o tempo até você acertar
            a senha ou esgotar as 20 tentativas.
          </p>
          <p>
            Você pode digitar no teclado físico ou usar o teclado na tela. Setas
            mudam a casa ativa; backspace apaga. Quando todas as casas estiverem
            preenchidas, use <strong>OK</strong> ou <strong>Enter</strong> para
            enviar.
          </p>
          <p>
            Você tem até <strong>20 tentativas</strong> por partida. Se acertar
            antes disso, o treino termina com vitória. Se usar todas sem
            acertar, termina e você pode ver o gabarito conforme a tela de
            resultado.
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>Ranking global e conjuntos</h2>
          <p>
            No filtro de <strong>conjunto</strong>, quando disponível, você pode
            ver o ranking só entre participantes daquele grupo.
            &quot;Global&quot; usa todos os usuários elegíveis (respeitando a
            opção de perfil de não aparecer no ranking global).
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>Critérios de desempate no ranking</h2>
          <p>
            A classificação prioriza quem resolve com{" "}
            <strong>menos tentativas</strong>. Em empate nesse número, quem tem{" "}
            <strong>menor tempo</strong> fica à frente. Se ainda empatar,
            prevalece quem alcançou aquele resultado <strong>primeiro</strong>{" "}
            (recorde mais antigo).
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para jogar?</h2>
          <p>
            Volte para a página Senha, escolha a configuração e inicie um
            treino.
          </p>
          <div className="instrucao-acoes">
            <button
              onClick={() => navigate("/senha")}
              className="btn-comecar-treino"
            >
              Ir para senha
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesSenha;
