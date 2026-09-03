-- ==========================================================
-- Database Optimization & Refactoring Migration for Pizza ETR
-- Database: pizza_pizza
-- Description: Adds missing high-frequency indexes, composite unique keys,
--              standardizes charsets, and provides view abstractions.
-- ==========================================================

USE `pizza_pizza`;

-- 1. Add missing indexes for high-frequency search and filter queries
ALTER TABLE `orders` ADD INDEX `idx_orders_status_date` (`payment_status`, `placed_on`);
ALTER TABLE `orders` ADD INDEX `idx_orders_user` (`user_id`);
ALTER TABLE `order_items` ADD INDEX `idx_order_items_order_id` (`order_id`);
ALTER TABLE `order_items` ADD INDEX `idx_order_items_product_id` (`product_id`);
ALTER TABLE `cart` ADD INDEX `idx_cart_user_product` (`user_id`, `pid`);
ALTER TABLE `sales` ADD INDEX `idx_sales_date_product` (`date`, `product_id`);
ALTER TABLE `products` ADD INDEX `idx_products_price` (`price`);

-- 2. Prevent duplicate favorites with composite UNIQUE index
ALTER TABLE `favorites` ADD UNIQUE KEY `uniq_user_product_favorite` (`user_id`, `product_id`);

-- 3. Align consistent UTF-8 Charset & Collation
ALTER TABLE `products` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `cart` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `orders` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `order_items` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `sales` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `size` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `customization` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `user` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `admin` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `favorites` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

