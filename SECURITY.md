# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in StockHub Backend, please report it by emailing the maintainer directly.

**Please do not open public issues for security vulnerabilities.**

### What to include in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### Response Timeline:

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity (critical issues prioritized)

## Security Measures

### Automated Security Checks

This project uses automated security scanning with **two dedicated workflows**:

#### 1. Main CI/CD Pipeline (`.github/workflows/main_stockhub-back.yml`)

- Runs on: Every push and PR
- Includes: Tests, Lint, Build, **npm audit**
- Badge: ![CI/CD](https://github.com/SandrineCipolla/stockhub_back/actions/workflows/main_stockhub-back.yml/badge.svg)

#### 2. Security Audit Workflow (`.github/workflows/security-audit.yml`)

- **Dedicated security monitoring**
- Runs on: Push, PR, **weekly schedule (Monday 00:00 UTC)**, manual trigger
- Includes: **npm audit only**
- Badge: ![Security](https://github.com/SandrineCipolla/stockhub_back/actions/workflows/security-audit.yml/badge.svg)
- **Advantage:** Isolated security status visible at a glance

**Vulnerability threshold:** HIGH and CRITICAL vulnerabilities block builds
**Dependency updates:** Regular security patches recommended via Dependabot

For technical details on the Security Audit workflow, see: [docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md](docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md)

### Authentication & Authorization

- **Authentication:** Azure AD B2C with JWT Bearer tokens
- **Authorization:** Role-Based Access Control (RBAC) - See Issue #44
- **API Security:** HTTPS only in production, CORS configured

### Data Protection

- **Database:** Azure MySQL with encryption at rest
- **Secrets Management:** Azure Key Vault / GitHub Secrets
- **Environment Variables:** Never committed to repository

## Security Best Practices

When contributing to this project:

1. Never commit sensitive data (API keys, passwords, tokens)
2. Follow TypeScript strict mode and ESLint security rules
3. Validate all user inputs
4. Use parameterized queries (Prisma ORM)
5. Keep dependencies up-to-date

## Security Audit History

- **2026-01-06:** Created dedicated Security Audit workflow with dynamic badge (Issue #45)
- **2025-12-27:** npm audit integrated into CI/CD pipeline (Issue #45)
- **2025-11-30:** Azure AD B2C authentication implemented (ADR-003)

---

**Last Updated:** 2026-01-06
**Maintainer:** Sandrine Cipolla
**Project:** StockHub Backend (RNCP Project)
