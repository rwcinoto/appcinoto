# Plano de implementação - Calendário (cálculo do dia da semana)

Plano para implementar o módulo de treinos de calendário, que permite ao usuário treinar o cálculo mental do dia da semana de uma data. O módulo deve ser integrado ao sistema existente, reutilizando o máximo possível das páginas de operações (rankings, recordes, treino).

**Observação sobre cálculo do dia da semana:** O período 15/10/1582 a 31/12/2399 está dentro do calendário gregoriano. É possível calcular corretamente o dia da semana usando algoritmos padrão (ex.: Zeller, ou cálculo baseado em timestamp JavaScript com cuidado para fusos horários). O JavaScript `Date` pode ter limites em anos muito antigos (ex.: antes de 1970); para datas antes de ~1900, é recomendável usar uma função de cálculo explícita (dia juliano ou fórmula modular).

---

## 1. Backend - Modelo e banco de dados

### 1.1. Migration da tabela `recorde_calendario`

Criar migration com os campos:

- `id` (INT, auto incremento, PK)
- `id_usuario` (INT 11, FK usuarios)
- `tipo` (ENUM: 'data_geral', 'mes', 'ano', 'seculo', 'data_21')
- `id_limite` (INT 11, FK limites)
- `total` (INT 11)
- `erros` (INT 11, opcional)
- `data_recorde` (DATETIME, opcional)
- `quantidade` (INT 11, default 1)
- `criado_em` (DATETIME)
- `criado_por` (INT 11, opcional)
- `atualizado_em` (DATETIME)
- `atualizado_por` (INT 11, opcional)

Índices e FKs conforme padrão do projeto. Índice único composto: (id_usuario, tipo, id_limite).

### 1.2. Model Sequelize `RecordeCalendario`

Criar model com associações: belongsTo Usuario, Limite. Incluir no `models/index.js`.

---

## 2. Backend - Serviços e regras de negócio

### 2.1. Utilitário de cálculo do dia da semana

Criar `calendarioService.js` (ou similar) com:

- Função para calcular dia da semana de uma data (1=domingo, 2=segunda, …, 6=sexta, 0 ou 7=sábado)
- Função para sortear datas no intervalo 15/10/1582 a 31/12/2399
- Função para sortear datas apenas do século XXI (2000-2099)
- Função para formatar data em texto (ex.: "15 de setembro de 1984") e em números (15/09/1984)
- Constantes dos tipos: data_geral, mes, ano, seculo, data_21

### 2.2. Serviço `treinoCalendarioService.js`

- `gerarDatas(quantidade, tipo)` – sorteio de datas conforme tipo (data_geral, data_21, etc.)
- `gerarBufferDatas(quantidade, tipo)` – 150 datas previamente sorteadas (análogo a contas)
- Para treino de meses: lógica das chaves (janeiro base, demais derivadas). Vai mostrar a data completa, mas a resposta é apenas para o mês.
- Para treino de séculos: lógica das chaves (século XXI base, demais derivadas). Vai mostrar a data completa, mas a resposta é apenas para o século.
- Para treino de anos: fórmula (ANO + INT(ANO/4)) mod 7
- `validarRespostaData(data, respostaUsuario, tipoResposta)` – compara número (0-7) ou dia da semana abreviado

### 2.3. Serviço `rankingCalendarioService.js`

Análogo ao `rankingService.js`, mas consultando `recorde_calendario` com filtros `tipo` e `id_limite`. Retornar ranking ordenado por total, com posição do usuário.

### 2.4. Serviço `recordeCalendarioService.js`

Lógica para criar/atualizar recorde de calendário (similar ao `recordeService.js`), considerando melhor pontuação (total) e data_recorde.

---

## 3. Backend - Controllers e rotas

### 3.1. `calendarioController.js`

- `iniciarTreino` – valida plano, limite, tipo; gera buffer de datas; retorna treino_id e datas_iniciais
- `validarResposta` – valida resposta, retorna correto, proximaData, tempoEsgotado
- `confirmarInicio` – incrementar quantidade no treino ativo
- `finalizarTreino` – salvar recorde em `recorde_calendario`

### 3.2. `rankingCalendarioController.js`

- `obterRanking` – filtros tipo e limite; retorna ranking, posicaoUsuario, totalParticipantes

### 3.3. `recordeCalendarioController.js`

- `listar` – recordes do usuário (ou de outro usuário via usuario_id) com filtros tipo e limite

### 3.4. Rotas

- `POST /calendario/treinos/iniciar` – body: tipo, limite_id
- `POST /calendario/treinos/validar-resposta`
- `POST /calendario/treinos/confirmar-inicio`
- `POST /calendario/treinos/finalizar`
- `GET /calendario/rankings?tipo=&limite_id=`
- `GET /calendario/recordes?tipo=&limite_id=&usuario_id=`

