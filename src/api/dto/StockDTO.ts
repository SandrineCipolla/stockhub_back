/**
 * DTO (Data Transfer Object) pour l'API StockHub
 *
 * Ce format est celui attendu par le Frontend React.
 * Il transforme les Value Objects DDD en JSON simple.
 */

export type StockStatus = 'optimal' | 'low' | 'critical' | 'out-of-stock';

export interface StockDTO {
  /**
   * Identifiant unique du stock
   */
  id: number;

  /**
   * Nom du stock (mappé depuis StockLabel.value)
   */
  name: string;

  /**
   * Description du stock
   */
  description: string;

  /**
   * Catégorie du stock (alimentation, hygiene, artistique)
   */
  category: string;

  /**
   * Quantité totale (somme de tous les items)
   */
  quantity: number;

  /**
   * Unité de mesure (kg, L, unités, etc.)
   * Par défaut: "unités"
   */
  unit: string;

  /**
   * Stock minimum requis (somme des minimums de tous les items)
   */
  minimumStock: number;

  /**
   * Statut calculé automatiquement :
   * - 'out-of-stock': quantity === 0
   * - 'critical': quantity < 10% minimumStock
   * - 'low': quantity < 30% minimumStock
   * - 'optimal': quantity >= 30% minimumStock
   */
  status: StockStatus;
}

export interface StockItemDTO {
  /**
   * Identifiant unique de l'item
   */
  id: number;

  /**
   * Label de l'item
   */
  label: string;

  /**
   * Description de l'item
   */
  description: string;

  /**
   * Quantité de cet item spécifique
   */
  quantity: number;

  /**
   * Stock minimum pour cet item
   */
  minimumStock: number;

  /**
   * ID du stock parent
   */
  stockId: number;
}
