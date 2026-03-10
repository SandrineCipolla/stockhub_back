# ADR-011: Choix de Render.com + Aiven MySQL pour le staging

**Date:** 2026-01-15
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

Le projet nécessite un environnement de staging pour :

- Valider les déploiements avant la production Azure
- Exécuter les tests E2E Playwright dans un environnement réel
- Permettre des démonstrations sans impacter la production

### Contraintes

- Budget : gratuit (certification RNCP, projet personnel)
- Base de données : MySQL (compatible avec le schéma Prisma existant)
- Déploiement : automatisable via GitHub Actions
- Hébergement : doit supporter Node.js avec Webpack build

---

## Décision

**Render.com** pour l'hébergement de l'application Node.js et **Aiven MySQL** (free tier) pour la base de données staging.

### Configuration

- `render.yaml` à la racine définit le service (`startCommand: node dist/index.js`)
- `autoDeploy: false` — déploiement déclenché manuellement via hook curl dans GitHub Actions
- Branche deployée : `main`
- Aiven MySQL : connexion avec `DB_SSL=true` et `?ssl-mode=REQUIRED` dans `DATABASE_URL`

---

## Raisons

| Critère         | Render.com          | Aiven MySQL              |
| --------------- | ------------------- | ------------------------ |
| Coût            | Gratuit (750h/mois) | Gratuit (free tier)      |
| Support Node.js | Natif               | —                        |
| Support MySQL   | —                   | Natif, compatible Prisma |
| Déploiement CI  | Hook curl           | —                        |
| Localisation    | US (EU possible)    | EU (RGPD)                |

---

## Alternatives considérées

| Alternative           | Raison du rejet                                                    |
| --------------------- | ------------------------------------------------------------------ |
| **Railway**           | Free tier supprimé en 2023                                         |
| **Fly.io**            | Configuration plus complexe, Docker requis                         |
| **PlanetScale**       | MySQL-compatible mais branching model inadapté, free tier supprimé |
| **Heroku**            | Plus gratuit depuis 2022                                           |
| **Staging sur Azure** | Coût supplémentaire, quota F1 déjà limité en prod                  |

---

## Conséquences

### Positives

- Environnement staging fonctionnel sans coût
- Pipeline CI/CD complet (dev → staging → prod)
- Tests E2E Playwright sur environnement réel avant prod

### Négatives

- **Aiven free tier** : instance MySQL se met en veille après inactivité — nécessite un "Power on" manuel via console.aiven.io
- **Render.com cold start** : ~30s de démarrage après inactivité (free tier)
- **Render US** : latence légèrement plus élevée depuis l'EU
- Procédure documentée : `docs/troubleshooting/staging-render-issues.md`
