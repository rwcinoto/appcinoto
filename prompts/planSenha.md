# Plano de implementação - Senha (Mastermind)

Plano para implementar o módulo de treinos de Senha, um jogo baseado no clássico Mastermind (anos 80). O jogador deve descobrir uma sequência secreta de algarismos através de tentativas, recebendo feedback sobre acertos (posição correta) e parciais (algarismo certo na posição errada). O módulo deve ser integrado ao sistema existente, seguindo os mesmos padrões do módulo de calendário (ranking, recordes, treino, perfil).

**Regras do jogo:**
- O sistema sorteia uma sequência de 3, 4 ou 5 algarismos (configurável pelo "Tamanho")
- Os algarismos vão de 1 até N, onde N é a quantidade de "Dígitos" escolhida (6 a 10). Quando N=10, usa-se 1-9 e 0 (zero pode ser o primeiro)
- O jogador faz tentativas para descobrir a sequência
- A cada tentativa errada, o sistema mostra: quantidade de algarismos na posição correta + quantidade de algarismos certos na posição errada (sem revelar quais são)
- Limite de 20 tentativas
- Recorde = menor número de tentativas; desempate por menor tempo; segundo desempate pelo treino mais antigo

---

## 1. Backend - Migration da tabela `recordes_senha`

Criar migration com os campos:

- `id` (INT, auto incremento, PK)
- `id_usuario` (INT 11, FK usuarios)
- `digitos` (INT 11) — quantidade de dígitos disponíveis (6, 7, 8, 9 ou 10)
- `tamanho` (INT 11) — tamanho da senha (3, 4 ou 5)
- `repeticao` (TINYINT 1, default 0) — se permite repetição de algarismos (0=não, 1=sim)
- `total` (INT 11) — quantidade de tentativas para acertar a senha (melhor resultado)
- `tempo` (INT 11) — tempo em milissegundos (ou formato usado no calendário) para acertar
- `data_recorde` (DATETIME, opcional)
- `quantidade` (INT 11, default 1) — total de treinos iniciados nessa combinação
- `criado_em` (DATETIME)
- `criado_por` (INT 11, opcional, FK usuarios)
- `atualizado_em` (DATETIME)
- `atualizado_por` (INT 11, opcional, FK usuarios)

Índices:
- Índice único composto: `(id_usuario, digitos, tamanho, repeticao)`
- Índice composto para ranking: `(digitos, tamanho, repeticao, total, tempo)`
- FKs para `usuarios` em `id_usuario`, `criado_por`, `atualizado_por`

Seguir o mesmo padrão da migration `20260211000000-create-recorde-calendario.js`.

---

## 2. Backend - Migration para preferências de Senha no usuário

Adicionar três colunas na tabela `usuarios`:

- `senha_digitos` (INT 11, nullable) — quantidade favorita de dígitos (6-10)
- `senha_tamanho` (INT 11, nullable) — tamanho favorito da senha (3-5)
- `senha_repeticao` (TINYINT 1, nullable) — preferência de repetição (0=não, 1=sim)

Seguir o mesmo padrão da migration `20260212000000-add-calendario-tipo-treino-to-usuarios.js`.

---

## 3. Backend - Model Sequelize `RecordeSenha`

Criar model `RecordeSenha` em `backend/src/models/RecordeSenha.js`:

- Tabela: `recordes_senha`
- Campos conforme migration da tarefa 1
- Associações: `belongsTo(Usuario)`, similar ao `RecordeCalendario`
- Registrar no `models/index.js` (carregamento automático)

Seguir o mesmo padrão do model `RecordeCalendario.js`.

---

## 4. Backend - Serviço `treinoSenhaService.js`

Criar `backend/src/services/treinoSenhaService.js` com a lógica do jogo:

- `sortearSenha(digitos, tamanho, repeticao)` — gera a sequência secreta:
  - Algarismos de 1 a `digitos` (se `digitos=10`, usa 1-9 e 0)
  - Com ou sem repetição conforme parâmetro
  - Retorna array de números
