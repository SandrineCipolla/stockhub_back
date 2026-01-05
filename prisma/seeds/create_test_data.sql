-- ============================================================================
-- SCRIPT DE CRÉATION DE DONNÉES DE TEST - StockHub
-- Date : 05 janvier 2026
-- Base : stockhub-database-mysql-decembre
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : CRÉATION DES UTILISATEURS
-- ============================================================================

-- Votre utilisateur principal (déjà existant normalement)
INSERT IGNORE INTO users (EMAIL) VALUES ('sandrine.cipolla@gmail.com');

-- Utilisateurs de test supplémentaires
INSERT IGNORE INTO users (EMAIL) VALUES
('alice.martin@example.com'),
('bob.dupont@example.com'),
('claire.bernard@example.com');

-- Vérification
SELECT '============================================' AS '';
SELECT '👥 UTILISATEURS CRÉÉS' AS '';
SELECT ID, EMAIL FROM users ORDER BY ID;

-- ============================================================================
-- ÉTAPE 2 : CRÉATION DES STOCKS POUR SANDRINE
-- ============================================================================

-- Récupération de l'ID de Sandrine
SET @sandrine_id = (SELECT ID FROM users WHERE EMAIL = 'sandrine.cipolla@gmail.com' LIMIT 1);

-- Stocks catégorie ALIMENTATION
INSERT INTO stocks (LABEL, DESCRIPTION, CATEGORY, USER_ID) VALUES
('Café Arabica Premium', 'Grains de café Arabica importés d''Éthiopie', 'alimentation', @sandrine_id),
('Thé Vert Bio Japonais', 'Thé vert biologique en sachet, origine Japon', 'alimentation', @sandrine_id),
('Farine Bio T65', 'Farine de blé biologique type 65 pour boulangerie', 'alimentation', @sandrine_id),
('Huile d''Olive Extra Vierge', 'Huile d''olive première pression à froid, Provence', 'alimentation', @sandrine_id),
('Pâtes Italiennes Artisanales', 'Pâtes de blé dur, séchage lent 24h', 'alimentation', @sandrine_id);

-- Stocks catégorie HYGIENE
INSERT INTO stocks (LABEL, DESCRIPTION, CATEGORY, USER_ID) VALUES
('Savon Liquide Mains', 'Savon liquide antibactérien pour les mains', 'hygiene', @sandrine_id),
('Gel Hydroalcoolique', 'Solution hydroalcoolique virucide 70% alcool', 'hygiene', @sandrine_id),
('Papier Toilette Recyclé', 'Papier toilette 3 plis 100% recyclé', 'hygiene', @sandrine_id),
('Shampooing Naturel', 'Shampooing sans sulfates, tous types de cheveux', 'hygiene', @sandrine_id);

-- Stocks catégorie ARTISTIQUE
INSERT INTO stocks (LABEL, DESCRIPTION, CATEGORY, USER_ID) VALUES
('Peinture Acrylique', 'Tubes de peinture acrylique haute qualité', 'artistique', @sandrine_id),
('Pinceaux Professionnels', 'Set de pinceaux pour peinture (synthétiques et naturels)', 'artistique', @sandrine_id),
('Toiles à Peindre', 'Toiles sur châssis en coton, apprêtées gesso', 'artistique', @sandrine_id),
('Crayons de Couleur', 'Boîte de 48 crayons de couleur aquarellables', 'artistique', @sandrine_id),
('Papier Aquarelle', 'Papier aquarelle grain fin 300g/m²', 'artistique', @sandrine_id);

-- Vérification
SELECT '' AS '';
SELECT '============================================' AS '';
SELECT '📦 STOCKS CRÉÉS POUR SANDRINE' AS '';
SELECT ID, LABEL, CATEGORY, DESCRIPTION FROM stocks WHERE USER_ID = @sandrine_id ORDER BY CATEGORY, LABEL;

-- ============================================================================
-- ÉTAPE 3 : CRÉATION DES ITEMS POUR CHAQUE STOCK
-- ============================================================================

