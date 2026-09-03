-- ==========================================================
-- Migration 006: Dedicated Categories Table
-- ==========================================================

USE `pizza_pizza`;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL UNIQUE,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `categories` (`name`) VALUES
('Pizza'),
('Drinks'),
('Meals'),
('Burgers'),
('Sides'),
('Desserts');

