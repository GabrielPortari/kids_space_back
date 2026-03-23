---
name: kids-space-back-copilot
description: Diretrizes para assistência ao desenvolvimento do backend "kids_space_back" — sistema de checkin/checkout para espaços kids em eventos. Use como referência para geração de endpoints, refatorações, testes e automações.
---

Contexto do sistema

- Objetivo: backend para gerenciar checkin/checkout de crianças em eventos, com empresas (clientes do provedor), administradores, colaboradores, pais e crianças.
- Fluxo resumido:
  1. Empresa realiza cadastro.

2.  Provedor (owner) verifica e aprova/reprova empresas.
3.  Empresa recebe status (ativa/inativa).
4.  `companyAdmin` gerencia a empresa e cria `collaborator`.
5.  `collaborator` cadastra `users` (pais/responsáveis) e `children`.
6.  `collaborator` realiza check-in e check-out das crianças; check-out exige confirmação de CPF de um responsável.

Papéis e permissões

- `master`: super-usuário do provedor (opera deploys, manutenção crítica).
- `systemAdmin`: administração global do sistema; pode atuar em qualquer empresa quando necessário.
- `companyAdmin`: administrador da empresa; pode criar colaboradores e gerir dados da empresa.
- `collaborator`: usuário operacional que registra pais, crianças e realiza checkins/checkouts.

Stack e recomendações técnicas

- Back-end: NestJS + TypeScript (projeto já usa NestJS).
- Autenticação: Firebase Authentication (ID tokens) com verificação via `FirebaseService.verifyIdToken`.
- Banco: Firestore (Firebase Admin SDK) — usar transações para operações críticas.
- Validação: `class-validator` / `class-transformer` em DTOs.
- Documentação: Swagger decorators (`@ApiOperation`, `@ApiBody`, `@ApiResponse`) para gerar docs.

Boas práticas back-end

- Verificar brechas de segurança, especialmente em endpoints que modificam dados sensíveis (ex: estoque, status de pedido).
- Realizar pentestes de segurança e validação de entrada rigorosa para evitar injeção ou manipulação de dados.
- Verificar se há exposição de dados sensíveis (ex: IDs, tokens) em logs ou respostas de API.
- Validar e sanitizar todos os DTOs (class-validator/class-transformer). Use DTOs claros para requests/responses.
- Usar transações do Firestore para operações de pedido/estoque.
- Guardas: `RolesGuard`, `BusinessOwnerGuard` para garantir ownership quando necessário.
- Storage: salvar imagens em Firebase Storage e persistir `imageUrl` no Firestore; gerar URLs assinadas quando necessário.
- Testes: unitários com Jest e e2e com Supertest; adicionar exemplos de fixtures para Firestore (emulação/local) quando possível.

Onde alterar/consultar código

- Controllers: `src/**/*.controller.ts` — definem rotas e guards.
- Services: `src/**/*.service.ts` — lógica de negócio, validações centrais (ex: validação de CPF no AttendanceService).
- DTOs: `src/**/dto/*.ts` — contratos de entrada; manter estritos para evitar campos indesejados.
- Guards: `src/roles/roles.guard.ts`, `src/auth/auth.guard.ts` — autorização e autenticação.
- Firebase: `src/firebase/*` e injeção `@Inject('FIRESTORE')` quando necessário.
- Exceções: `src/exceptions/*` — usar `AppUnauthorizedException`, `AppBadRequestException` consistentemente.

Padrões e boas práticas para o repositório

- Controllers finos: delegar lógica para Services.
- DTOs completos: descrever e validar todas as entradas, proibir campos sensíveis que não devam ser definidos pelo cliente (ex: `companyId` quando não aplicável).
- Verificação de token: todos os endpoints protegidos devem usar `AuthGuard`/`RolesGuard` e `@ApiBearerAuth()`.
- Normalização de CPFs: normalizar (remover formatação) ao comparar durante checkout.
- Testabilidade: isolar Firebase em um adapter para permitir mocks em testes unitários e integração com emulator para e2e.

Regras de negócio críticas (não remover/alterar sem testes)

- Check-out obliga confirmação do CPF de um responsável.
- `systemAdmin` pode criar entidades para qualquer `companyId` quando informado no payload; caso contrário, `companyAdmin` e `collaborator` operam apenas na própria empresa.
- Ao criar criança via `POST /users/:parentId/child` não permitir `companyId` ou `responsibleUserIds` no body enviado pelo cliente; esses campos devem ser geridos pelo back-end.

Exemplos de endpoints (mapear antes de remover/alterar)

- `POST /auth/login` — login (recebe `LoginDto`).
- `POST /auth/refresh-auth` — renovar token.
- `POST /auth/logout` — logout (AuthGuard).
- `POST /attendance/checkin` — realiza checkin (roles: collaborator, companyAdmin, systemAdmin, master).
- `POST /attendance/checkout` — realiza checkout (confirmação CPF requerida).
- `POST /v2/parents` — cria responsável (companyId tratada conforme role).
- `POST /v2/children` — cria criança (sanitiza payload e valida autorização).

Devops, CI e scripts

- Scripts úteis já esperados: `npm run start:dev`, `npm run build`, `npm test`, `npm run lint`, `npm run format`.
- Recomendação: GitHub Actions para lint, build e testes; deploy para staging antes de produção.

Testes e qualidade

- Unit tests: focar em `AttendanceService`, `UserService`, `CollaboratorService`, `CompanyService`.
- Integration / e2e: usar Firestore emulator e mocks para Firebase Admin.
- Testes de autorização: combinar roles em `RolesGuard` para cobrir permissões.

Checklist para refatoração segura

1. Gerar relatório de endpoints (arquivo `ENDPOINTS_REPORT.md`).
2. Criar testes unitários cobrindo regras críticas.
3. Extrair validações reutilizáveis (ex: CPF, company ownership).
4. Isolar Firebase em adapter com interface mockável.
5. Atualizar DTOs e Swagger; rodar lint/format.
6. Executar pipeline CI (lint → test → build) antes de PR merge.

Como o copilot/agent deve operar aqui

- Ao gerar código: seguir os padrões deste arquivo e manter controllers finos.
- Ao modificar endpoints: atualizar `ENDPOINTS_REPORT.md` e adicionar testes que cubram as mudanças.
- Para operações destrutivas: gerar lista de arquivos afetados e instruções de backup/export do Firestore.

Perguntas recomendadas ao mantenedor antes de alterações destrutivas

- Deseja exportar/backup do Firestore antes de alterações? (recomendado)
- Alguma rota deve permanecer compatível (v1) durante refactor?
- Quais ambientes (staging/prod) terão janelas de manutenção?

Próximos passos sugeridos (pos-merge)

- Converter `ENDPOINTS_REPORT.md` em OpenAPI/JSON para facilitar migração.
- Criar branch `refactor/api-cleanup` e aplicar mudanças incrementais acompanhadas de testes.
- Opcional: gerar um script de extração/backup do Firestore antes de grandes exclusões.

---

Fim do arquivo.
