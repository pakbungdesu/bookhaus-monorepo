# 📚 Bookhaus Monorepo

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework ecosystem for building an efficient, scalable, and AI-powered bookstore.</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintained" />
<a href="https://img.shields.io/badge/Architecture-Monorepo-orange.svg" alt="Architecture" />
<a href="https://img.shields.io/badge/Framework-NestJS%20%26%20Spring%20Boot-red.svg" alt="Frameworks" />
</p>

---

## 📖 Description

**Bookhaus** is a full-stack e-commerce solution. This repository serves as a monorepo housing the core API services, enterprise logic, and upcoming AI recommendation engines. It bridges the gap between traditional Java enterprise development and modern TypeScript microservices.

## 🛠️ Project Structure

```text
bookhaus-monorepo/
├── apps/
│   ├── auth-service/
│   ├── customer-service/
│   └── employee-service/
│   └── favorite-service/
│   └── gateway/
│   └── info-service/
│   └── inventory-service/
│   └── order-service/
├── libs/                  # Shared types, DTOS, and Common Utilities
└── docker-compose.yml     # Local orchestration for DB and Services
```

## 🚀 Getting Started

### Project Setup
```bash
# Install dependencies
$ npm install
```

### Compile and Run
```bash
# development
$ npm run start

# watch mode (recommended for dev)
$ npm run start:dev
```

## 🖇️ Resources
Framework: [NestJS Documentation](https://docs.nestjs.com/)

## 🛡️ License
Bookhaus is [MIT licensed.](https://github.com/nestjs/nest/blob/master/LICENSE).


