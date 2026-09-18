# Créer une Issue GitHub — User Story

Crée une issue GitHub en respectant **strictement** le format User Story du projet.

## Instructions

1. Demande-moi les informations manquantes si elles ne sont pas fournies :
   - **Persona** : qui est l'utilisateur ? (ex: utilisateur connecté, admin famille)
   - **Action souhaitée** : que veut-il faire ?
   - **Bénéfice** : pourquoi / quelle valeur ?
   - **Priorité** : Très haute / Haute / Moyenne / Basse / Très basse
   - **Module** : Frontend / Backend / Design System / Transverse

2. Génère le body **uniquement** avec ce format, sans rien ajouter d'autre :

```
**En tant que** [persona]
**Je souhaite** [action souhaitée]
**Afin de** [bénéfice attendu]

---

**Critères d'acceptation**

Étant donné que [contexte initial]
Lorsque [action déclenchée]
Alors :
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3
```

3. Exécute la commande suivante :

```bash
gh issue create \
  --title "[US-XXX] [titre court orienté utilisateur]" \
  --label "user-story" \
  --body "[body généré ci-dessus]"
```

## Règles ABSOLUES

- ❌ Pas de détails d'implémentation (composants, fichiers, code)
- ❌ Pas d'étapes techniques de développement
- ❌ Pas de commandes à exécuter
- ❌ Pas de TODO techniques
- ✅ Maximum 5 critères d'acceptation
- ✅ Le titre doit être compréhensible par un non-développeur
- ✅ Les critères d'acceptation décrivent un comportement visible, pas du code
