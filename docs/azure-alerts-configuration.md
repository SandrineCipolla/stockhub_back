# Configuration des Alertes Azure - StockHub

**Date** : 9 novembre 2025
**Serveur MySQL** : stockhub-database-mysql-restored
**Resource Group** : StockHubApp-resources

---

## 🔔 Objectif

Configurer des alertes pour être prévenu(e) en cas de :
1. **Problèmes de performance** MySQL (CPU, RAM, stockage)
2. **Dépassement de budget** Azure
3. **Anomalies** de coûts

---

## 📊 Partie 1 : Alertes de Métriques MySQL (Performance)

### 🎯 Alertes Recommandées

| Alerte | Seuil | Durée | Gravité |
|--------|-------|-------|---------|
| CPU élevé | > 80% | 5 min | Warning |
| Stockage plein | > 80% | 5 min | Critical |
| Connexions élevées | > 50 | 5 min | Warning |
| Mémoire élevée | > 80% | 5 min | Warning |

---

### 📍 Étape par Étape : Créer une Alerte de Métrique

#### 1️⃣ Accéder au Serveur MySQL

1. Allez sur https://portal.azure.com
2. Dans la barre de recherche en haut, tapez : **`stockhub-database-mysql-restored`**
3. Cliquez sur votre serveur MySQL dans les résultats

#### 2️⃣ Accéder aux Alertes

