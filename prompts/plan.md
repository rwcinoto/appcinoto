# Plano arquitetônico - Sistema numix

## 1. Visão geral do sistema

Sistema web para treino de cálculos matemáticos com sistema de planos, rankings e conjuntos de usuários. O sistema permite que usuários pratiquem operações matemáticas (soma, subtração, multiplicação, divisão e raiz quadrada) em diferentes sistemas numéricos (arábico, romano, binário) com limites de tempo configuráveis, registrando recordes pessoais e gerando rankings globais e por conjuntos.

### 1.1 Objetivos principais

- Permitir treino de cálculos matemáticos com diferentes operações e sistemas numéricos
- Registrar e comparar recordes pessoais e globais
- Criar e gerenciar conjuntos de usuários para rankings específicos
- Sistema de planos com diferentes níveis de acesso e funcionalidades
- Interface otimizada para dispositivos móveis (95% do uso)

### 1.2 Stack tecnológica

- **Backend**: Node.js + Express.js 4.21.2
- **Frontend**: React
- **Banco de dados**: MySQL
- **ORM**: Sequelize
- **Autenticação**: JWT (JSON Web Tokens)
- **Segurança**: bcrypt para hash de senhas
- **Deploy**: Render.com (web service único)

## 2. Arquitetura de banco de dados

### 2.1 Modelo entidade-relacionamento

#### 2.1.1 Tabela: planos

```sql
- id (INT, PK, AUTO_INCREMENT)
- nome (VARCHAR(255), NOT NULL)
- descricao (TEXT, NULL)
- ordem (INT, NOT NULL, UNIQUE) -- Define hierarquia de planos
- conjuntos_criar (INT, NOT NULL, DEFAULT 0)
- conjuntos_participar (INT, NOT NULL, DEFAULT 0)
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**: `ordem` (UNIQUE), `criado_por`, `atualizado_por`

**Observações**:

- A ordem define hierarquia: planos com ordem maior ou igual têm acesso a recursos de planos com ordem menor
- Campos de auditoria (criado_por, atualizado_por) podem ser NULL na criação inicial do sistema

#### 2.1.2 Tabela: usuarios

```sql
- id (INT, PK, AUTO_INCREMENT)
- email (VARCHAR(255), NOT NULL, UNIQUE)
- senha (VARCHAR(255), NOT NULL) -- Hash bcrypt
- nome (VARCHAR(255), NOT NULL)
- tipo (ENUM('admin', 'comum'), NOT NULL, DEFAULT 'comum')
- id_plano (INT, NOT NULL, FK -> planos.id)
- ativo (BOOLEAN, NOT NULL, DEFAULT true)
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**: `email` (UNIQUE), `id_plano`, `tipo`, `ativo`, `criado_por`, `atualizado_por`

**Observações**:

- Email é único e serve como login
- Senha sempre armazenada como hash bcrypt
- Campo ativo permite exclusão lógica

#### 2.1.3 Tabela: operacoes

```sql
- id (INT, PK, AUTO_INCREMENT)
- nome (VARCHAR(255), NOT NULL)
- descricao (TEXT, NULL)
- tipo (ENUM('soma', 'subtracao', 'multiplicacao', 'divisao', 'raiz'), NOT NULL)
- min_parcela_1 (INT, NOT NULL)
- max_parcela_1 (INT, NOT NULL)
- min_parcela_2 (INT, NULL)
- max_parcela_2 (INT, NULL)
- min_parcela_3 (INT, NULL)
- max_parcela_3 (INT, NULL)
- id_plano (INT, NULL, FK -> planos.id) -- NULL = disponível para todos
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**: `tipo`, `id_plano`, `criado_por`, `atualizado_por`

**Observações**:

- Para raiz quadrada: min_parcela_2 e max_parcela_2 são NULL
- Para operações de 2 parcelas: min_parcela_3 e max_parcela_3 são NULL
- Validação: max_parcela_N >= min_parcela_N quando ambos não são NULL
- id_plano NULL significa disponível para todos os planos

#### 2.1.4 Tabela: limites

```sql
- id (INT, PK, AUTO_INCREMENT)
- descricao (VARCHAR(255), NOT NULL)
- tempo (INT, NOT NULL) -- Tempo em segundos
- id_plano (INT, NOT NULL, FK -> planos.id)
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**: `id_plano`, `tempo`, `criado_por`, `atualizado_por`

#### 2.1.5 Tabela: sistemas

```sql
- id (INT, PK, AUTO_INCREMENT)
- descricao (VARCHAR(255), NULL)
- tipo (ENUM('arabico', 'romano', 'binario'), NOT NULL)
- id_plano (INT, NOT NULL, FK -> planos.id)
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**: `tipo`, `id_plano`, `criado_por`, `atualizado_por`

#### 2.1.6 Tabela: recordes

```sql
- id (INT, PK, AUTO_INCREMENT)
- id_usuario (INT, NOT NULL, FK -> usuarios.id)
- id_operacao (INT, NOT NULL, FK -> operacoes.id)
- id_limite (INT, NOT NULL, FK -> limites.id)
- id_sistema (INT, NOT NULL, FK -> sistemas.id)
- total (INT, NOT NULL) -- Número de acertos no treino
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL) -- Data do recorde (usado para ranking)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**:

- `id_usuario`, `id_operacao`, `id_limite`, `id_sistema`
- `(id_operacao, id_limite, id_sistema, total DESC)` -- Índice composto para rankings
- `(id_usuario, id_operacao, id_limite, id_sistema)` -- Índice único composto (um recorde por combinação)
- `criado_por`, `atualizado_por`

**Observações**:

- Um usuário pode ter apenas um recorde por combinação (operacao, limite, sistema)
- O recorde sempre armazena o maior total alcançado
- atualizado_em indica quando o recorde foi estabelecido e deve ser preenchido na criação do registro

#### 2.1.7 Tabela: conjuntos

```sql
- id (INT, PK, AUTO_INCREMENT)
- nome (VARCHAR(255), NOT NULL)
- ativo (BOOLEAN, NOT NULL, DEFAULT true)
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**: `ativo`, `criado_por`, `atualizado_por`

**Observações**:

- Campo ativo permite exclusão lógica
- Nome não precisa ser único (usuários podem criar conjuntos com mesmo nome)

#### 2.1.8 Tabela: usuarios_conjuntos

```sql
- id (INT, PK, AUTO_INCREMENT)
- id_conjunto (INT, NOT NULL, FK -> conjuntos.id)
- id_usuario (INT, NOT NULL, FK -> usuarios.id)
- tipo (ENUM('dono', 'admin', 'comum'), NOT NULL, DEFAULT 'comum')
- status (ENUM('pendente', 'aceito', 'rejeitado'), NOT NULL, DEFAULT 'pendente') -- Novo campo necessário
- criado_em (DATETIME, NOT NULL)
- criado_por (INT, NULL, FK -> usuarios.id)
- atualizado_em (DATETIME, NOT NULL)
- atualizado_por (INT, NULL, FK -> usuarios.id)
```

**Índices**:

- `(id_conjunto, id_usuario)` -- Índice único composto (um usuário por conjunto)
- `id_conjunto`, `id_usuario`, `tipo`, `status`
- `criado_por`, `atualizado_por`

**Observações**:

- Um usuário pode participar de um conjunto apenas uma vez
- Campo status necessário para gerenciar convites pendentes
- Quando criado, o dono automaticamente tem status 'aceito'

### 2.2 Relacionamentos

1. **planos** → **usuarios** (1:N)

   - Um plano pode ter muitos usuários
   - Um usuário pertence a um plano

2. **planos** → **operacoes** (1:N)

   - Um plano pode ter muitas operações associadas
   - Uma operação pode estar associada a um plano (ou NULL para todos)

3. **planos** → **limites** (1:N)

   - Um plano pode ter muitos limites
   - Um limite pertence a um plano

4. **planos** → **sistemas** (1:N)

   - Um plano pode ter muitos sistemas
   - Um sistema pertence a um plano

5. **usuarios** → **recordes** (1:N)

   - Um usuário pode ter muitos recordes
   - Um recorde pertence a um usuário

6. **operacoes** → **recordes** (1:N)

   - Uma operação pode ter muitos recordes
   - Um recorde pertence a uma operação

7. **limites** → **recordes** (1:N)

   - Um limite pode ter muitos recordes
   - Um recorde pertence a um limite

8. **sistemas** → **recordes** (1:N)

   - Um sistema pode ter muitos recordes
   - Um recorde pertence a um sistema

9. **conjuntos** → **usuarios_conjuntos** (1:N)

   - Um conjunto pode ter muitos usuários
   - Um registro de usuário_conjunto pertence a um conjunto

10. **usuarios** → **usuarios_conjuntos** (1:N)
    - Um usuário pode participar de muitos conjuntos
    - Um registro de usuário_conjunto pertence a um usuário

### 2.3 Constraints e validações

#### Constraints de banco

- Email único na tabela usuarios
- Ordem única na tabela planos
- Combinação única (id_usuario, id_operacao, id_limite, id_sistema) na tabela recordes
- Combinação única (id_conjunto, id_usuario) na tabela usuarios_conjuntos
- Foreign keys com ON DELETE RESTRICT (exceto campos de auditoria que podem ser SET NULL)

#### Validações de aplicação

- Senha: mínimo 6 caracteres (validar no backend)
- Email: formato válido (validar no backend)
- Tempo em limites: valor positivo
- Parcelas em operações: max >= min quando ambos não são NULL
- Total em recordes: valor não negativo
- Ordem em planos: valor positivo e único

## 3. Regras de negócio

### 3.1 Autenticação e autorização

#### 3.1.1 Login

- Usuário informa email e senha
- Sistema valida credenciais e retorna JWT token
- Token contém: id_usuario, email, tipo, id_plano
- Token expira em 24 horas (configurável)
- Refresh token pode ser implementado para melhor UX

#### 3.1.2 Permissões por tipo de usuário

**Admin**:

- Criar, editar e excluir planos, operações, limites e sistemas
- Criar, editar e excluir usuários
- Visualizar todos os dados do sistema
- Todas as funcionalidades de usuário comum

**Comum**:

- Editar próprio perfil (email, senha, nome)
- Criar e gerenciar próprios conjuntos (respeitando limites do plano)
- Participar de conjuntos (respeitando limites do plano)
- Criar recordes através de treinos
- Visualizar próprios recordes e rankings

### 3.2 Sistema de planos

#### 3.2.1 Hierarquia de planos

- Planos possuem campo `ordem` que define hierarquia
- Usuário com plano de ordem N tem acesso a recursos de planos com ordem <= N
- Exemplo: Se operação está disponível para plano ordem 2, usuários de planos 2, 3, 4... têm acesso

#### 3.2.2 Limites de conjuntos

- `conjuntos_criar`: máximo de conjuntos que o usuário pode criar
- `conjuntos_participar`: máximo de conjuntos que o usuário pode participar (incluindo os que criou)
- Ao criar conjunto, verificar ambos os limites
- Contar apenas conjuntos ativos

### 3.3 Operações matemáticas

#### 3.3.1 Geração de contas

- Números sorteados aleatoriamente dentro dos limites (min_parcela_N, max_parcela_N)
- Validação: max >= min quando ambos não são NULL

#### 3.3.2 Tipos de operação

**Soma**:

- Parcelas: min_parcela_1 a max_parcela_1, min_parcela_2 a max_parcela_2, etc.
- Resultado: soma de todas as parcelas

**Subtração**:

- Parcelas: min_parcela_1 a max_parcela_1 (minuendo), min_parcela_2 a max_parcela_2 (subtraendo)
- Validação: minuendo >= subtraendo (garantir resultado não negativo)
- Resultado: minuendo - subtraendo

**Multiplicação**:

- Parcelas: min_parcela_1 a max_parcela_1, min_parcela_2 a max_parcela_2, etc.
- Resultado: multiplicação de todas as parcelas

**Divisão**:

- Parcelas: min_parcela_1 a max_parcela_1 (dividendo), min_parcela_2 a max_parcela_2 (divisor)
- Validação: divisor != 0 e dividendo % divisor == 0 (garantir resultado inteiro)
- Resultado: dividendo / divisor

**Raiz quadrada**:

- Apenas min_parcela_1 e max_parcela_1 são usados
- Gerar número base aleatório e calcular base²
- Verificar se base² está dentro de [min_parcela_1, max_parcela_1]
- Apresentar base² e esperar resposta = base
- Garantir que apenas números com raiz quadrada inteira sejam apresentados

#### 3.3.3 Sistemas numéricos

**Arábico**:

- Números em formato decimal padrão (0-9)
- Exemplo: 123, 456, 7890

**Romano**:

- Converter números para notação romana
- Regras padrão: I=1, V=5, X=10, L=50, C=100, D=500, M=1000
- Exemplo: 123 = CXXIII, 456 = CDLVI
- Limitação: números muito grandes podem ser difíceis de representar, limitar todos os números em 3999

**Binário**:

- Converter números para base 2
- Exemplo: 123 = 1111011, 456 = 111001000
- Resposta do usuário deve ser em binário
- Limitação: números muito grandes são inviáveis de lidar, limitar tudo em 11111111111

### 3.4 Sistema de treinos

#### 3.4.1 Fluxo de treino

1. Usuário seleciona operação, limite de tempo e sistema numérico
2. Sistema valida se usuário tem acesso aos recursos selecionados (baseado no plano)
3. Contagem regressiva de 3 segundos
4. Início do cronômetro e geração de contas
5. Usuário digita respostas
6. Ao acertar, próxima conta aparece automaticamente
7. Ao errar, campo fica vermelho (apenas quando número de dígitos estiver completo)
8. Ao finalizar tempo, calcular total de acertos
9. Verificar se é novo recorde
10. Salvar recorde se necessário

#### 3.4.2 Geração de contas

- Gerar múltiplas contas antecipadamente (buffer de 10 contas) e mostrar todas na tela
- Quando usuário acerta, remover conta atual e adicionar nova ao final
- Contas são geradas aleatoriamente respeitando limites da operação
- Validações específicas por tipo de operação (ver seção 3.3.2)

#### 3.4.3 Validação de respostas

- Comparar resposta do usuário com resultado esperado
- Para números com múltiplos dígitos: validar apenas quando quantidade de dígitos estiver completa
- Feedback visual imediato (vermelho para erro, verde pode ser opcional para acerto)
- Avanço automático ao acertar (sem necessidade de Enter)

### 3.5 Sistema de recordes

#### 3.5.1 Criação/atualização de recordes

- Após cada treino, verificar se existe recorde para combinação (usuario, operacao, limite, sistema)
- Se não existe: criar novo recorde
- Se existe e total atual > total anterior: atualizar recorde (total e atualizado_em)
- Se existe e total atual <= total anterior: não fazer nada
- Sempre atualizar campo atualizado_em (mesmo na criação)

#### 3.5.2 Consulta de recordes

- Usuário pode filtrar por limite e sistema
- Mostrar todos os recordes do usuário para operações disponíveis no seu plano
- Ordenar por operação, limite, sistema

### 3.6 Sistema de rankings

#### 3.6.1 Ranking

- Filtrar por conjunto (se o usuário pertence a pelo menos um conjunto), operação, limite e sistema
- Se não escolher nenhum conjunto, mostra ranking global
- Ao filtrar por conjunto, apenas usuários do conjunto com status 'aceito' aparecem no ranking
- Ordenar por total DESC, atualizado_em DESC (maior pontuação, mais antiga em caso de empate)
- Mostrar top 100 usuários
- Destacar top 3 com estilo especial
- Destacar usuário logado se estiver nos 100
- Mostrar posição do usuário logado mesmo se não estiver nos 100
- Mostrar total de usuários que com recorde do ranking filtrado

### 3.7 Sistema de conjuntos

#### 3.7.1 Criação de conjunto

- Qualquer usuário pode criar conjunto
- Verificar limite `conjuntos_criar` do plano do usuário
- Verificar limite `conjuntos_participar` do plano do usuário (criador participa automaticamente)
- Criador automaticamente vira dono (tipo='dono', status='aceito')

#### 3.7.2 Gerenciamento de conjunto

- Dono pode editar nome do conjunto
- Dono pode excluir conjunto logicamente (ativo=false)
- Dono pode alterar tipo de usuários do conjunto para 'admin'
- Dono e admin podem adicionar usuários ao conjunto

#### 3.7.3 Convites para conjunto

- Dono ou admin digita email do usuário para convidar
- Criar registro em usuarios_conjuntos com status='pendente'
- Usuário convidado vê notificação na interface
- Usuário pode aceitar ou rejeitar convite
- Ao aceitar: status='aceito', tipo='comum' (a menos que dono/admin defina outro)
- Ao rejeitar: status='rejeitado' (ou excluir registro)
- Usuário pode ver lista de convites pendentes

#### 3.7.4 Remoção de usuários

- Dono e admin podem remover usuários do conjunto
- Dono não pode ser removido (ou apenas se excluir conjunto)
- Remover registro de usuarios_conjuntos

## 4. Estrutura da aplicação

### 4.1 Estrutura de diretórios

```
contas/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Configuração Sequelize
│   │   │   ├── jwt.js                # Configuração JWT
│   │   │   └── bcrypt.js             # Configuração bcrypt
│   │   ├── models/
│   │   │   ├── index.js              # Inicialização Sequelize
│   │   │   ├── Plano.js
│   │   │   ├── Usuario.js
│   │   │   ├── Operacao.js
│   │   │   ├── Limite.js
│   │   │   ├── Sistema.js
│   │   │   ├── Recorde.js
│   │   │   ├── Conjunto.js
│   │   │   └── UsuarioConjunto.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── usuarioController.js
│   │   │   ├── planoController.js
│   │   │   ├── operacaoController.js
│   │   │   ├── limiteController.js
│   │   │   ├── sistemaController.js
│   │   │   ├── treinoController.js
│   │   │   ├── recordeController.js
│   │   │   ├── rankingController.js
│   │   │   ├── conjuntoController.js
│   │   │   └── usuarioConjuntoController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js               # Middleware de autenticação JWT
│   │   │   ├── autorizacao.js        # Middleware de autorização (admin/comum)
│   │   │   └── validacao.js          # Validações de entrada
│   │   ├── routes/
│   │   │   ├── index.js              # Rotas principais
│   │   │   ├── authRoutes.js
│   │   │   ├── usuarioRoutes.js
│   │   │   ├── planoRoutes.js
│   │   │   ├── operacaoRoutes.js
│   │   │   ├── limiteRoutes.js
│   │   │   ├── sistemaRoutes.js
│   │   │   ├── treinoRoutes.js
│   │   │   ├── recordeRoutes.js
│   │   │   ├── rankingRoutes.js
│   │   │   ├── conjuntoRoutes.js
│   │   │   └── usuarioConjuntoRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── treinoService.js      # Lógica de geração de contas
│   │   │   ├── conversaoService.js   # Conversão de sistemas numéricos
│   │   │   ├── recordeService.js     # Lógica de recordes
│   │   │   └── rankingService.js    # Lógica de rankings
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── errors.js             # Tratamento de erros
│   │   │   └── validators.js         # Validadores reutilizáveis
│   │   ├── app.js                    # Configuração Express
│   │   └── server.js                 # Inicialização do servidor
│   ├── migrations/                   # Migrations Sequelize
│   ├── seeders/                      # Seeders Sequelize (dados iniciais)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   ├── auth/
│   │   │   │   └── LoginForm.jsx
│   │   │   ├── treino/
│   │   │   │   ├── SelecaoTreino.jsx
│   │   │   │   ├── ContagemRegressiva.jsx
│   │   │   │   ├── TreinoAtivo.jsx
│   │   │   │   ├── ListaContas.jsx
│   │   │   │   ├── InputResultado.jsx
│   │   │   │   ├── TecladoVirtual.jsx
│   │   │   │   └── ResultadoTreino.jsx
│   │   │   ├── recordes/
│   │   │   │   ├── FiltrosRecordes.jsx
│   │   │   │   └── ListaRecordes.jsx
│   │   │   ├── rankings/
│   │   │   │   ├── FiltrosRanking.jsx
│   │   │   │   └── TabelaRanking.jsx
│   │   │   ├── conjuntos/
│   │   │   │   ├── ListaConjuntos.jsx
│   │   │   │   ├── FormConjunto.jsx
│   │   │   │   ├── DetalhesConjunto.jsx
│   │   │   │   └── ConvitesPendentes.jsx
│   │   │   ├── perfil/
│   │   │   │   └── FormPerfil.jsx
│   │   │   └── usuarios/
│   │   │       ├── ListaUsuarios.jsx
│   │   │       └── FormUsuario.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── NovoTreino.jsx
│   │   │   ├── Recordes.jsx
│   │   │   ├── Rankings.jsx
│   │   │   ├── Conjuntos.jsx
│   │   │   ├── Perfil.jsx
│   │   │   └── Usuarios.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Context de autenticação
│   │   │   └── NotificationContext.jsx # Context de notificações
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   └── useNotifications.js
│   │   ├── services/
│   │   │   └── api.js                # Cliente API axios/fetch
│   │   ├── utils/
│   │   │   ├── constants.js          # Constantes (cores, etc)
│   │   │   └── helpers.js            # Funções auxiliares
│   │   ├── styles/
│   │   │   ├── theme.js              # Tema (cores cubo mágico)
│   │   │   ├── global.css
│   │   │   └── components.css
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── routes.js                 # Configuração de rotas
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

