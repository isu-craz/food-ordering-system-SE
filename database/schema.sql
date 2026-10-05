-- ============================================================================
-- SPICE AVENUE - MASTER DATABASE SCHEMA (MySQL 8.x)
-- Coursework: SE2030 - Software Engineering (SLIIT Y2S1)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `spice_avenue_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `spice_avenue_db`;

-- Drop tables in reverse dependency order if they exist
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `deliveries`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `customer_addresses`;
DROP TABLE IF EXISTS `menu_variations`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `delivery_areas`;
DROP TABLE IF EXISTS `branches`;
DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION TABLE (Shared)
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
    `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `role` ENUM('CUSTOMER', 'BRANCH_MANAGER', 'RIDER', 'SUPERVISOR', 'OPS_MANAGER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `rider_status` ENUM('AVAILABLE', 'BUSY', 'OFFLINE') NOT NULL DEFAULT 'OFFLINE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. BRANCHES TABLE (Member 1 - Branch Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `branches` (
    `branch_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_name` VARCHAR(100) NOT NULL UNIQUE,
    `street_address` VARCHAR(255) NOT NULL,
    `contact_number` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `opening_time` TIME NOT NULL,
    `closing_time` TIME NOT NULL,
    `manager_id` BIGINT UNIQUE NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_branch_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. DELIVERY AREAS TABLE (Member 1 - Branch Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `delivery_areas` (
    `area_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT NOT NULL,
    `area_name` VARCHAR(100) NOT NULL,
    `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_area_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE CASCADE,
    INDEX `idx_area_branch` (`branch_id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. FOOD CATEGORIES TABLE (Member 2 - Menu Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `categories` (
    `category_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT NOT NULL,
    `category_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_category_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE CASCADE,
    CONSTRAINT `uq_branch_category` UNIQUE (`branch_id`, `category_name`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. MENU ITEMS TABLE (Member 2 - Menu Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `menu_items` (
    `item_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `food_name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `base_price` DECIMAL(10,2) NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_item_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_item_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT,
    INDEX `idx_item_category` (`category_id`),
    INDEX `idx_item_branch` (`branch_id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. MENU VARIATIONS TABLE (Member 2 - Menu Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `menu_variations` (
    `variation_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `item_id` BIGINT NOT NULL,
    `variation_name` VARCHAR(100) NOT NULL,
    `additional_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_variation_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. CUSTOMER ADDRESSES TABLE (Member 3 - Customer Ordering)
-- ----------------------------------------------------------------------------
CREATE TABLE `customer_addresses` (
    `address_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` BIGINT NOT NULL,
    `label` VARCHAR(50) NOT NULL DEFAULT 'Home',
    `house_number` VARCHAR(50) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `area_id` BIGINT NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_address_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_address_area` FOREIGN KEY (`area_id`) REFERENCES `delivery_areas` (`area_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. ORDERS TABLE (Member 3 & Member 4)
-- ----------------------------------------------------------------------------
CREATE TABLE `orders` (
    `order_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `customer_id` BIGINT NOT NULL,
    `branch_id` BIGINT NOT NULL,
    `order_type` ENUM('PICKUP', 'DELIVERY') NOT NULL,
    `status` ENUM(
        'PENDING', 
        'CONFIRMED', 
        'PREPARING', 
        'READY_FOR_PICKUP', 
        'PICKED_UP', 
        'READY_FOR_DELIVERY', 
        'OUT_FOR_DELIVERY', 
        'DELIVERED', 
        'CANCELLED', 
        'REJECTED'
    ) NOT NULL DEFAULT 'PENDING',
    `subtotal` DECIMAL(10,2) NOT NULL,
    `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `payment_method` ENUM('CARD', 'CASH_ON_DELIVERY') NOT NULL,
    `delivery_address_id` BIGINT NULL,
    `estimated_prep_minutes` INT NULL,
    `rejection_reason` VARCHAR(255) NULL,
    `cancellation_reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_order_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_order_address` FOREIGN KEY (`delivery_address_id`) REFERENCES `customer_addresses` (`address_id`) ON DELETE SET NULL,
    INDEX `idx_order_status` (`status`),
    INDEX `idx_order_branch` (`branch_id`),
    INDEX `idx_order_customer` (`customer_id`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. ORDER ITEMS TABLE (Member 3 - Customer Ordering)
-- ----------------------------------------------------------------------------
CREATE TABLE `order_items` (
    `order_item_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `item_id` BIGINT NOT NULL,
    `variation_id` BIGINT NULL,
    `item_name` VARCHAR(150) NOT NULL,
    `variation_name` VARCHAR(100) NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(10,2) NOT NULL,
    `total_price` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `fk_orderitem_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_orderitem_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_orderitem_variation` FOREIGN KEY (`variation_id`) REFERENCES `menu_variations` (`variation_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 10. DELIVERIES TABLE (Member 5 - Delivery Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `deliveries` (
    `delivery_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL UNIQUE,
    `rider_id` BIGINT NOT NULL,
    `status` ENUM('ASSIGNED', 'ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED') NOT NULL DEFAULT 'ASSIGNED',
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `accepted_at` TIMESTAMP NULL,
    `out_for_delivery_at` TIMESTAMP NULL,
    `delivered_at` TIMESTAMP NULL,
    CONSTRAINT `fk_delivery_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_delivery_rider` FOREIGN KEY (`rider_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    INDEX `idx_delivery_rider` (`rider_id`),
    INDEX `idx_delivery_status` (`status`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 11. COMPLAINTS TABLE (Member 6 - Complaint & Review Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `complaints` (
    `complaint_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `resolution_notes` TEXT NULL,
    `resolved_by` BIGINT NULL,
    `resolved_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_complaint_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_complaint_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_complaint_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_complaint_status` (`status`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 12. REVIEWS TABLE (Member 6 - Complaint & Review Management)
-- ----------------------------------------------------------------------------
CREATE TABLE `reviews` (
    `review_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL UNIQUE,
    `customer_id` BIGINT NOT NULL,
    `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `comment` TEXT NULL,
    `review_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    INDEX `idx_review_customer` (`customer_id`)
) ENGINE=InnoDB;