- `verificarTentativa(senhaSecreta, tentativa)` — compara tentativa com a senha:
  - Retorna `{ corretos, parciais }` onde `corretos` = algarismos na posição certa e `parciais` = algarismos certos na posição errada
  - Algoritmo: primeiro marca os exatos; depois nos restantes, conta os parciais sem duplicação
- `validarOpcoes(digitos, tamanho, repeticao, idPlano)` — valida se as opções são permitidas para o plano do usuário:
  - Plano 2: apenas digitos=6, tamanho=4, repeticao=não
  - Plano 3: digitos 6-7, tamanho 3-4, repeticao sim/não
  - Plano 4: digitos 6-8, tamanho 3-5, repeticao sim/não
  - Plano 5: digitos 6-9, tamanho 3-5, repeticao sim/não
  - Plano 6: digitos 6-10, tamanho 3-5, repeticao sim/não

---

## 5. Backend - Serviço `recordeSenhaService.js`

Criar `backend/src/services/recordeSenhaService.js`:

- `incrementarQuantidadeTreinoSenha(idUsuario, digitos, tamanho, repeticao)` — busca ou cria o registro em `recordes_senha` e incrementa `quantidade`
- `verificarESalvarRecordeSenha(idUsuario, digitos, tamanho, repeticao, total, tempo)` — verifica se é recorde:
  - Se não existe registro: cria com o resultado
  - Se `total` (tentativas) < recorde atual: atualiza
  - Se `total` = recorde atual e `tempo` < tempo do recorde: atualiza
  - Retorna `{ bateuRecorde, recordeAnterior: { total, tempo }, recordeAtual: { total, tempo } }`
- `listarRecordes(idUsuario)` — lista todos os recordes do usuário
- `listarUltimosRecordesBatidos(limite)` — lista os últimos recordes batidos no sistema (global)

Seguir o mesmo padrão do `recordeCalendarioService.js`.

---

## 6. Backend - Serviço `rankingSenhaService.js`

Criar `backend/src/services/rankingSenhaService.js`:

- `obterRanking(digitos, tamanho, repeticao, conjuntoId, usuarioId)`:
  - Filtra `RecordeSenha` por `digitos`, `tamanho` e `repeticao`
  - Ordenação: `total` ASC (menos tentativas = melhor), `tempo` ASC (desempate), `data_recorde` ASC (mais antigo ganha segundo desempate)
  - Inclui `Usuario` com `ativo: true` e (para global) `ranking_global: true`
  - Se `conjuntoId`: filtra por membros aceitos do conjunto (sem exigir `ranking_global`)
  - Retorna `{ ranking, posicaoUsuario, totalParticipantes }`
  - Top 100

Seguir o mesmo padrão do `rankingCalendarioService.js`.

---

## 7. Backend - Controllers e rotas

### 7.1. `senhaController.js`

- `iniciarTreino` — valida plano e opções, sorteia senha, armazena treino em memória (Map com limpeza), retorna `treino_id`
- `confirmarInicio` — marca início do treino, incrementa `quantidade` via `recordeSenhaService`
- `tentativa` — recebe tentativa do jogador, valida, retorna `{ corretos, parciais, acertou }`; se acertou, calcula tempo
- `finalizarTreino` — salva recorde via `recordeSenhaService`, retorna resultado com info de recorde

### 7.2. `rankingSenhaController.js`

- `obterRanking` — query params: `digitos`, `tamanho`, `repeticao`, `conjunto_id`

### 7.3. `recordeSenhaController.js`

- `listar` — query params: `digitos?`, `tamanho?`, `repeticao?`, `usuario_id?`
- `listarUltimosBatidos` — query param: `limite?`

### 7.4. Rotas

Criar três arquivos de rotas e registrar no `routes/index.js`:

- `senhaRoutes.js`:
  - `POST /senha/treinos/iniciar`
  - `POST /senha/treinos/confirmar-inicio`
  - `POST /senha/treinos/tentativa`
  - `POST /senha/treinos/finalizar`
- `rankingSenhaRoutes.js`:
  - `GET /senha/rankings`
- `recordeSenhaRoutes.js`:
  - `GET /senha/recordes`
  - `GET /senha/recordes/ultimos-batidos`

