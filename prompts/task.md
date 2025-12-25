# Task.md - Passo a passo detalhado de implementação

Este documento contém o passo a passo detalhado para implementação do sistema numix. Cada tarefa deve ser executada e revisada antes de seguir para a próxima.

**Referência**: Consulte `plan.md` para detalhes arquiteturais e de negócio. O arquivo `prompt0.txt` também pode ajudar a esclarecer algumas dúvidas.

---

## FASE 1: SETUP INICIAL

### Tarefa 1.1: Criar estrutura de diretórios

**Objetivo**: Criar toda a estrutura de pastas do projeto conforme definido no plan.md seção 4.1.

**Comandos**:

```bash
# Criar estrutura backend
mkdir -p backend/src/config
mkdir -p backend/src/models
mkdir -p backend/src/controllers
mkdir -p backend/src/middlewares
mkdir -p backend/src/routes
mkdir -p backend/src/services
mkdir -p backend/src/utils
mkdir -p backend/migrations
mkdir -p backend/seeders

# Criar estrutura frontend
mkdir -p frontend/public
mkdir -p frontend/src/components/common
mkdir -p frontend/src/components/auth
mkdir -p frontend/src/components/treino
mkdir -p frontend/src/components/recordes
mkdir -p frontend/src/components/rankings
mkdir -p frontend/src/components/conjuntos
mkdir -p frontend/src/components/perfil
mkdir -p frontend/src/components/usuarios
mkdir -p frontend/src/pages
mkdir -p frontend/src/context
mkdir -p frontend/src/hooks
mkdir -p frontend/src/services
mkdir -p frontend/src/utils
mkdir -p frontend/src/styles
```

**Validação**: Verificar que todas as pastas foram criadas corretamente.

**Próximo passo**: Tarefa 1.2

---

### Tarefa 1.2: Inicializar projeto backend

**Objetivo**: Configurar package.json do backend com todas as dependências necessárias.

**Comandos**:

```bash
cd backend
npm init -y
```

**Arquivo a criar**: `backend/package.json`

**Conteúdo**:

```json
{
  "name": "contas-backend",
  "version": "1.0.0",
  "description": "Backend do sistema numix",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "cd ../frontend && npm install && npm run build",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all",
    "seed:undo": "sequelize-cli db:seed:undo:all"
  },
  "dependencies": {
    "express": "4.21.2",
    "mysql2": "^3.6.5",
    "sequelize": "^6.35.2",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "sequelize-cli": "^6.6.2"
  }
}
```

**Comando após criar**:

```bash
npm install
```

**Validação**: Verificar que node_modules foi criado e todas as dependências instaladas.

**Próximo passo**: Tarefa 1.3

---

### Tarefa 1.3: Criar arquivo de configuração do ambiente backend

**Objetivo**: Criar arquivo .env.example e .env para configurações do backend.

**Arquivo a criar**: `backend/.env.example`

**Conteúdo**:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=appcinoto
DB_USER=root
DB_PASSWORD=
JWT_SECRET=sua_chave_secreta_jwt_aqui_altere_em_producao
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

**Arquivo a criar**: `backend/.env` (copiar do .env.example e preencher valores locais)

**Arquivo a criar**: `backend/.gitignore`

**Conteúdo**:

```
node_modules/
.env
.DS_Store
*.log
dist/
build/
```

**Validação**: Verificar que os arquivos foram criados.

**Próximo passo**: Tarefa 1.4

---

### Tarefa 1.4: Configurar Sequelize

**Objetivo**: Criar arquivo de configuração do Sequelize e inicializar.

**Arquivo a criar**: `backend/.sequelizerc`

**Conteúdo**:

```javascript
const path = require("path");

module.exports = {
  config: path.resolve("src/config", "database.js"),
  "models-path": path.resolve("src", "models"),
  "seeders-path": path.resolve("seeders"),
  "migrations-path": path.resolve("migrations"),
};
```

**Arquivo a criar**: `backend/src/config/database.js`

**Conteúdo**:

```javascript
require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: "-03:00", // Timezone do Brasil (UTC-3)
    logging: console.log,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: "-03:00", // Timezone do Brasil (UTC-3)
    logging: false,
  },
};
```

**Nota importante sobre datas**:

- Todas as datas devem ser armazenadas em UTC-3 (horário do Brasil)
- Não converter datas - mostrar sempre a data que está no banco, sem conversão de horário
- Usar tudo em português e horário do Brasil

**Comando**:

```bash
npx sequelize-cli init
```

**Validação**: Verificar que a estrutura do Sequelize foi criada.

**Próximo passo**: Tarefa 1.5

---

### Tarefa 1.5: Criar banco de dados MySQL

**Objetivo**: Criar o banco de dados MySQL.

**Comando** (no MySQL):

```sql
CREATE DATABASE appcinoto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Ou via linha de comando**:

```bash
mysql -u root -p -e "CREATE DATABASE appcinoto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Validação**: Verificar que o banco foi criado:

```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'appcinoto';"
```

**Próximo passo**: Tarefa 1.6

---

### Tarefa 1.6: Criar migration da tabela planos

**Objetivo**: Criar migration para tabela planos conforme plan.md seção 2.1.1.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-planos
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-planos.js` (substituir XXXXXX pelo timestamp)

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("planos", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ordem: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      conjuntos_criar: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      conjuntos_participar: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    await queryInterface.addIndex("planos", ["ordem"], { unique: true });
    await queryInterface.addIndex("planos", ["criado_por"]);
    await queryInterface.addIndex("planos", ["atualizado_por"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("planos");
  },
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.7

---

### Tarefa 1.7: Criar migration da tabela usuarios

**Objetivo**: Criar migration para tabela usuarios conforme plan.md seção 2.1.2.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-usuarios
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-usuarios.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usuarios", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      senha: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("admin", "comum"),
        allowNull: false,
        defaultValue: "comum",
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "planos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    await queryInterface.addIndex("usuarios", ["email"], { unique: true });
    await queryInterface.addIndex("usuarios", ["id_plano"]);
    await queryInterface.addIndex("usuarios", ["tipo"]);
    await queryInterface.addIndex("usuarios", ["ativo"]);
    await queryInterface.addIndex("usuarios", ["criado_por"]);
    await queryInterface.addIndex("usuarios", ["atualizado_por"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("usuarios");
  },
};
```

**Nota**: Esta migration depende de planos, então deve ser executada após planos.

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.8

---

### Tarefa 1.8: Criar migration da tabela operacoes

