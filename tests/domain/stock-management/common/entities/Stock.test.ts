import {Stock} from "../../../../../src/domain/stock-management/common/entities/Stock";
import {StockItem} from "../../../../../src/domain/stock-management/common/entities/StockItem";
import {StockLabel} from "../../../../../src/domain/stock-management/common/value-objects/StockLabel";
import {StockDescription} from "../../../../../src/domain/stock-management/common/value-objects/StockDescription";
import {Quantity} from "../../../../../src/domain/stock-management/common/value-objects/Quantity";


describe('Stock', () => {
    describe('create()', () => {
        describe('when creating with Value Objects', () => {
            it('should create stock with StockLabel and StockDescription', () => {
                const label = new StockLabel('Stock Cuisine');
                const description = new StockDescription('Aliments périssables');

                const stock = Stock.create({
                    label,
                    description,
                    category: 'alimentation',
                    userId: 123
                });

                expect(stock.getLabelValue()).toBe('Stock Cuisine');
                expect(stock.getDescriptionValue()).toBe('Aliments périssables');
                expect(stock.category).toBe('alimentation');
                expect(stock.items).toHaveLength(0);
            })
        })

        describe('when creating with strings', () => {
            it('should convert strings to Value Objects automatically', () => {
                const stock = Stock.create({
                    label: 'Mon Stock',
                    description: 'Description simple',
                    category: 'test',
                    userId: 456
                });

                expect(stock.getLabelValue()).toBe('Mon Stock');
                expect(stock.getDescriptionValue()).toBe('Description simple');
            })
        })

        describe('when id is not provided', () => {
            it('should set id to 0', () => {
                const stock = Stock.create({
                    label: 'Test',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                expect(stock.id).toBe(0);
            })
        })

        describe('when id is provided', () => {
            it('should set the provided id', () => {
                const stock = Stock.create({
                    label: 'Test',
                    description: 'Test',
                    category: 'test',
                    userId: 1,
                    id: 999
                });

                expect(stock.id).toBe(999);
            })
        })

        describe('when category contains whitespace', () => {
            it('should trim the category', () => {
                const stock = Stock.create({
                    label: 'Test',
                    description: 'Test',
                    category: '  alimentation  ',
                    userId: 1
                });

                expect(stock.category).toBe('alimentation');
            })
        })

        describe('when category is empty', () => {
            it('should throw an error', () => {
                expect(() => Stock.create({
                    label: 'Test',
                    description: 'Test',
                    category: '',
                    userId: 1
                })).toThrow('Stock category cannot be empty');
            })
        })

        describe('when category is whitespace only', () => {
            it('should throw an error', () => {
                expect(() => Stock.create({
                    label: 'Test',
                    description: 'Test',
                    category: '   ',
                    userId: 1
                })).toThrow('Stock category cannot be empty');
            })
        })

        describe('when userId is 0', () => {
            it('should throw an error', () => {
                expect(() => Stock.create({
                    label: 'Test',
                    description: 'Test',
                    category: 'test',
                    userId: 0
                })).toThrow('Stock must have a valid userId');
            })
        })

        describe('when userId is negative', () => {
            it('should throw an error', () => {
                expect(() => Stock.create({
                    label: 'Test',
                    description: 'Test',
                    category: 'test',
                    userId: -1
                })).toThrow('Stock must have a valid userId');
            })
        })

        describe('when label is invalid', () => {
            it('should throw an error from StockLabel', () => {
                expect(() => Stock.create({
                    label: 'AB',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                })).toThrow('Stock label must be at least 3 characters');
            })
        })
    })

    describe('getTotalItems()', () => {
        describe('when stock is empty', () => {
            it('should return 0', () => {
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []);
                expect(stock.getTotalItems()).toBe(0);
            })
        })

        describe('when stock has items', () => {
            it('should return the correct count', () => {
                const items = [
                    new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                    new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                ];
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
                expect(stock.getTotalItems()).toBe(2);
            })
        })
    })

    describe('getTotalQuantity()', () => {
        describe('when stock is empty', () => {
            it('should return 0', () => {
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []);
                expect(stock.getTotalQuantity()).toBe(0);
            })
        })

        describe('when stock has items', () => {
            it('should return the sum of all quantities', () => {
                const items = [
                    new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                    new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                ];
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
                expect(stock.getTotalQuantity()).toBe(15);
            })
        })

        describe('when items have zero quantity', () => {
            it('should not count zero quantities', () => {
                const items = [
                    new StockItem(1, 'Item 1', 0, 'description item1', 1, 1),
                    new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                ];
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
                expect(stock.getTotalQuantity()).toBe(10);
            })
        })
    })

    describe('addItem()', () => {
        describe('when adding with all parameters', () => {
            it('should add the item to the stock', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1,
                    id: 100
                });

                const item = stock.addItem({
                    label: 'Tomates',
                    description: 'Tomates fraîches',
                    quantity: 10,
                    minimumStock: 2
                });

                expect(stock.items).toHaveLength(1);
                expect(item.LABEL).toBe('Tomates');
                expect(item.DESCRIPTION).toBe('Tomates fraîches');
                expect(item.QUANTITY).toBe(10);
                expect(item.minimumStock).toBe(2);
                expect(item.STOCK_ID).toBe(100);
            })
        })

        describe('when adding without description', () => {
            it('should use empty string as description', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({
                    label: 'Pâtes',
                    quantity: 5,
                    minimumStock: 3
                });

                expect(item.DESCRIPTION).toBe('');
            })
        })

        describe('when adding without minimumStock', () => {
            it('should use default minimumStock of 1', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({
                    label: 'Riz',
                    quantity: 20
                });

                expect(item.minimumStock).toBe(1);
            })
        })

        describe('when adding multiple items', () => {
            it('should add all items and calculate correct totals', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                stock.addItem({label: 'Item1', quantity: 5});
                stock.addItem({label: 'Item2', quantity: 10});
                stock.addItem({label: 'Item3', quantity: 15});

                expect(stock.items).toHaveLength(3);
                expect(stock.getTotalItems()).toBe(3);
                expect(stock.getTotalQuantity()).toBe(30);
            })
        })

        describe('when label contains whitespace', () => {
            it('should trim the label', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({
                    label: '  Tomates  ',
                    quantity: 10
                });

                expect(item.LABEL).toBe('Tomates');
            })
        })

        describe('when description contains whitespace', () => {
            it('should trim the description', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({
                    label: 'Test',
                    description: '  Description  ',
                    quantity: 10
                });

                expect(item.DESCRIPTION).toBe('Description');
            })
        })

        describe('when label is empty', () => {
            it('should throw an error', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                expect(() => stock.addItem({
                    label: '',
                    quantity: 10
                })).toThrow('Item label cannot be empty');
            })
        })

        describe('when label is whitespace only', () => {
            it('should throw an error', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                expect(() => stock.addItem({
                    label: '   ',
                    quantity: 10
                })).toThrow('Item label cannot be empty');
            })
        })

        describe('when quantity is negative', () => {
            it('should throw an error', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                expect(() => stock.addItem({
                    label: 'Test',
                    quantity: -5
                })).toThrow('Item quantity cannot be negative');
            })
        })

        describe('when label already exists (case insensitive)', () => {
            it('should throw an error', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                stock.addItem({label: 'Tomates', quantity: 10});

                expect(() => stock.addItem({
                    label: 'tomates',
                    quantity: 5
                })).toThrow('Item with label "tomates" already exists in this stock');
            })
        })
    })

    describe('updateItemQuantity()', () => {
        describe('when updating with a number', () => {
            it('should update the quantity', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({label: 'Tomates', quantity: 10});
                item.ID = 1;

                stock.updateItemQuantity(1, 25);

                expect(item.QUANTITY).toBe(25);
            })
        })

        describe('when updating with Quantity Value Object', () => {
            it('should update the quantity', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({label: 'Pâtes', quantity: 5});
                item.ID = 2;

                stock.updateItemQuantity(2, new Quantity(15));

                expect(item.QUANTITY).toBe(15);
            })
        })

        describe('when updating to zero', () => {
            it('should allow zero quantity', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({label: 'Riz', quantity: 10});
                item.ID = 3;

                stock.updateItemQuantity(3, 0);

                expect(item.QUANTITY).toBe(0);
            })
        })

        describe('when updating to negative', () => {
            it('should throw an error', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({label: 'Test', quantity: 10});
                item.ID = 1;

                expect(() => stock.updateItemQuantity(1, -5))
                    .toThrow('Quantity cannot be negative');
            })
        })

        describe('when item does not exist', () => {
            it('should throw an error', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                expect(() => stock.updateItemQuantity(999, 10))
                    .toThrow('Item with ID 999 not found in this stock');
            })
        })
    })

    describe('getLowStockItems()', () => {
        describe('when no items are low on stock', () => {
            it('should return empty array', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                stock.addItem({label: 'Item1', quantity: 10, minimumStock: 2});
                stock.addItem({label: 'Item2', quantity: 20, minimumStock: 5});

                const lowStockItems = stock.getLowStockItems();

                expect(lowStockItems).toHaveLength(0);
            })
        })

        describe('when some items are low on stock', () => {
            it('should return items where quantity <= minimumStock', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                stock.addItem({label: 'LowItem1', quantity: 2, minimumStock: 5});
                stock.addItem({label: 'OkItem', quantity: 10, minimumStock: 2});
                stock.addItem({label: 'LowItem2', quantity: 1, minimumStock: 3});

                const lowStockItems = stock.getLowStockItems();

                expect(lowStockItems).toHaveLength(2);
                expect(lowStockItems[0].LABEL).toBe('LowItem1');
                expect(lowStockItems[1].LABEL).toBe('LowItem2');
            })
        })

        describe('when quantity equals minimumStock', () => {
            it('should include the item', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                stock.addItem({label: 'BorderlineItem', quantity: 5, minimumStock: 5});

                const lowStockItems = stock.getLowStockItems();

                expect(lowStockItems).toHaveLength(1);
            })
        })
    })

    describe('hasLowStockItems()', () => {
        describe('when stock has no low stock items', () => {
            it('should return false', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                stock.addItem({label: 'Item1', quantity: 10, minimumStock: 2});

                expect(stock.hasLowStockItems()).toBe(false);
            })
        })

        describe('when stock has low stock items', () => {
            it('should return true', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                stock.addItem({label: 'OkItem', quantity: 10, minimumStock: 2});
                stock.addItem({label: 'LowItem', quantity: 1, minimumStock: 5});

                expect(stock.hasLowStockItems()).toBe(true);
            })
        })
    })

    describe('removeItem()', () => {
        describe('when removing an existing item', () => {
            it('should remove the item', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({label: 'Tomates', quantity: 10});
                item.ID = 1;

                stock.removeItem(1);

                expect(stock.items).toHaveLength(0);
            })
        })

        describe('when removing one item among multiple', () => {
            it('should remove only the correct item', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item1 = stock.addItem({label: 'Item1', quantity: 10});
                const item2 = stock.addItem({label: 'Item2', quantity: 20});
                const item3 = stock.addItem({label: 'Item3', quantity: 30});

                item1.ID = 1;
                item2.ID = 2;
                item3.ID = 3;

                stock.removeItem(2);

                expect(stock.items).toHaveLength(2);
                expect(stock.items.find(i => i.ID === 2)).toBeUndefined();
                expect(stock.items.find(i => i.ID === 1)).toBeDefined();
                expect(stock.items.find(i => i.ID === 3)).toBeDefined();
            })
        })

        describe('when item does not exist', () => {
            it('should throw an error', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                expect(() => stock.removeItem(999))
                    .toThrow('Item with ID 999 not found in this stock');
            })
        })
    })

    describe('getItemById()', () => {
        describe('when item exists', () => {
            it('should return the item', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const item = stock.addItem({label: 'Tomates', quantity: 10});
                item.ID = 1;

                const found = stock.getItemById(1);

                expect(found).toBeDefined();
                expect(found?.LABEL).toBe('Tomates');
            })
        })

        describe('when item does not exist', () => {
            it('should return undefined', () => {
                const stock = Stock.create({
                    label: 'Test Stock',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                });

                const found = stock.getItemById(999);

                expect(found).toBeUndefined();
            })
        })
    })
})
