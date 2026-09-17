# Matériel pour le mémoire RNCP

Ce dossier rassemble, par bloc de compétence, les études de cas de ce repo qui valent d'être citées dans le mémoire RNCP7 (EADL, Ingétis). Référentiel complet : `referentiel-eadl-ingetis.md` dans le Second Brain.

## Différence avec le reste de `docs/`

Le reste de la documentation du projet est vivant : elle doit rester exacte à tout instant, donc elle pointe vers le code plutôt que de le recopier (voir `docs/technical/guide-redaction.md`). Ce dossier est différent : le mémoire, une fois rédigé, est un livrable figé. Les fichiers ici sont des instantanés datés, sur le même principe que `docs/sessions/`.

Chaque fichier contient des pointeurs annotés vers le matériel source (ADR, incidents, PR), avec la compétence visée et l'angle à développer. La rédaction finale (voix, mise en forme, contraintes RNCP) reste à faire ailleurs.

## Template

Nouveau fichier de bloc : copier `TEMPLATE.md`.

## Fichiers

| Fichier                          | Blocs couverts                                                                  | Statut |
| -------------------------------- | ------------------------------------------------------------------------------- | ------ |
| `C2-conception-developpement.md` | C2.1 (architecture), C2.4 (back-end, OWASP/RGPD)                                | Créé   |
| `C3-mise-en-production.md`       | C3.1 (intégration continue), C3.2 (tests), C3.3 (surveillance des mises à jour) | Créé   |

Bloc 1 (C1.2, veille technologique) vit dans le Second Brain (`stockhub-veille.md`). Bloc 4 (pilotage d'équipe) ne s'applique pas à ce projet solo.