**Objetivo**: Criar migration para tabela operacoes conforme plan.md seção 2.1.3.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-operacoes
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-operacoes.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("operacoes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tipo: {
        type: Sequelize.ENUM(
          "soma",
          "subtracao",
          "multiplicacao",
          "divisao",
          "raiz"
        ),
        allowNull: false,
      },
      min_parcela_1: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      max_parcela_1: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      min_parcela_2: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      max_parcela_2: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      min_parcela_3: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      max_parcela_3: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "planos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    await queryInterface.addIndex("operacoes", ["tipo"]);
    await queryInterface.addIndex("operacoes", ["id_plano"]);
    await queryInterface.addIndex("operacoes", ["criado_por"]);
    await queryInterface.addIndex("operacoes", ["atualizado_por"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("operacoes");
  },
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.9

---

### Tarefa 1.9: Criar migration da tabela limites

**Objetivo**: Criar migration para tabela limites conforme plan.md seção 2.1.4.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-limites
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-limites.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("limites", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tempo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Tempo em segundos",
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "planos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    await queryInterface.addIndex("limites", ["id_plano"]);
    await queryInterface.addIndex("limites", ["tempo"]);
    await queryInterface.addIndex("limites", ["criado_por"]);
    await queryInterface.addIndex("limites", ["atualizado_por"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("limites");
  },
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.10

---

### Tarefa 1.10: Criar migration da tabela sistemas

**Objetivo**: Criar migration para tabela sistemas conforme plan.md seção 2.1.5.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-sistemas
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-sistemas.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sistemas", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tipo: {
        type: Sequelize.ENUM("arabico", "romano", "binario"),
        allowNull: false,
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "planos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    await queryInterface.addIndex("sistemas", ["tipo"]);
    await queryInterface.addIndex("sistemas", ["id_plano"]);
    await queryInterface.addIndex("sistemas", ["criado_por"]);
    await queryInterface.addIndex("sistemas", ["atualizado_por"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sistemas");
  },
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.11

---

### Tarefa 1.11: Criar migration da tabela recordes

**Objetivo**: Criar migration para tabela recordes conforme plan.md seção 2.1.6.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-recordes
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-recordes.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recordes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_operacao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "operacoes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      id_limite: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "limites",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      id_sistema: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sistemas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Número de acertos no treino",
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
        comment:
          "Data do recorde (usado para ranking). Deve ser preenchido na criação do registro.",
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    // Índices individuais
    await queryInterface.addIndex("recordes", ["id_usuario"]);
    await queryInterface.addIndex("recordes", ["id_operacao"]);
    await queryInterface.addIndex("recordes", ["id_limite"]);
    await queryInterface.addIndex("recordes", ["id_sistema"]);
    await queryInterface.addIndex("recordes", ["criado_por"]);
    await queryInterface.addIndex("recordes", ["atualizado_por"]);

    // Índice composto para rankings (ordenado por total DESC)
    await queryInterface.addIndex(
      "recordes",
      ["id_operacao", "id_limite", "id_sistema", "total"],
      {
        name: "idx_recordes_ranking",
      }
    );

    // Índice único composto (um recorde por combinação)
    await queryInterface.addIndex(
      "recordes",
      ["id_usuario", "id_operacao", "id_limite", "id_sistema"],
      {
        unique: true,
        name: "idx_recordes_unique",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("recordes");
  },
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.12

---

### Tarefa 1.12: Criar migration da tabela conjuntos

**Objetivo**: Criar migration para tabela conjuntos conforme plan.md seção 2.1.7.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-conjuntos
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-conjuntos.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("conjuntos", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    await queryInterface.addIndex("conjuntos", ["ativo"]);
    await queryInterface.addIndex("conjuntos", ["criado_por"]);
    await queryInterface.addIndex("conjuntos", ["atualizado_por"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("conjuntos");
  },
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.13

---

### Tarefa 1.13: Criar migration da tabela usuarios_conjuntos

**Objetivo**: Criar migration para tabela usuarios_conjuntos conforme plan.md seção 2.1.8.

**Comando**:

```bash
npx sequelize-cli migration:generate --name create-usuarios-conjuntos
```

**Arquivo a editar**: `backend/migrations/XXXXXX-create-usuarios-conjuntos.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usuarios_conjuntos", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_conjunto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "conjuntos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tipo: {
        type: Sequelize.ENUM("dono", "admin", "comum"),
        allowNull: false,
        defaultValue: "comum",
      },
      status: {
        type: Sequelize.ENUM("pendente", "aceito", "rejeitado"),
        allowNull: false,
        defaultValue: "pendente",
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });

    // Índice único composto (um usuário por conjunto)
    await queryInterface.addIndex(
      "usuarios_conjuntos",
      ["id_conjunto", "id_usuario"],
      {
        unique: true,
        name: "idx_usuarios_conjuntos_unique",
      }
    );

    await queryInterface.addIndex("usuarios_conjuntos", ["id_conjunto"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["id_usuario"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["tipo"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["status"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["criado_por"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["atualizado_por"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("usuarios_conjuntos");
  },
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.14

---

### Tarefa 1.14: Executar migrations

**Objetivo**: Executar todas as migrations na ordem correta para criar as tabelas no banco.

**Comando**:

```bash
npm run migrate
```

**Validação**:

1. Verificar que não houve erros
2. Verificar no MySQL que todas as tabelas foram criadas:

```sql
USE appcinoto;
SHOW TABLES;
```

**Próximo passo**: Tarefa 1.15

---

### Tarefa 1.15: Criar modelos Sequelize - Plano

**Objetivo**: Criar modelo Plano com relacionamentos.

**Arquivo a criar**: `backend/src/models/Plano.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Plano extends Model {
    static associate(models) {
      // Um plano tem muitos usuários
      Plano.hasMany(models.Usuario, {
        foreignKey: "id_plano",
        as: "usuarios",
      });

      // Um plano tem muitas operações
      Plano.hasMany(models.Operacao, {
        foreignKey: "id_plano",
        as: "operacoes",
      });

      // Um plano tem muitos limites
      Plano.hasMany(models.Limite, {
        foreignKey: "id_plano",
        as: "limites",
      });

      // Um plano tem muitos sistemas
      Plano.hasMany(models.Sistema, {
        foreignKey: "id_plano",
        as: "sistemas",
      });
    }
  }

  Plano.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ordem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      conjuntos_criar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      conjuntos_participar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Plano",
      tableName: "planos",
      timestamps: false,
      underscored: false,
    }
  );

  return Plano;
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.16

---

### Tarefa 1.16: Criar modelos Sequelize - Usuario

**Objetivo**: Criar modelo Usuario com relacionamentos e métodos.

**Arquivo a criar**: `backend/src/models/Usuario.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Um usuário pertence a um plano
      Usuario.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      // Um usuário tem muitos recordes
      Usuario.hasMany(models.Recorde, {
        foreignKey: "id_usuario",
        as: "recordes",
      });

      // Um usuário pode participar de muitos conjuntos
      Usuario.belongsToMany(models.Conjunto, {
        through: models.UsuarioConjunto,
        foreignKey: "id_usuario",
        otherKey: "id_conjunto",
        as: "conjuntos",
      });
    }

    // Método para verificar senha
    async verificarSenha(senha) {
      return await bcrypt.compare(senha, this.senha);
    }

    // Hook antes de criar/atualizar para hash da senha
    static async beforeSave(usuario) {
      if (usuario.changed("senha")) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        usuario.senha = await bcrypt.hash(usuario.senha, rounds);
      }
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      senha: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [6, 255],
        },
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM("admin", "comum"),
        allowNull: false,
        defaultValue: "comum",
      },
      id_plano: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "usuarios",
      timestamps: false,
      underscored: false,
      hooks: {
        beforeCreate: async (usuario) => {
          await Usuario.beforeSave(usuario);
        },
        beforeUpdate: async (usuario) => {
          await Usuario.beforeSave(usuario);
        },
      },
    }
  );

  return Usuario;
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 1.17

---

### Tarefa 1.17: Criar modelos Sequelize - Operacao, Limite, Sistema

**Objetivo**: Criar os modelos restantes básicos.

**Arquivo a criar**: `backend/src/models/Operacao.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Operacao extends Model {
    static associate(models) {
      Operacao.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      Operacao.hasMany(models.Recorde, {
        foreignKey: "id_operacao",
        as: "recordes",
      });
    }
  }

  Operacao.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM(
          "soma",
          "subtracao",
          "multiplicacao",
          "divisao",
          "raiz"
        ),
        allowNull: false,
      },
      min_parcela_1: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_parcela_1: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      min_parcela_2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_parcela_2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      min_parcela_3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_parcela_3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_plano: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Operacao",
      tableName: "operacoes",
      timestamps: false,
    }
  );

  return Operacao;
};
```

**Arquivo a criar**: `backend/src/models/Limite.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Limite extends Model {
    static associate(models) {
      Limite.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      Limite.hasMany(models.Recorde, {
        foreignKey: "id_limite",
        as: "recordes",
      });
    }
  }

  Limite.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tempo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_plano: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Limite",
      tableName: "limites",
      timestamps: false,
    }
  );

  return Limite;
};
```

**Arquivo a criar**: `backend/src/models/Sistema.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sistema extends Model {
    static associate(models) {
      Sistema.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      Sistema.hasMany(models.Recorde, {
        foreignKey: "id_sistema",
        as: "recordes",
      });
    }
  }

  Sistema.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM("arabico", "romano", "binario"),
        allowNull: false,
      },
      id_plano: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Sistema",
      tableName: "sistemas",
      timestamps: false,
    }
  );

  return Sistema;
};
```

**Validação**: Verificar sintaxe dos arquivos.

**Próximo passo**: Tarefa 1.18

---

### Tarefa 1.18: Criar modelos Sequelize - Recorde, Conjunto, UsuarioConjunto

**Objetivo**: Criar os modelos restantes com relacionamentos.

**Arquivo a criar**: `backend/src/models/Recorde.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Recorde extends Model {
    static associate(models) {
      Recorde.belongsTo(models.Usuario, {
        foreignKey: "id_usuario",
        as: "usuario",
      });

      Recorde.belongsTo(models.Operacao, {
        foreignKey: "id_operacao",
        as: "operacao",
      });

      Recorde.belongsTo(models.Limite, {
        foreignKey: "id_limite",
        as: "limite",
      });

      Recorde.belongsTo(models.Sistema, {
        foreignKey: "id_sistema",
        as: "sistema",
      });
    }
  }

  Recorde.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_operacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_limite: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_sistema: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Recorde",
      tableName: "recordes",
      timestamps: false,
    }
  );

  return Recorde;
};
```

**Arquivo a criar**: `backend/src/models/Conjunto.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Conjunto extends Model {
    static associate(models) {
      Conjunto.belongsToMany(models.Usuario, {
        through: models.UsuarioConjunto,
        foreignKey: "id_conjunto",
        otherKey: "id_usuario",
        as: "usuarios",
      });
    }
  }

  Conjunto.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Conjunto",
      tableName: "conjuntos",
      timestamps: false,
    }
  );

  return Conjunto;
};
```

**Arquivo a criar**: `backend/src/models/UsuarioConjunto.js`

**Conteúdo**:

```javascript
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UsuarioConjunto extends Model {
    static associate(models) {
      UsuarioConjunto.belongsTo(models.Usuario, {
        foreignKey: "id_usuario",
        as: "usuario",
      });

      UsuarioConjunto.belongsTo(models.Conjunto, {
        foreignKey: "id_conjunto",
        as: "conjunto",
      });
    }
  }

  UsuarioConjunto.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_conjunto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM("dono", "admin", "comum"),
        allowNull: false,
        defaultValue: "comum",
      },
      status: {
        type: DataTypes.ENUM("pendente", "aceito", "rejeitado"),
        allowNull: false,
        defaultValue: "pendente",
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UsuarioConjunto",
      tableName: "usuarios_conjuntos",
      timestamps: false,
    }
  );

  return UsuarioConjunto;
};
```

**Validação**: Verificar sintaxe dos arquivos.

**Próximo passo**: Tarefa 1.19

---

### Tarefa 1.19: Criar arquivo index.js dos modelos

**Objetivo**: Criar arquivo que inicializa todos os modelos e seus relacionamentos.

**Arquivo a criar**: `backend/src/models/index.js`

**Conteúdo**:

```javascript
"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/database.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

**Validação**: Verificar que o arquivo foi criado corretamente.

**Próximo passo**: Tarefa 1.20

---

### Tarefa 1.20: Criar seeders - Plano grátis e admin padrão

**Objetivo**: Criar seeders com dados iniciais conforme obs.txt.

**Comando**:

```bash
npx sequelize-cli seed:generate --name seed-planos-iniciais
npx sequelize-cli seed:generate --name seed-admin-padrao
```

**Arquivo a editar**: `backend/seeders/XXXXXX-seed-planos-iniciais.js`

**Conteúdo**:

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Plano grátis (ordem 1)
    await queryInterface.bulkInsert(
      "planos",
      [
        {
          nome: "Gratuito",
          descricao: "Plano gratuito com funcionalidades básicas",
          ordem: 1,
          conjuntos_criar: 2,
          conjuntos_participar: 3,
          criado_em: new Date(),
          atualizado_em: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("planos", { ordem: 1 }, {});
  },
};
```

**Arquivo a editar**: `backend/seeders/XXXXXX-seed-admin-padrao.js`

**Conteúdo**:

```javascript
"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Buscar plano grátis
    const [planos] = await queryInterface.sequelize.query(
      "SELECT id FROM planos WHERE ordem = 1 LIMIT 1"
    );

    if (planos.length === 0) {
      throw new Error(
        "Plano grátis não encontrado. Execute o seeder de planos primeiro."
      );
    }

    const planoId = planos[0].id;
    const senhaHash = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert(
      "usuarios",
      [
        {
          email: "admin@contas.com",
          senha: senhaHash,
          nome: "Administrador",
          tipo: "admin",
          id_plano: planoId,
          ativo: true,
          criado_em: new Date(),
          atualizado_em: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "usuarios",
      { email: "admin@contas.com" },
      {}
    );
  },
};
```

**Comando para executar**:

```bash
npm run seed
```

**Validação**:

1. Verificar que não houve erros
2. Verificar no MySQL que os dados foram inseridos:

```sql
SELECT * FROM planos;
SELECT id, email, nome, tipo FROM usuarios;
```

**Próximo passo**: Tarefa 1.21

---

### Tarefa 1.21: Configurar Express básico

**Objetivo**: Criar estrutura básica do Express com middlewares essenciais.

**Arquivo a criar**: `backend/src/app.js`

**Conteúdo**:

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  })
);

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (em produção)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/build")));
}

// Rotas da API
app.use("/api", require("./routes"));

// Rota para frontend (em produção)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/build/index.html"));
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
```

**Arquivo a criar**: `backend/src/server.js`

**Conteúdo**:

```javascript
require("dotenv").config();
const app = require("./app");
const db = require("./models");

const PORT = process.env.PORT || 3000;

// Sincronizar modelos com banco (apenas em desenvolvimento)
if (process.env.NODE_ENV === "development") {
  db.sequelize
    .authenticate()
    .then(() => {
      console.log("Conexão com banco de dados estabelecida.");
    })
    .catch((err) => {
      console.error("Erro ao conectar com banco de dados:", err);
    });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

**Arquivo a criar**: `backend/src/routes/index.js`

**Conteúdo**:

```javascript
const express = require("express");
const router = express.Router();

// Rotas serão adicionadas aqui conforme desenvolvimento
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API funcionando" });
});

