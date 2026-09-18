Instructions projet backend
Introduction générale
Bienvenue dans l’atelier final de votre module back-end : pendant trois jours, vous allez réinvestir l’ensemble des
compétences acquises lors de ces neuf séances pour aller plus loin dans votre projet personnel. Ce travail vous
permettra de renforcer votre posture professionnelle, de relier besoins métier et solutions techniques, et de produire
un module concret prêt à enrichir votre portfolio.
Objectif global : (Re)créer ou enrichir un module autonome de votre projet personnel, en explicitant vos besoins métier
et en mettant en oeuvre une réponse technique professionnelle, robuste, sécurisée et documentée.
Ce qui est attendu :
•
Une identification claire du besoin métier : écrire en introduction ce que doit permettre le module, pourquoi il est
utile, pour qui et dans quel contexte (aspect DDD).
•
Un choix et une réalisation technique cohérente : chaque techno, pattern ou mesure de sécurité retenu doit être justifié
au regard de vos besoins (le back-end DOIT répondre aux cas d'usage métier).
•
La mise en pratique, de façon visible, de toutes les notions abordées lors des cours :
o
Architecture et numérique responsable
o
Développement TDD/agilité
o
Sécurité (disponibilité, résilience, accès, data)
o
Authentification/autorisation
o
Base de données, droits et modélisation
o
ORM / migrations / performance
o
Design et sécurisation d’API
o
Culture tech (PR vs trunk-based, refactoring, performance)
o
Exploitation cloud
•
Une capacité à relier explicitement chaque choix technique à un besoin métier ou contexte d’usage (corrélation).
Contexte : Ce n’est pas un simple exercice technique ou de restitution académique : il s’agit de démontrer que vous
savez penser :
•
"Quel est mon problème métier ?"
•
"Quelles solutions techniques dois-je prioriser ?"
•
"Pourquoi ce choix plutôt qu’un autre ?"
Chacune travaille individuellement, sur la base de son projet personnel existant (projet RNCP, projet pro, ou projet
fictif si besoin dont je peux fournir des idées), pour garantir la pertinence et l’ancrage des réalisations.
Au menu de ces 3 jours :
•
Définir ou reformuler clairement votre besoin métier (en quelques lignes structurées, validées avec le formateur ou en
peer review rapide)
•
Construire, refaire ou refondre un module technique clé, en documentant vos décisions à chaque étape
•
Mettre en avant, à chaque fois qu’une notion du cours est mobilisée, le lien entre besoin business, choix
d’architecture, compromis et résultat
•
(Si possible) Documenter le tout clairement
•
Livrer un module que vous pourrez présenter ou déployer concrètement, par exemple en cloud.
Vous avez droit à toutes les ressources du cours, à l’entraide entre pairs, à l’usage ponctuel de l’IA ou de
l’autocomplétion, aux questions/réponses avec le formateur – mais votre démarche métier/technique doit rester lisible,
personnelle et argumentée.
Guide pour ne rien oublier
Avant de commencer :
•
Relisez la consigne : vérifiez que votre objectif métier est clair (utilité, public cible, valeur ajoutée attendue).
•
Listez vos besoins métiers et les fonctionnalités attendues du module.
•
Pensez à l’échelle métier et technique : pas besoin de tout couvrir, mais il faut que la solution soit cohérente,
réaliste et argumentée.
Plan d’action :
•
Formulez le besoin métier : un ou deux paragraphes maximum pour présenter le problème à résoudre et la cible
utilisateur.
•
Découpez votre module en fonctionnalités métiers ou techniques (ex : gestion des droits, reporting, workflow, etc.)
Astuce : pensez à la simplicité (KISS), n'implémentez que ce qui est justifié.
Pour chaque fonctionnalité :
•
Donnez le(s) cas d’usage précis (scénarios réels).
•
Justifiez les choix techniques : pourquoi tel contrôleur, tel design pattern, tel type de sécurité ou de stockage ?
•
Séparez clairement la logique métier (DDD) de l’implémentation technique.
Mettez en place vos outils et méthodes agiles :
•
Rédigez au moins deux ou trois tests unitaires (cycle TDD) sur les cas critiques, en pensant à bien séparer le code
métier du code de dépendance (votre contrôleur appelle le service de DB et le service métier pour éviter d'avoir à mock
la BDD).
•
Utilisez un gestionnaire de code source : git, branches, commits propres.
•
Signez vos commits, ouvrez une mini-PR (même en solo, pour l’auto-review !) si vous choisissez le modèle GitHubFlow.
Sécurité et performance :
•
Protégez les accès (gestion des rôles, droits minimalistes, authentification contrôlée). Vous pouvez par ailleurs
prévoir d'utiliser l'AD Azure (Azure Entra ou AD B2C) !
•
Prévoyez des logs et, si possible, des métriques pour le monitoring.
•
Montrez où et comment vous évitez les problèmes de performance (requêtes, caches, async).
Base de données et ORM :
•
Modélisez proprement : tables, relations, contraintes.
•
Documentez les migrations et la gestion des versions du schéma (éviter N+1, utiliser les outils ORM efficacement).
API et documentation :
•
Exposez vos endpoints principaux (OpenAPI ou équivalent) avec exemples d’appels.
•
Précisez les contrats (inputs/outputs, pagination, filtrage, gestion des erreurs, API sécurisée).
Cloud et déploiement :
•
Préparez au moins une stratégie de déploiement (même fictive) et une option de monitoring sur un cloud grand public (
Azure conseillé puisque vous avez vos comptes, free tier possible).
•
Expliquez en quoi votre architecture prévue assure disponibilité & redondance (même de façon simple).
Documentation finale :
•
Rédigez une documentation propre au contexte métier (un schéma MCD est une bonne idée, en Merise ou en UML, ou d'autres
schémas si vous sentez que vos use cases nécessitent d'aller plus loin).
•
Ajoutez, à chaque grosse décision technique, une ligne de justification (liée au besoin métier ou technique évoqué en
début de fiche).
Astuces pour optimiser votre temps
•
Démarrez petit : Visez un MVP (Minimum Viable Product) qui marche. Ne complexifiez que si c’est vraiment utile.
•
Soyez explicite : Affichez clairement vos hypothèses et limites. Il vaut mieux un module simple mais bien justifié et
documenté qu'un code compliqué bâclé.
•
Automatisez là où c'est possible : Utilisez les scripts d’initialisation, générez la doc (Swagger, ORM), exploitez les
modèles d’app cloud pour déployer vite.
•
Testez au fur et à mesure plutôt qu'à la fin, pour gagner du temps sur le debug.
•
Demandez de l’aide rapidement : Si vous êtes bloquée plus de 20 minutes, exposez votre problème à une camarade ou au
formateur.
•
Lisez vos logs/erreurs avec attention : Ne cherchez pas 2 heures sans diagnostiquer ni réessayer.
•
Conservez des traces régulières de vos avancées : Notes, commits, captures d’écran pour justifier et expliquer vos
choix (utile en rendu et pour la soutenance RNCP à terme).
•
Reliez toujours vos choix techniques au besoin métier : Chaque fois que vous hésitez, revenez à votre cas d'usage
initial.
Points de vigilance
•
N’ajoutez pas de "features inutiles" : Tout ce qui n’apporte pas de valeur métier claire est à proscrire.
•
Ne sous-estimez pas la sécurité : Défaut d’authentification, droits trop larges, accès non protégés… sont des fautes
professionnelles. Ce projet est l'occasion de travailler votre posture d'ingénierie.
•
Ne délaissez pas la documentation : Prévoyez 10–15% du temps le dernier jour pour relire, corriger et rendre vos docs,
mais pensez surtout à tout documenter du début à la fin !
•
Attention à la cohérence globale : Justifiez chaque “pivot”, chaque mise à l’échelle, chaque raccourci technique. Mieux
vaut moins, mais bien fait et argumenté
Checklist de rendu du module
•

1. Introduction claire et structurée :
   o
   Besoins métier explicités : utilité, public cible, valeur ajoutée attendue
   o
   Périmètre fonctionnel précis (ce que couvre le module, ce qui n’est pas géré)
   •
2. Liste des fonctionnalités avec cas d’usage réels et justification métier pour chaque élément
   •
3. Choix techniques argumentés pour chaque fonctionnalité :
   o
   Design pattern et architecture (projection DDD, découpage, etc.)
   o
   Sécurité (auth, droits, confidentialité)
   o
   Performance (requêtes, caches, async…)
   o
   Adéquation choix technique / besoin métier
   •
4. Qualité du code :
   o
   Découpage lisible, code commenté si nécessaire (jamais redondant)
   o
   Commits propres et réguliers (avec explications), PR ou revue même en solo le cas échéant
   o
   Respect des bonnes pratiques clean code / KISS
   •
5. Prise en compte de l'agilité et des tests :
   o
   Tests unitaires et (si pertinent) tests d’intégration sur les points critiques
   o
   Cycle TDD visible sur au moins une fonctionnalité clé (test, code, refacto)
   •
6. Base de données et ORM :
   o
   Modélisation claire (schéma MCD ou UML selon besoin)
   o
   Migrations documentées, gestion des versions, justification des choix anti N+1
   o
   Gestion des droits, utilisateurs et rôles au niveau base
   •
7. API et documentation :
   o
   Contrats d’API documentés (ex : OpenAPI/Swagger)
   o
   Exemples d'appels, gestion des erreurs, pagination et filtrage si pertinent
   o
   Sécurisation des endpoints
   •
8. Cloud et déploiement :
   o
   Stratégie claire et (si possible) réalisation/test de déploiement sur Azure
   o
   Justification sur la disponibilité & redondance même simple
   o
   Monitoring/logging, même basique
   •
9. Documentation finale propre :
   o
   README métier & tech à jour
   o
   Schémas (BDD, architecture, user flows…)
   o
   Justification courte pour chaque grosse décision technique (liée au besoin métier)
   •
10. Respect des ASTUCES & POINTS DE VIGILANCE :
    o
    MVP d’abord, automatisation et tests, documentation au fil de l’eau
    o
    Explicitation des choix, pas de "code zombie", respect du temps imparti
    Exemple de planning sur 3 jours
    •
    Jour 1 :
    o
    Matin : Reformulation du besoin métier, découpage en fonctionnalités, validation avec le formateur
    o
    Début de la modélisation (BDD, schémas, use cases)
    o
    Après-midi : Premier prototype (MVP), mise en place du repo, choix du workflow git, premiers tests unitaires sur le
    coeur métier
    •
    Jour 2 :
    o
    Développement progressif des fonctionnalités principales : itérations courtes, TDD/agilité, commits réguliers
    o
    Montée en sécurité, droits, première documentation API (Swagger…)
    o
    Tests de performance (requêtes, ORM), ajout de logs et monitoring de base
    o
    Fin de journée : Démonstration interne ou peer review, détection des points bloquants
    •
    Jour 3 :
    o
    Matin : Finalisation Cloud/déploiement, ajustements sécurité et performance
    o
    Poussée finale sur la documentation, schémas (BDD, archi, user flows)
    o
    Après-midi : Révision globale, relecture sur les objectifs initiaux (checklist à la main), corrections de dernière
    minute
    o
    Rendu final et préparation de la soutenance orale/démonstration
