# Guide des Milestones GitHub - StockHub

> Guide d'utilisation des milestones GitHub pour le suivi d'avancement du projet et le mémoire RNCP.

---

## Pourquoi des Milestones ?

Les milestones GitHub offrent des **KPIs visuels** pour démontrer la gestion de projet :

- **Progress bars** avec pourcentage d'avancement
- **Due dates** avec indicateurs retard/avance
- **Issues ouvertes vs fermées**
- **Burndown** implicite (évolution du %)

---

## Organisation des Milestones

### Deux types de milestones

#### 1. Par version (releases techniques)

Liés aux phases d'autorisation et releases :

| Exemple                     | Usage                |
| --------------------------- | -------------------- |
| `v2.3.0 - Authorization P1` | Phase 1 autorisation |
| `v2.4.0 - Authorization P2` | Phase 2 suggestions  |
| `v4.0.0 - RNCP Ready`       | Version finale RNCP  |

#### 2. Par domaine RNCP (livrables par compétence)

Regroupent les issues par domaine pour le mémoire :

| Exemple                        | Usage                           |
| ------------------------------ | ------------------------------- |
| `RNCP - Architecture DDD/CQRS` | Démontrer maîtrise architecture |
| `RNCP - Sécurité & Auth`       | Authentification, autorisation  |
| `RNCP - Tests & Qualité`       | Tests, CI/CD, couverture        |

### Règle d'assignation

- **Une issue = un seul milestone**
- Issues fermées comptent dans le %
- Issues ouvertes = travail restant

---

## Milestones par repo

### Backend ([voir](https://github.com/SandrineCipolla/stockhub_back/milestones))

| #   | Milestone                          | Type    |
| --- | ---------------------------------- | ------- |
| 1   | v2.3.0 - Authorization P1          | Version |
| 2-5 | v2.4.0 à v4.0.0                    | Version |
| 6   | RNCP - Architecture DDD/CQRS       | RNCP    |
| 7   | RNCP - Sécurité & Authentification | RNCP    |
| 8   | RNCP - Tests & Qualité             | RNCP    |
| 9   | RNCP - Documentation Technique     | RNCP    |

### Frontend ([voir](https://github.com/SandrineCipolla/stockHub_V2_front/milestones))

| #   | Milestone                    | Type    |
| --- | ---------------------------- | ------- |
| 1-4 | v1.4.0 à v2.0.0              | Version |
| 5   | RNCP - UI/UX & Accessibilité | RNCP    |
| 6   | RNCP - Intégration Backend   | RNCP    |
| 7   | RNCP - Tests Frontend        | RNCP    |

### Design System ([voir](https://github.com/SandrineCipolla/stockhub_design_system/milestones))

| #   | Milestone                        | Type    |
| --- | -------------------------------- | ------- |
| 1-4 | v1.4.0 à v2.0.0                  | Version |
| 5   | RNCP - Composants Core           | RNCP    |
| 6   | RNCP - Accessibilité & Standards | RNCP    |

---

## Commandes utiles (gh CLI)

### Lister les milestones avec pourcentages

```bash
gh api repos/OWNER/REPO/milestones --jq '.[] | "\(.title): \(.closed_issues)/\(.open_issues + .closed_issues)"'
```

### Lister les issues d'un milestone

```bash
gh issue list --repo OWNER/REPO --milestone "Milestone Name" --state all
```

### Assigner une issue à un milestone

```bash
gh issue edit NUMBER --repo OWNER/REPO --milestone "Milestone Name"
```

### Créer un milestone

```bash
gh api repos/OWNER/REPO/milestones \
  -f title="Milestone Name" \
  -f description="Description" \
  -f due_on="2026-03-31T00:00:00Z"
```

### Fermer un milestone (100% complété)

```bash
gh api repos/OWNER/REPO/milestones/NUMBER -X PATCH -f state="closed"
```

### Voir tous les milestones (ouverts et fermés)

```bash
gh api repos/OWNER/REPO/milestones?state=all --jq '.[] | "[\(.state)] \(.title)"'
```

---

## Utilisation pour le mémoire RNCP

### 1. Screenshots

Capturer les pages milestones pour montrer l'avancement :

- Progress bars visuelles
- Pourcentages par domaine
- Issues ouvertes/fermées

**URLs à capturer :**

- https://github.com/SandrineCipolla/stockhub_back/milestones
- https://github.com/SandrineCipolla/stockHub_V2_front/milestones
- https://github.com/SandrineCipolla/stockhub_design_system/milestones

### 2. KPIs à présenter

| KPI                       | Source                        |
| ------------------------- | ----------------------------- |
| % avancement Architecture | Milestone RNCP - Architecture |
| % avancement Sécurité     | Milestone RNCP - Sécurité     |
| % avancement Tests        | Milestone RNCP - Tests        |
| Issues fermées / total    | Page milestones               |

### 3. Timeline

Capturer les milestones à différentes dates pour montrer l'évolution :

- Début de projet
- Mi-parcours
- Avant soutenance

### 4. Démontrer la méthodologie

Les milestones prouvent :

- **Planification** : Due dates, phases définies
- **Suivi** : % d'avancement mesurable
- **Organisation** : Issues catégorisées par domaine
- **Priorisation** : Milestones ordonnés logiquement

---

## Bonnes pratiques

### Quand créer une issue

- Nouvelle feature → créer issue → assigner au milestone approprié
- Bug fix → créer issue → assigner au milestone concerné
- Tech debt → créer issue → assigner au milestone RNCP correspondant

### Quand fermer un milestone

- Toutes les issues sont fermées (100%)
- Ou décision de ne plus travailler dessus (documenter pourquoi)

### Maintenir la cohérence

- Réviser les milestones à chaque session de dev
- Réassigner les issues si nécessaire
- Fermer les milestones complétés

---

## Liens

- [GitHub Docs - Milestones](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones)
- [gh CLI - Issues](https://cli.github.com/manual/gh_issue)

---

**Créé le :** 2026-01-29
**Auteur :** Sandrine Cipolla
