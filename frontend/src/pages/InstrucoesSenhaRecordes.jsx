import React from "react";
import { useNavigate } from "react-router-dom";
import "./InstrucoesRecordes.css";

const InstrucoesSenhaRecordes = () => {
  const navigate = useNavigate();

  return (
    <div className="instrucoes-container">
      <div className="instrucoes-header">
        <button onClick={() => navigate(-1)} className="btn-voltar">
          ← Voltar
        </button>
        <h1>Sobre os recordes de senha no Numix</h1>
      </div>

      <div className="instrucoes-content">
        <section className="instrucao-secao">
          <h2>Visão geral</h2>
          <p>
            Na página de recordes de senha aparecem todas as configurações de
            treino de senha em que você já obteve um recorde no Numix. Cada
            cartão mostra sua melhor marca para aquela combinação (dígitos +
            tamanho + repetição).
          </p>
          <img
            src="/instrucoes/recordesSenha.png"
            alt="Página Recordes de Senha mostrando os cartões"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Informações nos cartões</h2>
          <p>
            Cada cartão de recorde de senha exibe informações sobre seu
            desempenho:
          </p>
          <ul>
            <li>
              - <strong>Quantidade de dígitos</strong> possíveis na senha (6 a
              10);
            </li>
            <li>
              - <strong>Tentativas:</strong> seu menor número de tentativas para
              acertar a senha, com o <strong>tempo</strong> entre parênteses;
            </li>
            <li>
              - <strong>Tamanho</strong> da senha: de 3 a 5 casas;
            </li>
            <li>
              - <strong>Repete</strong>, quando a configuração permite repetir
              algarismos na senha;
            </li>
            <li>
              - <strong>Data</strong> em que o recorde foi batido;
            </li>
            <li>
              - <strong>Treinos:</strong> quantas vezes você já treinou aquela
              configuração;
            </li>
            <li>
              - <strong>Posição no ranking global</strong> e quantas pessoas
              jogaram nessa configuração.
            </li>
          </ul>
          <img
            src="/instrucoes/recordeSenhaCartao.png"
            alt="Exemplo de cartão de recorde de senha com as informações"
            className="instrucao-imagem"
          />
        </section>

        <section className="instrucao-secao">
          <h2>Ações rápidas nos cartões</h2>

          <div className="instrucao-item">
            <h3>Iniciar treino com as mesmas configurações</h3>
            <p>
              No <strong>canto superior esquerdo</strong> de cada cartão há o
              botão &quot;Treinar&quot;. Clicando nele, você inicia um novo
              treino de senha com as mesmas opções daquele recorde (mesmos
              dígitos, tamanho e repetição).
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
              A <strong>posição no ranking</strong> é clicável. Ao clicar nela,
              você é levado à página de ranking de senha já filtrada para aquela
              configuração, onde pode comparar seu desempenho com o de outras
              pessoas.
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
              - <strong>Dígitos:</strong> mostra apenas uma quantidade de
              dígitos (6, 7, 8, 9 ou 10);
            </li>
            <li>
              - <strong>Tamanho:</strong> filtra pelo número de casas da senha;
            </li>
            <li>
              - <strong>Repetição:</strong> sim ou não (com ou sem repetição de
              algarismos).
            </li>
          </ul>
          <img
            src="/instrucoes/filtrosRecordesSenha.png"
            alt="Filtros de dígitos, tamanho e repetição na página de recordes de senha"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> ao atualizar a página (F5), os filtros são
            limpos e você volta a ver todos os seus recordes visíveis.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Ver recordes de outros usuários</h2>
          <p>
            Você pode ver os recordes de senha de outro usuário no Numix ao
            clicar no nome dele em qualquer ranking de senha.
          </p>
        </section>

        <section className="instrucao-secao">
          <h2>Últimos recordes batidos no Numix</h2>
          <p>
            Na parte de baixo da página há uma seção com os 20{" "}
            <strong>últimos recordes de senha batidos no Numix</strong>. Ao
            clicar no nome do usuário de um recorde, você é levado à página de
            recordes de senha daquela pessoa.
          </p>
          <img
            src="/instrucoes/ultimosRecordesSenha.png"
            alt="Últimos recordes de senha batidos no Numix"
            className="instrucao-imagem"
          />
          <div className="instrucao-destaque">
            <strong>Dica:</strong> use o botão &quot;Treinar&quot; no cartão
            para começar um treino com a mesma configuração daquele recorde.
          </div>
        </section>

        <section className="instrucao-secao">
          <h2>Pronto para treinar?</h2>
          <p>
            Agora que já sabe como funciona, volte para a página de recordes de
            senha e acompanhe suas marcas.
          </p>
          <div className="instrucao-acoes">
            <button
              onClick={() => navigate("/senha/recordes")}
              className="btn-comecar-treino"
            >
              Ver meus recordes de senha
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstrucoesSenhaRecordes;
