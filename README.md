# Numix - Sistema de Treino Matemático

Sistema web para treino de cálculos matemáticos com suporte a diferentes sistemas numéricos (arábico, romano e binário) e operações matemáticas (soma, subtração, multiplicação, divisão e raiz quadrada).

## 📋 Descrição

O Numix é uma aplicação web desenvolvida para auxiliar no aprendizado e treino de cálculos matemáticos. O sistema permite:

- Realizar treinos matemáticos com diferentes tipos de operações
- Treinar com diferentes sistemas numéricos (arábico, romano, binário)
- Acompanhar seus recordes pessoais
- Competir em rankings globais e por conjunto
- Criar e gerenciar conjuntos de treino colaborativos
- Gerenciar usuários, planos, operações, limites e sistemas (administradores)

## 🚀 Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 14 ou superior)
- **npm** (geralmente vem com o Node.js)
- **MySQL** (versão 5.7 ou superior)
- **Git** (para clonar o repositório)

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd appcinoto
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Instalar dependências do frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### 1. Configurar banco de dados MySQL

Crie um banco de dados MySQL para o projeto:

```sql
CREATE DATABASE appcinoto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ou usando o cliente MySQL:

```bash
mysql -u root -p
CREATE DATABASE appcinoto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
# Banco de dados
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=appcinoto
DB_HOST=localhost
DB_PORT=3306

# JWT (Autenticação)
JWT_SECRET=chave_secret_do_cinotoapp
JWT_EXPIRES_IN=24h

# Bcrypt (Hash de senhas)
BCRYPT_ROUNDS=10

# Servidor
PORT=3000
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3001
```

**Nota**: Altere os valores conforme sua configuração local. O `JWT_SECRET` deve ser uma string aleatória e segura em produção.

### 3. Executar migrations (criar tabelas)

```bash
cd backend
npm run migrate
```

Este comando criará todas as tabelas necessárias no banco de dados.

### 4. Executar seeders (dados iniciais)

```bash
npm run seed
```

Este comando criará:
- Plano "Grátis" padrão
- Usuário administrador padrão com as credenciais:
  - **Email**: `admin@contas.com`
  - **Senha**: `admin123`

⚠️ **Importante**: Altere a senha do administrador após o primeiro login em produção!

## 🎯 Executando o projeto

### Modo desenvolvimento

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

O servidor backend estará rodando em `http://localhost:3000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

O frontend estará rodando em `http://localhost:3001` e abrirá automaticamente no navegador.

### Modo produção

#### 1. Fazer build do frontend

```bash
cd frontend
npm run build
```

Isso criará uma pasta `build` com os arquivos otimizados do frontend.

#### 2. Iniciar servidor backend

```bash
cd backend
NODE_ENV=production npm start
```

O backend servirá o frontend buildado automaticamente.

**Nota Windows**: No Windows, use `cross-env` ou defina a variável de ambiente manualmente:

```bash
set NODE_ENV=production && npm start
```

## 📝 Comandos úteis

### Backend

```bash
cd backend

# Executar migrations (criar/atualizar tabelas)
npm run migrate

# Desfazer última migration
npm run migrate:undo

# Executar seeders (dados iniciais)
npm run seed

# Desfazer seeders
npm run seed:undo

# Iniciar servidor em produção
npm start

# Iniciar servidor em desenvolvimento (com nodemon)
npm run dev

# Build do frontend (instala dependências e faz build)
npm run build
```

### Frontend

```bash
cd frontend

# Iniciar em desenvolvimento
npm start

# Fazer build para produção
npm run build

# Executar testes (se houver)
npm test
```

### Banco de dados

```bash
# Acessar MySQL
mysql -u root -p

# Usar banco do projeto
USE appcinoto;

# Listar tabelas
SHOW TABLES;

# Ver estrutura de uma tabela
DESCRIBE usuarios;
```

## 📁 Estrutura do projeto

```
appcinoto/
├── backend/                 # Backend Node.js/Express
│   ├── migrations/          # Migrations do Sequelize
│   ├── seeders/             # Seeders do Sequelize
│   └── src/
│       ├── config/          # Configurações (database, jwt)
│       ├── controllers/     # Controllers das rotas
│       ├── middlewares/     # Middlewares (auth, error handler)
│       ├── models/          # Models do Sequelize
│       ├── routes/          # Rotas da API
│       ├── services/        # Lógica de negócio
│       ├── utils/           # Utilitários
│       ├── app.js           # Configuração do Express
│       └── server.js        # Ponto de entrada do servidor
│
├── frontend/                # Frontend React
│   ├── public/              # Arquivos públicos
│   └── src/
│       ├── components/      # Componentes React
│       │   ├── common/      # Componentes comuns (Layout, Sidebar, etc.)
│       │   ├── treino/      # Componentes de treino
│       │   ├── recordes/    # Componentes de recordes
│       │   ├── rankings/    # Componentes de rankings
│       │   ├── conjuntos/   # Componentes de conjuntos
│       │   └── ...
│       ├── pages/           # Páginas principais
│       ├── context/         # Context API (Auth, Toast)
│       ├── services/        # Serviços (API calls)
│       ├── styles/          # Estilos globais e tema
│       ├── utils/           # Utilitários
│       ├── routes.js        # Configuração de rotas
│       ├── App.js           # Componente raiz
│       └── index.js         # Ponto de entrada
│
└── prompts/                 # Documentação e prompts do projeto
```

## 🛠️ Tecnologias utilizadas

### Backend

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para MySQL
- **MySQL2** - Driver MySQL
- **JWT (jsonwebtoken)** - Autenticação
- **bcrypt** - Hash de senhas
- **express-validator** - Validação de dados
- **cors** - Configuração CORS
- **helmet** - Segurança HTTP
- **dotenv** - Variáveis de ambiente

### Frontend

- **React** - Biblioteca JavaScript para UI
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
- **CSS3** - Estilização (com tema customizado)

### Banco de dados

- **MySQL** - Banco de dados relacional

## 🔐 Segurança

- Senhas são hasheadas usando bcrypt antes de serem salvas
- Autenticação via JWT (JSON Web Tokens)
- Validação de dados de entrada
- CORS configurado para produção
- Helmet para headers de segurança HTTP

## 🌐 Variáveis de ambiente

### Backend (.env)

| Variável | Descrição | Obrigatória | Padrão |
|----------|-----------|-------------|--------|
| `DB_USER` | Usuário do MySQL | Sim | - |
| `DB_PASSWORD` | Senha do MySQL | Sim | - |
| `DB_NAME` | Nome do banco de dados | Sim | - |
| `DB_HOST` | Host do MySQL | Sim | - |
| `DB_PORT` | Porta do MySQL | Não | 3306 |
| `JWT_SECRET` | Chave secreta para JWT | Não | `chave_secret_do_cinotoapp` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | Não | `24h` |
| `BCRYPT_ROUNDS` | Rounds do bcrypt | Não | `10` |
| `PORT` | Porta do servidor | Não | `3000` |
| `NODE_ENV` | Ambiente (development/production) | Não | `development` |
| `FRONTEND_URL` | URL do frontend (para CORS) | Não | `http://localhost:3001` |

## 📚 Próximos passos

1. Altere a senha do usuário administrador padrão
2. Configure as variáveis de ambiente adequadamente
3. Crie operações, limites e sistemas conforme necessário
4. Configure planos de acesso
5. Crie usuários conforme necessário

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso interno.

## 📞 Suporte

Para questões ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido por Rafael Cinoto para treino matemático**

