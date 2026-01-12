---
name: Modo visitante sem login
overview: Implementar funcionalidade de acesso como visitante que permite usar o sistema sem login, com acesso ao plano id=2, mas sem salvar recordes, criar conjuntos ou editar perfil. Visitantes podem treinar, ver rankings e visualizar recordes de outros usuários.
todos:
  - id: backend-visitante-auth
    content: Criar endpoint POST /auth/visitante no backend que gera token JWT especial para visitantes
    status: completed
  - id: backend-auth-middleware
    content: Modificar middleware auth.js para detectar e criar objeto usuário visitante sem buscar no banco
    status: completed
  - id: backend-prevent-records
    content: Modificar treinoController para não salvar recordes quando usuário for visitante
    status: completed
  - id: backend-prevent-conjuntos
    content: Modificar conjuntoController para bloquear criação de conjuntos para visitantes
    status: completed
  - id: frontend-login-button
    content: Adicionar botão 'Entrar como visitante' na página de login
    status: completed
  - id: frontend-auth-context
    content: Adicionar método loginVisitante() no AuthContext e suporte a visitantes
    status: completed
  - id: frontend-recordes-page
    content: Ajustar página de recordes para visitantes (chamar API com id=0, retornará vazio automaticamente)
    status: completed
  - id: frontend-conjuntos-page
    content: Esconder botão criar conjunto e mostrar mensagem apropriada para visitantes
    status: completed
  - id: frontend-perfil-page
    content: Desabilitar edição e mostrar mensagem informativa no perfil para visitantes
    status: completed
---

# Implementação de modo visitante

## Objetivo

Permitir que qualquer pessoa acesse o sistema sem login para testá-lo, com funcionalidades limitadas mas suficientes para uma boa experiência de demonstração.

## Arquitetura

### Backend

#### 1. Autenticação de visitante

- **Arquivo**: `backend/src/controllers/authController.js`
  - Adicionar método `loginVisitante()` que gera um token JWT especial para visitantes
  - O token deve conter um payload identificando como visitante (ex: `tipo: "visitante"`)
  - Não criar usuário no banco de dados
  - Retornar dados simulados do usuário com `id_plano: 2` e informações padrão

- **Arquivo**: `backend/src/routes/authRoutes.js`
  - Adicionar rota `POST /auth/visitante` que chama `authController.loginVisitante`

- **Arquivo**: `backend/src/middlewares/auth.js`
  - Modificar `authMiddleware` para detectar tokens de visitante (verificar `decoded.id === 0` ou `decoded.isVisitante === true`)
  - Se for visitante, criar objeto `req.usuario` simulado sem buscar no banco
  - Carregar dados do plano id=2 do banco para incluir no objeto visitante
  - Incluir flag `isVisitante: true` no objeto usuário para facilitar verificações
  - Manter compatibilidade com usuários reais (buscar no banco normalmente se não for visitante)

#### 2. Prevenção de salvamento de recordes

- **Arquivo**: `backend/src/controllers/treinoController.js`
  - No método `finalizar()`, verificar se `req.usuario.isVisitante === true`
  - Se for visitante, pular completamente a chamada a `recordeService.verificarESalvarRecorde()`
  - Retornar resposta normal mas sem informações de recorde

- **Arquivo**: `backend/src/controllers/treinoController.js`
  - No método `confirmarInicio()`, verificar se é visitante
  - Se for visitante, pular `recordeService.incrementarQuantidadeTreino()`

#### 3. Prevenção de criação de conjuntos

- **Arquivo**: `backend/src/controllers/conjuntoController.js`
  - No método `criar()`, verificar se é visitante
  - Se for visitante, retornar erro 403 com mensagem apropriada

#### 4. Acesso ao plano id=2

- **Arquivo**: `backend/src/middlewares/auth.js`
  - Ao criar objeto de visitante, incluir `id_plano: 2` e carregar dados do plano
  - Garantir que visitante tenha acesso a todas as operações, limites e sistemas do plano id=2

### Frontend

#### 1. Página de login

- **Arquivo**: `frontend/src/pages/Login.jsx`
  - Adicionar botão "Entrar como visitante" abaixo do formulário de login
  - O botão deve chamar uma nova função `loginVisitante()` do AuthContext
  - Estilizar o botão de forma atrativa mas secundária ao login principal

#### 2. Contexto de autenticação

- **Arquivo**: `frontend/src/context/AuthContext.jsx`
  - Adicionar método `loginVisitante()` que chama `POST /auth/visitante`
  - Armazenar token de visitante no localStorage (mesmo comportamento de login normal)
  - Marcar usuário como visitante no estado (ex: `usuario.isVisitante = true`)
  - Modificar `carregarUsuario()` para detectar visitantes e não chamar `/auth/me` (ou criar endpoint específico)