### 4.2 Backend - APIs principais

#### 4.2.1 Autenticação

- `POST /api/auth/login` - Login (email, senha) → retorna JWT
- `POST /api/auth/logout` - Logout (opcional, pode ser apenas frontend)
- `GET /api/auth/me` - Obter dados do usuário logado

#### 4.2.2 Usuários

- `GET /api/usuarios` - Listar usuários (admin apenas)
- `GET /api/usuarios/:id` - Obter usuário (admin ou próprio)
- `POST /api/usuarios` - Criar usuário (admin apenas)
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Excluir usuário logicamente (admin apenas)

#### 4.2.3 Planos

- `GET /api/planos` - Listar planos disponíveis
- `GET /api/planos/:id` - Obter plano
- `POST /api/planos` - Criar plano (admin apenas)
- `PUT /api/planos/:id` - Atualizar plano (admin apenas)
- `DELETE /api/planos/:id` - Excluir plano (admin apenas)

#### 4.2.4 Operações

- `GET /api/operacoes` - Listar operações disponíveis para usuário logado
- `GET /api/operacoes/:id` - Obter operação
- `POST /api/operacoes` - Criar operação (admin apenas)
- `PUT /api/operacoes/:id` - Atualizar operação (admin apenas)
- `DELETE /api/operacoes/:id` - Excluir operação (admin apenas)

