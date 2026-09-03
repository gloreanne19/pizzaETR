-- ==========================================================
-- Complete Database Schema & Initial Seed Data for Pizza ETR
-- Database Name: pizza_pizza
-- Compatible with MySQL / MariaDB / XAMPP phpMyAdmin
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `pizza_pizza` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pizza_pizza`;

-- --------------------------------------------------------
-- Table: admin
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_admin_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Admin Account: Username: admin, Password: 111 (SHA-1 hash: 6216f8a75fd5bb3d5f22b6f9958cdede3fc086c2)
INSERT INTO `admin` (`id`, `name`, `password`) VALUES
(1, 'admin', '6216f8a75fd5bb3d5f22b6f9958cdede3fc086c2')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- --------------------------------------------------------
-- Table: user
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Customer Account: Email: user@gmail.com, Password: 111
INSERT INTO `user` (`id`, `name`, `email`, `password`) VALUES
(1, 'Demo Customer', 'user@gmail.com', '6216f8a75fd5bb3d5f22b6f9958cdede3fc086c2')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- --------------------------------------------------------
-- Table: products
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'Pizza',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('available', 'sold_out', 'unavailable', 'inactive') NOT NULL DEFAULT 'available',
  `has_customizations` tinyint(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_price` (`price`),
  KEY `idx_products_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Sample Pizza Products
INSERT INTO `products` (`id`, `name`, `category`, `price`, `status`, `has_customizations`, `description`, `image`) VALUES
(1, 'Hawaiian Special', 'Pizza', 299.00, 'available', 1, 'Sweet juicy pineapple paired with premium smoked ham and rich mozzarella.', 'Hawaiian.png'),
(2, 'Triple Cheese Feast', 'Pizza', 349.00, 'available', 1, 'A heavenly blend of mozzarella, cheddar, and parmesan over signature pizza sauce.', 'Triple Cheese.png'),
(3, 'Double Cheese Pepperoni', 'Pizza', 399.00, 'available', 1, 'Classic crispy pepperoni loaded with double layers of stringy mozzarella.', 'Double Cheese Pepperoni.png'),
(4, 'Bacon & Pepperoni', 'Pizza', 420.00, 'available', 1, 'Smoked bacon strips and crispy pepperoni loaded over golden melted cheese.', 'Bacon and Pepperoni.png'),
(5, 'Italian Hawaiian', 'Pizza', 380.00, 'available', 1, 'Classic Hawaiian upgraded with Italian herbs and sun-ripened marinara.', 'Italian Hawaiian.png'),
(6, 'Beef & Onion Melt', 'Pizza', 360.00, 'available', 1, 'Seasoned minced beef with caramelized sweet onions and melted cheese.', 'Beef-n-Onion.png')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- --------------------------------------------------------
-- Table: size
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `size` (
  `sizeID` int(11) NOT NULL AUTO_INCREMENT,
  `sizename` varchar(100) NOT NULL,
  `sizeprice` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`sizeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Pizza Crust Sizes
INSERT INTO `size` (`sizeID`, `sizename`, `sizeprice`) VALUES
(1, 'Regular (10 inch)', 0.00),
(2, 'Medium (12 inch)', 120.00),
(3, 'Large (14 inch)', 220.00)
ON DUPLICATE KEY UPDATE `sizeID`=`sizeID`;

-- --------------------------------------------------------
-- Table: customization
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customization` (
  `cusID` int(11) NOT NULL AUTO_INCREMENT,
  `cusName` varchar(100) NOT NULL,
  `cusPrice` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cusImage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`cusID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Pizza Customization Toppings
INSERT INTO `customization` (`cusID`, `cusName`, `cusPrice`, `cusImage`) VALUES
(1, 'Extra Mozzarella Cheese', 45.00, 'uploads/customization/6775c90a6412f.png'),
(2, 'Crispy Bacon Bits', 55.00, 'uploads/customization/6775c92609f17.png'),
(3, 'Sliced Pepperoni', 50.00, 'uploads/customization/6775c94403865.png'),
(4, 'Black Sliced Olives', 35.00, 'uploads/customization/6775c9617a5b6.png'),
(5, 'Sweet Pineapple Chunks', 30.00, 'uploads/customization/6775c987a63f7.png'),
(6, 'Fresh Button Mushrooms', 40.00, 'uploads/customization/6775c9beaa738.png')
ON DUPLICATE KEY UPDATE `cusID`=`cusID`;

-- --------------------------------------------------------
-- Table: cart
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `user_id` int(100) NOT NULL,
  `pid` int(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(100) NOT NULL DEFAULT 1,
  `image` varchar(255) NOT NULL,
  `sizeID` int(11) DEFAULT NULL,
  `customIDS` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_cart_user_product` (`user_id`,`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: favorites
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `user_id` int(100) NOT NULL,
  `product_id` int(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_product_favorite` (`user_id`,`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `user_id` int(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `number` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `method` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `total_products` text DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `placed_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_orders_status_date` (`payment_status`,`placed_on`),
  KEY `idx_orders_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: order_items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `size` varchar(50) DEFAULT NULL,
  `customizations` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: sales
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `product_id` int(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `qty` int(100) NOT NULL,
  `sizeID` varchar(50) DEFAULT '',
  `cusIDs` varchar(255) DEFAULT '',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sales_date_product` (`date`,`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

