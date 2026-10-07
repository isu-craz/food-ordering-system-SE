-- ============================================================================
-- SPICE AVENUE - MASTER SEED DATA SCRIPT (MySQL 8.x)
-- Default Password for all seeded accounts: Password123!
-- (BCrypt hash: $2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW)
-- ============================================================================

USE `spice_avenue_db`;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS (All 6 Roles)
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone_number`, `role`, `rider_status`) VALUES
-- Admin & Ops Manager (Member 1)
(1, 'System Administrator', 'admin@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110001', 'ADMIN', 'OFFLINE'),
(2, 'Operations Manager', 'ops@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110002', 'OPS_MANAGER', 'OFFLINE'),

-- Branch Managers (Member 1, 2, 4)
(3, 'Kasun Perera (Colombo Manager)', 'manager.colombo@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110003', 'BRANCH_MANAGER', 'OFFLINE'),
(4, 'Dinesh Silva (Negombo Manager)', 'manager.negombo@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110004', 'BRANCH_MANAGER', 'OFFLINE'),
(5, 'Nuwan Fernando (Kandy Manager)', 'manager.kandy@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110011', 'BRANCH_MANAGER', 'OFFLINE'),

-- Delivery Riders (Member 5)
(6, 'Kamal Perera (Rider)', 'rider.kamal@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110005', 'RIDER', 'AVAILABLE'),
(7, 'Nimal Silva (Rider)', 'rider.nimal@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110006', 'RIDER', 'AVAILABLE'),
(8, 'Sunil Fernando (Rider)', 'rider.sunil@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110007', 'RIDER', 'BUSY'),

-- Customer Service Supervisor (Member 6)
(9, 'Sarah Jayasinghe (Supervisor)', 'supervisor@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110008', 'SUPERVISOR', 'OFFLINE'),

-- Customers (Member 3 & 6)
(10, 'John Doe (Customer)', 'customer.john@gmail.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110009', 'CUSTOMER', 'OFFLINE'),
(11, 'Jane Smith (Customer)', 'customer.jane@gmail.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110010', 'CUSTOMER', 'OFFLINE'),
(12, 'Alex Rodrigo (Customer)', 'customer.alex@gmail.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110012', 'CUSTOMER', 'OFFLINE');

-- ----------------------------------------------------------------------------
-- 2. SEED BRANCHES (Member 1)
-- ----------------------------------------------------------------------------
INSERT INTO `branches` (`branch_id`, `branch_name`, `street_address`, `contact_number`, `email`, `opening_time`, `closing_time`, `manager_id`, `status`) VALUES
(1, 'Spice Avenue - Colombo Main', 'No. 120, Galle Road, Colombo 03', '0112345678', 'colombo@spiceavenue.com', '08:00:00', '23:00:00', 3, 'ACTIVE'),
(2, 'Spice Avenue - Negombo Coastal', 'No. 45, Beach Road, Negombo', '0312345678', 'negombo@spiceavenue.com', '09:00:00', '22:30:00', 4, 'ACTIVE'),
(3, 'Spice Avenue - Kandy Hills', 'No. 18, Dalada Veediya, Kandy', '0812345678', 'kandy@spiceavenue.com', '09:00:00', '22:00:00', 5, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 3. SEED DELIVERY AREAS (Member 1)
-- ----------------------------------------------------------------------------
INSERT INTO `delivery_areas` (`area_id`, `branch_id`, `area_name`, `delivery_fee`, `status`) VALUES
-- Colombo Areas
(1, 1, 'Colombo 01 (Fort)', 250.00, 'ACTIVE'),
(2, 1, 'Colombo 03 (Kollupitiya)', 150.00, 'ACTIVE'),
(3, 1, 'Colombo 04 (Bambalapitiya)', 180.00, 'ACTIVE'),
(4, 1, 'Colombo 07 (Cinnamon Gardens)', 200.00, 'ACTIVE'),
-- Negombo Areas
(5, 2, 'Negombo Town', 150.00, 'ACTIVE'),
(6, 2, 'Kurana', 200.00, 'ACTIVE'),
(7, 2, 'Katunayake', 250.00, 'ACTIVE'),
-- Kandy Areas
(8, 3, 'Kandy Town', 150.00, 'ACTIVE'),
(9, 3, 'Peradeniya', 220.00, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 4. SEED FOOD CATEGORIES (Member 2)
-- ----------------------------------------------------------------------------
INSERT INTO `categories` (`category_id`, `branch_id`, `category_name`, `description`, `status`) VALUES
(1, 1, 'Woodfired Pizzas', 'Handcrafted stone oven Neapolitan pizzas with gourmet toppings', 'ACTIVE'),
(2, 1, 'Gourmet Burgers', 'Flame-grilled smash patties with melted cheeses in toasted brioche', 'ACTIVE'),
(3, 1, 'Rice & Wok Bowls', 'Authentic Asian wok fried rice, spicy devilled bowls and noodles', 'ACTIVE'),
(4, 1, 'Starters & Sides', 'Crispy wings, loaded fries, garlic bread, and appetizers', 'ACTIVE'),
(5, 1, 'Pastas & Grills', 'Creamy Italian pastas, lasagna, and charcoal grilled meats', 'ACTIVE'),
(6, 1, 'Beverages & Mocktails', 'Fresh tropical juices, artisan mocktails, smoothies and shakes', 'ACTIVE'),
(7, 1, 'Decadent Desserts', 'Molten lava cakes, cheesecakes, and gelato sundaes', 'ACTIVE'),

-- Negombo Branch Categories
(8, 2, 'Woodfired Pizzas', 'Coastal style thin crust stone oven pizzas', 'ACTIVE'),
(9, 2, 'Seafood Grills & Platters', 'Fresh lagoon crab, grilled prawns and catch of the day', 'ACTIVE'),
(10, 2, 'Beverages & Smoothies', 'Chilled refreshments and shakes', 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 5. SEED MENU ITEMS (Member 2)
-- ----------------------------------------------------------------------------
INSERT INTO `menu_items` (`item_id`, `branch_id`, `category_id`, `food_name`, `description`, `base_price`, `image_url`, `is_available`, `status`) VALUES
-- Pizzas (Category 1)
(1, 1, 1, 'Spicy Devilled Chicken Pizza', 'Woodfired crust topped with spicy Sri Lankan devilled chicken, fiery capsicum, red onions and molten mozzarella.', 1850.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', TRUE, 'ACTIVE'),
(2, 1, 1, 'Classic Margherita Rustica', 'Rich San Marzano tomato reduction, buffalo mozzarella, olive oil drizzle and fresh aromatic basil leaves.', 1500.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500', TRUE, 'ACTIVE'),
(3, 1, 1, 'Smoky BBQ Beef & Bacon Pizza', 'Tender shredded BBQ beef brisket, crispy bacon bits, mushrooms and smoky cheddar blend.', 2150.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', TRUE, 'ACTIVE'),

-- Burgers (Category 2)
(4, 1, 2, 'Double Beef Smash Supreme', 'Two 100% prime Angus beef smash patties, double aged cheddar, dill pickles and signature house glaze in brioche.', 1650.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', TRUE, 'ACTIVE'),
(5, 1, 2, 'Crispy Hot Honey Chicken Burger', 'Crispy spiced buttermilk fried chicken fillet, spicy scotch bonnet honey drizzle, tangy slaw and creamy mayo.', 1450.00, 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500', TRUE, 'ACTIVE'),

-- Rice & Wok (Category 3)
(6, 1, 3, 'Signature Indonesian Nasi Goreng', 'Spicy wok tossed jasmine rice with chicken skewers, fried sunny-side egg, chili sambal and crispy prawn crackers.', 1400.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500', TRUE, 'ACTIVE'),
(7, 1, 3, 'Fiery Black Pepper Wok Noodles', 'Yellow egg noodles tossed with wok charred beef strips, crunchy bell peppers, scallions and cracked peppercorn sauce.', 1550.00, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500', TRUE, 'ACTIVE'),

-- Starters & Sides (Category 4)
(8, 1, 4, 'Buffalo Wings with Ranch Dip', 'Six crispy chicken wings tossed in tangy cayenne pepper hot sauce served with house blue cheese dip.', 1100.00, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500', TRUE, 'ACTIVE'),
(9, 1, 4, 'Truffle & Parmesan Loaded Fries', 'Golden skin-on shoestring fries tossed in white truffle oil, grated aged parmesan and minced fresh parsley.', 850.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', TRUE, 'ACTIVE'),

-- Pastas & Grills (Category 5)
(10, 1, 5, 'Creamy Fettuccine Carbonara', 'Fresh fettuccine pasta in rich egg-yolk and parmesan cream sauce with crispy pancetta bacon.', 1750.00, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500', TRUE, 'ACTIVE'),
(11, 1, 5, 'Grilled Chicken Breast with Herb Butter', 'Tender herb-marinated grilled chicken breast served with creamy mashed potatoes and glazed garden veggies.', 1950.00, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500', TRUE, 'ACTIVE'),

-- Beverages (Category 6)
(12, 1, 6, 'Tropical Mango & Passion Cooler', 'Fresh blended ripe Alphonso mango and passion fruit nectar over crushed ice with mint sprig.', 650.00, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500', TRUE, 'ACTIVE'),
(13, 1, 6, 'Belgian Iced Dark Chocolate Shake', 'Decadent chilled Belgian dark chocolate blended with whole milk and topped with whipped cream.', 750.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500', TRUE, 'ACTIVE'),

-- Desserts (Category 7)
(14, 1, 7, 'Molten Dark Chocolate Lava Cake', 'Warm molten Valrhona chocolate cake with a rich flowing center served with a scoop of vanilla bean gelato.', 850.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', TRUE, 'ACTIVE'),
(15, 1, 7, 'New York Style Baked Cheesecake', 'Classic creamy baked vanilla cheesecake on a buttery graham cracker crust with wild berry compote.', 950.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500', TRUE, 'ACTIVE'),

-- Negombo Branch Items
(16, 2, 8, 'Negombo Lagoon Prawn Pizza', 'Fresh lagoon prawns, chili flakes, mozzarella, roasted garlic cloves and herb oil.', 2200.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', TRUE, 'ACTIVE'),
(17, 2, 9, 'Grilled Jumbo Butter Garlic Prawns', 'Charcoal grilled jumbo prawns smothered in garlic butter served with salad and fries.', 2600.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', TRUE, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 6. SEED MENU VARIATIONS (Member 2)
-- ----------------------------------------------------------------------------
INSERT INTO `menu_variations` (`variation_id`, `item_id`, `variation_name`, `additional_price`, `status`) VALUES
-- Spicy Devilled Chicken Pizza
(1, 1, 'Small (6-inch)', 0.00, 'ACTIVE'),
(2, 1, 'Medium (9-inch)', 600.00, 'ACTIVE'),
(3, 1, 'Large (12-inch)', 1200.00, 'ACTIVE'),

-- Classic Margherita Rustica
(4, 2, 'Small (6-inch)', 0.00, 'ACTIVE'),
(5, 2, 'Medium (9-inch)', 500.00, 'ACTIVE'),
(6, 2, 'Large (12-inch)', 1000.00, 'ACTIVE'),

-- Smoky BBQ Beef Pizza
(7, 3, 'Small (6-inch)', 0.00, 'ACTIVE'),
(8, 3, 'Medium (9-inch)', 700.00, 'ACTIVE'),
(9, 3, 'Large (12-inch)', 1400.00, 'ACTIVE'),

-- Double Beef Smash Supreme (Portion / Combo)
(10, 4, 'Single Combo (with Fries & Drink)', 450.00, 'ACTIVE'),
(11, 4, 'Double Meat Patty Extra', 500.00, 'ACTIVE'),

-- Crispy Hot Honey Chicken Burger
(12, 5, 'Meal Combo (with Fries & Coke)', 450.00, 'ACTIVE'),

-- Smoothies & Shakes
(13, 12, 'Regular (350ml)', 0.00, 'ACTIVE'),
(14, 12, 'Large (500ml)', 250.00, 'ACTIVE'),
(15, 13, 'Regular (350ml)', 0.00, 'ACTIVE'),
(16, 13, 'Large (500ml)', 300.00, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 7. SEED CUSTOMER ADDRESSES (Member 3)
-- ----------------------------------------------------------------------------
INSERT INTO `customer_addresses` (`address_id`, `customer_id`, `label`, `house_number`, `street`, `area_id`, `is_default`) VALUES
(1, 10, 'Home', 'No. 24/B', 'Duplication Road, Kollupitiya', 2, TRUE),
(2, 10, 'Office', 'Level 14, World Trade Center', 'Echelon Square, Fort', 1, FALSE),
(3, 11, 'Apartment', 'Tower A, 8th Floor, Emperor Residencies', 'Galle Road, Colombo 03', 2, TRUE),
(4, 11, 'Villa', 'No. 88', 'Beach Road, Negombo', 5, FALSE),
(5, 12, 'Residence', 'No. 15/4', 'Independence Avenue, Cinnamon Gardens', 4, TRUE);

-- ----------------------------------------------------------------------------
-- 8. SEED ORDERS (Member 3, 4, 5, 6) - Rich Order History
-- ----------------------------------------------------------------------------
INSERT INTO `orders` (`order_id`, `order_number`, `customer_id`, `branch_id`, `order_type`, `status`, `subtotal`, `delivery_fee`, `total_amount`, `payment_method`, `delivery_address_id`, `estimated_prep_minutes`, `created_at`) VALUES
-- Order 1: Completed Delivery Order (Delivered 3 days ago for John Doe)
(1, 'ORD-20261003-001', 10, 1, 'DELIVERY', 'DELIVERED', 3300.00, 150.00, 3450.00, 'CARD', 1, 25, DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Order 2: Completed Pickup Order (Picked up 2 days ago for John Doe)
(2, 'ORD-20261004-002', 10, 1, 'PICKUP', 'PICKED_UP', 2300.00, 0.00, 2300.00, 'CARD', NULL, 20, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Order 3: Completed Delivery Order (Delivered yesterday for John Doe)
(3, 'ORD-20261005-003', 10, 1, 'DELIVERY', 'DELIVERED', 2950.00, 150.00, 3100.00, 'CARD', 1, 30, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Order 4: Active In-Progress Delivery Order (Out for Delivery today for John Doe)
(4, 'ORD-20261006-004', 10, 1, 'DELIVERY', 'OUT_FOR_DELIVERY', 2100.00, 150.00, 2250.00, 'CARD', 1, 25, DATE_SUB(NOW(), INTERVAL 35 MINUTE)),

-- Order 5: Active In-Progress Kitchen Preparing Order (Preparing right now for John Doe)
(5, 'ORD-20261006-005', 10, 1, 'DELIVERY', 'PREPARING', 2700.00, 150.00, 2850.00, 'CASH_ON_DELIVERY', 2, 20, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

-- Order 6: Newly Placed Order (Pending approval for Jane Smith)
(6, 'ORD-20261006-006', 11, 1, 'DELIVERY', 'PENDING', 2500.00, 200.00, 2700.00, 'CARD', 3, NULL, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),

-- Order 7: Completed Pickup Order (Delivered for Jane Smith)
(7, 'ORD-20261005-007', 11, 1, 'PICKUP', 'PICKED_UP', 1500.00, 0.00, 1500.00, 'CASH_ON_DELIVERY', NULL, 15, DATE_SUB(NOW(), INTERVAL 20 HOUR)),

-- Order 8: Cancelled Order (Customer changed mind)
(8, 'ORD-20261004-008', 10, 1, 'DELIVERY', 'CANCELLED', 1650.00, 150.00, 1800.00, 'CARD', 1, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ----------------------------------------------------------------------------
-- 9. SEED ORDER ITEMS (Member 3)
-- ----------------------------------------------------------------------------
INSERT INTO `order_items` (`order_item_id`, `order_id`, `item_id`, `variation_id`, `item_name`, `variation_name`, `quantity`, `unit_price`, `total_price`) VALUES
-- Items for Order 1 (Total 3300)
(1, 1, 1, 2, 'Spicy Devilled Chicken Pizza', 'Medium (9-inch)', 1, 2450.00, 2450.00),
(2, 1, 9, NULL, 'Truffle & Parmesan Loaded Fries', NULL, 1, 850.00, 850.00),

-- Items for Order 2 (Total 2300)
(3, 2, 4, NULL, 'Double Beef Smash Supreme', NULL, 1, 1650.00, 1650.00),
(4, 2, 12, 13, 'Tropical Mango & Passion Cooler', 'Regular (350ml)', 1, 650.00, 650.00),

-- Items for Order 3 (Total 2950)
(5, 3, 5, 12, 'Crispy Hot Honey Chicken Burger', 'Meal Combo (with Fries & Coke)', 1, 1900.00, 1900.00),
(6, 3, 13, 16, 'Belgian Iced Dark Chocolate Shake', 'Large (500ml)', 1, 1050.00, 1050.00),

-- Items for Order 4 (Total 2100)
(7, 4, 4, 10, 'Double Beef Smash Supreme', 'Single Combo (with Fries & Drink)', 1, 2100.00, 2100.00),

-- Items for Order 5 (Total 2700)
(8, 5, 6, NULL, 'Signature Indonesian Nasi Goreng', NULL, 1, 1400.00, 1400.00),
(9, 5, 8, NULL, 'Buffalo Wings with Ranch Dip', NULL, 1, 1100.00, 1100.00),
(10, 5, 14, NULL, 'Molten Dark Chocolate Lava Cake', NULL, 1, 850.00, 850.00),

-- Items for Order 6 (Total 2500)
(11, 6, 2, 5, 'Classic Margherita Rustica', 'Medium (9-inch)', 1, 2000.00, 2000.00),
(12, 6, 12, 13, 'Tropical Mango & Passion Cooler', 'Regular (350ml)', 1, 650.00, 650.00),

-- Items for Order 7 (Total 1500)
(13, 7, 2, 4, 'Classic Margherita Rustica', 'Small (6-inch)', 1, 1500.00, 1500.00),

-- Items for Order 8 (Total 1650)
(14, 8, 4, NULL, 'Double Beef Smash Supreme', NULL, 1, 1650.00, 1650.00);

-- ----------------------------------------------------------------------------
-- 10. SEED DELIVERIES (Member 5)
-- ----------------------------------------------------------------------------
INSERT INTO `deliveries` (`delivery_id`, `order_id`, `rider_id`, `status`, `assigned_at`, `accepted_at`, `out_for_delivery_at`, `delivered_at`) VALUES
-- Delivery for Order 1 (Completed by Kamal)
(1, 1, 6, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 71 HOUR), DATE_SUB(NOW(), INTERVAL 70 HOUR), DATE_SUB(NOW(), INTERVAL 69 HOUR)),

-- Delivery for Order 3 (Completed by Nimal)
(2, 3, 7, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 23 HOUR), DATE_SUB(NOW(), INTERVAL 22 HOUR), DATE_SUB(NOW(), INTERVAL 21 HOUR)),

-- Delivery for Order 4 (Active Out For Delivery by Sunil)
(3, 4, 8, 'OUT_FOR_DELIVERY', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL);

-- ----------------------------------------------------------------------------
-- 11. SEED COMPLAINTS (Member 6)
-- ----------------------------------------------------------------------------
INSERT INTO `complaints` (`complaint_id`, `order_id`, `customer_id`, `category`, `description`, `image_url`, `status`, `resolution_notes`, `resolved_by`, `resolved_at`, `created_at`) VALUES
(1, 1, 10, 'Packaging & Quality', 'The pizza box corner was crushed slightly in transit causing some cheese to stick to lid.', NULL, 'RESOLVED', 'Credited 250 LKR Spice Avenue loyalty voucher to customer account.', 9, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 3, 10, 'Late Delivery', 'Rider was delayed by 15 mins due to heavy rain in Kollupitiya area.', NULL, 'RESOLVED', 'Apologised to customer and provided express delivery priority for next 3 orders.', 9, DATE_SUB(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 22 HOUR));

-- ----------------------------------------------------------------------------
-- 12. SEED REVIEWS (Member 6)
-- ----------------------------------------------------------------------------
INSERT INTO `reviews` (`review_id`, `order_id`, `customer_id`, `rating`, `comment`, `review_date`) VALUES
(1, 1, 10, 5, 'Spicy devilled chicken pizza was absolutely fantastic! Crust was crisp and flavorful.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 2, 10, 5, 'Double beef smash burger is the best burger in Colombo. Super juicy and cheesy.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 3, 10, 4, 'Hot honey chicken burger was spicy and crispy. Great taste, delivery had minor rain delay.', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(4, 7, 11, 5, 'Fresh Margherita with authentic basil leaves. Loved every bite!', DATE_SUB(NOW(), INTERVAL 19 HOUR));