#### 3. Página de recordes

- **Arquivo**: `frontend/src/pages/Recordes.jsx`
  - **Opção A (recomendada)**: Chamar a API normalmente com `id_usuario: 0` (ou id especial de visitante)
    - A API retornará array vazio pois não há recordes com esse ID
    - Vantagem: não precisa alterar lógica de chamada, funciona automaticamente
    - Desvantagem: faz uma chamada desnecessária à API
  - **Opção B**: Não chamar a API se for visitante, retornar array vazio diretamente
    - Vantagem: evita chamada desnecessária
    - Desvantagem: precisa adicionar verificação condicional
  - **Decisão**: Usar Opção A (chamar API com id=0) para manter código mais simples e consistente
  - A mensagem padrão "Nenhum recorde encontrado" já será exibida automaticamente pelo componente `ListaRecordes`

- **Arquivo**: `frontend/src/components/recordes/ListaRecordes.jsx`
  - A mensagem existente "Complete treinos para começar a registrar seus recordes!" já é adequada para visitantes

#### 4. Página de rankings

- **Arquivo**: `frontend/src/pages/Rankings.jsx`
  - Funcionar normalmente para visitantes
  - Permitir clicar em nomes de usuários para ver recordes (já funciona)

#### 5. Página de conjuntos

- **Arquivo**: `frontend/src/pages/Conjuntos.jsx`
  - Se for visitante, esconder botão "Criar conjunto"
  - A lista de conjuntos estará vazia (visitante não participa de nenhum)
  - A mensagem padrão de "nenhum conjunto" já será exibida automaticamente

#### 6. Página de perfil

- **Arquivo**: `frontend/src/pages/Perfil.jsx`
  - Se for visitante, desabilitar todos os campos do formulário
  - Adicionar mensagem informativa no topo explicando que visitantes não podem editar perfil
  - Mostrar dados do visitante (nome padrão, email padrão, etc.)

#### 7. Rotas

- **Arquivo**: `frontend/src/routes.js`
  - Manter `PrivateRoute` funcionando normalmente
  - Visitantes terão `usuario !== null`, então passarão pela verificação

## Detalhes de implementação

### Token JWT para visitante

O payload do token deve incluir:

```javascript
{
  id: 0, // ID fixo para visitantes (não existe no banco)
  tipo: "visitante",
  id_plano: 2,
  isVisitante: true
}
```

### Objeto usuário visitante

```javascript
{
  id: 0, // ID fixo para todos os visitantes
  email: "visitante@numix.app",
  nome: "Visitante",
  tipo: "visitante",
  id_plano: 2,
  plano: { /* dados do plano id=2 */ },
  isVisitante: true
}
```

### Múltiplos visitantes simultâneos

**Não há conflito** quando múltiplos visitantes acessam simultaneamente porque:

1. **Tokens JWT únicos**: Cada visitante recebe um token JWT único (mesmo payload, mas assinatura diferente)
2. **Sessões isoladas**: Cada visitante tem sua própria sessão no navegador (localStorage separado)
3. **Treinos em memória**: Os treinos são armazenados em memória no backend com `treino_id` único gerado por `Date.now()` e contador incremental, garantindo unicidade
4. **Sem persistência no banco**: Visitantes não salvam dados no banco (recordes, conjuntos, etc.), então não há conflito de dados
5. **ID fixo não é problema**: O ID fixo (0) é usado apenas para:

   - Identificar que é visitante no middleware
   - Fazer queries de recordes (que retornarão vazio)
   - Não é usado para criar registros no banco

**Conclusão**: O sistema suporta múltiplos visitantes simultâneos sem problemas.

### Considerações importantes

1. **Segurança**: Tokens de visitante devem ter expiração (mesma do JWT normal)
2. **Persistência**: Visitantes podem fechar e reabrir o navegador, mas perderão a sessão se o token expirar
3. **Limitações claras**: Todas as limitações devem ser comunicadas visualmente ao usuário
4. **Experiência**: A experiência deve ser fluida e não frustrante, mostrando o valor do sistema

## Ordem de implementação sugerida

1. Backend: Endpoint de login visitante e modificação do middleware
2. Backend: Prevenção de salvamento de recordes
3. Backend: Prevenção de criação de conjuntos
4. Frontend: Botão de visitante na página de login
5. Frontend: Modificação do AuthContext
6. Frontend: Ajustes nas páginas (recordes, conjuntos, perfil)
7. Testes: Verificar todas as funcionalidades como visitante