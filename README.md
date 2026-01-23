  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Atualizado para refletir o estado atual do projeto Kids Space (backend).
Implementação baseada em NestJS + Firebase (Auth + Firestore).

Principais pontos:
- Tratamento de erros unificado: `src/exceptions/app.exceptions.ts` provê exceções do tipo `AppBadRequestException`, `AppNotFoundException`, `AppUnauthorizedException`, `AppServiceUnavailableException` etc., usadas por toda a API.
- Padrões de rota e documentação foram padronizados (pluralização de recursos, correções Swagger).
- Firestore: uso intensivo de transações que seguem o padrão "read before write" e retornam snapshots para evitar leituras extras.
- Firebase: `src/firebase/firebase.service.ts` encapsula chamadas ao Admin SDK e REST (auth endpoints) com mapeamento de erros para exceções da aplicação.
- Testes unitários: adicionados specs básicos para os serviços principais e correções de mocks para Jest.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---
# Kids Space — Backend

Projeto backend em NestJS com integração ao Firebase (Auth + Firestore).

Resumo rápido:
- Tratamento de erros centralizado em `src/exceptions` (ex.: `AppBadRequestException`, `AppUnauthorizedException`).
- Rotas padronizadas (pluralização de recursos) e documentação Swagger atualizada.

**Instalação**

```bash
npm install
```

**Execução**

```bash
# desenvolvimento
npm run start:dev

# produção
npm run start:prod
```

**Testes**

```bash
npm run test
```

**Endpoints principais (ajustar no frontend)**

- Auth:
  - POST /auth/login
  - POST /auth/refresh-auth
  - POST /auth/logout
  - GET  /auth/me

- Admins:
  - POST /admin
  - GET  /admin/:id
  - PUT  /admin/:id
  - DELETE /admin/:id

- Attendance:
  - POST /attendance/checkin
  - POST /attendance/checkout
  - GET  /attendance/company/:companyId
  - GET  /attendance/company/:companyId/last-checkin
  - GET  /attendance/company/:companyId/last-checkout
  - GET  /attendance/company/:companyId/last-10
  - GET  /attendance/company/:companyId/active-checkins
  - GET  /attendance/company/:companyId/between?from=<iso>&to=<iso>
  - GET  /attendance/:id

- Children:
  - GET  /children/:id
  - GET  /children/company/:companyId
  - PUT  /children/:id
  - DELETE /children/:id

- Collaborator:
  - GET  /collaborator/:id
  - GET  /collaborator/company/:companyId
  - POST /collaborator
  - PUT  /collaborator/:id
  - DELETE /collaborator/:id

- Companies:
  - POST /companies
  - PUT  /companies/:id
  - GET  /companies/:id
  - GET  /companies
  - DELETE /companies/:id

- Users:
  - POST /users/register
  - GET  /users/:id
  - GET  /users/company/:companyId
  - PUT  /users/:id
  - DELETE /users/:id
  - POST /users/:parentId/child

Observação: os controllers estão em `src/*/*.controller.ts`.

**Tratamento de erros**

A API usa exceções do tipo `App*` que mapeiam para códigos HTTP. No frontend trate os códigos (400, 401, 404, 503) e exiba `message` retornado no corpo da resposta.

**Credenciais**

Para desenvolvimento local é necessário o `serviceAccountKey.json` do Firebase em `src/`.

---

Se quiser, eu exporto todas as rotas em JSON/CSV para importar direto no frontend ou gero exemplos de payloads para os endpoints mais usados.
