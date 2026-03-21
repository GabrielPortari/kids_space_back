# Kids Space Backend

Backend do Kids Space para gerenciamento de check-in e check-out de criancas em eventos, com autenticacao Firebase e persistencia em Firestore.

## Stack

- NestJS
- TypeScript
- Firebase Authentication
- Firestore (Firebase Admin SDK)
- Swagger
- Jest

## Como rodar

### Instalacao

```bash
npm install
```

### Desenvolvimento

```bash
npm run start:dev
```

### Producao

```bash
npm run start:prod
```

### Testes

```bash
npm run test
```

## Modulos implementados

### Auth

Endpoints implementados:

- POST /auth/signup
- POST /auth/login
- POST /auth/refresh-auth
- POST /auth/recover-password
- POST /auth/logout
- GET /auth/me

Comportamentos implementados:

- Login e refresh de token via Firebase.
- Logout com revogacao de refresh tokens.
- Recuperacao de senha com resposta neutra para reduzir user enumeration.
- Signup de company com:
  - normalizacao de email e CNPJ
  - lock de unicidade para email e CNPJ
  - rollback em falhas de criacao/sign-in
  - claim de role company no usuario criado
- Rate limit em login, refresh e recover-password.

### Company (v2)

Base path:

- /v2/companies

Endpoints implementados:

- GET /v2/companies/me
- PATCH /v2/companies/me
- GET /v2/companies (admin)
- GET /v2/companies/:companyId (company dona ou admin)
- PATCH /v2/companies/:companyId (company dona ou admin)

Regras de autorizacao implementadas:

- CompanyOwnerOrAdminGuard aplicado nas rotas com :companyId.
- company so acessa/altera a propria company.
- admin pode acessar qualquer company.
- no PATCH por :companyId:
  - para admin, companyId no body e obrigatorio e deve ser igual ao companyId da rota
  - para company, o companyId da rota determina o escopo

Comportamentos implementados no service:

- listagem com filtros por companyId, active, verified e name.
- normalizacao de dados no update:
  - email em lowercase
  - CNPJ sem mascara
  - state do endereco em uppercase

### Collaborator (v2)

Base path:

- /v2/collaborators

Endpoints implementados:

- POST /v2/collaborators (create)
- GET /v2/collaborators (findAll)
- GET /v2/collaborators/:collaboratorId (findOne)
- PATCH /v2/collaborators/:collaboratorId (update)
- DELETE /v2/collaborators/:collaboratorId (delete)

Regras de autorizacao implementadas:

- CollaboratorOwnerOrAdminGuard aplicado nas rotas com :collaboratorId.
- company e collaborator acessam/alteram apenas collaborators da propria company.
- admin pode acessar qualquer collaborator.
- em operacoes de escrita (create/update/delete):
  - para company/collaborator, companyId vem do token autenticado
  - para admin, companyId no body e obrigatorio

Comportamentos implementados no service:

- filtros por name, email, document com client-side matching.
- normalizacao de dados:
  - email em lowercase
  - document e contact em trim
  - state do endereco em uppercase
- validacao de ownership por companyId antes de operacoes sensíveis.

## Estado da refatoracao

Os modulos Parent, Child e Attendance ainda estao em refatoracao para o padrao v2.

Os modulos Auth, Company e Collaborator foram completamente refatorados para v2.

## Estrutura util

- Controllers: src/_/_.controller.ts
- Services: src/_/_.service.ts
- DTOs: src/\*_/dto/_.ts
- Entities: src/\*_/entities/_.ts

## Credenciais de ambiente

Configure as variaveis de ambiente do Firebase para executar localmente:

- FIREBASE_API_KEY
- FIREBASE_ADMIN_CREDENTIALS

## Observacao

O documento ENDPOINTS_REPORT_v2.md contem o desenho completo dos endpoints alvo da refatoracao.
