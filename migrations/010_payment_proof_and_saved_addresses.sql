-- ==========================================================
-- Migration 010: Payment Proof, Delivery Notes & Saved Addresses
-- ==========================================================

USE `pizza_pizza`;

-- Add payment_proof and delivery_notes to orders
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `payment_proof` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `delivery_notes` TEXT DEFAULT NULL;

-- Add saved_addresses to user table
ALTER TABLE `user`
  ADD COLUMN IF NOT EXISTS `saved_addresses` TEXT DEFAULT NULL;