1. Dans le menu de gauche, cherchez la section **"Monitoring"** (Surveillance)
2. Cliquez sur **"Alerts"** (Alertes)
3. En haut, cliquez sur **"+ Create"** puis **"Alert rule"** (Créer une règle d'alerte)

#### 3️⃣ Configurer la Condition (Scope déjà défini)

Vous êtes sur la page "Create an alert rule" :

**Section 1 : Scope (Étendue)**
- ✅ Déjà configuré : `stockhub-database-mysql-restored`

**Section 2 : Condition**
1. Cliquez sur **"+ Add condition"** ou **"Select a signal"**
2. Vous verrez une liste de métriques disponibles

---

### 🔴 ALERTE 1 : CPU Élevé

#### Étape A : Sélectionner la Métrique

Dans la liste des signaux, recherchez et cliquez sur :
- **"CPU percent"** ou **"Percentage CPU"**

#### Étape B : Configurer la Logique de l'Alerte

Dans la page "Configure signal logic" :

**Alert logic** (Logique d'alerte) :
```
Operator: Greater than
Aggregation type: Average
Threshold value: 80
```

**When to evaluate** (Quand évaluer) :
```
Check every: 5 minutes
Lookback period: 5 minutes
```

**Explication** : L'alerte se déclenche si le CPU moyen dépasse 80% pendant 5 minutes.

#### Étape C : Cliquer sur **"Done"** ou **"Next: Actions"**

---

### 🟠 ALERTE 2 : Stockage Plein

#### Étape A : Répéter l'Étape 2 (Add condition)

Cliquez à nouveau sur **"+ Add condition"** pour ajouter une deuxième règle.

#### Étape B : Sélectionner la Métrique

Recherchez et cliquez sur :
- **"Storage percent"** ou **"Storage Percent"**

#### Étape C : Configurer la Logique

**Alert logic** :
```
Operator: Greater than
Aggregation type: Average
Threshold value: 80
```

**When to evaluate** :
```
Check every: 5 minutes
Lookback period: 5 minutes
```

#### Étape D : Cliquer sur **"Done"**

---

### 🟡 ALERTE 3 : Connexions Élevées

#### Étape A : Add condition

Cliquez sur **"+ Add condition"**

#### Étape B : Sélectionner la Métrique

Recherchez :
- **"Active Connections"** ou **"Total connections"**

#### Étape C : Configurer

**Alert logic** :
```
Operator: Greater than
Aggregation type: Average
Threshold value: 50
```

**When to evaluate** :
```
Check every: 5 minutes
Lookback period: 5 minutes
```

---

### 📧 Étape 4 : Configurer les Actions (Notifications)

Après avoir configuré les conditions, passez à la section **"Actions"** :

#### Option A : Créer un Nouveau Action Group

1. Cliquez sur **"+ Create action group"**
2. Remplissez le formulaire :

**Basics** (Informations de base) :
```
Subscription: Azure subscription 1
Resource group: StockHubApp-resources
Action group name: stockhub-mysql-alerts
Display name: StockHub Alerts
```

**Notifications** :
```
Notification type: Email/SMS message/Push/Voice
Name: Email Notification
Email: sandrine.cipolla@gmail.com
☐ SMS (optionnel)
☐ Push (optionnel)
```

3. Cliquez sur **"Review + create"** puis **"Create"**

#### Option B : Utiliser un Action Group Existant

Si vous avez déjà un action group :
1. Cliquez sur **"Select action groups"**
2. Choisissez dans la liste
3. Cliquez sur **"Select"**

---

### 📝 Étape 5 : Détails de l'Alerte

Remplissez les détails :

**Alert rule details** :
```
Alert rule name: MySQL-CPU-High (ou MySQL-Storage-High, etc.)
Description: Alerte quand le CPU dépasse 80% pendant 5 min
Severity: 2 - Warning (pour CPU)
          1 - Error (pour Storage)
```

**Advanced options** (optionnel) :
```
☑ Enable alert rule upon creation
☐ Automatically resolve alerts (laisser décoché pour MySQL)
```

---

### ✅ Étape 6 : Créer l'Alerte

1. Cliquez sur **"Review + create"**
2. Vérifiez les paramètres
3. Cliquez sur **"Create"**

---

## 💰 Partie 2 : Alertes de Budget (Coûts)

### 📍 Configuration d'une Alerte de Budget

#### 1️⃣ Accéder à Cost Management

1. Dans le portail Azure, cherchez **"Cost Management + Billing"** dans la barre de recherche
2. Cliquez dessus
3. Dans le menu de gauche, sous "Cost Management", cliquez sur **"Budgets"**

#### 2️⃣ Créer un Budget

1. Cliquez sur **"+ Add"** en haut
2. Remplissez le formulaire :

**Scope** (Étendue) :
```
☑ Subscription: Azure subscription 1
```

**Budget details** (Détails du budget) :
```
Name: StockHub-Monthly-Budget
Reset period: Monthly
Creation date: (laisser par défaut)
Expiration date: (laisser vide ou dans 1 an)
Amount: 25 (en euros)
```

#### 3️⃣ Configurer les Alertes de Budget

Dans la section **"Set alerts"** :

**Alerte 1 - Avertissement à 80%** :
```
Alert conditions:
  Type: Actual
  % of budget: 80

Action group: stockhub-mysql-alerts (créé précédemment)
Alert recipients (email): sandrine.cipolla@gmail.com
```

**Alerte 2 - Critique à 100%** :
```
Alert conditions:
  Type: Actual
  % of budget: 100

Action group: stockhub-mysql-alerts
Alert recipients (email): sandrine.cipolla@gmail.com
```

**Alerte 3 - Prévision à 110%** :
```
Alert conditions:
  Type: Forecasted
  % of budget: 110

Action group: stockhub-mysql-alerts
Alert recipients (email): sandrine.cipolla@gmail.com
```

#### 4️⃣ Créer le Budget

1. Cliquez sur **"Create"**
2. Attendez la confirmation

---

## 📋 Récapitulatif des Alertes Configurées

### Alertes de Métriques MySQL

| Alerte | Métrique | Seuil | Notification |
|--------|----------|-------|--------------|
| CPU High | CPU percent | > 80% | Email |
| Storage Full | Storage percent | > 80% | Email |
| Connexions | Active connections | > 50 | Email |

### Alertes de Budget

| Alerte | Type | Seuil | Notification |
|--------|------|-------|--------------|
| Budget 80% | Actual | 20€ | Email |
| Budget 100% | Actual | 25€ | Email |
| Budget Forecast | Forecasted | 27,5€ | Email |

---

## 🧪 Tester les Alertes

### Test Métrique (Optionnel)

Pour tester que les alertes fonctionnent, vous pouvez :

1. **Alerte CPU** : Exécuter une requête lourde sur MySQL
2. **Alerte Budget** : Attendre la fin du mois et vérifier si vous recevez les emails

### Vérifier la Configuration

```bash
# Via Azure CLI - Lister les alertes
az monitor metrics alert list \
  --resource-group StockHubApp-resources \
  --output table
```

---

## 📧 Format des Emails d'Alerte

Vous recevrez des emails du type :

**Objet** : `Azure Monitor alert: MySQL-CPU-High activated`

**Contenu** :
```
Alert Rule: MySQL-CPU-High
Severity: Warning
Resource: stockhub-database-mysql-restored
Metric: CPU percent
Current value: 85%
Threshold: 80%
Time: 2025-11-09 16:30:00 UTC
```

---

## 🔧 Gérer les Alertes

### Modifier une Alerte

1. Azure Portal → MySQL Server
2. Monitoring → **Alerts**
3. Cliquez sur **"Alert rules"** en haut
4. Cliquez sur l'alerte à modifier
5. Cliquez sur **"Edit"**

### Désactiver Temporairement

1. Dans la liste des alertes
2. Cliquez sur l'alerte
3. Cliquez sur **"Disable"**

### Supprimer une Alerte

1. Dans la liste des alertes
2. Sélectionnez l'alerte
3. Cliquez sur **"Delete"**

---

## 📊 Monitoring Dashboard (Bonus)

### Créer un Dashboard de Surveillance

1. Azure Portal → Dashboards
2. **"+ New dashboard"**
3. Ajoutez des tuiles :
   - **Metrics chart** pour CPU MySQL
   - **Metrics chart** pour Storage MySQL
   - **Cost analysis** pour les coûts
4. **Save** le dashboard

---

## 🎯 Recommandations

### Alertes Critiques (À Configurer Absolument)

1. ✅ **Budget mensuel** : > 25€
2. ✅ **Storage MySQL** : > 80%
3. ✅ **CPU MySQL** : > 80% pendant 5 min

### Alertes Optionnelles

1. 🔵 Connexions actives > 50
2. 🔵 Mémoire > 80%
3. 🔵 Budget forecast > 110%

---

## 📞 En Cas de Problème

### Alerte ne se déclenche pas

1. Vérifier que l'alerte est **activée** (Enabled)
2. Vérifier l'action group (email correct)
3. Vérifier les spams dans votre boîte email
4. Attendre 5-10 min (délai de propagation)

### Trop d'alertes

1. Augmenter les seuils (ex: CPU 80% → 90%)
2. Augmenter la durée (ex: 5 min → 15 min)
3. Désactiver les alertes moins critiques

---

## 📝 Checklist Post-Configuration

- [ ] Alerte CPU créée et activée
- [ ] Alerte Storage créée et activée
- [ ] Alerte Budget créée (25€/mois)
- [ ] Action Group configuré avec email
- [ ] Email de confirmation reçu d'Azure
- [ ] Test réussi (optionnel)

---

**Auteur** : Sandrine Cipolla
**Projet** : StockHub Backend
**Date** : 9 novembre 2025
**Dernière mise à jour** : 9 novembre 2025
