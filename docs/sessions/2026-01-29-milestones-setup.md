# Session 29 janvier 2026 - Mise en place des Milestones GitHub

**Branche**: `main`
**Objectif**: Configurer des milestones GitHub pour le suivi d'avancement RNCP

---

## Contexte

Pour le dossier mémoire RNCP, besoin de KPIs visuels démontrant la gestion de projet :

- Pourcentages d'avancement
- Progress bars
- Timeline de livraison

Les milestones GitHub offrent ces fonctionnalités nativement.

---

## Milestones créés

### Backend (stockhub_back)

**Milestones par version (phases d'autorisation) :**

| #   | Milestone                 | Due Date  | Issues      |
| --- | ------------------------- | --------- | ----------- |
| 1   | v2.3.0 - Authorization P1 | -         | #62 (fermé) |
| 2   | v2.4.0 - Authorization P2 | Mar 2026  | #63         |
| 3   | v2.5.0 - Authorization P3 | Mai 2026  | #64         |
| 4   | v3.0.0 - Authorization P4 | Août 2026 | #65         |
| 5   | v4.0.0 - RNCP Ready       | Fév 2027  | -           |

**Milestones RNCP (livrables par domaine) :**

| #   | Milestone                          | Issues assignées             | % initial    |
| --- | ---------------------------------- | ---------------------------- | ------------ |
| 6   | RNCP - Architecture DDD/CQRS       | #37, #36, #74, #75, #78, #79 | 16%          |
| 7   | RNCP - Sécurité & Authentification | #44, #71                     | 50%          |
| 8   | RNCP - Tests & Qualité             | #41, #43, #45, #52, #53, #54 | 66%          |
| 9   | RNCP - Documentation Technique     | #42, #46, #60                | 100% (fermé) |

### Frontend (stockHub_V2_front)

| #   | Milestone                    | Issues    | % initial |
| --- | ---------------------------- | --------- | --------- |
| 1-4 | v1.4.0 à v2.0.0 (versions)   | -         | 0%        |
| 5   | RNCP - UI/UX & Accessibilité | 16 issues | 68%       |
| 6   | RNCP - Intégration Backend   | 6 issues  | 0%        |
| 7   | RNCP - Tests Frontend        | 7 issues  | 57%       |

### Design System (stockhub_design_system)

| #   | Milestone                        | Issues   | % initial |
| --- | -------------------------------- | -------- | --------- |
| 1-4 | v1.4.0 à v2.0.0 (versions)       | -        | 0%        |
| 5   | RNCP - Composants Core           | 7 issues | 57%       |
| 6   | RNCP - Accessibilité & Standards | 3 issues | 0%        |

---

## Stratégie d'organisation

### Deux types de milestones

1. **Par version** (v2.3.0, v2.4.0, etc.)
   - Orientés releases techniques
   - Liés aux phases d'autorisation (Issues #62-65)
   - Due dates pour planning

2. **Par domaine RNCP** (Architecture, Sécurité, Tests, etc.)
   - Orientés livrables pour le mémoire
   - Regroupent les issues par compétence démontrée
   - KPIs pour screenshots

### Assignation des issues

- Une issue = un seul milestone
- Issues fermées comptent dans le %
- Issues ouvertes = travail restant

---

## Commandes utiles

### Voir les milestones

```bash
# Liste avec pourcentages
gh api repos/OWNER/REPO/milestones --jq '.[] | "\(.title): \(.closed_issues)/\(.open_issues + .closed_issues)"'
```

### Assigner une issue à un milestone

```bash
gh issue edit NUMBER --repo OWNER/REPO --milestone "Milestone Name"
```

### Créer un milestone

```bash
gh api repos/OWNER/REPO/milestones -f title="Name" -f description="Description" -f due_on="2026-03-31T00:00:00Z"
```

### Fermer un milestone

```bash
gh api repos/OWNER/REPO/milestones/NUMBER -X PATCH -f state="closed"
```

---

## Actions réalisées

1. ✅ Création de 5 milestones version sur backend
2. ✅ Création de 4 milestones RNCP sur backend
3. ✅ Création de 7 milestones sur frontend
4. ✅ Création de 6 milestones sur design system
5. ✅ Assignation de toutes les issues existantes
6. ✅ Fermeture des milestones à 100% (v2.3.0, Documentation)
7. ✅ Documentation dans ROADMAP.md

---

## Liens

- Backend milestones : https://github.com/SandrineCipolla/stockhub_back/milestones
- Frontend milestones : https://github.com/SandrineCipolla/stockHub_V2_front/milestones
- Design System milestones : https://github.com/SandrineCipolla/stockhub_design_system/milestones

---

**Auteur :** Sandrine Cipolla
**Assistance :** Claude Code (Opus 4.5)
**Date :** 2026-01-29
