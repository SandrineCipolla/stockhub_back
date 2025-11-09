# Optimisation Azure Database pour MySQL - StockHub

**Date** : 9 novembre 2025
**Serveur** : stockhub-database-mysql-restored
**Resource Group** : StockHubApp-resources
**Localisation** : France Central

---

## 🚨 Problème Identifié

Lors de la restauration de la base de données MySQL en septembre 2025, Azure a automatiquement configuré des options **premium par défaut** :

### Configuration Problématique (Septembre - Novembre 2025)

```yaml
SKU: Standard_B1ms
Storage: 20 GB
Storage SKU: Premium_LRS          ⚠️ PROBLÈME
Auto Scale IOPS: Enabled          ⚠️ PROBLÈME
IOPS: 360 (variables)
```

### Impact sur les Coûts

| Élément | Coût Mensuel |
|---------|--------------|
| MySQL Compute (B1ms) | 10,05 € |
| **MySQL Storage Premium + Paid IO** | **23,75 €** ⚠️ |
| Backup | 0,50 € |
| **TOTAL** | **34,30 €/mois** |

**Problème** : Le mode "Auto Scale IOPS" facture **chaque opération d'entrée/sortie** :
- Chaque requête SQL (SELECT, INSERT, UPDATE, DELETE) → facturée
- Chaque connexion de l'application → facturée
- Chaque backup automatique → facturée

**Résultat** : 23,75€/mois juste pour le stockage au lieu de ~3€/mois !

---

## ✅ Solution Appliquée (9 Novembre 2025)

### Modification de Configuration

**Via le Portail Azure** :
1. Azure Portal → `stockhub-database-mysql-restored`
2. Settings → **Compute + storage**
3. Section Storage :
   - ❌ Décocher **"Auto scale IOPS"**
   - ✅ Cocher **"Pre-provisioned IOPS"**
   - IOPS : 360 (fixe)
4. Cliquer sur **Save**

### Nouvelle Configuration (Depuis le 9 Novembre 2025)

```yaml
SKU: Standard_B1ms
Storage: 20 GB
Storage SKU: Premium_LRS          (inchangé)
Auto Scale IOPS: Disabled         ✅ OPTIMISÉ
IOPS: 360 (fixes)
```

### Impact sur les Coûts

| Élément | Avant | Après | Économie |
|---------|-------|-------|----------|
| MySQL Compute (B1ms) | 10,05 € | 10,05 € | - |
| MySQL Storage | **23,75 €** | **~3-5 €** | **~18-20 €** |
| Backup | 0,50 € | 0,50 € | - |
| **TOTAL MYSQL** | **34,30 €** | **~13-15 €** | **~20 €/mois** |

**Économie annuelle** : ~240 €/an 💰

---

## 📊 Évolution des Coûts StockHub Azure

### Historique des Factures

| Mois | Facture Totale | MySQL | Kubernetes | Autres |
|------|----------------|-------|------------|--------|
| Août 2025 | 15 € | - | - | ~15 € |
| Septembre 2025 | 32,5 € | ~18 € | - | ~14,5 € |
| Octobre 2025 | 55 € | 34 € | ~15 € | ~6 € |
| **Novembre 2025** | **~35 €** | **~13 €** ✅ | ~15 € | ~7 € |
| **Décembre 2025** | **~15 €** | **~13 €** ✅ | **0 €** ✅ | ~2 € |

### Actions d'Optimisation

1. ✅ **9 novembre** : Désactivation autoIoScaling MySQL → **-20 €/mois**
2. ✅ **9 novembre** : Suppression cluster Kubernetes "confiance" → **-15 €/mois**
3. 🔜 **À venir** : Nettoyage Log Analytics Workspaces → **-5 €/mois**

**Objectif** : Revenir à ~15 €/mois comme en août

---

## 🔧 Configuration Technique MySQL

### Paramètres Actuels

