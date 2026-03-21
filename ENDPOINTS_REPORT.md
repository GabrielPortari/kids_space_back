# Relatorio de Endpoints - kids_space_back

Resumo dos endpoints atuais com base nos controllers existentes em src.

---

## App

- GET / - Health-check simples (AppService.getHello).

## Auth (/auth)

- POST /auth/login - Login com e-mail e senha (guard: AuthRateLimitGuard) - 200.
- POST /auth/signup - Cadastro de empresa e usuario principal - 201.
- POST /auth/refresh-auth - Renovacao de token (guard: AuthRateLimitGuard) - 200.
- POST /auth/recover-password - Disparo de recuperacao de senha (guard: AuthRateLimitGuard) - 200.
- POST /auth/logout - Logout (guard: AuthGuard + bearer token) - 204.
- GET /auth/me - Dados do usuario autenticado (guard: AuthGuard + bearer token) - 200.

## Company v2 (/v2/companies)

- GET /v2/companies/me - Dados da company autenticada (roles: company).
- PATCH /v2/companies/me - Atualiza company autenticada (roles: company).
- GET /v2/companies - Lista companies (roles: admin).
- GET /v2/companies/:companyId - Busca company por id (roles: company, admin + CompanyOwnerOrAdminGuard).
- PATCH /v2/companies/:companyId - Atualiza company por id (roles: company, admin + CompanyOwnerOrAdminGuard).

## Collaborator v2 (/v2/collaborators)

- POST /v2/collaborators - Cria collaborator (roles: company, admin) - 201.
- GET /v2/collaborators - Lista collaborators (roles: company, admin).
- GET /v2/collaborators/:collaboratorId - Busca collaborator por id (roles: company, admin + CollaboratorOwnerOrAdminGuard).
- PATCH /v2/collaborators/:collaboratorId - Atualiza collaborator (roles: company, admin + CollaboratorOwnerOrAdminGuard).
- DELETE /v2/collaborators/:collaboratorId - Remove collaborator (roles: company, admin + CollaboratorOwnerOrAdminGuard) - 204.

## Parent v2 (/v2/parents)

- POST /v2/parents - Cria parent/responsavel (roles: collaborator, company, admin) - 201.
- GET /v2/parents - Lista parents/responsaveis (roles: collaborator, company, admin).
- GET /v2/parents/:parentId - Busca parent por id (roles: collaborator, company, admin + ParentOwnerOrCompanyGuard).
- PATCH /v2/parents/:parentId - Atualiza parent (roles: collaborator, company, admin + ParentOwnerOrCompanyGuard).
- DELETE /v2/parents/:parentId - Remove parent (roles: collaborator, company, admin + ParentOwnerOrCompanyGuard) - 204.

Observacao de regra de negocio no Parent v2:

- Acesso de alteracao/leitura por recurso usa companyId do parent para validar ownership no guard.

## Roles (/roles)

- GET /roles/collaborator - Endpoint de validacao para roles collaborator/company/admin.
- GET /roles/company - Endpoint de validacao para roles company/admin.
- GET /roles/admin - Endpoint de validacao para role admin.

## Admin (/admin)

- POST /admin - Cria admin - 201.
- GET /admin - Lista admins.
- GET /admin/:id - Busca admin por id.
- PATCH /admin/:id - Atualiza admin por id.
- DELETE /admin/:id - Remove admin por id.

## Attendance v2 (/v2/attendance)

- POST /v2/attendance/checkin - Realiza check-in de crianca (roles: collaborator, company, admin) - 201.
- POST /v2/attendance/checkout - Realiza checkout de crianca (roles: collaborator, company, admin) - 200.
- GET /v2/attendance - Lista atendimentos (roles: collaborator, company, admin).
- GET /v2/attendance/:attendanceId - Busca atendimento por id (roles: collaborator, company, admin + AttendanceOwnerOrCompanyGuard).
- PATCH /v2/attendance/:attendanceId - Atualiza atendimento por id (roles: collaborator, company, admin + AttendanceOwnerOrCompanyGuard).
- DELETE /v2/attendance/:attendanceId - Remove atendimento por id (roles: collaborator, company, admin + AttendanceOwnerOrCompanyGuard) - 204.

Observacao de regra de negocio no Attendance v2:

- Checkout exige confirmacao do CPF de um responsavel vinculado a crianca.

## Children v2 (/v2/children)

- POST /v2/children - Cria crianca (roles: collaborator, company, admin) - 201.
- GET /v2/children - Lista criancas (roles: collaborator, company, admin).
- GET /v2/children/:childId - Busca crianca por id (roles: collaborator, company, admin + ChildOwnerOrCompanyGuard).
- PATCH /v2/children/:childId - Atualiza crianca (roles: collaborator, company, admin + ChildOwnerOrCompanyGuard).
- DELETE /v2/children/:childId - Remove crianca (roles: collaborator, company, admin + ChildOwnerOrCompanyGuard) - 204.

Observacao de regra de negocio no Children v2:

- Collaborator/company so podem alterar recursos da propria company (comparacao por companyId no guard).

---

## Status de Testes

Ultima execucao registrada:

- Test Suites: 19 passed, 19 total.
- Tests: 33 passed, 33 total.
