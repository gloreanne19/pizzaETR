-- ==========================================================
-- Migration 005: Universal Product Customization Engine
-- ==========================================================

USE `pizza_pizza`;

-- Ensure size table exists
CREATE TABLE IF NOT EXISTS `size` (
  `sizeID` int(100) NOT NULL AUTO_INCREMENT,
  `sizename` varchar(100) NOT NULL,
  `sizeprice` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`sizeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure customization table exists
CREATE TABLE IF NOT EXISTS `customization` (
  `cusID` int(100) NOT NULL AUTO_INCREMENT,
  `cusName` varchar(100) NOT NULL,
  `cusPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cusImage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`cusID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add customization_options column to products table
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `customization_options` TEXT DEFAULT NULL;

