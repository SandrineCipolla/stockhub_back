# Contribuer à StockHub Back

Ce document décrit le process de contribution : branches, commits, pull requests, workflow par ticket, gestion des issues GitHub. Pour l'architecture et les standards de code, voir [CLAUDE.md](CLAUDE.md).

## Conventions Git

### Branches

Format strict :

```
type/issue-number-short-description
```

| Type        | Usage                                       |
| ----------- | ------------------------------------------- |
| `feat/`     | Nouvelle fonctionnalité                     |
| `fix/`      | Correction de bug                           |
| `chore/`    | Tâche technique sans valeur métier          |
| `docs/`     | Documentation uniquement                    |
| `test/`     | Tests uniquement                            |
| `refactor/` | Refactoring sans changement de comportement |

**Exemples corrects** : `feat/118-update-item-command`, `fix/86-stockitem-lowercase`, `docs/101-openapi-endpoints`
**Jamais** : `feature/...`, `feat-issue-62-...`, `feat/issue-44-...`. Le format `type/number-description` est la seule convention.

### Commits (Conventional Commits)

```
type(scope): message concis (closes #numero)
```

- Vérifiés automatiquement par **commitlint** au pre-commit
- Message en minuscules, verbe à l'infinitif, sans majuscule en fin
- Inclure `(closes #numero)` si le commit clôt une issue
- Pas de mention d'outils ou d'IA dans le message
- Pas de tiret cadratin, y compris dans cette syntaxe : parenthèses pour `closes #numero`

**Exemples** : `feat(items): add UpdateItem command and handler (closes #118)`, `fix(items): return 404 when itemId not found`

### Pull requests et revues de code

- Utiliser `.github/PULL_REQUEST_TEMPLATE.md`
- Indiquer les couches DDD impactées, le test plan, et `Closes #numero`
- Pas de mention d'outils ou d'IA, ni dans le titre ni dans la description

#### Règles de rédaction des commentaires de PR (Code & Doc Reviews)

Toute revue de PR doit respecter le [guide-redaction.md](docs/technical/guide-redaction.md) :

1. **Uniquement les points à corriger ou améliorer** : Ne pas lister ce qui est validé ou conforme. Un commentaire de revue sert exclusivement à signaler des éléments à modifier ou améliorer.
2. **Si aucun point à modifier** : Ne pas ajouter de commentaire de revue inutile. Le statut de la PR suffit.
3. **Rédaction concrète et factuelle** :
   - Écrire court pour réduire le temps de relecture.
   - Aucun tiret cadratin (`—`).
   - Aucun point-virgule dans la prose (`;`).
   - Aucun point médian (`·`).
   - Aucun qualificatif subjectif ou formule de remplissage.

### Releases

Automatiques via **Release Please** (semver) sur push `main`.

## Workflow par ticket

Suivre cet ordre pour chaque issue, sans exception.

### 1. Avant de commencer

```bash
git checkout main
git pull origin main
git checkout -b type/numero-description   # ex: feat/118-update-item-command
```

### 2. Développement

- Travailler sur la branche dédiée
- Commits fréquents, ciblés, au format Conventional Commits
- Respecter la checklist avant commit (ci-dessous)

### 3. Ouvrir la PR

- Titre : `type(scope): description (closes #numero)`
- Body : couches impactées, test plan, `Closes #numero`
- Vérifier que le CI passe avant de merger

### 4. Après le merge

Mettre à jour dans cet ordre :

| Action                                              | Quand                           |
| --------------------------------------------------- | ------------------------------- |
| **Wiki** (`Backend-Guide`) : endpoints, nb de tests | Nouvel endpoint ou modification |
| **Wiki** (`Architecture-Globale` ou `ADR`)          | Décision architecturale         |
| **Wiki** (`CICD-et-Deploiement`)                    | Changement d'infra ou pipeline  |
| **`docs/openapi.yaml`**                             | Modification d'un endpoint      |
| **GitHub Project** (issue → Done)                   | Systématiquement après merge    |

**Comment mettre à jour le wiki** :

```bash
git clone https://github.com/SandrineCipolla/stockHub_V2_front.wiki.git /tmp/wiki
# modifier les fichiers .md
cd /tmp/wiki && git add . && git commit -m "docs: ..." && git push
```

## Gestion des issues GitHub

### Labels obligatoires

