# ADR-XXX: [Titre de la décision]

**Date:** YYYY-MM-DD
**Statut:** Accepté | Proposé | Déprécié | Supplanté par ADR-YYY
**Décideurs:** Sandrine Cipolla, [Encadrant RNCP]

---

## Contexte

[Décrire la situation et le problème à résoudre]
[Contraintes techniques, temporelles, budgétaires]

## Contraintes et critères

**Contraintes** (éliminent des options d'office) :

- [ex: doit rester compatible avec Azure AD B2C déjà en place]

**Critères** (comparent les options restantes) :

- [ex: maintenabilité, coût, réversibilité — voir la liste dans le cours "Architecture logiciel"]

## Hypothèses et preuves

| Affirmation                         | Type      | Vérification                                       |
| ----------------------------------- | --------- | -------------------------------------------------- |
| [ex: le trafic restera < 100 users] | Hypothèse | à confirmer par le monitoring Application Insights |
| [ex: latence mesurée à 50ms]        | Preuve    | benchmark du DATE, lien vers les métriques         |

## Décision

[La solution choisie, en une phrase claire]

## Raisons

[Pourquoi cette solution est la meilleure]
[Quels critères ont guidé le choix]

## Alternatives considérées

### Alternative 1: [Nom]

- **Avantages:** [...]
- **Inconvénients:** [...]
- **Pourquoi rejetée:** [...]

### Alternative 2: [Nom]

- **Avantages:** [...]
- **Inconvénients:** [...]
- **Pourquoi rejetée:** [...]

## Conséquences

### Positives

- [Bénéfice 1]
- [Bénéfice 2]

### Négatives

- [Trade-off 1]
- [Trade-off 2]

### Risques

- [Risque potentiel et mitigation]

## Validation

[Comment vérifier que la décision est correcte]
[Métriques de succès]

## Réexamen

[Conditions observables qui déclenchent une relecture de cette décision]
[ex: rouvrir si plus de 1% des requêtes dépassent 500ms sur 7 jours]

## Liens

- Issue GitHub: #XX
- Documentation: [lien]
- Code concerné: `src/...`

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
