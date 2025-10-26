# =====================================================
# Script PowerShell pour arrêter MySQL StockHub
# Usage: Clic droit → Exécuter avec PowerShell
# =====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ARRET MYSQL STOCKHUB" -ForegroundColor Cyan
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
Write-Host "[INFO] Arrêt du serveur MySQL..." -ForegroundColor Yellow
Write-Host "[INFO] Serveur : stockhub-database-mysql-restored" -ForegroundColor Gray
Write-Host "[INFO] Coût pendant l'arrêt : presque 0€/jour" -ForegroundColor Gray
Write-Host ""

az mysql flexible-server stop --resource-group StockHubApp-resources --name stockhub-database-mysql-restored

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] Echec de l'arrêt MySQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   MYSQL ARRETE AVEC SUCCES !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[OK] Serveur MySQL arrêté" -ForegroundColor Green
Write-Host "[OK] Vos données sont conservées" -ForegroundColor Green
Write-Host "[OK] Économie : ~0.50€/jour (~15€/mois)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour redémarrer :" -ForegroundColor Cyan
Write-Host "  Clic droit sur start_mysql.ps1 → Exécuter avec PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