Todas com `authMiddleware`. Registrar em `routes/index.js` com:
- `router.use("/senha", require("./senhaRoutes"))`
- `router.use("/senha/rankings", require("./rankingSenhaRoutes"))`
- `router.use("/senha/recordes", require("./recordeSenhaRoutes"))`

---

## 8. Backend - Atualizar model `Usuario` e endpoints de perfil

- Adicionar os campos `senha_digitos`, `senha_tamanho`, `senha_repeticao` no model `Usuario.js`
- Atualizar o `usuarioController` / `authController` para incluir esses campos nas respostas e na atualização do perfil
- Atualizar o `authService` (endpoint `/auth/me`) para retornar as preferências de Senha

Seguir o mesmo padrão usado para `calendario_tipo_treino`.

---

## 9. Frontend - Menu "Senha" e rotas

### 9.1. Menu

Inserir item "Senha" no `Sidebar.jsx`, abaixo do item "Calendário". Rota: `/senha`.

### 9.2. Rotas

Adicionar em `routes.js` com lazy loading:

- `/senha` — página de ranking de Senha (`Senha.jsx`)
- `/senha/recordes` — página de recordes de Senha (`SenhaRecordes.jsx`)

---

## 10. Frontend - Página de ranking de Senha (`Senha.jsx`)

Criar `frontend/src/pages/Senha.jsx` seguindo o mesmo padrão de `Calendario.jsx`:

- Quatro filtros:
  - **Dígitos**: 6, 7, 8, 9, 10 (filtrado pelo plano do usuário; padrão: 6 ou preferência do usuário)
  - **Tamanho**: 3, 4, 5 (filtrado pelo plano do usuário; padrão: 4 ou preferência do usuário)
  - **Repetição**: Não / Sim (filtrado pelo plano; padrão: Não ou preferência do usuário)
  - **Conjunto**: Global / conjuntos do usuário (padrão: Global)
- Reutilizar `TabelaRanking`, `LinhaRanking` (mesmos componentes do calendário/operações)
- Consumir `GET /api/senha/rankings`
- Na primeira carga, usar preferências do usuário (`senha_digitos`, `senha_tamanho`, `senha_repeticao`) se disponíveis
- Link "Meus recordes" → `/senha/recordes`

### Regras de exibição de filtros por plano:
- Plano 2: Dígitos fixo em 6, Tamanho fixo em 4, Repetição fixo em "Não"
- Plano 3: Dígitos 6-7, Tamanho 3-4, Repetição escolhe
- Plano 4: Dígitos 6-8, Tamanho 3-5, Repetição escolhe
- Plano 5: Dígitos 6-9, Tamanho 3-5, Repetição escolhe
- Plano 6: Dígitos 6-10, Tamanho 3-5, Repetição escolhe

---

## 11. Frontend - Componente `InfoUsuarioSenha.jsx`

Criar `frontend/src/components/rankings/InfoUsuarioSenha.jsx`:

- Exibir recorde e posição do usuário logado para o filtro selecionado
- Botão "Iniciar treino" que navega para a tela de treino de Senha
- Nome do usuário como link para a página de recordes
- Seguir o mesmo padrão de `InfoUsuarioCalendario.jsx`

---

## 12. Frontend - Página de treino de Senha (`TreinoSenha.jsx`)

Criar `frontend/src/pages/TreinoSenha.jsx` (ou integrar em `TreinoAtivo.jsx` com modo "senha"):

- **Contagem regressiva** de 3 segundos (reutilizar `ContagemRegressiva`)
- **Cronômetro** visível durante o treino (reutilizar `Timer` ou criar variante sem limite de tempo)
- **Tela do jogo:**
  - Exibir tentativas anteriores com seus feedbacks (scrollável se necessário)
  - Linha de tentativa atual com `tamanho` campos de input para digitar algarismos
  - Os campos aceitam algarismos de 1 a `digitos` (se `digitos=10`, aceita 0-9)
  - O jogador pode preencher os campos em qualquer ordem
  - Botão "Confirmar" (ou similar) para submeter a tentativa — só habilitado quando todos os campos estiverem preenchidos
