-- ==========================================================
-- Migration 003: Add Address and Contact Number to User Table
-- ==========================================================

USE `pizza_pizza`;

ALTER TABLE `user`
  ADD COLUMN IF NOT EXISTS `address` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `number` VARCHAR(20) DEFAULT NULL;