#### 4.2.5 Limites

- `GET /api/limites` - Listar limites disponíveis para usuário logado
- `GET /api/limites/:id` - Obter limite
- `POST /api/limites` - Criar limite (admin apenas)
- `PUT /api/limites/:id` - Atualizar limite (admin apenas)
- `DELETE /api/limites/:id` - Excluir limite (admin apenas)

#### 4.2.6 Sistemas

- `GET /api/sistemas` - Listar sistemas disponíveis para usuário logado
- `GET /api/sistemas/:id` - Obter sistema
- `POST /api/sistemas` - Criar sistema (admin apenas)
- `PUT /api/sistemas/:id` - Atualizar sistema (admin apenas)
- `DELETE /api/sistemas/:id` - Excluir sistema (admin apenas)

#### 4.2.7 Treinos

- `POST /api/treinos/iniciar` - Iniciar treino (operacao_id, limite_id, sistema_id)
- `POST /api/treinos/validar-resposta` - Validar resposta (treino_id, resposta) → retorna correto/incorreto
- `POST /api/treinos/finalizar` - Finalizar treino (treino_id, total) → retorna se bateu recorde

#### 4.2.8 Recordes

- `GET /api/recordes` - Listar recordes do usuário logado (filtros: limite_id, sistema_id)
- `GET /api/recordes/:id` - Obter recorde específico