```bash
# Vérifier la configuration via Azure CLI
az mysql flexible-server show \
  --resource-group StockHubApp-resources \
  --name stockhub-database-mysql-restored \
  --query "{Tier:sku.tier, SKU:sku.name, IOPS:storage.iops, AutoIoScaling:storage.autoIoScaling, StorageSku:storage.storageSku}"
```

**Résultat attendu** :
```json
{
  "Tier": "Burstable",
  "SKU": "Standard_B1ms",
  "IOPS": 360,
  "AutoIoScaling": "Disabled",
  "StorageSku": "Premium_LRS"
}
```

### Connexion à la Base de Données

**Connection String** (depuis l'application) :
```
Server=stockhub-database-mysql-restored.mysql.database.azure.com
Database=stockhub_db
User=<admin-user>
Password=<from-azure-keyvault-or-env>
```

### Scripts de Gestion

**Arrêter le serveur MySQL** (économise ~13 €/mois) :
```bash
az mysql flexible-server stop \
  --resource-group StockHubApp-resources \
  --name stockhub-database-mysql-restored
```

**Démarrer le serveur MySQL** :
```bash
az mysql flexible-server start \
  --resource-group StockHubApp-resources \
  --name stockhub-database-mysql-restored
```

**Vérifier l'état** :
```bash
az mysql flexible-server show \
  --resource-group StockHubApp-resources \
  --name stockhub-database-mysql-restored \
  --query "state"
```

---

## 📚 Documentation Associée

- [azure_cost_analysis.md](../azure_cost_analysis.md) - Analyse complète des coûts Azure (octobre-novembre 2025)
- [troubleshooting-prisma-azure-deployment.md](./troubleshooting-prisma-azure-deployment.md) - Guide de déploiement Prisma sur Azure
- [README.md](../README.md) - Scripts PowerShell pour démarrer/arrêter le serveur MySQL

---

## ⚠️ Leçons Apprises

### Piège à Éviter : Restauration de Base de Données

**Lors de la restauration d'une base Azure MySQL** :
- ❌ Azure configure **automatiquement** des options premium par défaut
- ❌ "Auto Scale IOPS" est activé → facturation par opération I/O
- ❌ Le coût peut exploser sans que vous le remarquiez

**Bonne pratique** :
1. ✅ Toujours vérifier la configuration après une restauration
2. ✅ Désactiver "Auto Scale IOPS" immédiatement
3. ✅ Configurer des alertes de coûts (voir section suivante)

### Cluster Arrêté ≠ Gratuit

**Pour Kubernetes AKS** :
- ❌ Même arrêté, certaines ressources coûtent de l'argent (Load Balancer, IPs, monitoring)
- ✅ Supprimer complètement si pas utilisé pendant plusieurs mois

---

## 🔔 Alertes et Monitoring (À Configurer)

### Alertes de Coûts Recommandées

1. **Alerte Budget Mensuel** : > 20 €
2. **Alerte MySQL CPU** : > 80% pendant 5 min
3. **Alerte MySQL Storage** : > 80% utilisé
4. **Alerte MySQL Connexions** : > 100 connexions actives

### Configuration des Alertes (Section suivante)

Voir la section "Configuration des Alertes Azure" pour configurer :
- Alertes de coûts via Azure Cost Management
- Alertes de métriques MySQL (CPU, RAM, connexions, stockage)
- Notifications par email

---

## 📝 Historique des Modifications

| Date | Action | Impact |
|------|--------|--------|
| 12 sept 2025 | Restauration BDD → Config Premium par défaut | +17,5 €/mois |
| 9 nov 2025 | Désactivation autoIoScaling (Pre-provisioned IOPS) | -20 €/mois |
| 9 nov 2025 | Documentation créée | - |

---

**Auteur** : Sandrine Cipolla
**Projet** : StockHub Backend
**Dernière mise à jour** : 9 novembre 2025
