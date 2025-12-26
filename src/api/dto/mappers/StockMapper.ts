import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';
import { StockDTO, StockItemDTO, StockStatus } from '@api/dto/StockDTO';

/**
 * StockMapper - Transforme les entités Domain en DTOs pour l'API
 *
 * Responsabilités:
 * - Extraire les valeurs des Value Objects (StockLabel, StockDescription)
 * - Calculer les agrégats (quantité totale, stock minimum total)
 * - Déterminer le statut du stock (optimal, low, critical, out-of-stock)
 * - Transformer en JSON simple pour le Frontend
 */
export class StockMapper {
  /**
   * Transforme un Stock (domain entity) en StockDTO (API)
   *
   * @param stock - L'entité Stock du domaine
   * @param unit - Unité de mesure optionnelle (défaut: "unités")
   * @returns StockDTO prêt à être sérialisé en JSON
   *
   * @example
   * ```typescript
   * const stock = await repository.getStockDetails(stockId);
   * const dto = StockMapper.toDTO(stock);
   * res.json(dto);
   * ```
   */
  static toDTO(stock: Stock, unit: string = 'unités'): StockDTO {
    // Extraire les valeurs des Value Objects
    const name = stock.getLabelValue();
    const description = stock.getDescriptionValue();

    // Calculer la quantité totale (somme de tous les items)
    const totalQuantity = stock.getTotalQuantity();

    // Calculer le stock minimum total (somme des minimums de tous les items)
    const totalMinimumStock = stock.items.reduce((sum, item) => sum + item.minimumStock, 0);

    // Si pas d'items, considérer minimumStock = 1 par défaut
    const minimumStock = totalMinimumStock > 0 ? totalMinimumStock : 1;

    // Calculer le statut du stock
    const status = this.calculateStatus(totalQuantity, minimumStock);

    // Extraire la catégorie (gérer string ou enum)
    let category: string;
    if (typeof stock.category === 'string') {
      category = stock.category;
    } else {
      category = String(stock.category);
    }

    return {
      id: stock.id,
      name,
      description,
      category,
      quantity: totalQuantity,
      unit,
      minimumStock,
      status,
    };
  }

  /**
   * Transforme un StockItem (domain entity) en StockItemDTO (API)
   *
   * @param item - L'entité StockItem du domaine
   * @returns StockItemDTO prêt à être sérialisé en JSON
   */
  static itemToDTO(item: StockItem): StockItemDTO {
    return {
      id: item.ID,
      label: item.LABEL,
      description: item.DESCRIPTION,
      quantity: item.QUANTITY,
      minimumStock: item.minimumStock,
      stockId: item.STOCK_ID,
    };
  }

  /**
   * Calcule le statut du stock basé sur la quantité et le stock minimum
   *
   * Règles métier:
   * - out-of-stock: quantity === 0
   * - critical: quantity < 10% minimumStock
   * - low: quantity < 30% minimumStock
   * - optimal: quantity >= 30% minimumStock
   *
   * @param quantity - Quantité actuelle
   * @param minimumStock - Stock minimum requis
   * @returns Le statut calculé
   *
   * @private
   */
  private static calculateStatus(quantity: number, minimumStock: number): StockStatus {
    // Cas 1: Rupture de stock
    if (quantity === 0) {
      return 'out-of-stock';
    }

    // Cas 2: Stock critique (< 10% du minimum)
    const criticalThreshold = minimumStock * 0.1;
    if (quantity < criticalThreshold) {
      return 'critical';
    }

    // Cas 3: Stock faible (< 30% du minimum)
    const lowThreshold = minimumStock * 0.3;
    if (quantity < lowThreshold) {
      return 'low';
    }

    // Cas 4: Stock optimal
    return 'optimal';
  }

  /**
   * Transforme une liste de Stocks en DTOs
   *
   * @param stocks - Tableau de Stocks
   * @param unit - Unité par défaut
   * @returns Tableau de StockDTOs
   */
  static toDTOList(stocks: Stock[], unit: string = 'unités'): StockDTO[] {
    return stocks.map(stock => this.toDTO(stock, unit));
  }

  /**
   * Transforme une liste de StockItems en DTOs
   *
   * @param items - Tableau de StockItems
   * @returns Tableau de StockItemDTOs
   */
  static itemsToDTOList(items: StockItem[]): StockItemDTO[] {
    return items.map(item => this.itemToDTO(item));
  }
}