### 3.5. Regras de plano

- Plano id=2: apenas tipo data_geral
- Plano id≥3: data_geral, mes, ano, seculo
- Plano id≥4: data_geral, mes, ano, seculo, data_21
- Menu Calendário visível para todos os planos
- Instruções disponíveis para todos

---

## 4. Frontend - Menu e rotas

### 4.1. Menu "Calendário"

Inserir item "Calendário" no Sidebar após "Rankings", com ícone (ex.: 📅). Rota: `/calendario`.

### 4.2. Rotas

- `/calendario` – página de ranking de calendário
- `/calendario/recordes` – página de recordes de calendário
- `/instrucoes/calendario` – página de instruções (inicialmente simples)

---

## 5. Frontend - Página de ranking de calendário

### 5.1. Reutilização da página Rankings

Criar página `Calendario.jsx` que:

- Usa **a mesma página Rankings** ou um componente compartilhado, passando um prop `modo="calendario"`
- Alternativa: criar rota `/rankings?modo=calendario` e adaptar Rankings para suportar modo calendário (filtro tipo em vez de operação/sistema)
- Filtros: tipo (data 1582-2399 [padrão], mês, ano, século, data século XXI) e limite (1 min padrão, mesmos limites das operações)
- Botão "Meus recordes" ao lado dos filtros – leva a `/calendario/recordes` ou `/recordes?modo=calendario`
- Usa componente InfoUsuario (ou equivalente) com botão para iniciar treino – adaptar para chamar API de calendário
- Link de ajuda (?) ao lado do título – leva a `/instrucoes/calendario`
- Ao clicar no nome de alguém no ranking – ir para recordes dessa pessoa (como nas operações)

### 5.2. Backend de ranking

A página deve consumir `GET /calendario/rankings` com tipo e limite_id. O componente InfoUsuario deve ser adaptado ou ter variante para iniciar treino de calendário (chamando `/calendario/treinos/iniciar`).

---

## 6. Frontend - Página de recordes de calendário

### 6.1. Reutilização da página Recordes

- Opção A: rota `/recordes?modo=calendario` – adaptar Recordes para filtrar por modo e usar API de calendário
- Opção B: página separada `CalendarioRecordes.jsx` com mesmo layout, consumindo `/calendario/recordes`
- Filtros: tipo de treino, limite de tempo
- Suporte a `usuario_id` para ver recordes de outra pessoa (ao clicar no nome no ranking)
- Reutilizar componentes de layout (CardRecorde, FiltrosRecordes, ListaRecordes) adaptando para dados de calendário

---

## 7. Frontend - Página de instruções de calendário

### 7.1. Página inicial

Criar `InstrucoesCalendario.jsx` com conteúdo mínimo (ex.: texto placeholder) para depois ser elaborado. Link no título da página de ranking.

---

## 8. Frontend - Modal de opções ao iniciar treino (mobile)

### 8.1. Modal de escolha

Ao clicar em "Iniciar treino" no ranking de calendário:

- Modal perguntando: "Como quer ver a data?"
  - Texto (12 de abril de 1976) [padrão]
  - Números (12/04/1976)

Ao clicar em "Iniciar treino" no ranking de calendário, apenas para data geral e data 21 e **apenas no celular**:

- Modal perguntando: "Como quer digitar a resposta?"
  - Números (0 a 7)
  - Nome do dia (seg, ter, qua, qui, sex, sáb, dom)

Trazer marcadas as preferências do perfil, se houver.

---

## 9. Frontend - Teclado virtual para calendário

### 9.1. Modo números (0-7)

- Teclas: 0, 1, 2, 3, 4, 5, 6, 7 e sinal de menos
- 1=domingo, 2=segunda, …, 0 ou 7=sábado (0 e 7 equivalentes para sábado)

### 9.2. Modo texto

- Teclas: seg, ter, qua, qui, sex, sáb, dom

### 9.3. Integração

- Criar `TecladoCalendario.jsx` ou estender `TecladoVirtual.jsx` com prop `modoCalendario` e `tipoResposta` (numeros|texto)
- Exibir teclado virtual em mobile quando `modo="calendario"`

---

## 10. Frontend - Preferências no perfil

### 10.1. Campo novo em usuários

Migration para adicionar em `usuarios`:

- `calendario_tipo_treino` (ENUM ou VARCHAR: data_geral, mes, ano, seculo, data_21) – default data_geral

### 10.2. Formulário de perfil

Na página Perfil, adicionar seção "Preferências de calendário":

- Tipo de treino (data 1582-2399, mês, ano, século, data século XXI)

---

## 11. Frontend - Página de treino ativo para calendário