#### 4.2.9 Rankings

- `GET /api/rankings/global` - Ranking global (filtros: operacao_id, limite_id, sistema_id)
- `GET /api/rankings/conjunto/:conjunto_id` - Ranking do conjunto (filtros: operacao_id, limite_id, sistema_id)

#### 4.2.10 Conjuntos

- `GET /api/conjuntos` - Listar conjuntos do usuário logado
- `GET /api/conjuntos/:id` - Obter conjunto específico
- `POST /api/conjuntos` - Criar conjunto (nome)
- `PUT /api/conjuntos/:id` - Atualizar conjunto (nome) - dono apenas
- `DELETE /api/conjuntos/:id` - Excluir conjunto logicamente - dono apenas

#### 4.2.11 Usuários-Conjuntos

- `GET /api/conjuntos/:conjunto_id/usuarios` - Listar usuários do conjunto
- `POST /api/conjuntos/:conjunto_id/usuarios` - Convidar usuário (email) - dono/admin apenas
- `PUT /api/conjuntos/:conjunto_id/usuarios/:usuario_id` - Atualizar tipo de usuário - dono apenas
- `DELETE /api/conjuntos/:conjunto_id/usuarios/:usuario_id` - Remover usuário - dono/admin apenas
- `POST /api/conjuntos/:conjunto_id/usuarios/:usuario_id/aceitar` - Aceitar convite
- `POST /api/conjuntos/:conjunto_id/usuarios/:usuario_id/rejeitar` - Rejeitar convite
- `GET /api/usuarios/convites-pendentes` - Listar convites pendentes do usuário logado

