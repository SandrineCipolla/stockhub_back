DDD / architecture hexagonale
La découpe est propre, ton code est bien pensé, comme on l'avait vu ensemble tu es sur un domaine qui reste très
restreint en termes de complexité et il te manque donc les classiques : services métier qui contiennent le code métier a
proprement parler, vues (interfaces de dialogues entre les domaines), adapters (pour faire correspondre les objets entre
les domaines métier), etc... Mais bon, en l'état actuel des choses et sur un périmètre restreint, tu fais un sans-fautes
et c'est propre !

Tests
Les tests sont écrits, c'est bien ! Par contre, réfléchis à la pertinence du test sur les entités et les value-objects :
quel est l'intérêt de "bind" ou "documenter" le comportement des entités et value objects via des tests ? Je suis
toujours partagé sur ces cas-là, car il s'agit pour moi de choses qui sont soumises à modifications, à moins que tu sois
sûre à 100% que ton domaine ne bougera plus. En revanche, un énorme bon point pour les tests du service, qui te font à
la fois la définition de ton interface, et ton test d'intégration, c'est ça qui te permet de faire du refactoring sans
craindre quoi que ce soit ! De la même manière, les tests de route sont parfaits pour définir ton contrat, ce qui
garantit ta stabilité pour l'extérieur en cas de refactoring du back-end, et te permet de tout changer en interne sans
rien craindre. Avec un peu d'expérience, tu dois pouvoir arriver à 100% de couverture de code en tapant uniquement dans
les routes, d'ailleurs ;)

Je reste un peu plus circonspect sur les tests contrôleurs, qui sont encapsulés par les tests de route, mais bon,
pourquoi pas si tu veux aller taper un point plus précis...

De la même manière, les tests de BDD sont intéressants principalement pour de la non-régression, mais si tu souhaites
changer de technologie (parce que prisma ne t'aurait finalement pas convaincue), tu as des tests qui sont hyper
dépendants de la base, et donc il faudra faire la modification de base de données en double (une fois pour l'ORM, une
fois pour les tests)

Sécurité
OWASP Top 10 : close enough 🎉

Utilisation d'un middleware d'auth => check

Utilisation d'un provider d'auth/authn => check

Aucun PWD dans le repo => check

La seule chose que je ne vois pas (y compris dans ta CI, mais je l'ai peut-être raté), c'est un check automatique des
dépendances datées. Ca se fait très bien avec npm, il y a une commande à lancer (npm outdated) qui te donne les infos
sans avoir besoin de le chercher toi-même.

Auth/authn
Bon, je le sais, tu le sais, on le sait : il manque clairement la couche authorizations. Le user de niveau 0 à accès à
tout, il n'y a pas plus de gestion. C'est dommage pour tester cette gestion plus fine des droits, je pense qu'il y a
quelque chose que tu n'as donc pas pu expérimenter/démontrer dans ce projet. Dommage, pas dramatique.

L'authentification est propre, comme évoquée plus tôt.

BDD
Honnêtement, rien à dire. Ton schéma est propre, bien ficelé, tu utilises un ORM, c'est simple, clair, lisible, limpide.
Tu as fait des repo, ce qui est un choix technique valable.

Formats, stratégie, documentation
Tu as clairement opté pour du REST, ce qui est pertinent sur une appli qui est un CRUD glorifié (ce n'est pas péjoratif
de mon point de vue, juste un constat, il y a peu de règles de gestion).

Le choix de la V2 pour tes routes est cohérent avec une stratégie de montée de version progressive et l'intégration qui
est bien faite dans ton front... enfin, c'est ce que j'aurais aimé te dire, si la V1 n'avait pas disparu le jour même de
l'apparition de la V2 ;) L'idée d'une V2 c'est de permettre aux consommateurs externes de pouvoir update leur
consommation sans perdre en fonctionnalité, et en l'occurence, puisqu'il s'agit (autant que j'arrive à le comprendre)
surtout d'un refacto avec ajout de nouvelles features, la présence d'une V2 n'a pas forcément de sens dans la signature
de ton application. Tu peux très bien avoir une version 14 d'une API qui utilise toujours une seule version de routes si
tant est que tu ne modifies pas les signatures des routes existantes !

Par ailleurs, je constates que tu es sur un GitHub flow, ce qui est ok, notamment avec l'usage de ChatGPT comme
relecteur de PR.

Par contre, j'avais demandé d'avoir des justifications des choix techniques en rapport avec les contraintes. Je devine
ces argumentaires en lisant ton code, mais attention car certains me semblent être des choix par défaut, parce qu'on a
toujours fait comme ça. C'est une stratégie qui marche dans les grands groupes (et je pense que tu le vois au
quotidien), mais c'est aussi ce qui fait que les grands groupes sont souvent en retard sur leur temps : "comme on a
toujours fait", c'est valable en banque où la stabilité est le critère n°1, mais ce n'est pas un argument d'autorité
dans les autres domaines de l'informatique. Standardiser une entreprise c'est une bonne chose, mais ce n'est pas parce
qu'on a toujours fait du react/des repositories/du REST/xxx qu'on n'a pas le droit de changer, sinon on n'aurait pas eu
toutes ces innovations, qui sont apparues parce qu'on avait besoin de répondre à un problème.

Ce que je critique ici, ce n'est pas de faire ces choix : s'ils sont aussi répandus, c'est qu'il répondent à beaucoup de
cas d'usage. Mais je n'ai pas pu constater ta décision en pleine conscience de "pourquoi" on faisait cela, car je n'ai
aucun argumentaire (même simple) qui explique tes choix. C'est très standard, et au moins il n'y a pas de surprise, mais
il faudra être capable de défendre ces choix le jour du RNCP, et SURTOUT quand tu seras un peu plus capée et que ça sera
ton tour de former des juniors. "Parce que c'est comme ça", ce n'est pas le genre de réponses que tu dois aimer
entendre, alors il faut te préparer à ne pas donner ce genre de réponses dès maintenant sourire

Cloud et livraison
C'est up and running sans que tu aies besoin d'intervenir, c'est super !

Par contre, il te reste des questions de stabilité sur les appels directs en http sur tes routes front (teste un F5
n'importe où qui n'est pas la racine de ton appli, tu te rendras compte du problème). Peut-être un problème de routage ?

En tout cas, ça fonctionne, c'est en ligne, je peux faire un user de test, nickel. C'est digne d'une ingénieure : ça
fonctionne, bravo pour ça !

Note
Rapide explication sur la note globale :

Tu as fait un travail qui fonctionne, dont l'ensemble paraît bien pensé, ça vaut des points. J'aurais aimé plus d'
argumentation sur le pourquoi du comment, j'ai insisté dessus pendant tout le module pour mettre en relation les
solutions techniques en face de besoins métiers (pas besoin de répliquer ta DB sur 5 continents pour une micro-appli
utilisée par toi et ta famille par exemple, ce que tu as bien fait), et autant j'arrive à voir une cohérence dans tes
choix d'implémentation, autant je n'ai pas la preuve que tu y as réfléchi, car il s'agit autant de stratégies "standard"
que de stratégies "pertinentes dans ton cas d'usage", et je ne peux pas savoir où tu en es.

Tu as une bonne maîtrise des concepts de base du DDD, des tests, de la sécurité, de l'ORM, de l'authentification, du
cloud.

Je te mets un 72/100 : c'est bon, propre, et déjà une très bonne note. J'aurais aimé des choix argumentés, de l'auth,
des tests plus cohérents, et une meilleure maîtrise de ta stratégie d'évolution d'API.
