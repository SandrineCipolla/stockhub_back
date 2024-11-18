-- Insert 3 stocks
INSERT INTO stocks (LABEL, DESCRIPTION)
VALUES ('Stock 1', 'Description for Stock 1'),
       ('Stock 2', 'Description for Stock 2'),
       ('Stock 3', 'Description for Stock 3');

-- Insert 10 items for each stock
INSERT INTO items (LABEL, DESCRIPTION, QUANTITY, STOCK_ID)
VALUES ('Item 1 of Stock 1', 'Description for Item 1 of Stock 1', 10, 1),
       ('Item 2 of Stock 1', 'Description for Item 2 of Stock 1', 20, 1),
       ('Item 3 of Stock 1', 'Description for Item 3 of Stock 1', 30, 1),
       ('Item 4 of Stock 1', 'Description for Item 4 of Stock 1', 40, 1),
       ('Item 5 of Stock 1', 'Description for Item 5 of Stock 1', 50, 1),
       ('Item 6 of Stock 1', 'Description for Item 6 of Stock 1', 60, 1),
       ('Item 7 of Stock 1', 'Description for Item 7 of Stock 1', 70, 1),
       ('Item 8 of Stock 1', 'Description for Item 8 of Stock 1', 80, 1),
       ('Item 9 of Stock 1', 'Description for Item 9 of Stock 1', 90, 1),
       ('Item 10 of Stock 1', 'Description for Item 10 of Stock 1', 100, 1),
       ('Item 1 of Stock 2', 'Description for Item 1 of Stock 2', 10, 2),
       ('Item 2 of Stock 2', 'Description for Item 2 of Stock 2', 20, 2),
       ('Item 3 of Stock 2', 'Description for Item 3 of Stock 2', 30, 2),
       ('Item 4 of Stock 2', 'Description for Item 4 of Stock 2', 40, 2),
       ('Item 5 of Stock 2', 'Description for Item 5 of Stock 2', 50, 2),
       ('Item 6 of Stock 2', 'Description for Item 6 of Stock 2', 60, 2),
       ('Item 7 of Stock 2', 'Description for Item 7 of Stock 2', 70, 2),
       ('Item 8 of Stock 2', 'Description for Item 8 of Stock 2', 80, 2),
       ('Item 9 of Stock 2', 'Description for Item 9 of Stock 2', 90, 2),
       ('Item 10 of Stock 2', 'Description for Item 10 of Stock 2', 100, 2),
       ('Item 1 of Stock 3', 'Description for Item 1 of Stock 3', 10, 3),
       ('Item 2 of Stock 3', 'Description for Item 2 of Stock 3', 20, 3),
       ('Item 3 of Stock 3', 'Description for Item 3 of Stock 3', 30, 3),
       ('Item 4 of Stock 3', 'Description for Item 4 of Stock 3', 40, 3),
       ('Item 5 of Stock 3', 'Description for Item 5 of Stock 3', 50, 3),
       ('Item 6 of Stock 3', 'Description for Item 6 of Stock 3', 60, 3),
       ('Item 7 of Stock 3', 'Description for Item 7 of Stock 3', 70, 3),
       ('Item 8 of Stock 3', 'Description for Item 8 of Stock 3', 80, 3),
       ('Item 9 of Stock 3', 'Description for Item 9 of Stock 3', 90, 3),
       ('Item 10 of Stock 3', 'Description for Item 10 of Stock 3', 100, 3);