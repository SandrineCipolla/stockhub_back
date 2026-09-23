# Politique de sécurité

## Versions supportées

| Version | Supportée          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

Seule la dernière version 2.x publiée reçoit les correctifs de sécurité. La version courante est indiquée dans [package.json](package.json).

## Signaler une vulnérabilité

Si vous découvrez une vulnérabilité dans StockHub Backend, signalez-la en privé depuis l'onglet **Security** du dépôt, via [Report a vulnerability](https://github.com/SandrineCipolla/stockhub_back/security/advisories/new).

**Merci de ne pas ouvrir d'issue publique pour une vulnérabilité de sécurité.**

### Ce que doit contenir le signalement

- Description de la vulnérabilité
- Étapes pour la reproduire
- Impact potentiel
- Correctif suggéré, le cas échéant

### Traitement des signalements

Ce projet est maintenu par une seule personne, sur son temps disponible. Les signalements sont examinés dès que possible, les vulnérabilités critiques et hautes étant prioritaires sur le reste.

Aucun délai de réponse n'est garanti. Vous serez tenu informé de l'avancement dans le fil de l'advisory.

## Mesures de sécurité

### Contrôles automatiques

`security-audit.yml` exécute `npm audit --audit-level=high` : les vulnérabilités HIGH et CRITICAL bloquent le build. Les vulnérabilités MODERATE et LOW sont remontées à titre informatif, sans bloquer.

Le workflow s'exécute sur chaque push et pull request vers `main` ou `develop`, chaque lundi à 00h00 UTC, et sur déclenchement manuel. Il est distinct du workflow principal `main_stockhub-back.yml` (celui-ci n'exécute plus `npm audit`, cette étape y est désactivée depuis l'extraction vers ce workflow dédié) : pourquoi et comment, voir [docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md](docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md).

![Security](https://github.com/SandrineCipolla/stockhub_back/actions/workflows/security-audit.yml/badge.svg)

Les mises à jour de dépendances sont proposées automatiquement par Dependabot.

### Authentification et autorisation

- **Authentification** : Azure AD B2C avec jetons JWT Bearer sur chaque route `/api/v2`
- **Autorisation** : rôles par stock basés sur les ressources, voir [ADR-009](docs/adr/ADR-009-resource-based-authorization.md)
- **Sécurité API** : HTTPS uniquement en production, CORS configuré par environnement

### Protection des données

- **Base de données** : MySQL avec chiffrement au repos
- **Gestion des secrets** : Azure App Service settings et GitHub Secrets
- **Variables d'environnement** : jamais committées dans le dépôt
- **RGPD** : voir [docs/technical/rgpd.md](docs/technical/rgpd.md)

## Bonnes pratiques

Pour toute contribution à ce projet :

1. Ne jamais committer de données sensibles : clés d'API, mots de passe, tokens
2. Respecter le mode strict de TypeScript et les règles de sécurité ESLint
3. Valider toutes les entrées utilisateur
4. Utiliser Prisma plutôt que du SQL brut
5. Maintenir les dépendances à jour

## Historique des vulnérabilités

Chaque vulnérabilité découverte et corrigée est consignée dans [docs/security/SECURITY-VULNERABILITIES.md](docs/security/SECURITY-VULNERABILITIES.md).

---

**Mainteneuse** : Sandrine Cipolla
**Projet** : StockHub Backend (projet RNCP)
