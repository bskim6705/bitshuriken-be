# Quick Start

### 1. Infra Requirements

- Kafka: (Recommeneded) port - 9092
- Redis: (Recommeneded) port - 6379
- mysql: (Recommeneded) port - 3306
- MongoDB: (Recommeneded) port - 27017

You Can also set up above softwares using docker

```bash
docker-compose up -d
```

### 2. Install Dependencies & Generating Prisma Clients

```bash
# Dependencies
npm ci
# Prisma
npm run prisma:generate:spot
npm run prisma:generate:futures
```

### 3. Running Nest.js commands

```bash
npm run start:dev
```

