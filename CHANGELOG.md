# Changelog

## [2.10.2](https://github.com/SandrineCipolla/stockhub_back/compare/v2.10.1...v2.10.2) (2026-04-14)


### 🧪 Tests

* **controllers:** add unit tests for contribution and collaborator — closes [#204](https://github.com/SandrineCipolla/stockhub_back/issues/204) ([#206](https://github.com/SandrineCipolla/stockhub_back/issues/206)) ([58dd1dc](https://github.com/SandrineCipolla/stockhub_back/commit/58dd1dc05948ed99a0f1d211a0e2360a7b7918ff))

## [2.10.1](https://github.com/SandrineCipolla/stockhub_back/compare/v2.10.0...v2.10.1) (2026-04-14)

### 🐛 Bug Fixes

- **coverage:** restrict collectCoverageFrom to domain and controllers — refs [#199](https://github.com/SandrineCipolla/stockhub_back/issues/199) ([#203](https://github.com/SandrineCipolla/stockhub_back/issues/203)) ([e356325](https://github.com/SandrineCipolla/stockhub_back/commit/e3563254d37cef2f32949afdc69f87864377f02a))
- **prediction:** remove unused AuthenticatedRequest from StockPredictionController ([bc64b66](https://github.com/SandrineCipolla/stockhub_back/commit/bc64b6607f028242622a8cad26475b40093bbac0))

### ♻️ Code Refactoring

- **arch:** align src/ with DDD/CQRS layers — closes [#194](https://github.com/SandrineCipolla/stockhub_back/issues/194) ([#197](https://github.com/SandrineCipolla/stockhub_back/issues/197)) ([bc64b66](https://github.com/SandrineCipolla/stockhub_back/commit/bc64b6607f028242622a8cad26475b40093bbac0))
- **domain:** rename manipulation folders — closes [#189](https://github.com/SandrineCipolla/stockhub_back/issues/189) ([#190](https://github.com/SandrineCipolla/stockhub_back/issues/190)) ([017ee49](https://github.com/SandrineCipolla/stockhub_back/commit/017ee49474bc2bd95904dc3df497ae21fc744ba7))
- **tests:** remove redundant getValue happy-path tests on VOs — closes [#187](https://github.com/SandrineCipolla/stockhub_back/issues/187) ([#188](https://github.com/SandrineCipolla/stockhub_back/issues/188)) ([9c6bddf](https://github.com/SandrineCipolla/stockhub_back/commit/9c6bddf69a5443f1e9f8150d965721f620de975e))

### 📚 Documentation

- **adr:** add ADR-016 REST, ADR-017 Express, ADR-018 GitHub Flow — closes [#181](https://github.com/SandrineCipolla/stockhub_back/issues/181) [#182](https://github.com/SandrineCipolla/stockhub_back/issues/182) [#183](https://github.com/SandrineCipolla/stockhub_back/issues/183) ([#184](https://github.com/SandrineCipolla/stockhub_back/issues/184)) ([4c12ebe](https://github.com/SandrineCipolla/stockhub_back/commit/4c12ebe68bb035a415a20d035f8bfb879a505e47))
- **adr:** clarify V1 context and add versioning best practices in ADR-005 ([#186](https://github.com/SandrineCipolla/stockhub_back/issues/186)) ([92873be](https://github.com/SandrineCipolla/stockhub_back/commit/92873be03867e2ab74fda1103c8fd586e339df68))
- **readme:** update architecture diagram to reflect [#194](https://github.com/SandrineCipolla/stockhub_back/issues/194) changes ([#202](https://github.com/SandrineCipolla/stockhub_back/issues/202)) ([1b91348](https://github.com/SandrineCipolla/stockhub_back/commit/1b91348424b4d4d39acef3ddf4107874f3607fa1))
- **readme:** update README — closes [#198](https://github.com/SandrineCipolla/stockhub_back/issues/198) ([#200](https://github.com/SandrineCipolla/stockhub_back/issues/200)) ([89c3173](https://github.com/SandrineCipolla/stockhub_back/commit/89c3173e5055a12d42c882fcc64093bc3d8edf25))

### 🔧 Chores

- **ci:** integrate Codecov for dynamic coverage badge — closes [#199](https://github.com/SandrineCipolla/stockhub_back/issues/199) ([#201](https://github.com/SandrineCipolla/stockhub_back/issues/201)) ([b645c13](https://github.com/SandrineCipolla/stockhub_back/commit/b645c133f933220bf97850c2c3beb1977622470e))
- remove V1 code and migrate UserService to Prisma — closes [#192](https://github.com/SandrineCipolla/stockhub_back/issues/192) ([#193](https://github.com/SandrineCipolla/stockhub_back/issues/193)) ([c22d07e](https://github.com/SandrineCipolla/stockhub_back/commit/c22d07e4550f532c0d25ee999f8018ff1c86cdb4))

## [2.10.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.9.0...v2.10.0) (2026-04-05)

### ✨ Features

- **contributions:** add GET /contributions/pending-count endpoint — closes [#155](https://github.com/SandrineCipolla/stockhub_back/issues/155) ([#178](https://github.com/SandrineCipolla/stockhub_back/issues/178)) ([8825902](https://github.com/SandrineCipolla/stockhub_back/commit/8825902776ef2bc24ac556c963b95af19e6365ef))
- **items:** expose updatedAt on stock items — closes [#157](https://github.com/SandrineCipolla/stockhub_back/issues/157) ([#180](https://github.com/SandrineCipolla/stockhub_back/issues/180)) ([55b4cb7](https://github.com/SandrineCipolla/stockhub_back/commit/55b4cb7d71be9b59034bb8490796f3531d9ff86e))

## [2.9.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.8.1...v2.9.0) (2026-04-05)

### ✨ Features

- **authorization:** add collaborator management endpoints — closes [#172](https://github.com/SandrineCipolla/stockhub_back/issues/172) ([#173](https://github.com/SandrineCipolla/stockhub_back/issues/173)) ([cd928b4](https://github.com/SandrineCipolla/stockhub_back/commit/cd928b4ce0689cbbf957a912b755f112d739cee3))
- **contributions:** VIEWER_CONTRIBUTOR contribution workflow — closes [#63](https://github.com/SandrineCipolla/stockhub_back/issues/63) ([#171](https://github.com/SandrineCipolla/stockhub_back/issues/171)) ([cb1aa5c](https://github.com/SandrineCipolla/stockhub_back/commit/cb1aa5c9212ad4d03bf5e8347848695c99823ca1))
- **stocks:** include collaborated stocks in GET /stocks with viewerRole — closes [#175](https://github.com/SandrineCipolla/stockhub_back/issues/175) ([#176](https://github.com/SandrineCipolla/stockhub_back/issues/176)) ([9cdd38f](https://github.com/SandrineCipolla/stockhub_back/commit/9cdd38fe9448e7ed890af31e5d03d1942dea26f6))

### 🐛 Bug Fixes

- **visualization:** allow collaborators to access shared stock details — closes [#154](https://github.com/SandrineCipolla/stockhub_back/issues/154) ([#177](https://github.com/SandrineCipolla/stockhub_back/issues/177)) ([8a068e1](https://github.com/SandrineCipolla/stockhub_back/commit/8a068e16c7b74baba012c9aa63cd5c4e7b15a272))

## [2.8.1](https://github.com/SandrineCipolla/stockhub_back/compare/v2.8.0...v2.8.1) (2026-04-01)

### 🐛 Bug Fixes

- **deps:** upgrade prisma to 6.19.3 and copy-webpack-plugin to 14.0.0 — closes [#83](https://github.com/SandrineCipolla/stockhub_back/issues/83) ([#164](https://github.com/SandrineCipolla/stockhub_back/issues/164)) ([e870bd5](https://github.com/SandrineCipolla/stockhub_back/commit/e870bd57e888d4e3abbe42a66cc033b61a967898))

### 📚 Documentation

- **adr:** add business context to ADRs and complete schema documentation — closes [#160](https://github.com/SandrineCipolla/stockhub_back/issues/160) [#161](https://github.com/SandrineCipolla/stockhub_back/issues/161) [#162](https://github.com/SandrineCipolla/stockhub_back/issues/162) ([#167](https://github.com/SandrineCipolla/stockhub_back/issues/167)) ([6906cee](https://github.com/SandrineCipolla/stockhub_back/commit/6906cee062f664bb8c960512616dd5d545b8fe43))

### 🧪 Tests

- **e2e:** add status field assertions and status lifecycle scenario — closes [#43](https://github.com/SandrineCipolla/stockhub_back/issues/43) ([#166](https://github.com/SandrineCipolla/stockhub_back/issues/166)) ([da25beb](https://github.com/SandrineCipolla/stockhub_back/commit/da25beb1c5794a8a13d9a257eff411899155faaa))

### 🔧 Chores

- **ci:** add npm outdated check to CI pipeline — closes [#163](https://github.com/SandrineCipolla/stockhub_back/issues/163) ([#168](https://github.com/SandrineCipolla/stockhub_back/issues/168)) ([0674607](https://github.com/SandrineCipolla/stockhub_back/commit/0674607cdb555765bd8b220461bec52a1610c195))

## [2.8.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.7.0...v2.8.0) (2026-03-31)

### ✨ Features

- **stocks:** add aggregated status to GET /stocks response — closes [#142](https://github.com/SandrineCipolla/stockhub_back/issues/142) ([#143](https://github.com/SandrineCipolla/stockhub_back/issues/143)) ([0782acb](https://github.com/SandrineCipolla/stockhub_back/commit/0782acb9c84553443711acc3548fb3b3c9d8f9f8))

### 🐛 Bug Fixes

- **ai:** update default model to mistral-small-3.1-24b-instruct and add labels convention ([98b1b9c](https://github.com/SandrineCipolla/stockhub_back/commit/98b1b9cb890113693ee230ccf290d96581cefb35))
- **ia:** switch prompt to French and update Postman collection ([#139](https://github.com/SandrineCipolla/stockhub_back/issues/139)) ([03eade8](https://github.com/SandrineCipolla/stockhub_back/commit/03eade8700f8862e3354300ac8e793e7011cc957))
- **suggestions:** compute predictions for all items before LLM cache — closes [#141](https://github.com/SandrineCipolla/stockhub_back/issues/141) ([#144](https://github.com/SandrineCipolla/stockhub_back/issues/144)) ([1517fad](https://github.com/SandrineCipolla/stockhub_back/commit/1517fad19258f4fb8fb996f9569016962f6cc2be))
- **suggestions:** use item label in AI suggestion descriptions — closes [#145](https://github.com/SandrineCipolla/stockhub_back/issues/145) ([#146](https://github.com/SandrineCipolla/stockhub_back/issues/146)) ([62f5201](https://github.com/SandrineCipolla/stockhub_back/commit/62f52014f756c0ed2bb4d4fc0095ae45272511a0))

### 📚 Documentation

- update README, CLAUDE.md and openapi.yaml for v2.7.1 features ([bc3a911](https://github.com/SandrineCipolla/stockhub_back/commit/bc3a9114c831b242527c2e735fbddfa62268a7fd))

## [2.7.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.6.0...v2.7.0) (2026-03-27)

### ✨ Features

- **ia:** add AIService with OpenRouter/Mistral and 24h DB cache — closes [#124](https://github.com/SandrineCipolla/stockhub_back/issues/124) ([#137](https://github.com/SandrineCipolla/stockhub_back/issues/137)) ([8469dc9](https://github.com/SandrineCipolla/stockhub_back/commit/8469dc95f21897869a4eb0cffbfa205705ad237f))
- **ia:** add ItemHistory, StockPredictionService and 90-day seed — closes [#123](https://github.com/SandrineCipolla/stockhub_back/issues/123) ([#134](https://github.com/SandrineCipolla/stockhub_back/issues/134)) ([a5aed8f](https://github.com/SandrineCipolla/stockhub_back/commit/a5aed8faeae25a50ec78c4b059bd29219538eea1))

### 📚 Documentation

- post-release v2.6.0 — update README and ADR index ([#130](https://github.com/SandrineCipolla/stockhub_back/issues/130)) ([c7067a2](https://github.com/SandrineCipolla/stockhub_back/commit/c7067a22dee02da762b3364dbc3dc31aaac085f2))

## [2.6.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.5.2...v2.6.0) (2026-03-25)

### ✨ Features

- **items:** add UpdateItem command and handler ([#119](https://github.com/SandrineCipolla/stockhub_back/issues/119)) ([4f28305](https://github.com/SandrineCipolla/stockhub_back/commit/4f28305c21a55645992f85c71bf81efcef964f4d))
- **stocks:** align API response shape with frontend — closes [#75](https://github.com/SandrineCipolla/stockhub_back/issues/75) [#93](https://github.com/SandrineCipolla/stockhub_back/issues/93) ([#116](https://github.com/SandrineCipolla/stockhub_back/issues/116)) ([d000222](https://github.com/SandrineCipolla/stockhub_back/commit/d00022227e4e5e8cea17f2790ca9f6873df26fc9))

### 🐛 Bug Fixes

- **logger:** log exceptions in local dev and expose error details — closes [#127](https://github.com/SandrineCipolla/stockhub_back/issues/127) ([#128](https://github.com/SandrineCipolla/stockhub_back/issues/128)) ([4ac2685](https://github.com/SandrineCipolla/stockhub_back/commit/4ac2685f8486817db8ec13739a7509f6c0c8cd26))

### 📚 Documentation

- **adr:** add ADR-013 LLM provider decision with two-phase spike results — closes [#122](https://github.com/SandrineCipolla/stockhub_back/issues/122) ([#129](https://github.com/SandrineCipolla/stockhub_back/issues/129)) ([1d24050](https://github.com/SandrineCipolla/stockhub_back/commit/1d240504af273e56f320b13636d75c6f515c78c1))
- **claude:** add ticket workflow, branch naming convention and wiki update guide ([7f0c36d](https://github.com/SandrineCipolla/stockhub_back/commit/7f0c36db63bc4fd20cc731d6c0598a36cb95149d))
- **openapi:** update PATCH items to reflect full UpdateItem command ([#121](https://github.com/SandrineCipolla/stockhub_back/issues/121)) ([f3169bf](https://github.com/SandrineCipolla/stockhub_back/commit/f3169bfad8ecd505cb0793b8209e399f563542eb))

### 🔧 Chores

- move Claude working files to .claude/ and add to gitignore ([#120](https://github.com/SandrineCipolla/stockhub_back/issues/120)) ([509b135](https://github.com/SandrineCipolla/stockhub_back/commit/509b135f63af25aa710e1f8d738b51c228fc1510))

## [2.5.2](https://github.com/SandrineCipolla/stockhub_back/compare/v2.5.1...v2.5.2) (2026-03-16)

### 🐛 Bug Fixes

- **docs:** update openapi version to 2.5.1 and add RGPD link in README ([b30dae5](https://github.com/SandrineCipolla/stockhub_back/commit/b30dae585b6e26bf85fce1ed1ead2af7d178c6f5))

### 🧪 Tests

- **api:** add full V2 API integration coverage for stocks and items ([#115](https://github.com/SandrineCipolla/stockhub_back/issues/115)) ([a931163](https://github.com/SandrineCipolla/stockhub_back/commit/a93116341203bbe1cedfd74247532829812373ba))

### 💄 Styles

- format CHANGELOG and VERIFICATION_RESULTS with prettier ([fed4a33](https://github.com/SandrineCipolla/stockhub_back/commit/fed4a335dd12fa6a510d88a4cd270b9dd5e19a61))

## [2.5.1](https://github.com/SandrineCipolla/stockhub_back/compare/v2.5.0...v2.5.1) (2026-03-10)

### 🐛 Bug Fixes

- **auth:** accept both PKCE and ROPC audiences when ROPC policy is enabled ([#95](https://github.com/SandrineCipolla/stockhub_back/issues/95)) ([da2338d](https://github.com/SandrineCipolla/stockhub_back/commit/da2338dbb8a4b36bff503e615c4584d26db983bc))
- **security:** add authorizeStockWrite on PATCH and DELETE stock routes (OWASP A01) ([#106](https://github.com/SandrineCipolla/stockhub_back/issues/106)) ([a59de05](https://github.com/SandrineCipolla/stockhub_back/commit/a59de05c77db5104342d0521ea20e64a7ff274da))
- **tests:** add coverageThreshold 80% to jest.ci.config.js and update README ([#107](https://github.com/SandrineCipolla/stockhub_back/issues/107)) ([9f3e77e](https://github.com/SandrineCipolla/stockhub_back/commit/9f3e77ed22ed11c272445ec5772f98c5ef87a4bd)), closes [#99](https://github.com/SandrineCipolla/stockhub_back/issues/99)

### ♻️ Code Refactoring

- **domain:** extract StockCategory enum to domain layer ([#111](https://github.com/SandrineCipolla/stockhub_back/issues/111)) ([0e6bc20](https://github.com/SandrineCipolla/stockhub_back/commit/0e6bc20740add84a0014be81e954cac4244b7521)), closes [#103](https://github.com/SandrineCipolla/stockhub_back/issues/103)

### 📚 Documentation

- add .env.example for local development setup ([#108](https://github.com/SandrineCipolla/stockhub_back/issues/108)) ([17ef5f5](https://github.com/SandrineCipolla/stockhub_back/commit/17ef5f517f49b61666c37886054e0d369a521d54)), closes [#100](https://github.com/SandrineCipolla/stockhub_back/issues/100)
- add RGPD data protection policy document ([#110](https://github.com/SandrineCipolla/stockhub_back/issues/110)) ([2913a81](https://github.com/SandrineCipolla/stockhub_back/commit/2913a813357a63ae88f5c62e587578b83b83f4dd)), closes [#102](https://github.com/SandrineCipolla/stockhub_back/issues/102)
- add staging/Render troubleshooting guide ([#97](https://github.com/SandrineCipolla/stockhub_back/issues/97)) ([082d645](https://github.com/SandrineCipolla/stockhub_back/commit/082d64504f36b034402e3594544cb473db70056a))
- **adr:** add ADR-011 (Render+Aiven staging) and ADR-012 (Node.js 22) ([#112](https://github.com/SandrineCipolla/stockhub_back/issues/112)) ([40ec503](https://github.com/SandrineCipolla/stockhub_back/commit/40ec5032e8037dcaa95106628cb5e289b68224ca)), closes [#104](https://github.com/SandrineCipolla/stockhub_back/issues/104)
- **openapi:** add 3 missing endpoints to OpenAPI spec ([#109](https://github.com/SandrineCipolla/stockhub_back/issues/109)) ([07d4ebb](https://github.com/SandrineCipolla/stockhub_back/commit/07d4ebbc23e1ad44e9e26aeb2b06baea927a2c4d)), closes [#101](https://github.com/SandrineCipolla/stockhub_back/issues/101)

### 🔧 Chores

- **ci:** upgrade to Node 22 in Dockerfile, CI workflow and add .nvmrc ([#105](https://github.com/SandrineCipolla/stockhub_back/issues/105)) ([efa49cf](https://github.com/SandrineCipolla/stockhub_back/commit/efa49cfd995526db73239265f63323e72c8c4ce2))

## [2.5.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.4.0...v2.5.0) (2026-03-03)

### ✨ Features

- add SSL configuration to database connection options ([2a69ff6](https://github.com/SandrineCipolla/stockhub_back/commit/2a69ff6bfbf4f32e2d977c6e55dae254cba56f29))
- **api:** implement DELETE /api/v2/stocks/:stockId/items/:itemId ([#92](https://github.com/SandrineCipolla/stockhub_back/issues/92)) ([5e23402](https://github.com/SandrineCipolla/stockhub_back/commit/5e23402b10912422f915ff2cd4161f9466ef3fb8)), closes [#90](https://github.com/SandrineCipolla/stockhub_back/issues/90)
- **ci:** add staging environment with Docker, seed, Render and E2E pipeline ([#89](https://github.com/SandrineCipolla/stockhub_back/issues/89)) ([515bae7](https://github.com/SandrineCipolla/stockhub_back/commit/515bae73a34f8143c573907654d2b35c69525852))
- **db:** lowercase schema + cascade items [#86](https://github.com/SandrineCipolla/stockhub_back/issues/86) [#78](https://github.com/SandrineCipolla/stockhub_back/issues/78) ([71e68ec](https://github.com/SandrineCipolla/stockhub_back/commit/71e68ecae3f01b84c9bf7f5d1e1efba25f3ef104))

### 🐛 Bug Fixes

- **domain:** migrate StockItem and StockSummary properties to camelCase ([#91](https://github.com/SandrineCipolla/stockhub_back/issues/91)) ([8a613ec](https://github.com/SandrineCipolla/stockhub_back/commit/8a613ec2cbc420f0160c701298533bbece827491)), closes [#86](https://github.com/SandrineCipolla/stockhub_back/issues/86)

### 📚 Documentation

- **readme:** restore business/technical sections + keep new env links and Docker quickstart ([f7b2e88](https://github.com/SandrineCipolla/stockhub_back/commit/f7b2e8865abd2db4b94093cad1dc1fdeeac66721))
- **readme:** rewrite with multi-environment links, Docker quickstart, Postman envs ([a202ae0](https://github.com/SandrineCipolla/stockhub_back/commit/a202ae0a90219320c38b6befb1ca4129e640a743))

### 🔧 Chores

- update Postman collection with all endpoints and OAuth2 auth ([#88](https://github.com/SandrineCipolla/stockhub_back/issues/88)) ([d6b7834](https://github.com/SandrineCipolla/stockhub_back/commit/d6b783453528cb7b1292d3360e5378f5bf1fd2de))

## [2.4.0](https://github.com/SandrineCipolla/stockhub_back/compare/v2.3.0...v2.4.0) (2026-02-27)

### ✨ Features

- implement PATCH and DELETE endpoints for stocks (Issue [#74](https://github.com/SandrineCipolla/stockhub_back/issues/74)) ([#80](https://github.com/SandrineCipolla/stockhub_back/issues/80)) ([b8b3ca0](https://github.com/SandrineCipolla/stockhub_back/commit/b8b3ca0e49e07fde8a3ed52a20ca13fe06cc2eab))

### 🐛 Bug Fixes

- **cors:** allow Vercel preview URLs via VERCEL_PREVIEW_CORS env var ([af4a6ff](https://github.com/SandrineCipolla/stockhub_back/commit/af4a6ff4217c39cad390ab4612b1cb8011b39bcd))
- fix npm audit vulnerabilities ([9d45585](https://github.com/SandrineCipolla/stockhub_back/commit/9d45585f7db314027fe45882fdfcd31476bd0b34))

### ♻️ Code Refactoring

- improve code formatting and structure in StockControllerManipulation and StockRoutesV2 ([997a187](https://github.com/SandrineCipolla/stockhub_back/commit/997a18755dfe47db5c2ba228bd240813dc076de1))

### 📚 Documentation

- add CODEOWNERS file for repository ownership management ([0f7b442](https://github.com/SandrineCipolla/stockhub_back/commit/0f7b4426166b9247ae14884614bc35042e4293c8))
- add guides for code review best practices and logging system ([afe04e8](https://github.com/SandrineCipolla/stockhub_back/commit/afe04e803716224e80957e832f6cca50c14243c0))
- add milestones documentation for RNCP tracking ([7a6371f](https://github.com/SandrineCipolla/stockhub_back/commit/7a6371fd10a6aba856535e06739cc4a2977c52d7))
- create dedicated MILESTONES-GUIDE.md ([8537d29](https://github.com/SandrineCipolla/stockhub_back/commit/8537d29548325f35a84fbeae2586acd7b5e9522a))
- update backend URL to new Azure App Service domain ([284df7d](https://github.com/SandrineCipolla/stockhub_back/commit/284df7d9c8865a81d79fbcc35fb26cd6a81805ee))
- update CLAUDE.md with improved structure and clarity ([eda7f0c](https://github.com/SandrineCipolla/stockhub_back/commit/eda7f0cd3c2a677b3046f0342c9bfa427ca016be))

### 💄 Styles

- format CHANGELOG.md with Prettier ([57c5af6](https://github.com/SandrineCipolla/stockhub_back/commit/57c5af67a2bfe18e078f3573501170738c7538fe))
- improve formatting and consistency in CLAUDE.md ([e2738be](https://github.com/SandrineCipolla/stockhub_back/commit/e2738be263ae28daf7fbe87ea3f6f4bd203fd99d))
- improve formatting and consistency in CLAUDE.md ([1c4651f](https://github.com/SandrineCipolla/stockhub_back/commit/1c4651fa88d631a98dbc4468dbc067b9fa352d42))

### 🔧 Chores

- format issue templates with prettier ([f137bfe](https://github.com/SandrineCipolla/stockhub_back/commit/f137bfe8ee3084e18b05d65fa1233cff40ea4bb9))
- format workflows with prettier ([1e176a6](https://github.com/SandrineCipolla/stockhub_back/commit/1e176a606ee72b6621d7173428374a3b155de716))
- update prettier formatting rules to include YAML files ([d0beaec](https://github.com/SandrineCipolla/stockhub_back/commit/d0beaec735d753bda2a7048134e361602932881a))

### 👷 CI/CD

- lower security audit level to critical only ([a91dcb6](https://github.com/SandrineCipolla/stockhub_back/commit/a91dcb644169bbfb700ee7319e91c4e9dc2518c0))

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