-- Items pour Café Arabica Premium
SET @stock_cafe = (SELECT ID FROM stocks WHERE LABEL = 'Café Arabica Premium' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Café Arabica 1kg', 'Sachet de 1kg de grains entiers', 45, 10, @stock_cafe),
('Café Arabica 500g', 'Sachet de 500g de grains entiers', 28, 5, @stock_cafe),
('Café Arabica Moulu 250g', 'Sachet de 250g café moulu', 15, 5, @stock_cafe);

-- Items pour Thé Vert Bio Japonais
SET @stock_the = (SELECT ID FROM stocks WHERE LABEL = 'Thé Vert Bio Japonais' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Thé Vert 25 sachets', 'Boîte de 25 sachets individuels', 35, 8, @stock_the),
('Thé Vert 50 sachets', 'Boîte de 50 sachets individuels', 20, 5, @stock_the),
('Thé Vert en vrac 100g', 'Sachet de thé en vrac 100g', 12, 3, @stock_the);

-- Items pour Farine Bio T65
SET @stock_farine = (SELECT ID FROM stocks WHERE LABEL = 'Farine Bio T65' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Farine Bio 1kg', 'Sachet de 1kg', 50, 15, @stock_farine),
('Farine Bio 5kg', 'Sachet de 5kg', 18, 5, @stock_farine),
('Farine Bio 25kg', 'Sac de 25kg professionnel', 6, 2, @stock_farine);

-- Items pour Huile d'Olive Extra Vierge
SET @stock_huile = (SELECT ID FROM stocks WHERE LABEL = 'Huile d''Olive Extra Vierge' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Huile d''Olive 250ml', 'Bouteille de 250ml', 32, 10, @stock_huile),
('Huile d''Olive 500ml', 'Bouteille de 500ml', 25, 8, @stock_huile),
('Huile d''Olive 1L', 'Bouteille de 1L', 15, 5, @stock_huile);

-- Items pour Pâtes Italiennes Artisanales
SET @stock_pates = (SELECT ID FROM stocks WHERE LABEL = 'Pâtes Italiennes Artisanales' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Spaghetti 500g', 'Paquet de spaghetti 500g', 40, 12, @stock_pates),
('Penne 500g', 'Paquet de penne rigate 500g', 35, 10, @stock_pates),
('Fusilli 500g', 'Paquet de fusilli 500g', 28, 8, @stock_pates);

-- Items pour Savon Liquide Mains
SET @stock_savon = (SELECT ID FROM stocks WHERE LABEL = 'Savon Liquide Mains' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Savon Liquide 250ml', 'Flacon pompe de 250ml', 55, 15, @stock_savon),
('Savon Liquide 500ml', 'Flacon pompe de 500ml', 30, 10, @stock_savon),
('Savon Liquide 1L Recharge', 'Recharge de 1L', 18, 5, @stock_savon);

-- Items pour Gel Hydroalcoolique
SET @stock_gel = (SELECT ID FROM stocks WHERE LABEL = 'Gel Hydroalcoolique' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Gel Hydro 100ml', 'Flacon de poche 100ml', 75, 20, @stock_gel),
('Gel Hydro 500ml', 'Flacon pompe de 500ml', 40, 10, @stock_gel),
('Gel Hydro 5L', 'Bidon de 5L professionnel', 8, 2, @stock_gel);

-- Items pour Papier Toilette Recyclé
SET @stock_papier = (SELECT ID FROM stocks WHERE LABEL = 'Papier Toilette Recyclé' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Papier Toilette x4', 'Pack de 4 rouleaux', 45, 10, @stock_papier),
('Papier Toilette x12', 'Pack de 12 rouleaux', 22, 5, @stock_papier),
('Papier Toilette x24', 'Pack de 24 rouleaux économique', 10, 3, @stock_papier);

-- Items pour Shampooing Naturel
SET @stock_shampooing = (SELECT ID FROM stocks WHERE LABEL = 'Shampooing Naturel' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Shampooing 250ml', 'Flacon de 250ml', 42, 12, @stock_shampooing),
('Shampooing 500ml', 'Flacon de 500ml', 28, 8, @stock_shampooing),
('Shampooing 1L Format Famille', 'Flacon pompe 1L', 15, 4, @stock_shampooing);

-- Items pour Peinture Acrylique
SET @stock_peinture = (SELECT ID FROM stocks WHERE LABEL = 'Peinture Acrylique' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Peinture Acrylique 75ml', 'Tube de 75ml couleurs assorties', 60, 15, @stock_peinture),
('Peinture Acrylique 200ml', 'Tube de 200ml couleurs assorties', 35, 10, @stock_peinture),
('Peinture Acrylique 500ml', 'Pot de 500ml couleurs primaires', 20, 5, @stock_peinture);

-- Items pour Pinceaux Professionnels
SET @stock_pinceaux = (SELECT ID FROM stocks WHERE LABEL = 'Pinceaux Professionnels' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Set 5 pinceaux débutant', 'Set de 5 pinceaux synthétiques', 28, 8, @stock_pinceaux),
('Set 10 pinceaux standard', 'Set de 10 pinceaux assortis', 18, 5, @stock_pinceaux),
('Set 15 pinceaux pro', 'Set de 15 pinceaux professionnels', 10, 3, @stock_pinceaux);

-- Items pour Toiles à Peindre
SET @stock_toiles = (SELECT ID FROM stocks WHERE LABEL = 'Toiles à Peindre' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Toile 30x40cm', 'Toile sur châssis entoilé', 25, 6, @stock_toiles),
('Toile 50x70cm', 'Toile sur châssis entoilé', 15, 4, @stock_toiles),
('Toile 80x100cm', 'Toile sur châssis entoilé grand format', 8, 2, @stock_toiles);

-- Items pour Crayons de Couleur
SET @stock_crayons = (SELECT ID FROM stocks WHERE LABEL = 'Crayons de Couleur' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Boîte 12 crayons', 'Boîte de 12 crayons couleurs classiques', 50, 15, @stock_crayons),
('Boîte 24 crayons', 'Boîte de 24 crayons couleurs variées', 32, 10, @stock_crayons),
('Boîte 48 crayons', 'Boîte de 48 crayons aquarellables', 18, 5, @stock_crayons);

-- Items pour Papier Aquarelle
SET @stock_papier_aqua = (SELECT ID FROM stocks WHERE LABEL = 'Papier Aquarelle' AND USER_ID = @sandrine_id LIMIT 1);
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, MINIMUM_STOCK, STOCK_ID) VALUES
('Bloc A4 20 feuilles', 'Bloc aquarelle A4 grain fin', 30, 10, @stock_papier_aqua),
('Bloc A3 20 feuilles', 'Bloc aquarelle A3 grain fin', 20, 6, @stock_papier_aqua),
('Feuilles 50x70cm x10', 'Paquet de 10 feuilles grand format', 12, 3, @stock_papier_aqua);

-- ============================================================================
-- ÉTAPE 4 : CRÉATION DE STOCKS POUR D'AUTRES UTILISATEURS
-- ============================================================================

-- Stocks pour Alice
SET @alice_id = (SELECT ID FROM users WHERE EMAIL = 'alice.martin@example.com' LIMIT 1);
INSERT INTO stocks (LABEL, DESCRIPTION, CATEGORY, USER_ID) VALUES
('Chocolat Noir 70%', 'Tablettes de chocolat noir bio', 'alimentation', @alice_id),
('Lessive Écologique', 'Lessive liquide écologique 3L', 'hygiene', @alice_id),
('Carnets de Croquis', 'Carnets de dessin format A5', 'artistique', @alice_id);

-- Stocks pour Bob
SET @bob_id = (SELECT ID FROM users WHERE EMAIL = 'bob.dupont@example.com' LIMIT 1);
INSERT INTO stocks (LABEL, DESCRIPTION, CATEGORY, USER_ID) VALUES
('Miel de Lavande', 'Pots de miel de lavande 500g', 'alimentation', @bob_id),
('Dentifrice Bio', 'Dentifrice sans fluor 75ml', 'hygiene', @bob_id);

-- Stocks pour Claire
SET @claire_id = (SELECT ID FROM users WHERE EMAIL = 'claire.bernard@example.com' LIMIT 1);
INSERT INTO stocks (LABEL, DESCRIPTION, CATEGORY, USER_ID) VALUES
('Confiture Maison', 'Pots de confiture artisanale variée', 'alimentation', @claire_id),
('Marqueurs Permanents', 'Set de marqueurs permanents couleurs', 'artistique', @claire_id);

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================

SELECT '' AS '';
SELECT '============================================' AS '';
SELECT '📊 RÉSUMÉ FINAL DES DONNÉES CRÉÉES' AS '';
SELECT '============================================' AS '';

-- Statistiques par utilisateur
SELECT
    u.EMAIL as Utilisateur,
    COUNT(DISTINCT s.ID) as Nb_Stocks,
    COUNT(i.ID) as Nb_Items_Total,
    COALESCE(SUM(i.QUANTITY), 0) as Quantité_Totale
FROM users u
LEFT JOIN stocks s ON u.ID = s.USER_ID
LEFT JOIN items i ON s.ID = i.STOCK_ID
GROUP BY u.EMAIL
ORDER BY u.EMAIL;

SELECT '' AS '';
SELECT '============================================' AS '';
SELECT '📦 DÉTAIL DES STOCKS DE SANDRINE' AS '';
SELECT '============================================' AS '';

SELECT
    s.CATEGORY as Catégorie,
    s.LABEL as Stock,
    COUNT(i.ID) as Nb_Items,
    COALESCE(SUM(i.QUANTITY), 0) as Quantité_Totale
FROM stocks s
LEFT JOIN items i ON s.ID = i.STOCK_ID
WHERE s.USER_ID = @sandrine_id
GROUP BY s.CATEGORY, s.LABEL, s.ID
ORDER BY s.CATEGORY, s.LABEL;

SELECT '' AS '';
SELECT '✅ SCRIPT TERMINÉ AVEC SUCCÈS !' AS '';
SELECT CONCAT('Total utilisateurs : ', COUNT(*)) as Info FROM users;
SELECT CONCAT('Total stocks : ', COUNT(*)) as Info FROM stocks;
SELECT CONCAT('Total items : ', COUNT(*)) as Info FROM items;
