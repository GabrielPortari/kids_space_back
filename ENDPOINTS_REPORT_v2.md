# Relatorio de Endpoints v2 - kids_space_back

Proposta de novo sistema de endpoints para a refatoracao completa, com 3 roles:

- collaborator
- company
- admin

## Regras Globais de Autorizacao e Escopo

- `companyId` so deve ser usado para definir escopo de dados de uma company.
- cada company possui seu proprio identificador unico (`companyId`).
- cada colaborador possui seu proprio identificador unico (`collaboratorId`).
- collaborator e company:
  - companyId sempre vem do token autenticado.
  - qualquer companyId enviado no payload deve ser ignorado pelo backend.
- admin:
  - acesso total ao sistema.
  - em operacoes de escrita (POST, PATCH, DELETE), deve enviar companyId no body.
- leituras:
  - collaborator e company leem apenas dados da propria company.
  - admin pode ler dados de qualquer company (com filtro por companyId quando necessario).

## Convencoes

- Prefixo das rotas: /v2
- Autenticacao: Bearer token (Firebase ID token validado no backend)
- IDs de rota:
  - usar `:collaboratorId` para recursos de colaborador.
  - usar `:parentId` para recursos de parent.
  - usar `:childId` para recursos de child.
  - usar `:attendanceId` para recursos de attendance.
  - usar `:companyId` somente quando o endpoint for explicitamente de escopo da company (principalmente para consultas/admin).
- Resposta de erro recomendada:
  - 400 para validacao de payload
  - 401 para nao autenticado
  - 403 para sem permissao
  - 404 para recurso nao encontrado

---

## Auth (/v2/auth)

| Metodo | Rota             | Roles       | companyId | Descricao                               |
| ------ | ---------------- | ----------- | --------- | --------------------------------------- |
| POST   | /v2/auth/signup  | publico     | n/a       | Registro de nova company                |
| POST   | /v2/auth/login   | publico     | n/a       | Login de company, collaborator ou admin |
| POST   | /v2/auth/refresh | autenticado | token     | Renovacao de sessao                     |
| POST   | /v2/auth/logout  | autenticado | token     | Encerramento de sessao                  |
| GET    | /v2/auth/me      | autenticado | token     | Dados do usuario autenticado            |

---

## Me (/v2/me)

| Metodo | Rota   | Roles                        | companyId | Descricao                        |
| ------ | ------ | ---------------------------- | --------- | -------------------------------- |
| GET    | /v2/me | collaborator, company, admin | token     | Retorna dados do proprio usuario |
| PATCH  | /v2/me | collaborator, company, admin | token     | Atualiza os proprios dados       |

Regras especificas:

- collaborator nao pode alterar role/companyId por este endpoint.
- company nao pode alterar role por este endpoint.
- admin nao pode alterar role por este endpoint.

---

## Parents (/v2/parents)

| Metodo | Rota                  | Roles                        | companyId                                            | Descricao           |
| ------ | --------------------- | ---------------------------- | ---------------------------------------------------- | ------------------- |
| POST   | /v2/parents           | collaborator, company, admin | token (collaborator/company), body (admin)           | Cria parent         |
| GET    | /v2/parents           | collaborator, company, admin | token (collaborator/company), query opcional (admin) | Lista parents       |
| GET    | /v2/parents/:parentId | collaborator, company, admin | escopo por role                                      | Busca parent por id |
| PATCH  | /v2/parents/:parentId | collaborator, company, admin | token (collaborator/company), body (admin)           | Atualiza parent     |
| DELETE | /v2/parents/:parentId | collaborator, company, admin | token (collaborator/company), body (admin)           | Remove parent       |

Filtros recomendados em listagem:

- name
- cpf
- page
- limit

---

## Childs (/v2/childs)

| Metodo | Rota                | Roles                        | companyId                                            | Descricao          |
| ------ | ------------------- | ---------------------------- | ---------------------------------------------------- | ------------------ |
| POST   | /v2/childs          | collaborator, company, admin | token (collaborator/company), body (admin)           | Cria child         |
| GET    | /v2/childs          | collaborator, company, admin | token (collaborator/company), query opcional (admin) | Lista childs       |
| GET    | /v2/childs/:childId | collaborator, company, admin | escopo por role                                      | Busca child por id |
| PATCH  | /v2/childs/:childId | collaborator, company, admin | token (collaborator/company), body (admin)           | Atualiza child     |
| DELETE | /v2/childs/:childId | collaborator, company, admin | token (collaborator/company), body (admin)           | Remove child       |