module.exports = router;
```

**Validação**:

1. Testar se o servidor inicia:

```bash
npm start
```

2. Testar rota de health:

```bash
curl http://localhost:3000/api/health
```

**Próximo passo**: Tarefa 1.22

---

### Tarefa 1.22: Inicializar projeto frontend

**Objetivo**: Configurar React com todas as dependências necessárias.

**Nota importante**: Como o projeto roda como monorepo no Render, não usamos variáveis de ambiente no frontend. A comunicação com a API usa paths relativos (`/api`) que funcionam tanto em desenvolvimento (via proxy) quanto em produção (mesmo domínio).

**Arquivo a criar**: `frontend/package.json`

**Conteúdo**:

```json
{
  "name": "contas-frontend",
  "version": "1.0.0",
  "description": "Frontend do sistema numix",
  "private": true,
  "proxy": "http://localhost:3000",
  "dependencies": {
    "axios": "^1.6.2",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^3.5.0"
  },
  "devDependencies": {
    "cross-env": "^7.0.3"
  },
  "scripts": {
    "start": "cross-env PORT=3001 react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

**Arquivos a criar**:

- `frontend/public/index.html`
- `frontend/src/index.js`
- `frontend/src/App.js`
- `frontend/src/index.css`
- `frontend/src/App.css`
- `frontend/src/services/api.js` (configuração do axios com paths relativos)

**Comando**:

```bash
cd frontend
npm install
```

**Arquivo a criar**: `frontend/.gitignore`

**Conteúdo**:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

**Validação**: Verificar que o projeto React foi criado e pode ser iniciado:

```bash
cd frontend
npm start
```

O frontend deve iniciar na porta 3001 (configurada via cross-env) e o proxy redireciona `/api/*` para `http://localhost:3000/api/*`.

**Observações importantes**:

- Não é necessário criar `.env` no frontend (monorepo usa paths relativos)
- A porta 3001 é configurada diretamente no script `start` usando `cross-env`
- Em produção, tudo roda no mesmo domínio, então paths relativos funcionam automaticamente
- O arquivo `frontend/src/services/api.js` usa `baseURL: '/api'` que funciona em dev (via proxy) e produção

**Próximo passo**: FASE 2 - AUTENTICAÇÃO

---

## FASE 2: AUTENTICAÇÃO

### Tarefa 2.1: Criar configuração JWT

**Objetivo**: Criar arquivo de configuração para JWT.

**Arquivo a criar**: `backend/src/config/jwt.js`

**Conteúdo**:

```javascript
require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET || "sua_chave_secreta_aqui",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
```

**Validação**: Verificar que o arquivo foi criado.

**Próximo passo**: Tarefa 2.2

---

### Tarefa 2.2: Criar middleware de autenticação

**Objetivo**: Criar middleware para validar tokens JWT.

**Arquivo a criar**: `backend/src/middlewares/auth.js`

**Conteúdo**:

```javascript
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    // Buscar usuário e verificar se está ativo
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ association: "plano" }],
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ message: "Usuário inválido ou inativo" });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }
    return res.status(500).json({ message: "Erro na autenticação" });
  }
};

module.exports = authMiddleware;
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 2.3

---

### Tarefa 2.3: Criar middleware de autorização

**Objetivo**: Criar middleware para verificar permissões (admin/comum).

**Arquivo a criar**: `backend/src/middlewares/autorizacao.js`

**Conteúdo**:

```javascript
const autorizarAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.tipo === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Acesso negado. Apenas administradores." });
};

const autorizarProprioOuAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);
  if (
    req.usuario &&
    (req.usuario.tipo === "admin" || req.usuario.id === userId)
  ) {
    return next();
  }
  return res.status(403).json({ message: "Acesso negado." });
};

module.exports = {
  autorizarAdmin,
  autorizarProprioOuAdmin,
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 2.4

---

### Tarefa 2.4: Criar service de autenticação

**Objetivo**: Criar service com lógica de autenticação e geração de tokens.

**Arquivo a criar**: `backend/src/services/authService.js`

**Conteúdo**:

```javascript
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario } = require("../models");

class AuthService {
  async login(email, senha) {
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ association: "plano" }],
    });

    if (!usuario) {
      throw new Error("Email ou senha inválidos");
    }

    if (!usuario.ativo) {
      throw new Error("Usuário inativo");
    }

    const senhaValida = await usuario.verificarSenha(senha);

    if (!senhaValida) {
      throw new Error("Email ou senha inválidos");
    }

    const token = this.gerarToken(usuario);

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        id_plano: usuario.id_plano,
        plano: usuario.plano,
      },
    };
  }

  gerarToken(usuario) {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      id_plano: usuario.id_plano,
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  }
}

module.exports = new AuthService();
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 2.5

---

### Tarefa 2.5: Criar controller de autenticação

**Objetivo**: Criar controller para rotas de autenticação.

**Arquivo a criar**: `backend/src/controllers/authController.js`

**Conteúdo**:

```javascript
const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const authMiddleware = require("../middlewares/auth");

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, senha } = req.body;
      const resultado = await authService.login(email, senha);

      return res.json(resultado);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }

  async me(req, res) {
    try {
      const usuario = await req.usuario.reload({
        include: [{ association: "plano" }],
      });

      return res.json({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        id_plano: usuario.id_plano,
        plano: usuario.plano,
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  }
}

module.exports = new AuthController();
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 2.6

---

### Tarefa 2.6: Criar rotas de autenticação

**Objetivo**: Criar rotas para login e verificação de token.

**Arquivo a criar**: `backend/src/routes/authRoutes.js`

**Conteúdo**:

```javascript
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");

// Validações
const validarLogin = [
  body("email").isEmail().withMessage("Email inválido"),
  body("senha")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no mínimo 6 caracteres"),
];

// Rotas
router.post("/login", validarLogin, authController.login.bind(authController));
router.get("/me", authMiddleware, authController.me.bind(authController));

module.exports = router;
```

**Arquivo a editar**: `backend/src/routes/index.js`

**Conteúdo** (adicionar):

```javascript
const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API funcionando" });
});

module.exports = router;
```

**Validação**:

1. Testar login via Postman/curl:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@contas.com","senha":"admin123"}'
```

2. Verificar que retorna token e dados do usuário.

**Próximo passo**: Tarefa 2.7

---

### Tarefa 2.7: Criar contexto de autenticação no frontend

**Objetivo**: Criar context React para gerenciar estado de autenticação.

**Arquivo a criar**: `frontend/src/context/AuthContext.jsx`

**Conteúdo**:

```javascript
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      carregarUsuario();
    } else {
      setLoading(false);
    }
  }, []);

  const carregarUsuario = async () => {
    try {
      const response = await api.get("/auth/me");
      setUsuario(response.data);
    } catch (error) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    const response = await api.post("/auth/login", { email, senha });
    const { token, usuario } = response.data;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUsuario(usuario);

    return usuario;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 2.8

---

### Tarefa 2.8: Criar serviço de API no frontend

**Objetivo**: Configurar axios para comunicação com backend.

**Arquivo a criar**: `frontend/src/services/api.js`

**Conteúdo**:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Validação**: Verificar sintaxe do arquivo.

**Próximo passo**: Tarefa 2.9

---

### Tarefa 2.9: Criar página de login

**Objetivo**: Criar componente de login funcional.

**Arquivo a criar**: `frontend/src/pages/Login.jsx`

**Conteúdo**:

```javascript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/novo-treino");
    } catch (error) {
      setErro(error.response?.data?.message || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>numix</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {erro && <div className="erro">{erro}</div>}
          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

**Arquivo a criar**: `frontend/src/pages/Login.css`

**Conteúdo** (básico, será melhorado depois):

```css
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.erro {
  color: #f44336;
  margin-bottom: 15px;
  text-align: center;
}
```

**Validação**: Testar login no navegador.

**Próximo passo**: Tarefa 2.10

---

### Tarefa 2.10: Configurar rotas protegidas no frontend

**Objetivo**: Configurar React Router com proteção de rotas.

**Arquivo a criar**: `frontend/src/routes.js`

**Conteúdo**:

```javascript
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import NovoTreino from "./pages/NovoTreino";

const PrivateRoute = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return usuario ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/novo-treino"
        element={
          <PrivateRoute>
            <NovoTreino />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/novo-treino" />} />
    </Routes>
  );
};

export default AppRoutes;
```

**Arquivo a editar**: `frontend/src/App.js`

**Conteúdo**:

```javascript
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

**Validação**:

1. Verificar que redireciona para login se não autenticado
2. Verificar que permite acesso após login

**Próximo passo**: FASE 3 - CRUD BÁSICO

---

## FASE 3: CRUD BÁSICO

### Tarefa 3.1: Criar controller de usuários

**Objetivo**: Criar controller completo para CRUD de usuários.

**Arquivo a criar**: `backend/src/controllers/usuarioController.js`

**Conteúdo** (estrutura básica, será expandido):

```javascript
const { validationResult } = require("express-validator");
const { Usuario, Plano } = require("../models");

class UsuarioController {
  async listar(req, res) {
    // Implementar listagem com paginação e filtros
  }

  async obter(req, res) {
    // Implementar busca por ID
  }

  async criar(req, res) {
    // Implementar criação (apenas admin)
  }

  async atualizar(req, res) {
    // Implementar atualização (próprio perfil ou admin)
  }

  async excluir(req, res) {
    // Implementar exclusão lógica (apenas admin)
  }
}

module.exports = new UsuarioController();
```

**Próximo passo**: Tarefa 3.2

---

### Tarefa 3.2: Implementar métodos do usuarioController

**Objetivo**: Implementar todos os métodos do controller de usuários com lógica completa.

**Arquivo a editar**: `backend/src/controllers/usuarioController.js`

**Métodos a implementar**:

1. **listar**:

   - Apenas admin pode acessar
   - Suportar paginação (page, limit)
   - Suportar filtros: tipo, ativo, id_plano, busca por nome/email
   - Retornar lista com informações básicas (sem senha)
   - Incluir relacionamento com plano

2. **obter**:

   - Admin pode ver qualquer usuário
   - Usuário comum pode ver apenas próprio perfil
   - Retornar dados completos (sem senha)
   - Incluir relacionamento com plano

3. **criar**:

   - Apenas admin pode criar
   - Validar email único
   - Validar plano existe e está ativo
   - Hash da senha (já feito no modelo)
   - Preencher campos de auditoria (criado_por, atualizado_por)
   - Retornar usuário criado (sem senha)

4. **atualizar**:

   - Admin pode atualizar qualquer usuário
   - Usuário comum pode atualizar apenas próprio perfil (email, senha, nome)
   - Validar email único (se alterado)
   - Validar plano existe (se admin alterar)
   - Hash da senha apenas se fornecida
   - Preencher atualizado_por
   - Retornar usuário atualizado (sem senha)

5. **excluir**:
   - Apenas admin pode excluir
   - Exclusão lógica (ativo = false)
   - Não permitir excluir próprio usuário admin
   - Preencher atualizado_por

**Validação**: Testar cada método via Postman/curl com diferentes cenários.

**Próximo passo**: Tarefa 3.3

---

### Tarefa 3.3: Criar rotas de usuários

**Objetivo**: Criar rotas para CRUD de usuários com validações e middlewares.

**Arquivo a criar**: `backend/src/routes/usuarioRoutes.js`

**Rotas a criar**:

- `GET /api/usuarios` - Listar (admin apenas)
- `GET /api/usuarios/:id` - Obter (admin ou próprio)
- `POST /api/usuarios` - Criar (admin apenas)
- `PUT /api/usuarios/:id` - Atualizar (próprio ou admin)
- `DELETE /api/usuarios/:id` - Excluir logicamente (admin apenas)

**Validações a adicionar** (usar express-validator):

- Email válido e único
- Senha mínimo 6 caracteres
- Nome obrigatório
- Tipo enum (admin, comum)
- id_plano existe e é válido
- Campos opcionais conforme tipo de usuário

**Middlewares**:

- authMiddleware em todas as rotas
- autorizarAdmin nas rotas de listar, criar, excluir
- autorizarProprioOuAdmin na rota de atualizar

**Arquivo a editar**: `backend/src/routes/index.js` - Adicionar rota de usuários

**Validação**: Testar todas as rotas e verificar permissões.

**Próximo passo**: Tarefa 3.4

---

### Tarefa 3.4: Criar controller de planos

**Objetivo**: Criar controller completo para CRUD de planos (admin apenas).

**Arquivo a criar**: `backend/src/controllers/planoController.js`

**Métodos a implementar**:

- **listar**: Listar todos os planos (qualquer usuário autenticado pode ver)
- **obter**: Obter plano por ID
- **criar**: Criar plano (admin apenas), validar ordem única
- **atualizar**: Atualizar plano (admin apenas), validar ordem única
- **excluir**: Exclusão lógica (admin apenas), verificar se há usuários usando

**Validações**:

- Nome obrigatório
- Ordem única e positiva
- conjuntos_criar e conjuntos_participar não negativos

**Próximo passo**: Tarefa 3.5

---

### Tarefa 3.5: Criar rotas de planos

**Objetivo**: Criar rotas para CRUD de planos.

**Arquivo a criar**: `backend/src/routes/planoRoutes.js`

**Rotas**:

- `GET /api/planos` - Listar (qualquer autenticado)
- `GET /api/planos/:id` - Obter
- `POST /api/planos` - Criar (admin apenas)
- `PUT /api/planos/:id` - Atualizar (admin apenas)
- `DELETE /api/planos/:id` - Excluir (admin apenas)

**Validações e middlewares**: Similar ao padrão de usuários.

**Arquivo a editar**: `backend/src/routes/index.js` - Adicionar rota de planos

**Próximo passo**: Tarefa 3.6

---

### Tarefa 3.6: Criar controllers e rotas de operações

**Objetivo**: Criar controller e rotas para CRUD de operações.

**Arquivo a criar**: `backend/src/controllers/operacaoController.js`

**Métodos**:

- **listar**: Listar operações disponíveis para usuário logado (baseado no plano)
- **obter**: Obter operação por ID
- **criar**: Criar operação (admin apenas)
- **atualizar**: Atualizar operação (admin apenas)
- **excluir**: Excluir operação (admin apenas)

**Validações**:

- Nome obrigatório
- Tipo enum (soma, subtracao, multiplicacao, divisao, raiz)
- min_parcela_N <= max_parcela_N quando ambos não são NULL
- Validações específicas por tipo (raiz só tem parcela_1, etc.)

**Arquivo a criar**: `backend/src/routes/operacaoRoutes.js`

**Rotas**: Similar ao padrão, mas listar filtra por plano do usuário.

**Próximo passo**: Tarefa 3.7

---

### Tarefa 3.7: Criar controllers e rotas de limites

**Objetivo**: Criar controller e rotas para CRUD de limites.

**Arquivo a criar**: `backend/src/controllers/limiteController.js`

**Métodos**: Similar ao padrão de operações.

**Validações**:

- Descrição obrigatória
- Tempo positivo (em segundos)
- id_plano obrigatório e válido

**Arquivo a criar**: `backend/src/routes/limiteRoutes.js`

**Rotas**: Similar ao padrão, filtrar por plano do usuário na listagem.

**Próximo passo**: Tarefa 3.8

---

### Tarefa 3.8: Criar controllers e rotas de sistemas

**Objetivo**: Criar controller e rotas para CRUD de sistemas.

**Arquivo a criar**: `backend/src/controllers/sistemaController.js`

**Métodos**: Similar ao padrão de operações.

**Validações**:

- Tipo enum (arabico, romano, binario)
- id_plano obrigatório e válido

**Arquivo a criar**: `backend/src/routes/sistemaRoutes.js`

**Rotas**: Similar ao padrão, filtrar por plano do usuário na listagem.

**Próximo passo**: Tarefa 3.9

---

### Tarefa 3.9: Criar tela de perfil no frontend

**Objetivo**: Criar página onde usuário pode editar próprio perfil.

**Arquivo a criar**: `frontend/src/pages/Perfil.jsx`

**Funcionalidades**:

- Formulário com campos: email, nome, senha (opcional)
- Validação de email
- Validação de senha (mínimo 6 caracteres, apenas se preenchida)
- Botão salvar
- Mensagens de sucesso/erro
- Loading state durante salvamento

**Arquivo a criar**: `frontend/src/components/perfil/FormPerfil.jsx` (opcional, pode ser tudo na página)

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rota `/perfil`

**Validação**: Testar edição de perfil e verificar que senha só atualiza se preenchida.

**Próximo passo**: Tarefa 3.10

---

### Tarefa 3.10: Criar tela de usuários (admin) no frontend

**Objetivo**: Criar página para admin gerenciar usuários.

**Arquivo a criar**: `frontend/src/pages/Usuarios.jsx`

**Funcionalidades**:

- Lista de usuários com paginação
- Filtros: tipo, ativo, plano
- Busca por nome ou email
- Botão "Criar usuário"
- Para cada usuário: botões editar, desativar/ativar
- Modal de criação/edição de usuário
- Mostrar informações: nome, email, tipo, plano, status ativo

**Arquivos a criar**:

- `frontend/src/components/usuarios/ListaUsuarios.jsx`
- `frontend/src/components/usuarios/FormUsuario.jsx`
- `frontend/src/components/usuarios/ModalUsuario.jsx` (opcional)

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rota `/usuarios` (apenas para admin)

**Validação**: Testar listagem, filtros, busca, criação, edição e exclusão lógica.

**Próximo passo**: Tarefa 3.11

---

### Tarefa 3.11: Criar telas de CRUD para planos, operações, limites e sistemas (admin)

**Objetivo**: Criar páginas administrativas para gerenciar planos, operações, limites e sistemas.

**Arquivos a criar** (seguir padrão similar à tela de usuários):

- `frontend/src/pages/Planos.jsx`
- `frontend/src/pages/Operacoes.jsx`
- `frontend/src/pages/Limites.jsx`
- `frontend/src/pages/Sistemas.jsx`

**Funcionalidades básicas para cada**:

- Lista com busca/filtros
- Botão criar
- Editar e excluir itens
- Modal de criação/edição
- Validações específicas de cada entidade

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rotas (apenas para admin)

**Validação**: Testar CRUD completo de cada entidade.

**Próximo passo**: FASE 4 - SISTEMA DE TREINOS

---

## CONTINUAÇÃO DAS FASES RESTANTES

**Nota**: As fases seguintes (4-9) seguirão o mesmo padrão de detalhamento. Cada funcionalidade será quebrada em tarefas granulares específicas. Por questões de tamanho do documento, as próximas fases serão resumidas aqui, mas devem seguir o mesmo nível de detalhamento:

## FASE 4: SISTEMA DE TREINOS

### Tarefa 4.1: Criar service de conversão de sistemas numéricos

**Objetivo**: Criar service para converter números entre sistemas numéricos (arábico, romano, binário).

**Arquivo a criar**: `backend/src/services/conversaoService.js`

**Métodos a implementar**:

1. **paraRomano(numero)**:

   - Converter número decimal para notação romana
   - Regras: I=1, V=5, X=10, L=50, C=100, D=500, M=1000
   - Validar que número está entre 1 e 3999
   - Retornar string com número romano

2. **paraBinario(numero)**:

   - Converter número decimal para binário (base 2)
   - Validar que número está entre 0 e 2047 (11111111111)
   - Retornar string com número binário

3. **deBinario(binario)**:

   - Converter número binário para decimal
   - Validar formato binário
   - Retornar número decimal

4. **formatarNumero(numero, sistema)**:
   - Formatar número conforme sistema solicitado
   - Sistema 'arabico': retornar como está
   - Sistema 'romano': chamar paraRomano
   - Sistema 'binario': chamar paraBinario

**Validação**: Testar conversões com diferentes números e validar limites.

**Próximo passo**: Tarefa 4.2

---

### Tarefa 4.2: Criar service de geração de contas matemáticas

**Objetivo**: Criar service para gerar contas matemáticas aleatórias respeitando limites da operação.

**Arquivo a criar**: `backend/src/services/treinoService.js`

**Métodos a implementar**:

1. **gerarConta(operacao)**:

   - Receber objeto operacao com tipo e limites de parcelas
   - Gerar conta conforme tipo:
     - **soma**: Gerar parcelas aleatórias, somar
     - **subtracao**: Gerar minuendo e subtraendo (minuendo >= subtraendo)
     - **multiplicacao**: Gerar parcelas aleatórias, multiplicar
     - **divisao**: Gerar dividendo e divisor (divisor != 0, dividendo % divisor == 0)
     - **raiz**: Gerar base aleatório, calcular base², verificar se está nos limites
   - Retornar objeto: { parcela1, parcela2, parcela3, resultado, tipo }

2. **gerarBufferContas(operacao, quantidade = 10)**:

   - Gerar múltiplas contas antecipadamente
   - Retornar array de contas

3. **validarResposta(conta, respostaUsuario, sistema)**:
   - Comparar resposta do usuário com resultado esperado
   - Considerar sistema numérico (binário precisa converter)
   - Retornar { correto: boolean, respostaEsperada: number/string }

**Validações específicas por tipo**:

- Subtração: garantir resultado não negativo
- Divisão: garantir resultado inteiro
- Raiz: garantir que base² está nos limites

**Validação**: Testar geração de cada tipo de operação e validação de respostas.

**Próximo passo**: Tarefa 4.3

---

### Tarefa 4.3: Criar controller de treinos

**Objetivo**: Criar controller para gerenciar treinos (iniciar, validar respostas, finalizar).

**Arquivo a criar**: `backend/src/controllers/treinoController.js`

**Métodos a implementar**:

1. **iniciar**:

   - Validar que usuário tem acesso à operação, limite e sistema (baseado no plano)
   - Gerar buffer inicial de 10 contas
   - Retornar: { treino_id, operacao, limite, sistema, contas_iniciais }
   - Armazenar estado do treino (pode ser em memória ou banco temporário)

2. **validarResposta**:

   - Receber treino_id, resposta do usuário
   - Validar resposta usando treinoService
   - Retornar: { correto: boolean, respostaEsperada, proximaConta? }
   - Se correto: gerar nova conta e adicionar ao buffer

3. **finalizar**:
   - Receber treino_id e total de acertos
   - Validar que tempo não foi ultrapassado
   - Chamar recordeService para verificar/salvar recorde
   - Retornar: { total, bateuRecorde: boolean, recordeAnterior? }

**Validações**:

- Verificar acesso do usuário aos recursos
- Validar que treino existe e pertence ao usuário
- Validar tempo não ultrapassado

**Próximo passo**: Tarefa 4.4

---

### Tarefa 4.4: Criar rotas de treinos

**Objetivo**: Criar rotas para iniciar, validar respostas e finalizar treinos.

**Arquivo a criar**: `backend/src/routes/treinoRoutes.js`

**Rotas**:

- `POST /api/treinos/iniciar` - Iniciar treino (operacao_id, limite_id, sistema_id)
- `POST /api/treinos/validar-resposta` - Validar resposta (treino_id, resposta)
- `POST /api/treinos/finalizar` - Finalizar treino (treino_id, total)

**Validações**:

- Todos os endpoints requerem autenticação
- Validar IDs existem e usuário tem acesso
- Validar formato de resposta (número ou binário conforme sistema)

**Arquivo a editar**: `backend/src/routes/index.js` - Adicionar rota de treinos

**Validação**: Testar fluxo completo de treino via API.

**Próximo passo**: Tarefa 4.5

---

### Tarefa 4.5: Criar tela de seleção de treino

**Objetivo**: Criar página onde usuário seleciona operação, limite e sistema para iniciar treino.

**Arquivo a criar**: `frontend/src/pages/NovoTreino.jsx`

**Funcionalidades**:

