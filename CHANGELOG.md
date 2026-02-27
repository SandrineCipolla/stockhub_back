# Changelog

## [2.4.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.3.0...v2.4.0) (2026-02-27)


### ✨ Features

* implement PATCH and DELETE endpoints for stocks (Issue [#74](https://github.com/SandrineCipolla/stockhub_back/issues/74)) ([#80](https://github.com/SandrineCipolla/stockhub_back/issues/80)) ([b8b3ca0](https://github.com/SandrineCipolla/stockhub_back/commit/b8b3ca0e49e07fde8a3ed52a20ca13fe06cc2eab))


### 🐛 Bug Fixes

* **cors:** allow Vercel preview URLs via VERCEL_PREVIEW_CORS env var ([af4a6ff](https://github.com/SandrineCipolla/stockhub_back/commit/af4a6ff4217c39cad390ab4612b1cb8011b39bcd))
* fix npm audit vulnerabilities ([9d45585](https://github.com/SandrineCipolla/stockhub_back/commit/9d45585f7db314027fe45882fdfcd31476bd0b34))


### ♻️ Code Refactoring

* improve code formatting and structure in StockControllerManipulation and StockRoutesV2 ([997a187](https://github.com/SandrineCipolla/stockhub_back/commit/997a18755dfe47db5c2ba228bd240813dc076de1))


### 📚 Documentation

* add CODEOWNERS file for repository ownership management ([0f7b442](https://github.com/SandrineCipolla/stockhub_back/commit/0f7b4426166b9247ae14884614bc35042e4293c8))
* add guides for code review best practices and logging system ([afe04e8](https://github.com/SandrineCipolla/stockhub_back/commit/afe04e803716224e80957e832f6cca50c14243c0))
* add milestones documentation for RNCP tracking ([7a6371f](https://github.com/SandrineCipolla/stockhub_back/commit/7a6371fd10a6aba856535e06739cc4a2977c52d7))
* create dedicated MILESTONES-GUIDE.md ([8537d29](https://github.com/SandrineCipolla/stockhub_back/commit/8537d29548325f35a84fbeae2586acd7b5e9522a))
* update backend URL to new Azure App Service domain ([284df7d](https://github.com/SandrineCipolla/stockhub_back/commit/284df7d9c8865a81d79fbcc35fb26cd6a81805ee))
* update CLAUDE.md with improved structure and clarity ([eda7f0c](https://github.com/SandrineCipolla/stockhub_back/commit/eda7f0cd3c2a677b3046f0342c9bfa427ca016be))


### 💄 Styles

* format CHANGELOG.md with Prettier ([57c5af6](https://github.com/SandrineCipolla/stockhub_back/commit/57c5af67a2bfe18e078f3573501170738c7538fe))
* improve formatting and consistency in CLAUDE.md ([e2738be](https://github.com/SandrineCipolla/stockhub_back/commit/e2738be263ae28daf7fbe87ea3f6f4bd203fd99d))
* improve formatting and consistency in CLAUDE.md ([1c4651f](https://github.com/SandrineCipolla/stockhub_back/commit/1c4651fa88d631a98dbc4468dbc067b9fa352d42))


### 🔧 Chores

* format issue templates with prettier ([f137bfe](https://github.com/SandrineCipolla/stockhub_back/commit/f137bfe8ee3084e18b05d65fa1233cff40ea4bb9))
* format workflows with prettier ([1e176a6](https://github.com/SandrineCipolla/stockhub_back/commit/1e176a606ee72b6621d7173428374a3b155de716))
* update prettier formatting rules to include YAML files ([d0beaec](https://github.com/SandrineCipolla/stockhub_back/commit/d0beaec735d753bda2a7048134e361602932881a))


### 👷 CI/CD

* lower security audit level to critical only ([a91dcb6](https://github.com/SandrineCipolla/stockhub_back/commit/a91dcb644169bbfb700ee7319e91c4e9dc2518c0))

## [2.3.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.2.0...v2.3.0) (2026-01-29)

### ✨ Features

- (issue 62) authorization phase1 ([#72](https://github.com/SandrineCipolla/stockhub_back/issues/72)) ([cf890f2](https://github.com/SandrineCipolla/stockhub_back/commit/cf890f2f0e7758d21934c447ad4e6006f3936a91))

### 🐛 Bug Fixes

- traiter retours review PR [#40](https://github.com/SandrineCipolla/stockhub_back/issues/40) sur qualité code et logging ([#81](https://github.com/SandrineCipolla/stockhub_back/issues/81)) ([8fab25e](https://github.com/SandrineCipolla/stockhub_back/commit/8fab25e5541665970750f93243a50d1001d182b4))

### 💄 Styles

- format CHANGELOG.md with Prettier ([fc2defb](https://github.com/SandrineCipolla/stockhub_back/commit/fc2defba481d1a3edcd1e0b6cd904967ec392562))

### 🔧 Chores

- rename claude.md to CLAUDE.md for consistency ([ee0cedf](https://github.com/SandrineCipolla/stockhub_back/commit/ee0cedfb2a132be25832200fe219f8fdaf004db1))

## [2.2.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.1.1...v2.2.0) (2026-01-07)

### ✨ Features

- **ci:** Add dedicated Security Audit workflow with dynamic badge (Issue [#45](https://github.com/SandrineCipolla/stockhub_back/issues/45)) ([#76](https://github.com/SandrineCipolla/stockhub_back/issues/76)) ([e49f6ce](https://github.com/SandrineCipolla/stockhub_back/commit/e49f6ce5440c081e6e55ae2533c6bdadad69edc6))
- optimize CI/CD pipeline for faster builds and deployments ([#68](https://github.com/SandrineCipolla/stockhub_back/issues/68)) ([ad257c5](https://github.com/SandrineCipolla/stockhub_back/commit/ad257c5113912e9658e9301fa7992a07cbbaf4a6))

### ⚡ Performance Improvements

- **ci:** further optimize CI/CD pipeline ([#70](https://github.com/SandrineCipolla/stockhub_back/issues/70)) ([5feaf7c](https://github.com/SandrineCipolla/stockhub_back/commit/5feaf7cc1d4fb80e2a286b58e07a57fe524c7795))

### 📚 Documentation

- add Best Practices section from PR [#72](https://github.com/SandrineCipolla/stockhub_back/issues/72) code review ([e297a4c](https://github.com/SandrineCipolla/stockhub_back/commit/e297a4c58f4c8fb0439611d20de4fb959e2b6dd4))
- add claude.md context file for AI assistant sessions ([1e10ba2](https://github.com/SandrineCipolla/stockhub_back/commit/1e10ba24a529521a3bfd6a438cec10f6c48efde0))
- add comprehensive Frontend V2 integration guide ([5f11cdc](https://github.com/SandrineCipolla/stockhub_back/commit/5f11cdc5fad887de428ba91468f7c025a0909a13))
- add Frontend V2 integration to roadmap (Issue [#57](https://github.com/SandrineCipolla/stockhub_back/issues/57)) ([41771f6](https://github.com/SandrineCipolla/stockhub_back/commit/41771f67ceba4c5d8b70af046e6c26c4f3859b61))
- add structured documentation with sessions tracking ([59ead71](https://github.com/SandrineCipolla/stockhub_back/commit/59ead713499da15c07d48157a95da4614a506a85))
- **claude.md:** add rule to avoid type assertions (as) ([af6bebe](https://github.com/SandrineCipolla/stockhub_back/commit/af6bebe34f7330f7974ffb823858978f3d7a0130))
- reorganize documentation files into thematic folders ([75090d6](https://github.com/SandrineCipolla/stockhub_back/commit/75090d6200481618e850f7396f9abb72126c01a6))
- update ROADMAP - mark Issue [#53](https://github.com/SandrineCipolla/stockhub_back/issues/53) as completed (25% CI/CD improvement) ([f2557eb](https://github.com/SandrineCipolla/stockhub_back/commit/f2557ebfa68d5b8dbfa1de86e6ed17a61788cbd6))

### 🔧 Chores

- **db:** add SQL seed scripts for test data ([70ed71c](https://github.com/SandrineCipolla/stockhub_back/commit/70ed71cb022040cfaa3911014d949aa301011b84))
- enforce LF line endings and auto-stage modified files ([6ea75f8](https://github.com/SandrineCipolla/stockhub_back/commit/6ea75f852654053f37e8ec5f5523c0f47dbeb85d))

## [2.1.1](https://github.com/SandrineCipolla/stockhub_back/compare/v2.1.0...v2.1.1) (2025-12-27)

### 📚 Documentation

- ADR-009 - Système d'autorisation hybride (Issue [#44](https://github.com/SandrineCipolla/stockhub_back/issues/44) planning) ([#66](https://github.com/SandrineCipolla/stockhub_back/issues/66)) ([1b8a7fd](https://github.com/SandrineCipolla/stockhub_back/commit/1b8a7fd171281a8d5b7947f3b52492fac03e9f80))

## [2.1.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.0.0...v2.1.0) (2025-12-27)

### ✨ Features

- **api:** add OpenAPI 3.0 interactive documentation with Swagger UI ([60e9c24](https://github.com/SandrineCipolla/stockhub_back/commit/60e9c2460c12b8c26de5286c196a7d438f3a009c)), closes [#60](https://github.com/SandrineCipolla/stockhub_back/issues/60)
- integrate npm audit into CI/CD pipeline and update dependencies (issue[#45](https://github.com/SandrineCipolla/stockhub_back/issues/45)) ([#59](https://github.com/SandrineCipolla/stockhub_back/issues/59)) ([e0cf0ec](https://github.com/SandrineCipolla/stockhub_back/commit/e0cf0ecc01ab20971591dc6dcc246361ff146c8f))

### 📚 Documentation

- update ROADMAP - mark Issue [#46](https://github.com/SandrineCipolla/stockhub_back/issues/46) (ADRs) as completed ([a2a991a](https://github.com/SandrineCipolla/stockhub_back/commit/a2a991a71e6b2c61f2e604abc646462912c1242f))
- update ROADMAP.md to reflect v2.0.0 and RNCP timeline ([f36a2e5](https://github.com/SandrineCipolla/stockhub_back/commit/f36a2e574ddef4b630d089afd2a64d1336aac0b4))

### 🔧 Chores

- add PR template with Conventional Commits reminder ([4e85fe1](https://github.com/SandrineCipolla/stockhub_back/commit/4e85fe1182e5885df492e1290834654f898c344f))

## [2.0.0](https://github.com/SandrineCipolla/stockhub_back/compare/v1.2.0...v2.0.0) (2025-12-26)

### ⚠ BREAKING CHANGES

- Enable strict TypeScript compiler options and enhanced git hooks

### 🔧 Chores

- clean up ESLint warnings and fix TypeScript errors (Issue [#52](https://github.com/SandrineCipolla/stockhub_back/issues/52)) ([#55](https://github.com/SandrineCipolla/stockhub_back/issues/55)) ([1dd70d7](https://github.com/SandrineCipolla/stockhub_back/commit/1dd70d759a8a2daa0165b58d98dbe03a7b982877))

## [1.2.0](https://github.com/SandrineCipolla/stockhub_back/compare/v1.1.0...v1.2.0) (2025-12-16)

### ✨ Features

- add Azure AD B2C ROPC configuration for E2E tests ([c811fec](https://github.com/SandrineCipolla/stockhub_back/commit/c811fec0d6e797861cf81e35dab10eec19de2995))
- add E2E tests with Playwright for stock management workflow ([f8dbf68](https://github.com/SandrineCipolla/stockhub_back/commit/f8dbf68b9ef5f38d76e674e4a8fffc584ef7fd2c))
- add StockDTO and StockMapper for transforming domain entities to API DTOs ([0d4efe2](https://github.com/SandrineCipolla/stockhub_back/commit/0d4efe2719afec32e46b38bb25a448eade639e7b))
- configure path aliases for cleaner imports ([06ae8a4](https://github.com/SandrineCipolla/stockhub_back/commit/06ae8a4a71a00d7bd2e7b31da82ff5d380320e81))

### 🐛 Bug Fixes

- add MINIMUM_STOCK support and auto-create users on first login ([ee63180](https://github.com/SandrineCipolla/stockhub_back/commit/ee63180d896b1b2cf40fa24bfa8722d54f970604))
- address PR[#40](https://github.com/SandrineCipolla/stockhub_back/issues/40) review feedback on security and logging ([3ccf29c](https://github.com/SandrineCipolla/stockhub_back/commit/3ccf29c2bbe9496b5ad7ded15bfd443294a9a4ab))

### ♻️ Code Refactoring

- simplify import paths and enhance test setup for stock management integration tests ([8e8568c](https://github.com/SandrineCipolla/stockhub_back/commit/8e8568c79c6ec57c35d00170cbce23dfae9219a4))
- update import paths to use path aliases for improved readability ([1a43f79](https://github.com/SandrineCipolla/stockhub_back/commit/1a43f794bc74e89b3e930e9a1da978794013a4fc))

### 📚 Documentation

- add comprehensive E2E testing documentation ([41c2f27](https://github.com/SandrineCipolla/stockhub_back/commit/41c2f27ce3ba2d26e6ad8d27485c69e89e737de1))
- add documentation for PR [#40](https://github.com/SandrineCipolla/stockhub_back/issues/40) review fixes and improvements ([42b98a3](https://github.com/SandrineCipolla/stockhub_back/commit/42b98a381941669894176037895d8b41aa7ca762))
- add roadmap for StockHub backend development phases and tasks ([a7b0d64](https://github.com/SandrineCipolla/stockhub_back/commit/a7b0d646432feef5980644e49253881d2f989b8a))

### 🧪 Tests

- add E2E tests infrastructure with Playwright and Azure AD B2C ([0ed07f5](https://github.com/SandrineCipolla/stockhub_back/commit/0ed07f50dec60932123dccd5875c7c6a10ea6374))

## [1.1.0](https://github.com/SandrineCipolla/stockhub_back/compare/v1.0.0...v1.1.0) (2025-12-10)

### ✨ Features

- add cors middleware ([bb37b4b](https://github.com/SandrineCipolla/stockhub_back/commit/bb37b4b665c3e28ebef11671479d4f8cc3429f57))
- configure CORS from environment ([9daaa24](https://github.com/SandrineCipolla/stockhub_back/commit/9daaa240a0f9b14f27826549be0aa48879073c4e))
- configure CORS from environment ([cae4379](https://github.com/SandrineCipolla/stockhub_back/commit/cae4379c75c698593328a39d3aab7c0cfa4cf97c))
- integrate cors middleware ([38688bf](https://github.com/SandrineCipolla/stockhub_back/commit/38688bf3e7161178a8caf9d70322c9d408322379))

### 🐛 Bug Fixes

- add error handling in AddItemToStockCommandHandler to prevent stack trace exposure ([fa41077](https://github.com/SandrineCipolla/stockhub_back/commit/fa41077ee11381cafb6e6ba0646acc7a7cb5b75b))
- add postinstall script to generate Prisma binaries on Azure…) ([e7d8d6d](https://github.com/SandrineCipolla/stockhub_back/commit/e7d8d6dc6e61108bf8644a2bd0b3961964c23d60))
- add userId parameter to repository.save() call in integration test ([51f755b](https://github.com/SandrineCipolla/stockhub_back/commit/51f755bd331e30917d2265b16a5c1ad76e9321e0))
- ensure Prisma binaries are deployed to Azure App Service ([d47696e](https://github.com/SandrineCipolla/stockhub_back/commit/d47696ed91f9a0bc10415e0a6aad13e408b86e98))
- ensure Prisma binaries are deployed to Azure App Service ([ec47fa5](https://github.com/SandrineCipolla/stockhub_back/commit/ec47fa5b82c41f067fdd8356c1a7d2d26861aaf3))

### ♻️ Code Refactoring

- extract OID validation to reusable private method in StockControllerVisualization ([c7b0c5e](https://github.com/SandrineCipolla/stockhub_back/commit/c7b0c5e610587cb80d6d7e35d2eeb9dce6f34132))
- **repositories:** add PrismaClient dependency injection for testability ([338d3b9](https://github.com/SandrineCipolla/stockhub_back/commit/338d3b92732b2699e68c64d26c6494e214aab658))
- **tests:** extract TestContainer setup to shared helper ([9a30fab](https://github.com/SandrineCipolla/stockhub_back/commit/9a30fab48daab61df051aeee6daf025498167ce1))
- **tests:** rename teardownTestDatabase to closeTestDatabase and update imports ([d4f88c6](https://github.com/SandrineCipolla/stockhub_back/commit/d4f88c619668bb4be22a206b19f438ddf733a6cb))

### 📚 Documentation

- implement DDD/CQRS stock manipulation module documentation ([cf0d548](https://github.com/SandrineCipolla/stockhub_back/commit/cf0d548744d0918c8c47e75101e6b28ac8a37650))

### 🧪 Tests

- add additional parameter to stock save expectation in CreateStockCommandHandler tests ([146ecb9](https://github.com/SandrineCipolla/stockhub_back/commit/146ecb95c97d3c634038b90ebffcb2a57529b05a))
- **integration:** add TestContainers tests for repositories and API ([28b1548](https://github.com/SandrineCipolla/stockhub_back/commit/28b15488ed6113f9ce297dbf4b28f4bd91a9cdeb))

### 🔧 Chores

- remove Azure cost analysis files from tracking ([6879ff1](https://github.com/SandrineCipolla/stockhub_back/commit/6879ff1e5b03bb7079a51c133e0ec440eb81d039))
- update CI configuration to trigger on all branches for pull requests ([18b5d11](https://github.com/SandrineCipolla/stockhub_back/commit/18b5d11c82b83adb295ca2f7edff653605e72887))

### 👷 CI/CD

- setup Release Please for automated versioning ([9673200](https://github.com/SandrineCipolla/stockhub_back/commit/9673200f4e96046e69f9fe994b71a9855bf7e09a))
- update CI configuration to run on all branches for pull requests ([0992e00](https://github.com/SandrineCipolla/stockhub_back/commit/0992e001f6e6a3d9ca5eb0e213a41499ffa34cf8))
- update CI configuration to run on all branches for pull requests ([c0c6235](https://github.com/SandrineCipolla/stockhub_back/commit/c0c62352d24b7a75c4c187354bde2ba0c90c24a8))