### 4.3 Frontend - Componentes principais

#### 4.3.1 Layout

- **Header**: Barra superior com informações do usuário e logout
- **Sidebar**: Menu lateral com navegação (responsivo, colapsável no mobile)
- **Layout principal**: Container que envolve todas as páginas

#### 4.3.2 Página: Login

- Formulário de login (email, senha)
- Validação de campos
- Mensagens de erro
- Redirecionamento após login bem-sucedido

#### 4.3.3 Página: Novo treino

- Cards com operações disponíveis (filtradas por plano)
- Select de limite de tempo
- Select de sistema numérico
- Botão "Começar"
- Após seleção: contagem regressiva → tela de treino

#### 4.3.4 Página: Treino ativo

- **Layout**:
  - Esquerda: Lista de contas (scrollável, animação de subida)
  - Direita: Timer no topo, input de resultado no meio, total de pontos embaixo
- **Componentes**:
  - Lista de contas: mostra 10 contas, atualiza conforme usuário acerta
  - Input de resultado: campo de texto com validação visual
  - Teclado virtual: teclado numérico na tela (mobile)
  - Timer: contagem regressiva do tempo restante
  - Contador de pontos: total de acertos
- **Comportamento**:
  - Geração de contas em buffer
  - Validação em tempo real (vermelho quando errado e completo)
  - Avanço automático ao acertar
  - Finalização automática ao acabar tempo
  - Modal de resultado final (mostra se bateu recorde)

#### 4.3.5 Página: Recordes

- Filtros no topo (limite, sistema)
- Cards com recordes do usuário
- Agrupamento por operação
- Mostrar data do recorde

#### 4.3.6 Página: Rankings

- Filtros no topo (operacao, limite, sistema, conjunto - se aplicável)
- Informações do usuário: pontuação e posição
- Total de participantes
- Tabela com top 100
- Destaque para top 3 (medalhas/cores especiais)
- Destaque para usuário logado

#### 4.3.7 Página: Conjuntos

- Lista de conjuntos do usuário
- Botão "Criar conjunto"
- Para cada conjunto:
  - Nome, quantidade de membros
  - Botões: Ver detalhes, Editar (se dono), Excluir (se dono)
- Modal de criação/edição de conjunto
- Página de detalhes do conjunto:
  - Lista de membros com tipos
  - Botão adicionar membro (dono/admin)
  - Gerenciar tipos de membros (dono apenas)

#### 4.3.8 Página: Perfil

- Formulário com dados do usuário
- Campos editáveis: email, senha, nome
- Validações
- Mensagem de sucesso/erro

#### 4.3.9 Página: Usuários (admin)

- Lista de usuários
- Filtros e busca
- Botão "Criar usuário"
- Para cada usuário: editar, desativar/ativar
- Modal de criação/edição
- Paginação se necessário

#### 4.3.10 Notificações

- Sistema de notificações para convites de conjuntos
- Badge no menu quando há convites pendentes
- Lista de convites pendentes (aceitar/rejeitar)

## 5. Fluxos principais

### 5.1 Fluxo de autenticação

1. Usuário acessa sistema → redirecionado para login se não autenticado
2. Usuário preenche email e senha
3. Frontend envia POST /api/auth/login
4. Backend valida credenciais, gera JWT
5. Frontend armazena token (localStorage/sessionStorage)
6. Frontend redireciona para página "Novo treino"
7. Todas as requisições subsequentes incluem token no header Authorization

### 5.2 Fluxo de treino

1. Usuário acessa "Novo treino"
2. Sistema carrega operações, limites e sistemas disponíveis (baseado no plano)
3. Usuário seleciona operação, limite e sistema
4. Usuário clica "Começar"
5. Frontend inicia contagem regressiva (3 segundos)
6. Frontend solicita início de treino ao backend (POST /api/treinos/iniciar)
7. Backend retorna configuração do treino
8. Frontend inicia timer e gera primeira leva de contas
9. Usuário digita respostas
10. Frontend valida respostas localmente (para performance)
11. Ao acertar: próxima conta, incrementa pontos, atualiza lista
12. Ao errar: campo fica vermelho, usuário corrige
13. Ao finalizar tempo: frontend envia total ao backend (POST /api/treinos/finalizar)
14. Backend verifica se é recorde, salva se necessário
15. Frontend mostra resultado e se bateu recorde
16. Opções: "Recomeçar" ou "Novo treino"

### 5.3 Fluxo de criação de conjunto

1. Usuário acessa "Conjuntos"
2. Usuário clica "Criar conjunto"
3. Sistema verifica limites do plano (conjuntos_criar, conjuntos_participar)
4. Se dentro do limite: mostra modal de criação
5. Usuário preenche nome e confirma
6. Frontend envia POST /api/conjuntos
7. Backend cria conjunto e adiciona criador como dono
8. Frontend atualiza lista de conjuntos

### 5.4 Fluxo de convite para conjunto

1. Dono/admin acessa detalhes do conjunto
2. Dono/admin clica "Adicionar usuário"
3. Dono/admin digita email do usuário
4. Frontend envia POST /api/conjuntos/:id/usuarios
5. Backend valida email, cria registro com status='pendente'
6. Usuário convidado recebe notificação (badge no menu)
7. Usuário acessa notificações/convites pendentes
8. Usuário aceita ou rejeita convite
9. Frontend envia POST /api/conjuntos/:id/usuarios/:id/aceitar ou /rejeitar
10. Backend atualiza status do registro

