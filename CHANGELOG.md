# Changelog

## [1.1.0](https://github.com/SandrineCipolla/stockhub_back/compare/v1.0.0...v1.1.0) (2025-12-10)


### ✨ Features

* add cors middleware ([bb37b4b](https://github.com/SandrineCipolla/stockhub_back/commit/bb37b4b665c3e28ebef11671479d4f8cc3429f57))
* configure CORS from environment ([9daaa24](https://github.com/SandrineCipolla/stockhub_back/commit/9daaa240a0f9b14f27826549be0aa48879073c4e))
* configure CORS from environment ([cae4379](https://github.com/SandrineCipolla/stockhub_back/commit/cae4379c75c698593328a39d3aab7c0cfa4cf97c))
* integrate cors middleware ([38688bf](https://github.com/SandrineCipolla/stockhub_back/commit/38688bf3e7161178a8caf9d70322c9d408322379))


### 🐛 Bug Fixes

* add error handling in AddItemToStockCommandHandler to prevent stack trace exposure ([fa41077](https://github.com/SandrineCipolla/stockhub_back/commit/fa41077ee11381cafb6e6ba0646acc7a7cb5b75b))
* add postinstall script to generate Prisma binaries on Azure…) ([e7d8d6d](https://github.com/SandrineCipolla/stockhub_back/commit/e7d8d6dc6e61108bf8644a2bd0b3961964c23d60))
* add userId parameter to repository.save() call in integration test ([51f755b](https://github.com/SandrineCipolla/stockhub_back/commit/51f755bd331e30917d2265b16a5c1ad76e9321e0))
* ensure Prisma binaries are deployed to Azure App Service ([d47696e](https://github.com/SandrineCipolla/stockhub_back/commit/d47696ed91f9a0bc10415e0a6aad13e408b86e98))
* ensure Prisma binaries are deployed to Azure App Service ([ec47fa5](https://github.com/SandrineCipolla/stockhub_back/commit/ec47fa5b82c41f067fdd8356c1a7d2d26861aaf3))


### ♻️ Code Refactoring

* extract OID validation to reusable private method in StockControllerVisualization ([c7b0c5e](https://github.com/SandrineCipolla/stockhub_back/commit/c7b0c5e610587cb80d6d7e35d2eeb9dce6f34132))
* **repositories:** add PrismaClient dependency injection for testability ([338d3b9](https://github.com/SandrineCipolla/stockhub_back/commit/338d3b92732b2699e68c64d26c6494e214aab658))
* **tests:** extract TestContainer setup to shared helper ([9a30fab](https://github.com/SandrineCipolla/stockhub_back/commit/9a30fab48daab61df051aeee6daf025498167ce1))
* **tests:** rename teardownTestDatabase to closeTestDatabase and update imports ([d4f88c6](https://github.com/SandrineCipolla/stockhub_back/commit/d4f88c619668bb4be22a206b19f438ddf733a6cb))


### 📚 Documentation

* implement DDD/CQRS stock manipulation module documentation ([cf0d548](https://github.com/SandrineCipolla/stockhub_back/commit/cf0d548744d0918c8c47e75101e6b28ac8a37650))


### 🧪 Tests

* add additional parameter to stock save expectation in CreateStockCommandHandler tests ([146ecb9](https://github.com/SandrineCipolla/stockhub_back/commit/146ecb95c97d3c634038b90ebffcb2a57529b05a))
* **integration:** add TestContainers tests for repositories and API ([28b1548](https://github.com/SandrineCipolla/stockhub_back/commit/28b15488ed6113f9ce297dbf4b28f4bd91a9cdeb))


### 🔧 Chores

* remove Azure cost analysis files from tracking ([6879ff1](https://github.com/SandrineCipolla/stockhub_back/commit/6879ff1e5b03bb7079a51c133e0ec440eb81d039))
* update CI configuration to trigger on all branches for pull requests ([18b5d11](https://github.com/SandrineCipolla/stockhub_back/commit/18b5d11c82b83adb295ca2f7edff653605e72887))


### 👷 CI/CD

* setup Release Please for automated versioning ([9673200](https://github.com/SandrineCipolla/stockhub_back/commit/9673200f4e96046e69f9fe994b71a9855bf7e09a))
* update CI configuration to run on all branches for pull requests ([0992e00](https://github.com/SandrineCipolla/stockhub_back/commit/0992e001f6e6a3d9ca5eb0e213a41499ffa34cf8))
* update CI configuration to run on all branches for pull requests ([c0c6235](https://github.com/SandrineCipolla/stockhub_back/commit/c0c62352d24b7a75c4c187354bde2ba0c90c24a8))