- **Feedback por tentativa:**
  - À direita da tentativa, mostrar sinais de acerto: um símbolo para "posição correta" repetido N vezes + outro símbolo para "algarismo certo, posição errada" repetido M vezes
  - Primeiro os sinais de posição correta, depois os de posição errada
  - Sugestão de símbolos: ● (cheio/verde) para posição correta, ○ (vazio/amarelo) para posição errada
- **Contagem de tentativas** visível (ex.: "Tentativa 3 de 20")
- **Fluxo:**
  1. Ao iniciar: `POST /senha/treinos/iniciar` → recebe `treino_id`
  2. Após contagem regressiva: `POST /senha/treinos/confirmar-inicio`
  3. A cada tentativa: `POST /senha/treinos/tentativa` → recebe `{ corretos, parciais, acertou }`
  4. Se acertou ou 20 tentativas: `POST /senha/treinos/finalizar`
- **Se acertou:** mostrar resultado com info de recorde (reutilizar padrão de `ResultadoTreino` adaptado)
- **Se não acertou em 20 tentativas:** mostrar mensagem de que não conseguiu descobrir, revelar a senha correta
- **Botão "Gabarito":** sempre visível após o treino (acertando ou não), navega para tela de gabarito
- Usar `sessionStorage` para persistência local, como no treino de calendário

Registrar rota `/treino-senha` em `routes.js`.

---

## 13. Frontend - Página de gabarito de Senha (`GabaritoSenha.jsx`)

Criar `frontend/src/pages/GabaritoSenha.jsx` (ou integrar no `GabaritoTreino.jsx` existente):

- Mostrar todas as tentativas feitas, com os feedbacks (corretos/parciais) de cada uma
- Mostrar a senha correta no topo ou rodapé
- Destacar a tentativa em que acertou (se acertou)
- Botão para voltar ao ranking

Registrar rota `/senha/gabarito` em `routes.js`.

---

## 14. Frontend - Página de recordes de Senha (`SenhaRecordes.jsx`)

Criar `frontend/src/pages/SenhaRecordes.jsx` seguindo o padrão de `CalendarioRecordes.jsx`:

- Mostrar recordes do usuário logado (ou de outro usuário via `?usuario_id=`)
- Mostrar recordes de todas as combinações que a pessoa já treinou (digitos × tamanho × repetição)
- Cada cartão de recorde deve mostrar:
  - A combinação (ex.: "6 dígitos · Tamanho 4 · Sem repetição")
  - O recorde (tentativas + tempo)
  - A posição no ranking global (link para o ranking com aquele filtro)
  - Botão para iniciar treino daquele tipo
- Diferenciação visual:
  - Cor por quantidade de dígitos (como fazemos por tipo no calendário)
  - Distinção visual entre com/sem repetição (como limite no calendário)
  - Badge para o tamanho (como sistema nos treinos de operações)
- Abaixo dos recordes do usuário: lista dos últimos recordes de Senha batidos no Numix
- Consumir `GET /api/senha/recordes` e `GET /api/senha/recordes/ultimos-batidos`

---

## 15. Frontend - Componentes de recordes de Senha

Criar os componentes seguindo o padrão dos de calendário:

- `CardRecordeSenha.jsx` — cartão individual de recorde (com posição no ranking, botão de iniciar treino)
- `ListaRecordesSenha.jsx` — lista de cartões de recordes do usuário
- `CardUltimoRecordeSenhaBatido.jsx` — cartão de recorde recém-batido (feed global)
- `ListaUltimosRecordesSenhaBatidos.jsx` — lista do feed de últimos recordes

Seguir os padrões de `CardRecordeCalendario.jsx`, `ListaRecordesCalendario.jsx`, etc.

---

## 16. Frontend - Atualizar página de perfil

Adicionar seção "Preferências de Senha" na página `Perfil.jsx`:

- Select para quantidade favorita de dígitos (6-10, filtrado pelo plano)
- Select para tamanho favorito (3-5, filtrado pelo plano)
- Select para repetição favorita (Não/Sim, filtrado pelo plano)

Salvar via endpoint de atualização de perfil. Seguir o mesmo padrão usado para `calendario_tipo_treino`.