- Carregar operações disponíveis para o plano do usuário
- Carregar limites disponíveis para o plano do usuário
- Carregar sistemas disponíveis para o plano do usuário
- Cards com operações disponíveis (mostrar nome e descrição)
- Select de limite de tempo
- Select de sistema numérico
- Botão "Começar" (desabilitado até selecionar todos)
- Validação: usuário deve selecionar operação, limite e sistema

**Arquivo a criar**: `frontend/src/components/treino/SelecaoTreino.jsx` (opcional)

**Validação**: Testar seleção e verificar que apenas recursos do plano aparecem.

**Próximo passo**: Tarefa 4.6

---

### Tarefa 4.6: Criar componente de contagem regressiva

**Objetivo**: Criar componente que mostra contagem regressiva de 3 segundos antes de iniciar treino.

**Arquivo a criar**: `frontend/src/components/treino/ContagemRegressiva.jsx`

**Funcionalidades**:

- Mostrar números: 3, 2, 1
- Animação/transição entre números
- Ao chegar em 0, chamar callback para iniciar treino
- Componente deve desaparecer após contagem

**Validação**: Testar contagem regressiva e transição para tela de treino.

**Próximo passo**: Tarefa 4.7

---

### Tarefa 4.7: Criar componente de lista de contas

**Objetivo**: Criar componente que mostra lista de contas na tela (buffer de 10).

**Arquivo a criar**: `frontend/src/components/treino/ListaContas.jsx`

**Funcionalidades**:

- Mostrar até 10 contas na tela
- Formatar números conforme sistema numérico (romano, binário, arábico)
- Mostrar operação matemática (+, -, ×, ÷, √)
- Animação de subida quando conta atual é removida
- Scroll automático para manter conta atual visível
- Estilo visual claro e legível

**Validação**: Testar exibição de contas em diferentes sistemas numéricos.

**Próximo passo**: Tarefa 4.8

---

### Tarefa 4.8: Criar componente de input de resultado

**Objetivo**: Criar componente de entrada de resultado com validação visual.

**Arquivo a criar**: `frontend/src/components/treino/InputResultado.jsx`

**Funcionalidades**:

- Campo de texto para digitar resultado
- Validação em tempo real:
  - Para números com múltiplos dígitos: validar apenas quando quantidade de dígitos estiver completa
  - Mostrar vermelho quando errado e completo
  - Mostrar verde (opcional) quando correto
- Avanço automático ao acertar (sem Enter)
- Limpar campo após acertar
- Foco automático no campo

**Validação**: Testar validação visual e avanço automático.

**Próximo passo**: Tarefa 4.9

---

### Tarefa 4.9: Criar componente de teclado virtual

**Objetivo**: Criar teclado numérico virtual para uso em mobile.

**Arquivo a criar**: `frontend/src/components/treino/TecladoVirtual.jsx`

**Funcionalidades**:

- Teclado numérico (0-9)
- Botões grandes e touch-friendly (mínimo 44x44px)
- Para sistema binário: apenas botões 0 e 1
- Para outros sistemas: botões 0-9
- Callback ao pressionar número
- Visual responsivo e acessível
- Mostrar apenas em mobile (detectar tamanho de tela)

**Validação**: Testar em dispositivo mobile e verificar usabilidade.

**Próximo passo**: Tarefa 4.10

---

### Tarefa 4.10: Criar componente de timer

**Objetivo**: Criar componente que mostra tempo restante do treino.

**Arquivo a criar**: `frontend/src/components/treino/Timer.jsx`

**Funcionalidades**:

- Mostrar tempo restante em formato MM:SS
- Contagem regressiva em tempo real
- Atualizar a cada segundo
- Quando chegar a 0, chamar callback para finalizar treino
- Visual destacado e fácil de ver
- Opcional: mostrar barra de progresso

**Validação**: Testar contagem regressiva e finalização automática.

**Próximo passo**: Tarefa 4.11

---

### Tarefa 4.11: Criar componente de contador de pontos

**Objetivo**: Criar componente que mostra total de acertos.

**Arquivo a criar**: `frontend/src/components/treino/ContadorPontos.jsx`

**Funcionalidades**:

- Mostrar total de acertos
- Incrementar ao acertar conta
- Visual destacado
- Animação ao incrementar (opcional)

**Validação**: Testar incremento de pontos.

**Próximo passo**: Tarefa 4.12

---

### Tarefa 4.12: Criar tela de treino ativo

**Objetivo**: Criar página principal do treino que integra todos os componentes.

**Arquivo a criar**: `frontend/src/pages/TreinoAtivo.jsx`

**Layout**:

- **Esquerda**: Lista de contas (scrollável)
- **Direita**: Timer no topo, Input de resultado no meio, Contador de pontos embaixo

**Funcionalidades**:

- Iniciar treino ao montar componente (após contagem regressiva)
- Gerenciar estado do treino (contas, pontos, tempo)
- Gerenciar buffer de contas (remover atual ao acertar, adicionar nova)
- Validar respostas em tempo real
- Finalizar automaticamente ao acabar tempo
- Mostrar modal de resultado ao finalizar
- Botões: "Recomeçar" (mesmo treino) e "Novo treino" (voltar seleção)

**Arquivo a criar**: `frontend/src/components/treino/TreinoAtivo.jsx` (componente principal)
**Arquivo a criar**: `frontend/src/components/treino/ResultadoTreino.jsx` (modal de resultado)

**Validação**: Testar fluxo completo de treino, validação de respostas e finalização.

**Próximo passo**: Tarefa 4.13

---

### Tarefa 4.13: Criar modal de resultado do treino

**Objetivo**: Criar modal que mostra resultado final do treino.

**Arquivo a criar**: `frontend/src/components/treino/ResultadoTreino.jsx`

**Funcionalidades**:

- Mostrar total de acertos
- Mostrar se bateu recorde (destaque especial)
- Mostrar recorde anterior (se não bateu)
- Botão "Recomeçar" (fecha modal e reinicia mesmo treino)
- Botão "Novo treino" (volta para seleção)
- Visual atrativo com cores do tema

**Validação**: Testar exibição de resultados e navegação.

**Próximo passo**: FASE 5 - SISTEMA DE RECORDES

## FASE 5: SISTEMA DE RECORDES

### Tarefa 5.1: Criar service de recordes

**Objetivo**: Criar service com lógica de criação e atualização de recordes.

**Arquivo a criar**: `backend/src/services/recordeService.js`

**Métodos a implementar**:

1. **verificarESalvarRecorde(usuarioId, operacaoId, limiteId, sistemaId, total)**:

   - Verificar se existe recorde para combinação (usuario, operacao, limite, sistema)
   - Se não existe: criar novo recorde
     - Preencher todos os campos incluindo atualizado_em (mesmo na criação)
     - Preencher criado_por e atualizado_por
   - Se existe e total atual > total anterior: atualizar recorde
     - Atualizar total
     - Atualizar atualizado_em (data do novo recorde)
     - Preencher atualizado_por
   - Se existe e total atual <= total anterior: não fazer nada
   - Retornar: { criado: boolean, atualizado: boolean, bateuRecorde: boolean, recordeAnterior? }

2. **listarRecordes(usuarioId, filtros)**:

   - Listar recordes do usuário
   - Filtros opcionais: limite_id, sistema_id
   - Incluir relacionamentos: operacao, limite, sistema
   - Filtrar apenas operações disponíveis no plano do usuário
   - Ordenar por operacao, limite, sistema
   - Retornar array de recordes

3. **obterRecorde(recordId, usuarioId)**:
   - Obter recorde específico por ID
   - Verificar que pertence ao usuário
   - Incluir todos os relacionamentos
   - Retornar recorde completo

**Validações**:

- Verificar que usuário existe
- Verificar que operacao, limite, sistema existem
- Validar que total é não negativo
- Sempre preencher atualizado_em na criação

**Validação**: Testar criação, atualização e consulta de recordes.

**Próximo passo**: Tarefa 5.2

---

### Tarefa 5.2: Criar controller de recordes

**Objetivo**: Criar controller para gerenciar recordes do usuário.

**Arquivo a criar**: `backend/src/controllers/recordeController.js`

**Métodos a implementar**:

1. **listar**:

   - Listar recordes do usuário logado
   - Aceitar filtros opcionais: limite_id, sistema_id (query params)
   - Chamar recordeService.listarRecordes
   - Retornar array de recordes formatados

2. **obter**:
   - Obter recorde específico por ID
   - Verificar que pertence ao usuário logado
   - Chamar recordeService.obterRecorde
   - Retornar recorde formatado

**Validações**:

- Verificar autenticação
- Validar que recorde pertence ao usuário
- Validar filtros (se fornecidos)

**Próximo passo**: Tarefa 5.3

---

### Tarefa 5.3: Criar rotas de recordes

**Objetivo**: Criar rotas para consultar recordes do usuário.

**Arquivo a criar**: `backend/src/routes/recordeRoutes.js`

**Rotas**:

- `GET /api/recordes` - Listar recordes do usuário logado (filtros: limite_id, sistema_id)
- `GET /api/recordes/:id` - Obter recorde específico

**Validações**:

- Todas as rotas requerem autenticação
- Validar que recorde pertence ao usuário (na rota de obter)
- Validar filtros opcionais (limite_id, sistema_id devem existir se fornecidos)

**Arquivo a editar**: `backend/src/routes/index.js` - Adicionar rota de recordes

**Validação**: Testar listagem com e sem filtros, e obter recorde específico.

**Próximo passo**: Tarefa 5.4

---

### Tarefa 5.4: Integrar salvamento de recordes no finalizar treino

**Objetivo**: Integrar chamada ao recordeService no controller de treinos ao finalizar.

**Arquivo a editar**: `backend/src/controllers/treinoController.js`

**Mudanças**:

- No método `finalizar`:
  - Após validar total de acertos
  - Chamar recordeService.verificarESalvarRecorde
  - Incluir informação se bateu recorde na resposta
  - Retornar: { total, bateuRecorde: boolean, recordeAnterior? }

**Validação**: Testar finalização de treino e verificar que recorde é salvo corretamente.

**Próximo passo**: Tarefa 5.5

---

### Tarefa 5.5: Criar componente de filtros de recordes

**Objetivo**: Criar componente com filtros para recordes (limite e sistema).

**Arquivo a criar**: `frontend/src/components/recordes/FiltrosRecordes.jsx`

**Funcionalidades**:

- Select de limite (carregar limites disponíveis para o plano)
- Select de sistema (carregar sistemas disponíveis para o plano)
- Botão "Filtrar" ou filtro automático ao selecionar
- Botão "Limpar filtros"
- Mostrar quantidade de recordes encontrados

**Validação**: Testar filtros e verificar que apenas recursos do plano aparecem.

**Próximo passo**: Tarefa 5.6

---

### Tarefa 5.6: Criar componente de card de recorde

**Objetivo**: Criar componente de card para exibir um recorde individual.

**Arquivo a criar**: `frontend/src/components/recordes/CardRecorde.jsx`

**Funcionalidades**:

- Mostrar informações do recorde:
  - Nome da operação
  - Descrição do limite (tempo)
  - Tipo de sistema numérico
  - Total de acertos (destaque)
  - Data do recorde (atualizado_em)
- Visual atrativo com cores do tema
- Diferentes cores por tipo de operação (opcional)
- Responsivo para mobile

**Validação**: Verificar visual do card e responsividade.

**Próximo passo**: Tarefa 5.7

---

### Tarefa 5.7: Criar componente de lista de recordes

**Objetivo**: Criar componente que agrupa e exibe recordes por operação.

**Arquivo a criar**: `frontend/src/components/recordes/ListaRecordes.jsx`

**Funcionalidades**:

- Receber array de recordes
- Agrupar por operação
- Para cada grupo:
  - Título com nome da operação
  - Lista de cards de recordes daquela operação
- Ordenar grupos por nome da operação
- Ordenar recordes dentro do grupo (limite, sistema)
- Mostrar mensagem se não há recordes
- Loading state durante carregamento

**Validação**: Testar agrupamento e exibição de recordes.

**Próximo passo**: Tarefa 5.8

---

### Tarefa 5.8: Criar tela de recordes

**Objetivo**: Criar página principal para exibir recordes do usuário.

**Arquivo a criar**: `frontend/src/pages/Recordes.jsx`

**Funcionalidades**:

- Carregar recordes do usuário logado
- Mostrar filtros no topo (componente FiltrosRecordes)
- Mostrar lista de recordes agrupados (componente ListaRecordes)
- Aplicar filtros ao carregar dados
- Atualizar lista quando filtros mudarem
- Mensagem quando não há recordes
- Loading state durante carregamento

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rota `/recordes`

**Validação**: Testar página completa com diferentes filtros e verificar agrupamento.

**Próximo passo**: Tarefa 5.9

---

### Tarefa 5.9: Otimizar consultas de recordes

**Objetivo**: Otimizar queries de recordes usando índices e relacionamentos eficientes.

**Arquivo a editar**: `backend/src/services/recordeService.js`

**Otimizações**:

- Usar include para carregar relacionamentos de uma vez
- Usar índices do banco (id_usuario, id_operacao, etc.)
- Evitar N+1 queries
- Usar select apenas dos campos necessários
- Considerar paginação se necessário no futuro

**Validação**: Verificar performance das queries com muitos recordes.

**Próximo passo**: FASE 6 - SISTEMA DE RANKINGS

## FASE 6: SISTEMA DE RANKINGS

### Tarefa 6.1: Criar service de ranking unificado

**Objetivo**: Criar service para gerar ranking unificado (global ou por conjunto).

**Arquivo a criar**: `backend/src/services/rankingService.js`

**Métodos a implementar**:

1. **obterRanking(filtros, usuarioId)**:

   - Receber filtros: operacao_id, limite_id, sistema_id, conjunto_id (opcional)
   - Se conjunto_id fornecido:
     - Validar que usuário pertence ao conjunto
     - Filtrar apenas usuários do conjunto com status='aceito'
   - Se conjunto_id não fornecido:
     - Ranking global (todos os usuários)
   - Buscar recordes com filtros aplicados
   - Ordenar por total DESC, atualizado_em DESC (maior pontuação, mais antiga em caso de empate)
   - Limitar a top 100 usuários
   - Incluir informações: posição, nome do usuário, total, data do recorde
   - Calcular posição do usuário logado (mesmo se não estiver nos 100)
   - Contar total de usuários que têm recorde no ranking filtrado
   - Retornar: { ranking: [...], posicaoUsuario: number, totalParticipantes: number }

2. **obterPosicaoUsuario(filtros, usuarioId)**:
   - Calcular posição exata do usuário no ranking filtrado
   - Mesma lógica de filtros e ordenação
   - Retornar posição (1-based) ou null se não tem recorde

**Validações**:

- Validar que operacao, limite, sistema existem
- Validar que conjunto existe (se fornecido)
- Validar que usuário pertence ao conjunto (se fornecido)
- Usar índices do banco para otimização

**Validação**: Testar ranking global e por conjunto com diferentes filtros.

**Próximo passo**: Tarefa 6.2

---

### Tarefa 6.2: Criar controller de rankings

**Objetivo**: Criar controller para gerenciar rankings.

**Arquivo a criar**: `backend/src/controllers/rankingController.js`

**Métodos a implementar**:

1. **obterRanking**:
   - Receber filtros via query params: operacao_id, limite_id, sistema_id, conjunto_id (opcional)
   - Validar filtros obrigatórios (operacao_id, limite_id, sistema_id)
   - Verificar se usuário pertence a conjuntos (se conjunto_id fornecido)
   - Chamar rankingService.obterRanking
   - Retornar ranking formatado com posição do usuário e total de participantes

**Validações**:

- Verificar autenticação
- Validar que filtros obrigatórios foram fornecidos
- Validar que conjunto existe e usuário pertence (se conjunto_id fornecido)
- Validar que operacao, limite, sistema existem e usuário tem acesso

**Próximo passo**: Tarefa 6.3

---

### Tarefa 6.3: Criar rotas de rankings

**Objetivo**: Criar rota unificada para rankings (global e por conjunto).

**Arquivo a criar**: `backend/src/routes/rankingRoutes.js`

**Rotas**:

- `GET /api/rankings` - Obter ranking (filtros: operacao_id, limite_id, sistema_id, conjunto_id - opcional)

**Validações**:

- Requer autenticação
- Validar query params obrigatórios (operacao_id, limite_id, sistema_id)
- Validar conjunto_id se fornecido (deve existir e usuário deve pertencer)

**Arquivo a editar**: `backend/src/routes/index.js` - Adicionar rota de rankings

**Validação**: Testar ranking global e por conjunto com diferentes filtros.

**Próximo passo**: Tarefa 6.4

---

### Tarefa 6.4: Otimizar queries de ranking com índices

**Objetivo**: Garantir que queries de ranking usem índices adequados para performance.

**Arquivo a editar**: `backend/src/services/rankingService.js`

**Otimizações**:

- Usar índice composto (id_operacao, id_limite, id_sistema, total) já criado
- Usar include para carregar relacionamentos (usuario) de uma vez
- Evitar N+1 queries
- Usar select apenas dos campos necessários
- Considerar cache se necessário (opcional)

**Validação**: Verificar performance com muitos usuários e recordes.

**Próximo passo**: Tarefa 6.5

---

### Tarefa 6.5: Criar componente de filtros de ranking

**Objetivo**: Criar componente com filtros para ranking.

**Arquivo a criar**: `frontend/src/components/rankings/FiltrosRanking.jsx`

**Funcionalidades**:

- Select de operação (carregar operações disponíveis para o plano)
- Select de limite (carregar limites disponíveis para o plano)
- Select de sistema (carregar sistemas disponíveis para o plano)
- Select de conjunto (opcional, apenas se usuário pertence a pelo menos um conjunto)
  - Opção "Global" para ranking global
  - Lista de conjuntos do usuário
- Botão "Filtrar" ou filtro automático ao selecionar
- Botão "Limpar filtros"
- Validação: operação, limite e sistema são obrigatórios

**Validação**: Testar filtros e verificar que apenas recursos do plano aparecem.

**Próximo passo**: Tarefa 6.6

---

### Tarefa 6.6: Criar componente de informações do usuário no ranking

**Objetivo**: Criar componente que mostra pontuação e posição do usuário logado.

**Arquivo a criar**: `frontend/src/components/rankings/InfoUsuario.jsx`

**Funcionalidades**:

- Mostrar pontuação do usuário (total de acertos)
- Mostrar posição do usuário no ranking
- Mostrar total de participantes
- Visual destacado
- Mensagem especial se usuário está no top 3
- Mensagem se usuário não tem recorde no ranking filtrado

**Validação**: Verificar exibição correta das informações.

**Próximo passo**: Tarefa 6.7

---

### Tarefa 6.7: Criar componente de linha da tabela de ranking

**Objetivo**: Criar componente para exibir uma linha do ranking.

**Arquivo a criar**: `frontend/src/components/rankings/LinhaRanking.jsx`

**Funcionalidades**:

- Mostrar posição (com medalha/ícone para top 3)
- Mostrar nome do usuário
- Mostrar total de acertos
- Mostrar data do recorde
- Destaque visual para top 3:
  - Posição 1: cor dourada/amarela
  - Posição 2: cor prateada/laranja
  - Posição 3: cor bronze/azul
- Destaque especial se for usuário logado (mesmo que não esteja no top 3)
- Responsivo para mobile

**Validação**: Verificar visual e destaques.

**Próximo passo**: Tarefa 6.8

---

### Tarefa 6.8: Criar componente de tabela de ranking

**Objetivo**: Criar componente que exibe tabela completa do ranking.

**Arquivo a criar**: `frontend/src/components/rankings/TabelaRanking.jsx`

**Funcionalidades**:

- Receber array de ranking (top 100)
- Receber posição do usuário logado
- Exibir cabeçalho da tabela: Posição, Nome, Pontuação, Data
- Renderizar linhas usando componente LinhaRanking
- Scrollável se necessário
- Responsivo (em mobile pode virar cards)
- Mostrar mensagem se ranking está vazio

**Validação**: Testar exibição do ranking e responsividade.

**Próximo passo**: Tarefa 6.9

---

### Tarefa 6.9: Criar tela de rankings

**Objetivo**: Criar página principal para exibir rankings.

**Arquivo a criar**: `frontend/src/pages/Rankings.jsx`

**Funcionalidades**:

- Carregar operações, limites e sistemas disponíveis
- Carregar conjuntos do usuário (se houver)
- Mostrar filtros no topo (componente FiltrosRanking)
- Mostrar informações do usuário (componente InfoUsuario)
- Mostrar tabela de ranking (componente TabelaRanking)
- Aplicar filtros ao carregar dados
- Atualizar ranking quando filtros mudarem
- Loading state durante carregamento
- Mensagem quando não há dados

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rota `/rankings`

**Validação**: Testar página completa com diferentes filtros, verificar destaques e posição do usuário.

**Próximo passo**: FASE 7 - SISTEMA DE CONJUNTOS

## FASE 7: SISTEMA DE CONJUNTOS

### Tarefa 7.1: Criar controller de conjuntos

**Objetivo**: Criar controller completo para CRUD de conjuntos.

**Arquivo a criar**: `backend/src/controllers/conjuntoController.js`

**Métodos a implementar**:

1. **listar**:

   - Listar conjuntos do usuário logado (onde ele participa com status 'aceito')
   - Incluir quantidade de membros
   - Retornar apenas conjuntos ativos

2. **obter**:

   - Obter conjunto por ID
   - Verificar se usuário tem acesso (participa do conjunto)
   - Incluir lista de membros com tipos

3. **criar**:

   - Qualquer usuário pode criar
   - Validar limites do plano:
     - Verificar `conjuntos_criar` (contar apenas conjuntos ativos)
     - Verificar `conjuntos_participar` (criador participa automaticamente)
   - Criar conjunto com nome
   - Criar registro em usuarios_conjuntos:
     - tipo='dono', status='aceito'
     - criado_por = usuário logado
   - Retornar conjunto criado

4. **atualizar**:

   - Apenas dono pode atualizar
   - Permitir editar apenas nome
   - Preencher atualizado_por

5. **excluir**:
   - Apenas dono pode excluir
   - Exclusão lógica (ativo=false)
   - Preencher atualizado_por

**Validações**:

- Nome obrigatório
- Verificar limites do plano antes de criar
- Verificar permissões (dono para editar/excluir)

**Próximo passo**: Tarefa 7.2

---

### Tarefa 7.2: Criar controller de usuários-conjuntos

**Objetivo**: Criar controller para gerenciar relacionamento entre usuários e conjuntos.

**Arquivo a criar**: `backend/src/controllers/usuarioConjuntoController.js`

**Métodos a implementar**:

1. **listarUsuarios**:

   - Listar usuários de um conjunto
   - Apenas dono/admin podem ver
   - Incluir informações: nome, email, tipo, status
   - Ordenar por tipo (dono, admin, comum) e nome

