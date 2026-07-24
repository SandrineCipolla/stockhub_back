# 🔧 Troubleshooting — Migrations Prisma jamais appliquées en production

> Incident rencontré et résolu le 24 juillet 2026, découvert en creusant un
> échec de test E2E côté Front (issue #66)

---

## Symptôme

`GET`/`POST /api/v2/stocks` renvoient `500 Internal Server Error` en
production, avec le message générique `"An unexpected error occurred.
Please try again later."` — aucun détail exploitable côté client.

## Diagnostic

Le message d'erreur générique ne dit rien. La vraie cause est dans
Application Insights, pas dans les logs Kudu (`az webapp log tail` ne
montre que l'historique de déploiement Kudu, pas les exceptions
applicatives) :

```bash
az extension add --name application-insights --yes

az monitor app-insights query \
  --app <app-insights-app-id> \
  --analytics-query "exceptions | where timestamp > ago(30m) | order by timestamp desc | project timestamp, problemId, outerMessage | take 5"
```

`<app-insights-app-id>` se trouve dans `az webapp log show --name stockhub-back --resource-group StockHubApp-resources` → tag caché
`hidden-link: /app-insights-resource-id`.

Résultat obtenu :

```
PrismaClientKnownRequestError at Sl.handleRequestError
Invalid `prisma.stock.create()` invocation:
The column `stockhub.items.note` does not exist in the current database.
```

## Cause racine (process, pas juste une colonne manquante)

`npx prisma migrate deploy` n'existe que dans le job
`continuous-integration` de `.github/workflows/main_stockhub-back.yml`,
exécuté contre la base MySQL **éphémère** du sidecar CI (créée puis
détruite à chaque run). **Aucune étape** des jobs `build-and-deploy` ou
`deploy-to-staging` n'applique les migrations aux vraies bases. Elles
doivent donc être appliquées **manuellement** après chaque merge qui
touche `prisma/schema.prisma` — étape facile à oublier, sans aucun
garde-fou. Résultat : 6 migrations en attente depuis fin mars 2026
(`20260327000000_add_ai_suggestions_cache` → `20260721150000_add_item_note`)
avant d'être détectées par ce test E2E frontend.

## Fix

```bash
# Récupérer la connection string réelle depuis l'App Service plutôt que
# de la deviner localement — évite de cibler la mauvaise base.
DATABASE_URL=$(az webapp config appsettings list \
  --name stockhub-back --resource-group StockHubApp-resources \
  --query "[?name=='DATABASE_URL'].value | [0]" -o tsv) \
  npx prisma migrate deploy
```

Vérifier ensuite qu'il n'y a plus d'exception récente (même requête
`app-insights query` que ci-dessus) et qu'un vrai appel API répond
correctement (`401` sur un token invalide, pas `500`).

⚠️ **Ne jamais imprimer `DATABASE_URL` en clair** — c'est une chaîne de
connexion avec mot de passe. La récupérer dans une variable shell et
l'utiliser directement, sans `echo`.

## Non résolu — à trancher dans une session dédiée

Le gap de process reste ouvert. Options pour la suite :

- Automatiser `prisma migrate deploy` dans `build-and-deploy`, avant le zip
  deploy — risque : une migration destructive (drop column, etc.) partirait
  sans revue humaine
- Étape manuelle mais avec un rappel explicite (checklist post-merge,
  commentaire automatique sur la PR si `prisma/migrations/` a changé)
- Un job séparé `workflow_dispatch` dédié aux migrations, déclenché
  volontairement après vérification du diff de schéma

## Prévention à court terme

Après tout merge touchant `prisma/schema.prisma` ou `prisma/migrations/`,
vérifier manuellement l'état de la prod :

```bash
DATABASE_URL=$(az webapp config appsettings list --name stockhub-back --resource-group StockHubApp-resources --query "[?name=='DATABASE_URL'].value | [0]" -o tsv) npx prisma migrate status
```
