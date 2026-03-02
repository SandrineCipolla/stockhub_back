import { Quantity } from '@domain/stock-management/common/value-objects/Quantity';

export class StockItem {
  private innerQuantity: Quantity;

  constructor(
    public id: number,
    public label: string,
    public quantity: number,
    public description: string,
    public minimumStock: number = 1,
    public stockId: number
  ) {
    this.innerQuantity = new Quantity(quantity);
  }

  isOutOfStock(): boolean {
    return this.innerQuantity.isZero();
  }

  isLowStock(): boolean {
    return this.innerQuantity.isLessOrEqualToMinimum(this.minimumStock);
  }
}
