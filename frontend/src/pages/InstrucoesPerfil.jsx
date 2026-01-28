import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesPerfil.css";

const InstrucoesPerfil = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre o perfil no Numix</h1>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            Na página de perfil você pode personalizar suas informações e preferências no Numix.
          </p>
          <img
            src="/instrucoes/perfil.png"
            alt="Página de perfil mostrando o formulário"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Informações pessoais</h2>

          <div className="instrucao-item">
            <h3>Nome</h3>
            <p>
              Você pode alterar seu nome a qualquer momento, e a mudança será refletida em
              todos os rankings imediatamente.
            </p>
          </div>

          <div className="instrucao-item">
            <h3>Email</h3>
            <p>
              O email é o que você usa para <strong>entrar no sistema</strong>. Se você mudá-lo,
              usará o novo email na próxima vez que entrar.
            </p>
            <div className="instrucao-destaque instrucao-importante">
              <strong>Importante:</strong> use um email ao qual você tenha acesso, pois ele é usado na recuperação de senha.
            </div>
          </div>

          <div className="instrucao-item">
            <h3>Senha</h3>
            <p>
              Você pode alterar sua senha a qualquer momento. Preencha apenas se quiser mudar sua senha atual.
            </p>
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Treino favorito</h2>
          <p>
            Configure seu treino favorito escolhendo uma operação, um limite e um
            sistema. Escolha como favorito o treino que você mais pratica, e pode mudar isso quando quiser. Essa configuração facilita:
          </p>

          <div className="instrucao-item">
            <h3>Ao entrar em novo treino</h3>
            <p>
              A página já virá <strong>pré-configurada com seu treino favorito</strong> e basta clicar em "Começar treino"
              para treinar.
            </p>
          </div>

          <div className="instrucao-item">
            <h3>Ao entrar em rankings</h3>
            <p>
              A página de rankings já exibirá automaticamente o <strong>ranking do seu treino
              favorito</strong>.
            </p>
          </div>

          <img
            src="/instrucoes/perfilfavorito.png"
            alt="Página de perfil mostrando o treino favorito"
            className="instrucao-imagem"
          />

          <div className="instrucao-destaque">
            <strong>Informação:</strong> se não escolher nada, o sistema irá usar as configurações padrão.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Privacidade nos rankings</h2>
          <p>
            Você pode escolher se deseja <strong>mostrar seu nome nos rankings globais</strong> do Numix.
          </p>

          <div className="instrucao-item">
            <h3>Aparecer nos rankings globais</h3>
            <p>
              Quando esta opção está ativada:
            </p>
            <ul>
              <li>- Seu nome aparece nos rankings globais de todas as operações que já treinou;</li>
              <li>- Outros usuários podem ver suas pontuações;</li>
              <li>- Outros usuários podem clicar no seu nome para ver seus recordes.</li>
            </ul>
          </div>

          <div className="instrucao-item">
            <p>
              Quando esta opção está desativada:
            </p>
            <ul>
              <li>- Seu nome não aparece nos rankings globais;</li>
              <li>- Você ainda pode ver os rankings de outros usuários;</li>
              <li>- Seus recordes continuam salvos normalmente.</li>
            </ul>
          </div>

          <div className="instrucao-destaque instrucao-importante">
            <strong>Importante:</strong> Se não quiser aparecer em um ranking de conjunto, você deve sair daquele conjunto.
          </div>

          <img
            src="/instrucoes/rankingperfil.png"
            alt="Página de perfil mostrando a configuração de privacidade nos rankings"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para personalizar?</h2>
          <p>
            Agora que já sabe como funciona, volte para a página de perfil e configure suas
            preferências!
          </p>
          <div className="instrucao-acoes">
            <button onClick={() => navigate("/perfil")} className="btn-comecar-treino">
              Ver perfil
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesPerfil;