### 5.5 Fluxo de ranking

1. Usuário acessa "Rankings"
2. Sistema carrega operações, limites e sistemas disponíveis
3. Se usuário participa de conjuntos: carrega lista de conjuntos
4. Usuário seleciona filtros (operacao, limite, sistema, conjunto - opcional)
5. Frontend envia GET /api/rankings/global ou /api/rankings/conjunto/:id
6. Backend retorna ranking ordenado e posição do usuário
7. Frontend exibe tabela com destaques apropriados

## 6. Segurança

### 6.1 Autenticação

- JWT com expiração (24 horas)
- Token armazenado de forma segura (não em localStorage se possível, considerar httpOnly cookies)
- Refresh token para renovação automática (opcional mas recomendado)
- Middleware de autenticação em todas as rotas protegidas

### 6.2 Autorização

- Middleware de autorização verifica tipo de usuário (admin/comum)
- Validação de propriedade (usuário só pode editar próprio perfil, dono só pode editar próprio conjunto)
- Validação de limites de plano antes de criar recursos

### 6.3 Validação de dados

- Validação de entrada em todas as rotas (usar biblioteca como express-validator ou joi)
- Sanitização de inputs para prevenir SQL injection (Sequelize já protege, mas validar mesmo assim)
- Validação de tipos e formatos (email, números, etc.)

### 6.4 Proteção de senhas

- Hash bcrypt com salt rounds adequado (10-12)
- Nunca retornar senha em respostas da API
- Validação de força de senha (mínimo 6 caracteres, recomendar complexidade)

### 6.5 Rate limiting

- Implementar rate limiting nas rotas de autenticação
- Limitar requisições de treino para prevenir abuso
- Considerar uso de biblioteca como express-rate-limit

### 6.6 CORS

- Configurar CORS adequadamente (apenas domínios permitidos)
- Em produção, restringir origins

### 6.7 Headers de segurança

- Helmet.js para headers de segurança HTTP
- XSS protection
- Content Security Policy

## 7. UX/UI e design

### 7.1 Tema visual - Cubo mágico

