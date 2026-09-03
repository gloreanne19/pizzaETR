-- ==========================================================
-- Migration 009: Order Lifecycle Status & Order Type (Delivery/Pickup)
-- ==========================================================

USE `pizza_pizza`;

-- Add order_type column to orders table (delivery or pickup)
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `order_type` ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery';

-- Add order_status column for detailed order progress tracking
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `order_status` ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';

