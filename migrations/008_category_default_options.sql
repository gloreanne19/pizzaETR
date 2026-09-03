-- ==========================================================
-- Migration 008: Category Default Customization Templates
-- ==========================================================

USE `pizza_pizza`;

-- Add default_options column to categories table
ALTER TABLE `categories`
  ADD COLUMN IF NOT EXISTS `default_options` TEXT DEFAULT NULL;

-- Seed default option templates for standard categories
UPDATE `categories`
SET `default_options` = '[{"id":"pizza_crust","title":"Select Crust Size","type":"single","required":true,"choices":[{"name":"Solo (10\\")","price":0},{"name":"Medium (12\\")","price":80},{"name":"Family (14\\")","price":150}]}]'
WHERE `name` = 'Pizza' AND (`default_options` IS NULL OR `default_options` = '');

UPDATE `categories`
SET `default_options` = '[{"id":"drink_size","title":"Select Size / Volume","type":"single","required":true,"choices":[{"name":"500ml","price":0},{"name":"1 Liter","price":35},{"name":"1.5 Liters","price":60}]}]'
WHERE `name` = 'Drinks' AND (`default_options` IS NULL OR `default_options` = '');

UPDATE `categories`
SET `default_options` = '[{"id":"burger_style","title":"Choose Style","type":"single","required":false,"choices":[{"name":"Classic","price":0},{"name":"With Melted Cheese","price":25},{"name":"Double Patty","price":60}]}]'
WHERE `name` = 'Burgers' AND (`default_options` IS NULL OR `default_options` = '');

UPDATE `categories`
SET `default_options` = '[{"id":"flavor","title":"Choose Flavor / Spice Level","type":"single","required":false,"choices":[{"name":"Original (Mild)","price":0},{"name":"Spicy","price":0},{"name":"Extra Hot","price":10}]}]'
WHERE `name` = 'Meals' AND (`default_options` IS NULL OR `default_options` = '');