2. **convidar**:

   - Dono ou admin podem convidar
   - Receber email do usuário
   - Validar que email existe no sistema
   - Validar que usuário não está já no conjunto
   - Validar limite `conjuntos_participar` do usuário convidado
   - Criar registro com status='pendente', tipo='comum'
   - Preencher criado_por

3. **atualizarTipo**:

   - Apenas dono pode alterar tipo
   - Permitir alterar para 'admin' ou 'comum'
   - Não permitir alterar tipo do dono
   - Preencher atualizado_por

4. **remover**:

   - Dono e admin podem remover
   - Não permitir remover dono (ou apenas se excluir conjunto)
   - Remover registro de usuarios_conjuntos

5. **aceitarConvite**:

   - Usuário pode aceitar próprio convite
   - Validar que convite existe e está pendente
   - Validar limite `conjuntos_participar` do usuário
   - Atualizar status para 'aceito'
   - Preencher atualizado_por

6. **rejeitarConvite**:

   - Usuário pode rejeitar próprio convite
   - Validar que convite existe e está pendente
   - Atualizar status para 'rejeitado' (ou excluir registro)
   - Preencher atualizado_por

7. **listarConvitesPendentes**:
   - Listar convites pendentes do usuário logado
   - Incluir informações do conjunto e quem convidou
   - Retornar apenas status='pendente'

**Validações**:

- Verificar permissões em cada método
- Validar limites do plano
- Validar que usuário existe
- Validar que não está duplicado no conjunto

**Próximo passo**: Tarefa 7.3

---

### Tarefa 7.3: Criar rotas de conjuntos

**Objetivo**: Criar rotas para CRUD de conjuntos.

**Arquivo a criar**: `backend/src/routes/conjuntoRoutes.js`

**Rotas**:

- `GET /api/conjuntos` - Listar conjuntos do usuário logado
- `GET /api/conjuntos/:id` - Obter conjunto específico
- `POST /api/conjuntos` - Criar conjunto (nome)
- `PUT /api/conjuntos/:id` - Atualizar conjunto (nome) - dono apenas
- `DELETE /api/conjuntos/:id` - Excluir conjunto logicamente - dono apenas

**Middlewares**:

- authMiddleware em todas as rotas
- Validação de propriedade (dono) nas rotas de atualizar/excluir

**Validações**:

- Nome obrigatório e não vazio

**Arquivo a editar**: `backend/src/routes/index.js` - Adicionar rota de conjuntos

**Validação**: Testar todas as rotas e verificar permissões.

**Próximo passo**: Tarefa 7.4

---

### Tarefa 7.4: Criar rotas de usuários-conjuntos

**Objetivo**: Criar rotas para gerenciar relacionamento usuários-conjuntos.

**Arquivo a criar**: `backend/src/routes/usuarioConjuntoRoutes.js`

**Rotas**:

- `GET /api/conjuntos/:conjunto_id/usuarios` - Listar usuários do conjunto
- `POST /api/conjuntos/:conjunto_id/usuarios` - Convidar usuário (email) - dono/admin
- `PUT /api/conjuntos/:conjunto_id/usuarios/:usuario_id` - Atualizar tipo - dono apenas
- `DELETE /api/conjuntos/:conjunto_id/usuarios/:usuario_id` - Remover usuário - dono/admin
- `POST /api/conjuntos/:conjunto_id/usuarios/:usuario_id/aceitar` - Aceitar convite
- `POST /api/conjuntos/:conjunto_id/usuarios/:usuario_id/rejeitar` - Rejeitar convite
- `GET /api/usuarios/convites-pendentes` - Listar convites pendentes do usuário logado

**Middlewares**:

- authMiddleware em todas as rotas
- Validação de permissões específicas (dono/admin) conforme necessário

**Validações**:

- Email válido para convites
- Validar que conjunto existe
- Validar que usuário existe (para convites)

**Arquivo a editar**: `backend/src/routes/index.js` - Adicionar rotas de usuários-conjuntos

**Validação**: Testar fluxo completo de convites e gerenciamento.

**Próximo passo**: Tarefa 7.5

---

### Tarefa 7.5: Criar context de notificações

**Objetivo**: Criar context React para gerenciar notificações de convites.

**Arquivo a criar**: `frontend/src/context/NotificationContext.jsx`

**Funcionalidades**:

- Estado para lista de convites pendentes
- Função para carregar convites pendentes
- Função para atualizar após aceitar/rejeitar
- Badge com contador de convites pendentes
- Atualizar automaticamente ao receber novo convite

**Validação**: Verificar que context funciona e atualiza corretamente.

**Próximo passo**: Tarefa 7.6

---

### Tarefa 7.6: Criar tela de conjuntos

**Objetivo**: Criar página principal para listar e gerenciar conjuntos do usuário.

**Arquivo a criar**: `frontend/src/pages/Conjuntos.jsx`

**Funcionalidades**:

- Listar conjuntos do usuário logado
- Mostrar para cada conjunto: nome, quantidade de membros
- Botão "Criar conjunto"
- Para cada conjunto:
  - Botão "Ver detalhes"
  - Botão "Editar" (apenas se dono)
  - Botão "Excluir" (apenas se dono)
- Modal de criação de conjunto
- Modal de edição de conjunto (apenas dono)
- Validação de limites do plano antes de criar

**Arquivos a criar**:

- `frontend/src/components/conjuntos/ListaConjuntos.jsx`
- `frontend/src/components/conjuntos/FormConjunto.jsx`
- `frontend/src/components/conjuntos/ModalConjunto.jsx` (opcional)

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rota `/conjuntos`

**Validação**: Testar listagem, criação, edição e exclusão de conjuntos.

**Próximo passo**: Tarefa 7.7

---

### Tarefa 7.7: Criar página de detalhes do conjunto

**Objetivo**: Criar página para visualizar e gerenciar membros de um conjunto.

**Arquivo a criar**: `frontend/src/pages/DetalhesConjunto.jsx`

**Funcionalidades**:

- Mostrar informações do conjunto (nome, quantidade de membros)
- Lista de membros com:
  - Nome, email
  - Tipo (dono, admin, comum) - badge visual
  - Status (aceito, pendente, rejeitado)
  - Botões de ação conforme permissões
- Botão "Adicionar membro" (dono/admin apenas)
- Modal para adicionar membro (digitar email)
- Para cada membro:
  - Botão "Tornar admin" (dono apenas, se for comum)
  - Botão "Remover" (dono/admin apenas, exceto dono do conjunto)
- Mostrar mensagem se usuário não tem permissão

**Arquivos a criar**:

- `frontend/src/components/conjuntos/DetalhesConjunto.jsx`
- `frontend/src/components/conjuntos/ListaMembros.jsx`
- `frontend/src/components/conjuntos/ModalAdicionarMembro.jsx`

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rota `/conjuntos/:id`

**Validação**: Testar gerenciamento de membros e verificar permissões.

**Próximo passo**: Tarefa 7.8

---

### Tarefa 7.8: Criar componente de convites pendentes

**Objetivo**: Criar componente para exibir e gerenciar convites pendentes.

**Arquivo a criar**: `frontend/src/components/conjuntos/ConvitesPendentes.jsx`

**Funcionalidades**:

- Listar convites pendentes do usuário logado
- Mostrar para cada convite:
  - Nome do conjunto
  - Quem convidou (nome/email)
  - Data do convite
  - Botões "Aceitar" e "Rejeitar"
- Atualizar lista após aceitar/rejeitar
- Mostrar mensagem se não há convites pendentes
- Integrar com NotificationContext

**Validação**: Testar aceitar e rejeitar convites.

**Próximo passo**: Tarefa 7.9

---

### Tarefa 7.9: Implementar badge de notificações no menu

**Objetivo**: Adicionar badge no menu lateral mostrando quantidade de convites pendentes.

**Arquivo a editar**: `frontend/src/components/common/Sidebar.jsx`

**Funcionalidades**:

- Mostrar badge com contador de convites pendentes
- Badge visível apenas se houver convites
- Link para página de convites ou dropdown
- Atualizar contador automaticamente
- Visual destacado (cor do tema)

**Validação**: Testar exibição e atualização do badge.

**Próximo passo**: Tarefa 7.10

---

### Tarefa 7.10: Criar página de convites pendentes

**Objetivo**: Criar página dedicada para visualizar e gerenciar convites pendentes.

**Arquivo a criar**: `frontend/src/pages/Convites.jsx`

**Funcionalidades**:

- Listar todos os convites pendentes
- Usar componente ConvitesPendentes
- Mostrar mensagem se não há convites
- Link para voltar ou navegar para conjuntos
- Atualizar automaticamente após ações

**Arquivo a editar**: `frontend/src/routes.js` - Adicionar rota `/convites`

**Validação**: Testar página completa de convites.

**Próximo passo**: FASE 8 - POLIMENTO

## FASE 8: POLIMENTO

### Tarefa 8.1: Criar arquivo de tema (cores do cubo mágico)

**Objetivo**: Criar arquivo centralizado com todas as cores do tema do cubo mágico.

**Arquivo a criar**: `frontend/src/styles/theme.js`

**Conteúdo**:

