-- ==========================================================
-- Migration 002: Replace Product Quantity with Product Status
-- Status: 'available', 'sold_out', 'unavailable', 'inactive'
-- ==========================================================

USE `pizza_pizza`;

-- Add status column if it doesn't exist
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `status` ENUM('available', 'sold_out', 'unavailable', 'inactive') NOT NULL DEFAULT 'available';

-- Set index for fast filtering by status
ALTER TABLE `products`
  ADD INDEX IF NOT EXISTS `idx_products_status` (`status`);

-- (Optional) If quantity exists, migrate products with 0 quantity to 'sold_out'
UPDATE `products` SET `status` = 'sold_out' WHERE `quantity` <= 0 AND `status` = 'available';

-- Drop quantity column if present
ALTER TABLE `products`
  DROP COLUMN IF EXISTS `quantity`;

