import {StockMapper} from '@api/dto/mappers/StockMapper';
import {Stock} from '@domain/stock-management/common/entities/Stock';
import {StockItem} from '@domain/stock-management/common/entities/StockItem';
import {StockLabel} from '@domain/stock-management/common/value-objects/StockLabel';
import {StockDescription} from '@domain/stock-management/common/value-objects/StockDescription';

describe('StockMapper', () => {
    describe('toDTO', () => {
        it('should transform Stock entity to StockDTO', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Café Arabica'),
                new StockDescription('Café premium'),
                'alimentation',
                [
                    new StockItem(1, 'Sac 1kg', 50, 'Sac de café', 10, 1),
                    new StockItem(2, 'Sac 500g', 30, 'Petit sac', 5, 1),
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock, 'kg');

            // Assert
            expect(dto).toEqual({
                id: 1,
                name: 'Café Arabica',
                description: 'Café premium',
                category: 'alimentation',
                quantity: 80, // 50 + 30
                unit: 'kg',
                minimumStock: 15, // 10 + 5
                status: 'optimal', // 80 > 30% of 15
            });
        });

        it('should use default unit "unités" when not specified', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Test Stock'),
                new StockDescription('Test'),
                'alimentation',
                []
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.unit).toBe('unités');
        });

        it('should calculate status as "out-of-stock" when quantity is 0', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Empty Stock'),
                new StockDescription('No items'),
                'alimentation',
                [
                    new StockItem(1, 'Item', 0, 'Empty item', 10, 1),
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.status).toBe('out-of-stock');
            expect(dto.quantity).toBe(0);
        });

        it('should calculate status as "critical" when quantity < 10% minimumStock', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Critical Stock'),
                new StockDescription('Very low'),
                'alimentation',
                [
                    new StockItem(1, 'Item', 5, 'Low item', 100, 1), // 5 < 10% of 100 (10)
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.status).toBe('critical');
            expect(dto.quantity).toBe(5);
            expect(dto.minimumStock).toBe(100);
        });

        it('should calculate status as "low" when quantity < 30% minimumStock', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Low Stock'),
                new StockDescription('Running low'),
                'alimentation',
                [
                    new StockItem(1, 'Item', 20, 'Low item', 100, 1), // 20 < 30% of 100 (30)
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.status).toBe('low');
        });

        it('should calculate status as "optimal" when quantity >= 30% minimumStock', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Optimal Stock'),
                new StockDescription('Good level'),
                'alimentation',
                [
                    new StockItem(1, 'Item', 50, 'Good item', 100, 1), // 50 >= 30% of 100 (30)
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.status).toBe('optimal');
        });

        it('should sum quantities from multiple items', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Multi-Item Stock'),
                new StockDescription('Multiple items'),
                'alimentation',
                [
                    new StockItem(1, 'Item 1', 10, '', 5, 1),
                    new StockItem(2, 'Item 2', 20, '', 5, 1),
                    new StockItem(3, 'Item 3', 15, '', 5, 1),
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.quantity).toBe(45); // 10 + 20 + 15
            expect(dto.minimumStock).toBe(15); // 5 + 5 + 5
        });

        it('should handle stock with no items', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Empty Stock'),
                new StockDescription('No items yet'),
                'alimentation',
                []
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.quantity).toBe(0);
            expect(dto.minimumStock).toBe(1); // Default when no items
            expect(dto.status).toBe('out-of-stock');
        });

        it('should handle string label and description (backward compatibility)', () => {
            // Arrange
            const stock = new Stock(
                1,
                'String Label',
                'String Description',
                'hygiene',
                []
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.name).toBe('String Label');
            expect(dto.description).toBe('String Description');
            expect(dto.category).toBe('hygiene');
        });
    });

    describe('itemToDTO', () => {
        it('should transform StockItem entity to StockItemDTO', () => {
            // Arrange
            const item = new StockItem(
                1,
                'Sac 1kg',
                50,
                'Sac de café arabica',
                10,
                5
            );

            // Act
            const dto = StockMapper.itemToDTO(item);

            // Assert
            expect(dto).toEqual({
                id: 1,
                label: 'Sac 1kg',
                description: 'Sac de café arabica',
                quantity: 50,
                minimumStock: 10,
                stockId: 5,
            });
        });
    });

    describe('toDTOList', () => {
        it('should transform array of Stocks to array of DTOs', () => {
            // Arrange
            const stocks = [
                new Stock(1, new StockLabel('Stock 1'), new StockDescription('Desc 1'), 'alimentation', []),
                new Stock(2, new StockLabel('Stock 2'), new StockDescription('Desc 2'), 'hygiene', []),
            ];

            // Act
            const dtos = StockMapper.toDTOList(stocks);

            // Assert
            expect(dtos).toHaveLength(2);
            expect(dtos[0].name).toBe('Stock 1');
            expect(dtos[1].name).toBe('Stock 2');
        });

        it('should handle empty array', () => {
            // Arrange
            const stocks: Stock[] = [];

            // Act
            const dtos = StockMapper.toDTOList(stocks);

            // Assert
            expect(dtos).toEqual([]);
        });
    });

    describe('itemsToDTOList', () => {
        it('should transform array of StockItems to array of DTOs', () => {
            // Arrange
            const items = [
                new StockItem(1, 'Item 1', 10, 'Desc 1', 5, 1),
                new StockItem(2, 'Item 2', 20, 'Desc 2', 10, 1),
            ];

            // Act
            const dtos = StockMapper.itemsToDTOList(items);

            // Assert
            expect(dtos).toHaveLength(2);
            expect(dtos[0].label).toBe('Item 1');
            expect(dtos[1].label).toBe('Item 2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle exactly 10% threshold (critical boundary)', () => {
            // Arrange - Exactly 10% should still be critical
            const stock = new Stock(
                1,
                new StockLabel('Boundary Stock'),
                new StockDescription('Exactly 10%'),
                'alimentation',
                [
                    new StockItem(1, 'Item', 10, '', 100, 1), // Exactly 10%
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.status).toBe('low'); // 10 is NOT < 10, so it's "low" (< 30%)
        });

        it('should handle exactly 30% threshold (low boundary)', () => {
            // Arrange - Exactly 30% should be optimal
            const stock = new Stock(
                1,
                new StockLabel('Boundary Stock'),
                new StockDescription('Exactly 30%'),
                'alimentation',
                [
                    new StockItem(1, 'Item', 30, '', 100, 1), // Exactly 30%
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.status).toBe('optimal'); // 30 >= 30%
        });

        it('should handle very large quantities', () => {
            // Arrange
            const stock = new Stock(
                1,
                new StockLabel('Large Stock'),
                new StockDescription('Very large'),
                'alimentation',
                [
                    new StockItem(1, 'Item', 1000000, '', 100, 1),
                ]
            );

            // Act
            const dto = StockMapper.toDTO(stock);

            // Assert
            expect(dto.quantity).toBe(1000000);
            expect(dto.status).toBe('optimal');
        });
    });
});
