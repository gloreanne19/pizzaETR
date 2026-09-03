-- ==========================================================
-- Migration 004: Add Category and Customization Flag to Products
-- ==========================================================

USE `pizza_pizza`;

ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(100) NOT NULL DEFAULT 'Pizza',
  ADD COLUMN IF NOT EXISTS `has_customizations` TINYINT(1) NOT NULL DEFAULT 0;

-- Index category for high-speed menu filtering
ALTER TABLE `products`
  ADD INDEX IF NOT EXISTS `idx_products_category` (`category`);

-- Ensure existing pizza products have has_customizations enabled
UPDATE `products` SET `has_customizations` = 1 WHERE `category` = 'Pizza' OR `category` IS NULL;
UPDATE `products` SET `category` = 'Pizza' WHERE `category` IS NULL OR `category` = '';