- **Cores principais**:
  - Branco (#FFFFFF) - fundo, cards
  - Amarelo (#FFD700 / #FFEB3B) - destaques, top 1
  - Verde (#4CAF50 / #8BC34A) - sucesso, acertos
  - Azul (#2196F3 / #03A9F4) - primária, links
  - Vermelho (#F44336 / #E91E63) - erros, alertas
  - Laranja (#FF9800 / #FF5722) - secundária, top 2-3
- **Aplicação**:
  - Header/Sidebar: azul ou branco com detalhes coloridos
  - Cards de operação: cores diferentes por tipo
  - Top 3 ranking: ouro/prata/bronze ou amarelo/laranja/azul
  - Feedback de acerto: verde
  - Feedback de erro: vermelho
  - Botões primários: azul
  - Botões secundários: laranja ou branco

### 7.2 Mobile-first

- Design responsivo com breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Sidebar colapsável no mobile (hamburger menu)
- Teclado virtual para entrada numérica no mobile
- Touch-friendly: botões e áreas clicáveis com tamanho adequado (mínimo 44x44px)
- Otimização de performance para conexões móveis
- Considerar PWA (Progressive Web App) para melhor experiência mobile

### 7.3 Acessibilidade

- Contraste adequado de cores (WCAG AA mínimo)
- Navegação por teclado
- Labels adequados em formulários
- ARIA labels onde necessário
- Feedback visual e textual

### 7.4 Performance

- Lazy loading de componentes
- Code splitting no React
- Otimização de imagens
- Cache de requisições quando apropriado
- Debounce em inputs de busca/filtro

## 8. Considerações adicionais

### 8.1 Tratamento de erros

- Mensagens de erro amigáveis ao usuário
- Logs detalhados no backend para debugging
- Tratamento de erros de rede (timeout, offline)
- Fallbacks quando serviços não estão disponíveis

### 8.2 Internacionalização (i18n)

- Considerar suporte a múltiplos idiomas no futuro
- Estruturar textos para facilitar tradução
- Usar biblioteca como react-i18next se necessário

### 8.3 Analytics e métricas

- Tracking de uso (opcional, respeitando privacidade)
- Métricas de performance
- Logs de ações importantes (criação de usuários, recordes, etc.)

### 8.4 Backup e recuperação

- Estratégia de backup do banco de dados
- Versionamento de migrations
- Plano de recuperação de desastres

### 8.5 Testes

- Testes unitários de serviços e utilitários
- Testes de integração das APIs
- Testes E2E das funcionalidades principais
- Considerar Jest, Supertest, React Testing Library

### 8.6 Documentação

- Documentação da API (Swagger/OpenAPI)
- README com instruções de instalação e execução
- Comentários no código para lógica complexa
- Guia de contribuição se for projeto open source

### 8.7 Melhorias futuras

- Sistema de conquistas/badges
- Histórico de treinos (não apenas recordes)
- Gráficos de evolução de performance
- Modo multiplayer/competição em tempo real
- Suporte a mais sistemas numéricos (hexadecimal, octal)
- Personalização de tema pelo usuário
- Exportação de dados pessoais

### 8.8 Pontos de atenção

#### 8.8.1 Geração de contas matemáticas

- Garantir que divisões sempre resultem em números inteiros
- Garantir que raízes quadradas sempre sejam de números perfeitos
- Garantir que subtrações não resultem em números negativos
- Validar limites de parcelas para evitar overflow em JavaScript

#### 8.8.2 Conversão de sistemas numéricos

- Implementar conversão robusta para romano (considerar números grandes)
- Implementar conversão para binário (validar tamanho)
- Considerar limitações de representação (romano não tem zero, binário pode ser muito longo)

#### 8.8.3 Performance de rankings

- Rankings podem ser lentos com muitos usuários
- Considerar cache de rankings (atualizar periodicamente)
- Índices adequados no banco de dados
- Paginação se necessário

#### 8.8.4 Sincronização de tempo

- Timer no frontend pode dessincronizar
- Considerar sincronização com servidor periodicamente
- Ou calcular tempo no backend e retornar tempo restante

#### 8.8.5 Validação de recordes

- Prevenir trapaça (validação no backend)
- Validar que tempo não foi ultrapassado
- Validar que respostas foram corretas
- Considerar enviar log de respostas para auditoria

#### 8.8.6 Datas e timezone

- **IMPORTANTE**: Considerar timezone do Brasil (UTC-3)
- Campos de data devem ser armazenados em UTC-3
- Mostrar sempre a data que está no banco, sem converter horário

## 9. Estrutura de deploy

### 9.1 Build process

- Backend: `npm install && npm run build`
- Frontend: `npm install && npm run build`
- Backend serve frontend estático após build

### 9.2 Variáveis de ambiente

#### Backend (.env)

```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=contas_db
DB_USER=usuario
DB_PASSWORD=senha
JWT_SECRET=chave_secreta_jwt
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

#### Frontend (.env)

```
REACT_APP_API_URL=https://api.seudominio.com
```

### 9.3 Scripts package.json

#### Backend

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "cd ../frontend && npm install && npm run build",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all"
  }
}
```

#### Frontend

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
```

## 10. Checklist de implementação

### Fase 1: Setup inicial

- [ ] Criar estrutura de diretórios
- [ ] Configurar backend (Express, Sequelize, JWT, bcrypt)
- [ ] Configurar frontend (React, roteamento, estado)
- [ ] Configurar banco de dados MySQL
- [ ] Criar migrations das tabelas
- [ ] Criar seeders com dados iniciais (planos, admin padrão)

### Fase 2: Autenticação

- [ ] Implementar login/logout
- [ ] Implementar middleware de autenticação
- [ ] Implementar middleware de autorização
- [ ] Criar tela de login
- [ ] Implementar proteção de rotas no frontend

### Fase 3: CRUD básico

- [ ] CRUD de usuários (admin)
- [ ] CRUD de planos (admin)
- [ ] CRUD de operações (admin)
- [ ] CRUD de limites (admin)
- [ ] CRUD de sistemas (admin)
- [ ] Tela de usuários (admin)
- [ ] Tela de perfil

### Fase 4: Sistema de treinos

- [ ] Implementar geração de contas matemáticas
- [ ] Implementar conversão de sistemas numéricos
- [ ] Implementar validação de respostas
- [ ] Criar tela de seleção de treino
- [ ] Criar tela de treino ativo
- [ ] Implementar timer e contagem regressiva
- [ ] Implementar teclado virtual (mobile)

### Fase 5: Sistema de recordes

- [ ] Implementar lógica de criação/atualização de recordes
- [ ] Criar tela de recordes
- [ ] Implementar filtros de recordes

### Fase 6: Sistema de rankings

- [ ] Implementar lógica de ranking global e por conjunto
- [ ] Criar tela de rankings
- [ ] Implementar filtros e destaques

### Fase 7: Sistema de conjuntos

- [ ] CRUD de conjuntos
- [ ] Sistema de convites
- [ ] Gerenciamento de membros
- [ ] Criar tela de conjuntos
- [ ] Implementar notificações de convites

### Fase 8: Polimento

- [ ] Aplicar tema visual (cubo mágico)
- [ ] Otimizar para mobile
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states
- [ ] Melhorar feedback visual
- [ ] Testes básicos
- [ ] Documentação

### Fase 9: Deploy

- [ ] Configurar variáveis de ambiente
- [ ] Testar build local
- [ ] Deploy no Render.com
- [ ] Testes em produção
- [ ] Monitoramento básico

## 11. Conclusão

Este plano arquitetônico fornece uma base sólida para o desenvolvimento do sistema numix. A estrutura proposta permite escalabilidade, manutenibilidade e uma boa experiência do usuário, especialmente em dispositivos móveis.

Principais pontos a destacar:

- Arquitetura modular e bem organizada
- Sistema de planos hierárquico flexível
- Geração inteligente de contas matemáticas com validações
- Sistema de rankings eficiente
- Foco em mobile-first e performance
- Segurança adequada com JWT e bcrypt
- Tema visual atraente baseado no cubo mágico

O sistema está pronto para ser implementado seguindo este plano, com espaço para melhorias e expansões futuras.