### 11.1. Estratégia: reutilizar TreinoAtivo

- Adicionar prop/state `modo="operacoes"|"calendario"` em TreinoAtivo
- Quando `modo="calendario"`:
  - `treinoData` contém: tipo, limite, datas_iniciais (array de datas)
  - Cada "conta" é uma data com formato (texto ou números)
  - `ListaContas` ou novo `ListaDatas` – exibe a data e campo de resposta
  - Validação via `/calendario/treinos/validar-resposta`
- Manter mesma dinâmica: acertou → próxima; errou → vermelho, apagar, até acertar
- Timer e contagem regressiva iguais
- 150 datas por minuto pré-sorteadas

### 11.2. Componente ListaDatas

Criar (ou adaptar ListaContas) para exibir data e campo de resposta, com TecladoCalendario em mobile. Tratamento de erro igual ao de operações (vermelho, limpar, repetir até acertar).

---

## 12. Treinos especiais: mês e século

### 12.1. Treino de meses

- Modal no início: usuário digita o número de Janeiro (padrão 0)
- Relações: outubro=janeiro; abril/julho=janeiro-1; maio=janeiro+1; agosto=janeiro+2; fev/mar/nov=janeiro+3; set/dez=janeiro-2; jun=janeiro-3
- Valores -7 a 7; equivalentes módulo 7 (0=7, 4=-3, etc.)
- Mostrar data completa, usuário digita número equivalente ao mês

### 12.2. Treino de séculos

- Modal no início: usuário digita número do século XXI (padrão 0)
- Relações: XVII=XXI; XVI/XX/XIV=XXI+1; XIX/XXIII=XXI+3; XVIII/XXII=XXI-2
- Considerar século XXI = 2000-2099; XX = 1900-1999; etc.
- Mostrar data completa, usuário digita número do século
- Valores -7 a 7, equivalentes módulo 7

### 12.3. Treino de anos

- Sem modal inicial
- Mostrar data completa
- Resposta: (ANO + INT(ANO/4)) mod 7, onde ANO = dois últimos algarismos do ano da data
- Exemplo: 84 + 21 = 105; 105 mod 7 = 0

---

## 13. Ordem de execução das tarefas

| #   | Tarefa                                                                                             |
| --- | -------------------------------------------------------------------------------------------------- |
| 1   | Migration tabela `recorde_calendario`                                                              |
| 2   | Model `RecordeCalendario` e inclusão em models                                                     |
| 3   | Utilitário/serviço de cálculo de dia da semana e formatação de datas                               |
| 4   | `treinoCalendarioService.js` – geração e validação                                                 |
| 5   | `rankingCalendarioService.js`                                                                      |
| 6   | `recordeCalendarioService.js`                                                                      |
| 7   | Controllers e rotas de calendário (treino, ranking, recordes)                                      |
| 8   | Migration campos de preferências de calendário em `usuarios`                                       |
| 9   | Atualizar Perfil para salvar preferências de calendário                                            |
| 10  | Menu "Calendário" e rota `/calendario`                                                             |
| 11  | Página de ranking de calendário (reutilizando Rankings ou componente compartilhado)                |
| 12  | Página de recordes de calendário (reutilizando Recordes)                                           |
| 13  | Página de instruções de calendário (versão inicial)                                                |
| 14  | Modal de opções ao iniciar treino (mobile): tipo resposta + estilo data                            |
| 15  | Teclado virtual para calendário (números 0-7 e dias da semana)                                     |
| 16  | Adaptar TreinoAtivo para modo calendário (ou criar TreinoCalendarioAtivo reutilizando componentes) |
| 17  | Componente ListaDatas (exibição de data + input + validação)                                       |
| 18  | Treino de data geral – fluxo completo e salvamento de recorde                                      |
| 19  | Treino de data século XXI                                                                          |
| 20  | Treino de meses – modal de chave de janeiro + tela de treino                                       |
| 21  | Treino de séculos – modal de chave século XXI + tela de treino                                     |
| 22  | Treino de anos – tela de treino (sem modal)                                                        |
| 23  | Integrar InfoUsuario/botão "Iniciar treino" para calendário                                        |
| 24  | Link "Meus recordes" na página de ranking de calendário                                            |
| 25  | Navegação ao clicar no nome – recordes da pessoa                                                   |
| 26  | Ajustes finais: testes, regras de plano, fusos horários (Brasil)                                   |

---

## Notas técnicas

- **Fuso horário:** Ao manipular datas (data_recorde, sorteio), usar timezone do Brasil (America/Sao_Paulo) para evitar deslocamento de dia.
- **Compatibilidade:** Manter mesma estrutura de resposta das APIs (ranking, recordes) para facilitar reutilização de componentes.
