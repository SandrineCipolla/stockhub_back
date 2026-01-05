-- ============================================================================
-- Ajouter les colonnes manquantes à la table stocks
-- Pour que le Frontend V2 puisse afficher les stocks
-- ============================================================================

-- Ajouter les colonnes (ignorer les erreurs si elles existent déjà)
-- Note: MySQL n'a pas de "IF NOT EXISTS" pour ADD COLUMN
ALTER TABLE stocks
ADD COLUMN quantity INT DEFAULT 0,
ADD COLUMN `value` DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN unit VARCHAR(50) DEFAULT 'piece',
ADD COLUMN status VARCHAR(50) DEFAULT 'optimal',
ADD COLUMN lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Mettre à jour les stocks avec des valeurs réalistes
UPDATE stocks
SET
    quantity = FLOOR(10 + RAND() * 90),  -- Entre 10 et 100
    `value` = ROUND(5 + RAND() * 45, 2),  -- Entre 5€ et 50€
    unit = 'piece',
    status = CASE
        WHEN RAND() > 0.8 THEN 'low'
        WHEN RAND() > 0.95 THEN 'critical'
        ELSE 'optimal'
    END,
    lastUpdate = NOW()
WHERE quantity IS NULL OR quantity = 0;

-- Vérifier les résultats
SELECT
    ID,
    LABEL,
    CATEGORY,
    quantity,
    `value`,
    unit,
    status,
    lastUpdate
FROM stocks
WHERE USER_ID = (SELECT ID FROM users WHERE EMAIL = 'sandrine.cipolla@gmail.com' LIMIT 1)
ORDER BY CATEGORY, LABEL
LIMIT 15;