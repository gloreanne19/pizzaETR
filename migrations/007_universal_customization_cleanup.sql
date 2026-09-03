-- ==========================================================
-- Migration 007: Universal Customization Cleanup & Cart Options
-- ==========================================================

USE `pizza_pizza`;

-- Ensure cart table supports universal options string
ALTER TABLE `cart`
  ADD COLUMN IF NOT EXISTS `options` TEXT DEFAULT NULL;

-- Ensure categories table exists
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL UNIQUE,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

