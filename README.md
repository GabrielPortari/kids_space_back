<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
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

**Guia rápido — comportamento atual**

- Exceções centrais: veja `src/exceptions/app.exceptions.ts` (use essas exceções nos handlers do frontend quando a API devolver `status` e `message`).
- Endpoints principais (rotas a ajustar no frontend):
  - `POST /auth/login`
  - `POST /auth/refresh-auth`
  - `POST /auth/logout`
  - `GET  /auth/me`

  - `POST /admin`
  - `GET /admin/:id`
  - `PUT /admin/:id`
  - `DELETE /admin/:id`

  - `POST /attendance/checkin`
  - `POST /attendance/checkout`
  - `GET  /attendance/company/:companyId`
  - `GET  /attendance/company/:companyId/last-checkin`
  - `GET  /attendance/company/:companyId/last-checkout`
  - `GET  /attendance/company/:companyId/last-10`
  - `GET  /attendance/company/:companyId/active-checkins`
  - `GET  /attendance/company/:companyId/between?from=<iso>&to=<iso>`
  - `GET  /attendance/:id`

  - `GET  /children/:id`
  - `GET  /children/company/:companyId`
  - `PUT  /children/:id`
  - `DELETE /children/:id`

  - `GET  /collaborator/:id`
  - `GET  /collaborator/company/:companyId`
  - `POST /collaborator`
  - `PUT  /collaborator/:id`
  - `DELETE /collaborator/:id`

  - `POST /companies`
  - `PUT  /companies/:id`
  - `GET  /companies/:id`
  - `GET  /companies`
  - `DELETE /companies/:id`

  - `POST /users/register`
  - `GET  /users/:id`
  - `GET  /users/company/:companyId`
  - `PUT  /users/:id`
  - `DELETE /users/:id`
  - `POST /users/:parentId/child`

Observação: os controllers com seus paths estão em `src/*/*.controller.ts` (por exemplo `src/users/user.controller.ts`).

**Como interpretar erros:** a API lança exceções `App*` que decoram respostas HTTP (código e mensagem). No frontend trate status HTTP (400/401/404/503) e use o `message` do body para exibir erros amigáveis.

**Variáveis/credenciais:**
- A aplicação depende de credenciais do Firebase (o arquivo `serviceAccountKey.json` está no `src/` para desenvolvimento local). Não comite credenciais sensíveis em repositórios públicos.

**Testes & CI:**
- Executar testes: `npm run test`. Durante a padronização foram adicionados specs para `attendance`, `admin`, `auth`, `children`, `collaborator`, `companies`, `firebase`, `users` (smoke tests + alguns casos). A suíte de testes local está passando.

Se quiser, eu atualizo este README com exemplos de payload para os endpoints mais usados, ou gero um arquivo CSV/JSON contendo todas as rotas para importar direto no frontend.