---

## 17. Frontend - Constantes e utilitários de Senha

Criar `frontend/src/constants/senha.js`:

- Mapeamento de dígitos por plano
- Mapeamento de tamanho por plano
- Mapeamento de repetição por plano
- Labels e cores para cada quantidade de dígitos
- Labels para tamanho e repetição

Criar `frontend/src/utils/senha.js` (se necessário):

- Funções de formatação e helpers para o jogo

---

## 18. Ajustes finais e integração

- Links cruzados: na página de ranking, nome do jogador deve linkar para `/senha/recordes?usuario_id=X`
- Na página de recordes, cada cartão linka para o ranking com os filtros correspondentes
- Botão de iniciar treino nos cartões de recordes e no componente InfoUsuarioSenha
- Verificar fuso horário do Brasil ao salvar `data_recorde`
- Testar fluxo completo: iniciar treino → jogar → acertar/esgotar → salvar recorde → ranking → recordes
- Testar com visitante (plano 2): opções fixas, sem salvar recorde (ou salvar em recordes_visitantes se aplicável)
- Verificar responsividade mobile

---

## Ordem de execução das tarefas

| #  | Tarefa | Escopo |
|----|--------|--------|
| 1  | Migration tabela `recordes_senha` | Backend/DB |
| 2  | Migration preferências de Senha em `usuarios` | Backend/DB |
| 3  | Model `RecordeSenha` e inclusão em models | Backend |
| 4  | Serviço `treinoSenhaService.js` — lógica do jogo (sortear, verificar, validar opções) | Backend |
| 5  | Serviço `recordeSenhaService.js` — criar/atualizar recordes, listar | Backend |
| 6  | Serviço `rankingSenhaService.js` — montar ranking com filtros e conjuntos | Backend |
| 7  | Controllers e rotas de Senha (treino, ranking, recordes) + registrar em `routes/index.js` | Backend |
| 8  | Atualizar model `Usuario` e endpoints de perfil com preferências de Senha | Backend |
| 9  | Constantes e utilitários de Senha no frontend | Frontend |
| 10 | Menu "Senha" no Sidebar e rotas em `routes.js` | Frontend |
| 11 | Página de ranking de Senha (`Senha.jsx`) com filtros e tabela | Frontend |
| 12 | Componente `InfoUsuarioSenha.jsx` (recorde + botão iniciar treino) | Frontend |
| 13 | Página de treino de Senha (`TreinoSenha.jsx`) — tela do jogo completa | Frontend |
| 14 | Página de gabarito de Senha (`GabaritoSenha.jsx`) | Frontend |
| 15 | Página de recordes de Senha (`SenhaRecordes.jsx`) | Frontend |
| 16 | Componentes de recordes (`CardRecordeSenha`, `ListaRecordesSenha`, cards de últimos batidos) | Frontend |
| 17 | Atualizar página de perfil com preferências de Senha | Frontend |
| 18 | Ajustes finais: links cruzados, fuso horário, testes, responsividade | Full-stack |

---

## Notas técnicas

- **Fuso horário:** Ao salvar `data_recorde`, usar timezone do Brasil (America/Sao_Paulo) para evitar deslocamento de dia, conforme `database.js` já configurado com `timezone: "-03:00"`.
- **Compatibilidade:** Manter mesma estrutura de resposta das APIs (ranking, recordes) para facilitar reutilização dos componentes de tabela e cards.
- **Treinos em memória:** Armazenar treinos ativos em Map no controller (como no calendário), com limpeza automática após 1 hora de inatividade.
- **Algoritmo de verificação:** Ao contar parciais, cuidado para não contar duas vezes um algarismo que já foi contado como correto. Primeiro marcar os exatos, depois nos restantes contar parciais.
- **Ranking:** Diferente do calendário (onde mais acertos = melhor), aqui menos tentativas = melhor. A ordenação deve ser `total ASC, tempo ASC, data_recorde ASC`.
- **Zero em dígitos=10:** Quando `digitos=10`, os algarismos disponíveis são 0-9 (não 1-10). O zero pode aparecer em qualquer posição, inclusive a primeira.
