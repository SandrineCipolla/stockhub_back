# =====================================================
# Script PowerShell pour démarrer MySQL StockHub
# Usage: Clic droit → Exécuter avec PowerShell
# =====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE MYSQL STOCKHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérification connexion Azure
Write-Host "[INFO] Verification de la connexion Azure..." -ForegroundColor Yellow
try {
    $account = az account show 2>$null | ConvertFrom-Json
    Write-Host "[OK] Compte Azure actif: $($account.name)" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Vous n'êtes pas connecté à Azure." -ForegroundColor Red
    Write-Host "Veuillez vous connecter avec: az login" -ForegroundColor Red
    Write-Host ""
    Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "[INFO] Démarrage du serveur MySQL..." -ForegroundColor Yellow
Write-Host "[INFO] Serveur : stockhub-database-mysql-decembre" -ForegroundColor Gray
Write-Host "[INFO] Cela peut prendre 1-2 minutes..." -ForegroundColor Gray
Write-Host ""

az mysql flexible-server start --resource-group StockHubApp-resources --name stockhub-database-mysql-decembre

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] Echec du démarrage MySQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   MYSQL DEMARRE AVEC SUCCES !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[OK] Serveur : stockhub-database-mysql-decembre" -ForegroundColor Green
Write-Host "[OK] Votre application peut maintenant se connecter" -ForegroundColor Green
Write-Host ""
Write-Host "Commandes utiles :" -ForegroundColor Gray
Write-Host "  - Lancer l'app : npm start" -ForegroundColor Gray
Write-Host "  - Arrêter MySQL : .\stop_mysql.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
