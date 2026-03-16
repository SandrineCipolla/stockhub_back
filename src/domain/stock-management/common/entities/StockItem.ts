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

  getStatus(): 'optimal' | 'low' | 'critical' | 'out-of-stock' | 'overstocked' {
    const min = this.minimumStock ?? 1;
    if (this.quantity === 0) return 'out-of-stock';
    if (this.quantity <= min) return 'critical';
    if (this.quantity <= min * 1.5) return 'low';
    if (this.quantity > min * 3) return 'overstocked';
    return 'optimal';
  }
}