- Definir paleta de cores:
  - Branco (#FFFFFF) - fundo, cards
  - Amarelo (#FFD700 / #FFEB3B) - destaques, top 1
  - Verde (#4CAF50 / #8BC34A) - sucesso, acertos
  - Azul (#2196F3 / #03A9F4) - primária, links
  - Vermelho (#F44336 / #E91E63) - erros, alertas
  - Laranja (#FF9800 / #FF5722) - secundária, top 2-3
- Exportar objeto com todas as cores
- Definir cores por contexto (primária, secundária, sucesso, erro, etc.)

**Validação**: Verificar que todas as cores estão definidas corretamente.

**Próximo passo**: Tarefa 8.2

---

### Tarefa 8.2: Aplicar tema no Header e Sidebar

**Objetivo**: Aplicar cores do tema do cubo mágico no Header e Sidebar.

**Arquivos a editar**:

- `frontend/src/components/common/Header.jsx`
- `frontend/src/components/common/Sidebar.jsx`

**Aplicações**:

- Header: azul ou branco com detalhes coloridos
- Sidebar: azul ou branco com detalhes coloridos
- Links e botões: usar cores primárias do tema
- Hover states: usar cores secundárias
- Badge de notificações: usar cor de destaque (laranja ou vermelho)

**Arquivo a criar**: `frontend/src/styles/components.css` (ou adicionar ao arquivo existente)

**Validação**: Verificar visual do Header e Sidebar com tema aplicado.

**Próximo passo**: Tarefa 8.3

---

### Tarefa 8.3: Aplicar tema nos cards de operação

**Objetivo**: Aplicar cores diferentes para cada tipo de operação nos cards.

**Arquivo a editar**: `frontend/src/pages/NovoTreino.jsx` ou componente de cards

**Aplicações**:

- Card de soma: uma cor (ex: azul)
- Card de subtração: outra cor (ex: verde)
- Card de multiplicação: outra cor (ex: laranja)
- Card de divisão: outra cor (ex: amarelo)
- Card de raiz: outra cor (ex: vermelho suave)
- Manter consistência visual
- Hover effects com cores do tema

**Validação**: Verificar que cada tipo de operação tem cor distinta.

**Próximo passo**: Tarefa 8.4

---

### Tarefa 8.4: Aplicar tema no ranking (top 3)

**Objetivo**: Destacar top 3 do ranking com cores especiais (ouro/prata/bronze ou amarelo/laranja/azul).

**Arquivo a editar**: `frontend/src/pages/Rankings.jsx` ou componente de tabela

**Aplicações**:

- Top 1: cor dourada/amarela (#FFD700)
- Top 2: cor prateada/laranja (#FF9800)
- Top 3: cor bronze/azul (#2196F3)
- Usuário logado: destaque especial (borda ou fundo)
- Ícones de medalha (opcional)

**Validação**: Verificar destaque visual do top 3 e usuário logado.

**Próximo passo**: Tarefa 8.5

---

### Tarefa 8.5: Aplicar tema nos feedbacks visuais

**Objetivo**: Aplicar cores do tema nos feedbacks de acerto/erro.

**Arquivos a editar**:

- `frontend/src/components/treino/InputResultado.jsx`
- Outros componentes com feedback visual

**Aplicações**:

- Feedback de acerto: verde (#4CAF50)
- Feedback de erro: vermelho (#F44336)
- Transições suaves entre estados
- Animações sutis (opcional)

**Validação**: Testar feedbacks visuais em diferentes situações.

**Próximo passo**: Tarefa 8.6

---

### Tarefa 8.6: Aplicar tema em botões e elementos interativos

**Objetivo**: Padronizar cores de botões e elementos interativos com o tema.

**Arquivos a editar**: Todos os componentes com botões

**Aplicações**:

- Botões primários: azul (#2196F3)
- Botões secundários: laranja (#FF9800) ou branco
- Botões de perigo (excluir): vermelho (#F44336)
- Estados hover e active consistentes
- Botões desabilitados: cinza claro

**Arquivo a criar**: `frontend/src/styles/buttons.css` (ou adicionar ao CSS global)

**Validação**: Verificar consistência visual de todos os botões.

**Próximo passo**: Tarefa 8.7

---

### Tarefa 8.7: Otimizar Sidebar para mobile (hamburger menu)

**Objetivo**: Tornar Sidebar responsiva com menu hamburger no mobile.

**Arquivo a editar**: `frontend/src/components/common/Sidebar.jsx`

**Funcionalidades**:

- Menu hamburger visível apenas em mobile (< 768px)
- Sidebar colapsável no mobile
- Overlay quando sidebar aberta no mobile
- Fechar ao clicar fora ou em link
- Transições suaves
- Touch-friendly (áreas clicáveis grandes)

**Validação**: Testar em diferentes tamanhos de tela mobile.

**Próximo passo**: Tarefa 8.8

---

### Tarefa 8.8: Otimizar layout de treino para mobile

**Objetivo**: Ajustar layout da tela de treino para funcionar bem em mobile.

**Arquivo a editar**: `frontend/src/pages/TreinoAtivo.jsx` e componentes relacionados

**Ajustes**:

- Layout responsivo: em mobile, lista de contas pode ficar acima do input
- Input de resultado maior e mais visível
- Timer destacado e fácil de ver
- Contador de pontos visível
- Teclado virtual sempre visível em mobile
- Otimizar espaçamentos e tamanhos de fonte

**Validação**: Testar treino completo em dispositivo mobile real.

**Próximo passo**: Tarefa 8.9

---

### Tarefa 8.9: Garantir touch-friendly em todos os elementos

**Objetivo**: Garantir que todos os elementos interativos sejam touch-friendly.

**Arquivos a editar**: Todos os componentes com elementos clicáveis

**Ajustes**:

- Botões com tamanho mínimo de 44x44px
- Links e áreas clicáveis com padding adequado
- Espaçamento entre elementos clicáveis
- Feedback tátil visual ao tocar
- Verificar todos os formulários e inputs

**Validação**: Testar em dispositivo mobile e verificar usabilidade.

**Próximo passo**: Tarefa 8.10

---

### Tarefa 8.10: Criar componente de Loading

**Objetivo**: Criar componente reutilizável de loading para usar em todo o sistema.

**Arquivo a criar**: `frontend/src/components/common/Loading.jsx`

**Funcionalidades**:

- Spinner ou skeleton loader
- Opção de texto de loading
- Tamanhos diferentes (pequeno, médio, grande)
- Usar cores do tema
- Animação suave

**Validação**: Verificar visual e animação do componente.

**Próximo passo**: Tarefa 8.11

---

### Tarefa 8.11: Adicionar loading states em todas as requisições

**Objetivo**: Adicionar estados de loading em todas as operações assíncronas.

**Arquivos a editar**: Todas as páginas e componentes que fazem requisições

**Aplicações**:

- Mostrar loading ao carregar dados iniciais
- Mostrar loading ao salvar formulários
- Mostrar loading ao fazer ações (aceitar convite, etc.)
- Usar componente Loading criado
- Desabilitar botões durante loading

**Validação**: Testar todas as operações e verificar loading states.

**Próximo passo**: Tarefa 8.12

---

### Tarefa 8.12: Criar componente de ErrorMessage

**Objetivo**: Criar componente reutilizável para exibir mensagens de erro.

**Arquivo a criar**: `frontend/src/components/common/ErrorMessage.jsx`

**Funcionalidades**:

- Exibir mensagens de erro de forma consistente
- Diferentes tipos: erro, aviso, info
- Ícones visuais
- Cores do tema (vermelho para erro)
- Opção de fechar
- Posicionamento flexível

**Validação**: Verificar visual e funcionalidade do componente.

**Próximo passo**: Tarefa 8.13

---

### Tarefa 8.13: Melhorar tratamento de erros no frontend

**Objetivo**: Implementar tratamento de erros consistente em todo o frontend.

**Arquivos a editar**: Todos os componentes que fazem requisições

**Aplicações**:

- Capturar erros de requisições
- Exibir mensagens amigáveis ao usuário
- Tratar erros de rede (timeout, offline)
- Tratar erros de validação
- Usar componente ErrorMessage
- Logs de erro no console (apenas em desenvolvimento)

**Validação**: Testar diferentes cenários de erro.

**Próximo passo**: Tarefa 8.14

---

### Tarefa 8.14: Melhorar tratamento de erros no backend

**Objetivo**: Melhorar tratamento de erros no backend com mensagens consistentes.

**Arquivos a editar**: Todos os controllers e middlewares

**Aplicações**:

- Mensagens de erro amigáveis e consistentes
- Logs detalhados no backend para debugging
- Tratamento de erros de validação
- Tratamento de erros de banco de dados
- Códigos HTTP apropriados
- Middleware de tratamento de erros global

**Arquivo a criar**: `backend/src/utils/errors.js` (opcional, para erros customizados)

**Validação**: Testar diferentes cenários de erro e verificar logs.

**Próximo passo**: Tarefa 8.15

---

### Tarefa 8.15: Adicionar feedback visual em ações importantes

**Objetivo**: Adicionar feedback visual (toasts/notificações) em ações importantes.

**Arquivo a criar**: `frontend/src/components/common/Toast.jsx` ou usar biblioteca

**Funcionalidades**:

- Toast de sucesso ao salvar dados
- Toast de erro ao falhar operação
- Toast de informação quando necessário
- Posicionamento não intrusivo
- Auto-dismiss após alguns segundos
- Usar cores do tema

**Aplicações**:

- Criar/editar usuário
- Criar/editar conjunto
- Aceitar/rejeitar convite
- Salvar perfil
- Finalizar treino

**Validação**: Testar feedbacks em todas as ações importantes.

**Próximo passo**: Tarefa 8.16

---

### Tarefa 8.16: Otimizar performance do frontend

**Objetivo**: Implementar otimizações de performance no React.

**Aplicações**:

- Lazy loading de componentes (React.lazy)
- Code splitting por rota
- Memoização de componentes pesados (React.memo)
- Debounce em inputs de busca/filtro
- Otimização de re-renders desnecessários
- Cache de requisições quando apropriado

**Arquivos a editar**:

- `frontend/src/routes.js` - Implementar lazy loading
- Componentes com busca/filtro - Adicionar debounce

**Validação**: Verificar performance com React DevTools.

**Próximo passo**: Tarefa 8.17

---

### Tarefa 8.17: Melhorar acessibilidade

**Objetivo**: Melhorar acessibilidade do sistema seguindo padrões WCAG.

**Aplicações**:

- Contraste adequado de cores (WCAG AA mínimo)
- Navegação por teclado em todos os elementos
- Labels adequados em todos os formulários
- ARIA labels onde necessário
- Feedback textual além do visual
- Foco visível em elementos interativos
- Ordem lógica de tabulação

**Validação**: Testar navegação por teclado e usar ferramentas de acessibilidade.

**Próximo passo**: Tarefa 8.18

---

### Tarefa 8.18: Criar CSS global e reset

**Objetivo**: Criar arquivo CSS global com reset e estilos base.

**Arquivo a criar**: `frontend/src/styles/global.css`

**Conteúdo**:

- Reset CSS básico
- Estilos base (fontes, cores, espaçamentos)
- Variáveis CSS com cores do tema
- Estilos para elementos HTML básicos
- Media queries para breakpoints
- Utilitários comuns

**Arquivo a editar**: `frontend/src/index.js` - Importar CSS global

**Validação**: Verificar que estilos base estão aplicados corretamente.

**Próximo passo**: Tarefa 8.19

---

### Tarefa 8.19: Testes básicos de funcionalidades críticas

**Objetivo**: Criar testes básicos para funcionalidades críticas do sistema.

**Arquivos a criar**:

- `backend/src/services/__tests__/treinoService.test.js`
- `backend/src/services/__tests__/conversaoService.test.js`
- `frontend/src/components/__tests__/Login.test.jsx` (exemplo)

**Testes a implementar**:

- Service de conversão de sistemas numéricos
- Service de geração de contas matemáticas
- Service de validação de respostas
- Componentes críticos do frontend (login, treino)

**Ferramentas**: Jest, Supertest (backend), React Testing Library (frontend)

**Validação**: Executar testes e verificar cobertura básica.

**Próximo passo**: Tarefa 8.20

---

### Tarefa 8.20: Criar README com instruções

**Objetivo**: Criar README completo com instruções de instalação e execução.

**Arquivo a criar**: `README.md`

**Conteúdo**:

- Descrição do projeto
- Requisitos (Node.js, MySQL)
- Instalação passo a passo
- Configuração do banco de dados
- Variáveis de ambiente
- Comandos para executar (dev, build, migrate, seed)
- Estrutura do projeto
- Tecnologias utilizadas

**Validação**: Seguir README e verificar que funciona do zero.

**Próximo passo**: FASE 9 - DEPLOY

### FASE 9: DEPLOY

- Configurar variáveis de ambiente
- Testar build
- Deploy no Render.com
- Testes em produção

---

## INSTRUÇÕES DE USO

1. **Execute as tarefas em ordem**: Cada tarefa depende das anteriores
2. **Valide cada etapa**: Não avance sem validar que a etapa anterior funcionou
3. **Teste frequentemente**: Teste após cada funcionalidade implementada
4. **Revise o código**: Revise o código gerado antes de seguir para próxima tarefa
5. **Ajuste conforme necessário**: Adapte os passos conforme sua necessidade específica

## COMANDOS ÚTEIS

```bash
# Backend
cd backend
npm start              # Iniciar servidor
npm run dev            # Modo desenvolvimento (nodemon)
npm run migrate        # Executar migrations
npm run seed           # Executar seeders

# Frontend
cd frontend
npm start              # Iniciar em desenvolvimento
npm run build          # Build para produção

# Banco de dados
mysql -u root -p      # Acessar MySQL
USE appcinoto;        # Usar banco
SHOW TABLES;          # Listar tabelas
```

---

**FIM DO DOCUMENTO**

Este documento serve como guia passo a passo. Cada tarefa pode ser passada individualmente para o Cursor para implementação.
