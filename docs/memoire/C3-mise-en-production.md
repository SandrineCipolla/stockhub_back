# Bloc 3 : Piloter la mise en production et son évolution

Voir `INDEX.md` de ce dossier pour le principe de ce fichier.

## C3.3 Surveiller les automatisations de mise à jour

**Cas** : lot de 10 PR Dependabot accumulées, mergées en un batch groupé plutôt qu'une par une.

**Source** : [docs/security/SECURITY-VULNERABILITIES.md](../security/SECURITY-VULNERABILITIES.md), section "Lot de septembre 2026". PR [#272](https://github.com/SandrineCipolla/stockhub_back/pull/272) et [#273](https://github.com/SandrineCipolla/stockhub_back/pull/273).

**Angle pour le mémoire** : le diagnostic (merger 10 PR une par une aurait déclenché 10 cycles de rebase/CI en cascade côté Dependabot), la décision d'y répondre par un batch groupé sur une branche dédiée, et la vérification (`npm audit`, tests, lint, build) avant de merger. Démontre une surveillance active du backlog de sécurité.

**Chiffres à jour à vérifier avant citation** : 35 → 7 vulnérabilités le 17 septembre 2026. Relancer `npm audit` dans `stockhub_back` avant de citer ce chiffre dans le mémoire : il aura changé.

## C3.1 Piloter l'intégration continue

**Cas** : séparation du workflow `Security Audit` du workflow CI principal, pour un badge dédié et une détection hebdomadaire (cron) des vulnérabilités publiées sur des dépendances déjà installées.

**Source** : [docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md](../ci-cd/SECURITY-AUDIT-WORKFLOW.md).

**Angle pour le mémoire** : décision d'architecture CI argumentée, avec un avant/après et des avantages/inconvénients pesés explicitement. Le point fort à citer : le déclencheur `schedule` (cron hebdomadaire) répond à un besoin spécifique, détecter une vulnérabilité publiée après coup sur une dépendance qui n'a pas bougé, ce qu'un déclencheur `push`/`pull_request` seul ne couvre pas.

**Point de vigilance si cité tel quel** : ce fichier documente un état de janvier 2026 partiellement daté (Node 20 dans le workflow alors que le projet est passé à Node 22 depuis, déclencheur sur une branche `develop` qui n'existe pas dans ce repo). À corriger ou à mentionner comme écart connu si le jury pose la question.

## C3.2 Organiser le plan de tests itératifs (incluant sécurité)

**Cas** : l'incident qs (CVE-2025-01, janvier 2026) documente le cycle complet détection → analyse → fix → vérification avant/après, avec le step CI qui bloque le merge tant que la vulnérabilité n'est pas résolue.

**Source** : [docs/security/SECURITY-VULNERABILITIES.md](../security/SECURITY-VULNERABILITIES.md), section "CVE-2025-01".

**Angle pour le mémoire** : bon exemple isolé et complet (un seul incident, tout le cycle documenté) plutôt que le lot de septembre (plus large mais moins détaillé par vulnérabilité individuelle). Les deux se complètent : celui-ci pour montrer la méthode sur un cas simple, celui de septembre pour montrer la gestion à l'échelle d'un vrai backlog accumulé.
