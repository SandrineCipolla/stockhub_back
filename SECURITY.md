# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

Only the latest released 2.x version receives security fixes. The current version is in [package.json](package.json).

## Reporting a Vulnerability

If you discover a security vulnerability in StockHub Backend, please report it by emailing the maintainer directly.

**Please do not open public issues for security vulnerabilities.**

### What to include in your report

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix, if any

### Response timeline

- **Initial response:** within 48 hours
- **Status update:** within 7 days
- **Fix timeline:** depends on severity, critical issues prioritized

## Security Measures

### Automated security checks

Two GitHub Actions workflows run `npm audit`. HIGH and CRITICAL vulnerabilities block the build.

- `main_stockhub-back.yml`, on every push and pull request, alongside tests, lint and build
- `security-audit.yml`, dedicated workflow with its own badge, also scheduled weekly

![Security](https://github.com/SandrineCipolla/stockhub_back/actions/workflows/security-audit.yml/badge.svg)

Why the workflows are split, and how the badge is wired: [docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md](docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md).

Dependency updates are proposed automatically by Dependabot.

### Authentication and authorization

- **Authentication:** Azure AD B2C with JWT Bearer tokens on every `/api/v2` route
- **Authorization:** resource-based roles per stock, see [ADR-009](docs/adr/ADR-009-resource-based-authorization.md)
- **API security:** HTTPS only in production, CORS configured per environment

### Data protection

- **Database:** MySQL with encryption at rest
- **Secrets management:** Azure App Service settings and GitHub Secrets
- **Environment variables:** never committed to the repository
- **GDPR:** see [docs/technical/rgpd.md](docs/technical/rgpd.md)

## Security Best Practices

When contributing to this project:

1. Never commit sensitive data such as API keys, passwords or tokens
2. Follow TypeScript strict mode and the ESLint security rules
3. Validate all user inputs
4. Use Prisma rather than raw SQL
5. Keep dependencies up to date

## Vulnerability History

Every vulnerability found and fixed is recorded in [docs/security/SECURITY-VULNERABILITIES.md](docs/security/SECURITY-VULNERABILITIES.md).

---

**Maintainer:** Sandrine Cipolla
**Project:** StockHub Backend (RNCP project)