Toute issue doit avoir **au minimum** ces trois labels :

| Label    | Valeur                                                         |
| -------- | -------------------------------------------------------------- |
| Scope    | `back` (toujours sur ce repo)                                  |
| Type     | `bug`, `enhancement`, `documentation`, `tech`, `clean code`... |
| Priorité | `P0`, `P1`, `P2`, `P3` ou `P4` (voir critères ci-dessous)      |

Sans ces labels, les issues n'apparaissent pas correctement dans le GitHub Project board.

```bash
gh issue create --label "back,bug,P2" ...
gh issue edit <numero> --repo SandrineCipolla/stockhub_back --add-label "back,bug,P2"
```

### Critères des labels de priorité

| Label  | Description | Quand l'utiliser                                                                                  |
| ------ | ----------- | ------------------------------------------------------------------------------------------------- |
| **P0** | Bloquant    | Production inaccessible, fuite de données, vulnérabilité exploitée, CI cassée bloquant tout merge |
| **P1** | Haute       | Fonctionnalité principale cassée sans workaround, régression prod, blocage démo RNCP              |
| **P2** | Moyenne     | Bug avec workaround, feature importante du sprint, dette technique impactant la productivité      |
| **P3** | Basse       | Amélioration UX, polish, feature secondaire, documentation non urgente                            |
| **P4** | Très basse  | Nice-to-have hors scope soutenance, feature post-RNCP, refactoring cosmétique                     |

### Champs GitHub Project board

Après création, remplir ces trois champs sur le board :

| Champ          | Valeurs                                                 | Règle                                                                       |
| -------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Priorité**   | 🔴 Très haute → ⚪ Très basse                           | Même échelle que P0–P4. Peut être ajusté au planning sans modifier l'issue. |
| **Module**     | `Frontend` / `Backend` / `Design System` / `Transverse` | Toujours `Backend` sur ce repo                                              |
| **Estimation** | Nombre d'heures (champ numérique)                       | Repères : XS 1, S 2, M 5, L 11, XL 20                                       |

Correspondance labels ↔ board : P0 → 🔴, P1 → 🟠, P2 → 🟡, P3 → 🟢, P4 → ⚪

### Association au GitHub Project (obligatoire)

Toute issue doit être associée au **GitHub Project** du projet :

```bash
# Lors de la création
gh issue create --label "back,bug" --project "StockHub V2"

# Après coup si oublié
gh issue edit <numero> --repo SandrineCipolla/stockhub_back --add-project "StockHub V2"
```

**URL du project** : https://github.com/users/SandrineCipolla/projects/3

Sans cette association, l'issue n'apparaît pas dans le board de suivi et ne peut pas être déplacée entre les colonnes (Backlog → In Progress → Done).

### Avant de créer une issue GitHub

**Format User Story** :

```
**En tant que** [persona]
**Je souhaite** [action souhaitée]
**Afin de** [bénéfice attendu]

---

**Critères d'acceptation**

Étant donné que [contexte]
Lorsque [action]
Alors :
- [ ] Critère 1
- [ ] Critère 2
```

**Interdit dans le body d'une issue** : détails d'implémentation, couches DDD, commandes, TODO techniques. Ça va dans la PR.

**Où mettre les notes techniques ?**

| Information                                | Où                      |
| ------------------------------------------ | ----------------------- |
| Valeur utilisateur, critères d'acceptation | Issue GitHub            |
| Idées en cours de dev                      | Commentaire sur l'issue |
| Couches DDD impactées, choix techniques    | Description de la PR    |
| Décisions d'architecture importantes       | `docs/adr/`             |

## Checklist avant commit

1. `npm run format` : formatage (automatique lint-staged)
2. `npm run lint` : 0 erreur ESLint (automatique lint-staged)
3. `tsc --noEmit` : 0 erreur TypeScript (automatique pre-commit)
4. Tests écrits pour les nouvelles features
5. Pas de `console.*` : logging structuré utilisé
6. Pas de secrets dans le code

## Checklist avant push

1. `npm run test:unit` : tous les tests passent (automatique pre-push)
2. `npm run knip` : pas de code mort (automatique pre-push)
3. ADR créé si décision architecturale importante (voir `docs/adr/TEMPLATE.md`)
4. GitHub Project mis à jour

Les hooks pre-commit et pre-push automatisent la majorité de ces vérifications.