Filtros recomendados em listagem:

- parentId
- name
- active
- page
- limit

Regras especificas de seguranca:

- bloquear campos sensiveis no payload (ex.: companyId controlado pelo backend para collaborator/company).
- validar vinculacao do child com parent da mesma company.

---

## Attendance (/v2/attendance)

| Metodo | Rota                           | Roles                        | companyId                                            | Descricao                |
| ------ | ------------------------------ | ---------------------------- | ---------------------------------------------------- | ------------------------ |
| POST   | /v2/attendance/checkin         | collaborator, company, admin | token (collaborator/company), body (admin)           | Realiza checkin          |
| POST   | /v2/attendance/checkout        | collaborator, company, admin | token (collaborator/company), body (admin)           | Realiza checkout         |
| GET    | /v2/attendance                 | collaborator, company, admin | token (collaborator/company), query opcional (admin) | Lista atendimentos       |
| GET    | /v2/attendance/:attendanceId   | collaborator, company, admin | escopo por role                                      | Busca atendimento por id |
| GET    | /v2/attendance/active-checkins | collaborator, company, admin | token (collaborator/company), query opcional (admin) | Lista checkins ativos    |

Filtros recomendados em listagem:

- childId
- parentId
- status
- from
- to
- page
- limit

Regra critica:

- checkout exige confirmacao de CPF de responsavel valido e normalizado.

---

## Collaborators (/v2/collaborators)

| Metodo | Rota                              | Roles          | companyId                                           | Descricao                 |
| ------ | --------------------------------- | -------------- | --------------------------------------------------- | ------------------------- |
| POST   | /v2/collaborators                 | company, admin | token (company), body (admin)                       | Cria collaborator         |
| GET    | /v2/collaborators                 | company, admin | token (company), query obrigatoria/opcional (admin) | Lista collaborators       |
| GET    | /v2/collaborators/:collaboratorId | company, admin | escopo por role                                     | Busca collaborator por id |
| PATCH  | /v2/collaborators/:collaboratorId | company, admin | token (company), body (admin)                       | Atualiza collaborator     |
| DELETE | /v2/collaborators/:collaboratorId | company, admin | token (company), body (admin)                       | Remove collaborator       |

Regra especifica:

- company lista e gerencia apenas colaboradores da propria company.
- `collaboratorId` identifica o colaborador individual; nao deve ser confundido com `companyId`.

---

## Matriz de Permissoes por Role

### collaborator

- parents: create, findAll, findOne, patch, delete
- childs: create, findAll, findOne, patch, delete
- attendance: checkin, checkout, findAll, findOne, active-checkins
- me: get, patch

### company

- tudo de collaborator
- collaborators: create, findAll (somente propria company), findOne, patch, delete
- auth: signup

### admin

- acesso total
- em operacoes de escrita deve informar companyId no body

---

## DTOs Minimos Recomendados

### CreateParentDto

- name
- cpf
- phone
- email (opcional)
- address (opcional)
- companyId (obrigatorio somente para admin)

### CreateChildDto

- name
- birthDate
- notes (opcional)
- parentId
- companyId (obrigatorio somente para admin)

### CheckinDto

- childId
- parentId
- companyId (obrigatorio somente para admin)

### CheckoutDto

- attendanceId
- responsibleCpf
- companyId (obrigatorio somente para admin)

### CreateCollaboratorDto

- name
- email
- password (ou fluxo de convite)
- companyId (obrigatorio somente para admin)

---

## Ordem Sugerida para Atualizacao Gradual

1. auth e me
2. parents
3. childs
4. attendance
5. collaborators
6. ajustes finais de guardas, DTOs e testes

---

## Observacoes de Implementacao

- manter controllers finos e regras de negocio nos services.
- validar DTOs com class-validator e whitelist estrita.
- usar guardas de role em todas as rotas protegidas.
- registrar trilha de auditoria (createdBy, updatedBy, role, companyId efetivo).
