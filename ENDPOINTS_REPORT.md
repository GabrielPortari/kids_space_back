# Relatório de Endpoints - kids_space_back

Resumo dos endpoints disponíveis no backend, rota completa, método HTTP e funcionalidade.

---

**App**

- GET / — Retorna texto de boas-vindas / health-check (AppService.getHello)

**Companies (`/companies`)**

- POST /companies — Registra nova empresa (roles: master, systemAdmin) — 201
- PUT /companies/:id — Atualiza empresa (roles: master, systemAdmin, companyAdmin)
- GET /companies/:id — Recupera empresa por id (roles: master, systemAdmin, companyAdmin, collaborator)
- GET /companies — Recupera todas as empresas (público)
- DELETE /companies/:id — Remove empresa (roles: master, systemAdmin) — 204

**Admin (`/admin`)**

- POST /admin — Cria um novo administrador do sistema (roles: master) — 201
- GET /admin/:id — Obtém administrador por ID (roles: master)
- PUT /admin/:id — Atualiza administrador por ID (roles: master)
- DELETE /admin/:id — Deleta administrador por ID (roles: master)

**Auth (`/auth`)**

- POST /auth/login — Realiza login (recebe `LoginDto`) — 200
- POST /auth/refresh-auth — Renova token (recebe `RefreshTokenDto`) — 200
- POST /auth/logout — Finaliza sessão (requires bearer + AuthGuard) — 204
- GET /auth/me — Retorna dados do usuário autenticado (requires bearer + AuthGuard)

**Attendance (`/attendance`)**

- POST /attendance/checkin — Realiza checkin de uma criança (roles: collaborator, companyAdmin, systemAdmin, master) — 201
- POST /attendance/checkout — Realiza checkout de uma criança (roles: collaborator, companyAdmin, systemAdmin, master) — 201
- GET /attendance/company/:companyId — Obtém registros de atendimento por empresa (roles: collaborator, companyAdmin, systemAdmin, master)
- GET /attendance/company/:companyId/last-checkin — Último checkin da empresa (roles: collaborator, companyAdmin, systemAdmin, master)
- GET /attendance/company/:companyId/last-checkout — Último checkout da empresa (roles: collaborator, companyAdmin, systemAdmin, master)
- GET /attendance/company/:companyId/last-10 — 10 últimos atendimentos (roles: collaborator, companyAdmin, systemAdmin, master)
- GET /attendance/company/:companyId/active-checkins — Checkins ativos (sem checkout) (roles: collaborator, companyAdmin, systemAdmin, master)
- GET /attendance/company/:companyId/between?from=&to= — Busca atendimentos entre duas datas (roles: companyAdmin, systemAdmin, master)
- GET /attendance/:id — Obtém um registro de atendimento por ID (roles: collaborator, companyAdmin, systemAdmin, master)

**Users (`/users`)**

- POST /users/register — Registra novo usuário (roles: collaborator, companyAdmin, systemAdmin) — 201
  - Observação: `systemAdmin` pode criar para qualquer empresa desde que informe `companyId` no corpo; caso contrário são aplicadas regras para atribuir `companyId` do collaborator autenticado.
- GET /users/:id — Recupera usuário por id (roles: collaborator, companyAdmin, systemAdmin)
- GET /users/company/:companyId — Recupera todos os usuários de uma empresa (roles: collaborator, companyAdmin, systemAdmin, master)
- PUT /users/:id — Atualiza usuário (roles: collaborator, companyAdmin, systemAdmin)
- DELETE /users/:id — Remove usuário (roles: collaborator, companyAdmin, systemAdmin) — 204
- POST /users/:parentId/child — Cria criança para um usuário (parentId) (roles: collaborator, companyAdmin, systemAdmin)
  - Observação: contém validações de autorização (systemAdmin sempre, ou pai/collaborator da mesma empresa). Sanitiza `companyId` e `responsibleUserIds` do payload.

**Roles (`/roles`)**

- GET /roles/collaborator — Endpoint para colaboradores (roles: collaborator, companyAdmin, systemAdmin, master)
- GET /roles/companyAdmin — Endpoint para administradores de empresa (roles: companyAdmin, systemAdmin, master)
- GET /roles/systemAdmin — Endpoint para administradores do sistema (roles: systemAdmin, master)
- GET /roles/master — Endpoint para master (roles: master)

**Collaborator (`/collaborator`)**

- GET /collaborator/:id — Recupera colaborador por id (roles: master, systemAdmin, companyAdmin, collaborator)
- GET /collaborator/company/:companyId — Recupera todos os colaboradores de uma empresa (roles: master, systemAdmin, companyAdmin, collaborator)
- POST /collaborator — Registra novo colaborador (roles: companyAdmin, systemAdmin, master) — 201
  - Observação: systemAdmin/master pode criar para qualquer empresa passando `companyId`; companyAdmin cria apenas para sua empresa.
- PUT /collaborator/:id — Atualiza colaborador (roles: master, systemAdmin, companyAdmin)
- DELETE /collaborator/:id — Remove colaborador (roles: master, systemAdmin, companyAdmin) — 204

**Children (`/children`)**

- GET /children/:id — Recupera criança por id (roles: collaborator, companyAdmin, systemAdmin)
- GET /children/company/:companyId — Recupera crianças de uma empresa (roles: collaborator, companyAdmin, systemAdmin)
- PUT /children/:id — Atualiza dados da criança (roles: collaborator, companyAdmin, systemAdmin)
- DELETE /children/:id — Remove uma criança (roles: collaborator, companyAdmin, systemAdmin) — 204
