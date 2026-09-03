import { query } from './index';

let migrationExecuted = false;

/**
 * Ensures all required database columns and tables exist in the connected MySQL instance.
 * Automatically handles schema migrations and self-heals empty tables with default menu items.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  if (migrationExecuted) return;

  try {
    // 1. Ensure `admin` table exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`admin\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`name\` varchar(50) NOT NULL UNIQUE,
          \`password\` varchar(255) NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const rootCheck = await query<any[]>('SELECT id, password FROM `admin` WHERE LOWER(`name`) = ? LIMIT 1', ['root']);
      if (!rootCheck || rootCheck.length === 0) {
        console.log('Seeding initial root super-admin account...');
        // SHA1 for 'root123'
        const rootHash = '0c04f2ff33c39f131a473f309a96e5781a8ef5a3';
        await query('INSERT INTO `admin` (`name`, `password`) VALUES (?, ?)', ['root', rootHash]);
      } else if (!rootCheck[0].password || rootCheck[0].password.startsWith('$2b$')) {
        const rootHash = '0c04f2ff33c39f131a473f309a96e5781a8ef5a3';
        await query('UPDATE `admin` SET `password` = ? WHERE `id` = ?', [rootHash, rootCheck[0].id]);
      }

      const adminCheck = await query<any[]>('SELECT id, password FROM `admin` WHERE LOWER(`name`) = ? LIMIT 1', ['admin']);
      if (!adminCheck || adminCheck.length === 0) {
        console.log('Seeding initial default admin account...');
        // SHA1 for 'admin123'
        const adminHash = 'd033e22ae348aeb5660fc2140aec35850c4da997';
        await query('INSERT INTO `admin` (`name`, `password`) VALUES (?, ?)', ['admin', adminHash]);
      } else if (!adminCheck[0].password || adminCheck[0].password.startsWith('$2b$')) {
        const adminHash = 'd033e22ae348aeb5660fc2140aec35850c4da997';
        await query('UPDATE `admin` SET `password` = ? WHERE `id` = ?', [adminHash, adminCheck[0].id]);
      }
      // Check and add session_id column for single-device session tracking
      try {
        const sessionColCheck = await query<any[]>(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin' AND COLUMN_NAME = 'session_id'
        `);
        if (!sessionColCheck || sessionColCheck.length === 0) {
          console.log('Adding session_id column to admin table for single-active-device tracking...');
          await query('ALTER TABLE `admin` ADD COLUMN `session_id` VARCHAR(100) DEFAULT NULL');
        }
      } catch (colErr) {
        // Fallback ALTER directly if information_schema query fails
        await query('ALTER TABLE `admin` ADD COLUMN IF NOT EXISTS `session_id` VARCHAR(100) DEFAULT NULL').catch(() => { });
      }
    } catch (adminErr) {
      console.warn('Notice: Admin table check:', adminErr);
    }

    // 2. Ensure `user` table exists & has required columns
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`user\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`name\` varchar(50) NOT NULL,
          \`email\` varchar(100) NOT NULL UNIQUE,
          \`password\` varchar(255) NOT NULL,
          \`address\` text DEFAULT NULL,
          \`number\` varchar(30) DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const userColumns = await query<{ Field: string }[]>('SHOW COLUMNS FROM `user`');
      const userFields = new Set(userColumns.map((c) => c.Field));

      if (!userFields.has('address')) {
        await query('ALTER TABLE `user` ADD COLUMN `address` TEXT DEFAULT NULL');
      }
      if (!userFields.has('number')) {
        await query('ALTER TABLE `user` ADD COLUMN `number` VARCHAR(30) DEFAULT NULL');
      }
      if (!userFields.has('saved_addresses')) {
        await query('ALTER TABLE `user` ADD COLUMN `saved_addresses` TEXT DEFAULT NULL');
      }
    } catch (userErr) {
      console.warn('Notice: User table check:', userErr);
    }

    // 3. Ensure `categories` table exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`categories\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`name\` varchar(100) NOT NULL UNIQUE,
          \`image\` varchar(255) DEFAULT NULL,
          \`default_options\` TEXT DEFAULT NULL,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const catColumns = await query<{ Field: string }[]>('SHOW COLUMNS FROM `categories`');
      const catFields = new Set(catColumns.map((c) => c.Field));
      if (!catFields.has('default_options')) {
        await query('ALTER TABLE `categories` ADD COLUMN `default_options` TEXT DEFAULT NULL');
      }

      const catCountResult = await query<{ count: number }[]>('SELECT COUNT(*) as count FROM `categories`');
      const catCount = Number(catCountResult[0]?.count || 0);
      if (catCount === 0) {
        console.log('Seeding initial categories table...');
        await query(`
          INSERT IGNORE INTO \`categories\` (\`name\`) VALUES
          ('Pizza'),
          ('Drinks'),
          ('Meals'),
          ('Burgers'),
          ('Sides'),
          ('Desserts')
        `);
      }

      // Seed default option templates for standard categories
      await query(`
        UPDATE \`categories\`
        SET \`default_options\` = '[{"id":"pizza_crust","title":"Select Crust Size","type":"single","required":true,"choices":[{"name":"Solo (10\\")","price":0},{"name":"Medium (12\\")","price":80},{"name":"Family (14\\")","price":150}]}]'
        WHERE \`name\` = 'Pizza' AND (\`default_options\` IS NULL OR \`default_options\` = '')
      `);

      await query(`
        UPDATE \`categories\`
        SET \`default_options\` = '[{"id":"drink_size","title":"Select Size / Volume","type":"single","required":true,"choices":[{"name":"500ml","price":0},{"name":"1 Liter","price":35},{"name":"1.5 Liters","price":60}]}]'
        WHERE \`name\` = 'Drinks' AND (\`default_options\` IS NULL OR \`default_options\` = '')
      `);

      await query(`
        UPDATE \`categories\`
        SET \`default_options\` = '[{"id":"burger_style","title":"Choose Style","type":"single","required":false,"choices":[{"name":"Classic","price":0},{"name":"With Melted Cheese","price":25},{"name":"Double Patty","price":60}]}]'
        WHERE \`name\` = 'Burgers' AND (\`default_options\` IS NULL OR \`default_options\` = '')
      `);

      await query(`
        UPDATE \`categories\`
        SET \`default_options\` = '[{"id":"flavor","title":"Choose Flavor / Spice Level","type":"single","required":false,"choices":[{"name":"Original (Mild)","price":0},{"name":"Spicy","price":0},{"name":"Extra Hot","price":10}]}]'
        WHERE \`name\` = 'Meals' AND (\`default_options\` IS NULL OR \`default_options\` = '')
      `);
    } catch (catErr) {
      console.warn('Notice: Categories table check:', catErr);
    }

    // 4. Ensure `products` table exists & has required columns
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`products\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`name\` varchar(100) NOT NULL,
          \`category\` varchar(100) NOT NULL DEFAULT 'Pizza',
          \`price\` decimal(10,2) NOT NULL,
          \`status\` ENUM('available', 'sold_out', 'unavailable', 'inactive') NOT NULL DEFAULT 'available',
          \`has_customizations\` tinyint(1) NOT NULL DEFAULT 1,
          \`customization_options\` TEXT DEFAULT NULL,
          \`description\` text DEFAULT NULL,
          \`image\` varchar(255) NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const productColumns = await query<{ Field: string }[]>('SHOW COLUMNS FROM `products`');
      const fields = new Set(productColumns.map((c) => c.Field));

      if (!fields.has('category')) {
        await query("ALTER TABLE `products` ADD COLUMN `category` VARCHAR(100) NOT NULL DEFAULT 'Pizza'");
        await query("UPDATE `products` SET `category` = 'Pizza' WHERE `category` IS NULL OR `category` = ''");
      }
      if (!fields.has('has_customizations')) {
        await query('ALTER TABLE `products` ADD COLUMN `has_customizations` TINYINT(1) NOT NULL DEFAULT 1');
        await query('UPDATE `products` SET `has_customizations` = 1 WHERE `has_customizations` IS NULL');
      }
      if (!fields.has('customization_options')) {
        await query('ALTER TABLE `products` ADD COLUMN `customization_options` TEXT DEFAULT NULL');
      }
      if (!fields.has('status')) {
        await query("ALTER TABLE `products` ADD COLUMN `status` ENUM('available', 'sold_out', 'unavailable', 'inactive') NOT NULL DEFAULT 'available'");
      }

      const countResult = await query<{ count: number }[]>('SELECT COUNT(*) as count FROM `products`');
      if (Number(countResult[0]?.count || 0) === 0) {
        console.log('Seeding initial products into empty catalog...');
        await query(`
          INSERT INTO \`products\` (\`name\`, \`category\`, \`price\`, \`status\`, \`has_customizations\`, \`description\`, \`image\`) VALUES
          ('Hawaiian Special', 'Pizza', 299.00, 'available', 1, 'Sweet juicy pineapple paired with premium smoked ham and rich mozzarella.', 'Hawaiian.png'),
          ('Triple Cheese Feast', 'Pizza', 349.00, 'available', 1, 'A heavenly blend of mozzarella, cheddar, and parmesan over signature pizza sauce.', 'Triple Cheese.png'),
          ('Double Cheese Pepperoni', 'Pizza', 399.00, 'available', 1, 'Classic crispy pepperoni loaded with double layers of stringy mozzarella.', 'Double Cheese Pepperoni.png'),
          ('Bacon & Pepperoni', 'Pizza', 420.00, 'available', 1, 'Smoked bacon strips and crispy pepperoni loaded over golden melted cheese.', 'Bacon and Pepperoni.png'),
          ('Italian Hawaiian', 'Pizza', 380.00, 'available', 1, 'Classic Hawaiian upgraded with Italian herbs and sun-ripened marinara.', 'Italian Hawaiian.png'),
          ('Beef & Onion Melt', 'Pizza', 360.00, 'available', 1, 'Seasoned minced beef with caramelized sweet onions and melted cheese.', 'Beef-n-Onion.png')
        `);
      }
    } catch (prodErr) {
      console.warn('Notice: Products table check:', prodErr);
    }

    // 5. Ensure `cart` table exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`cart\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`user_id\` int(100) NOT NULL,
          \`pid\` int(100) NOT NULL,
          \`name\` varchar(100) NOT NULL,
          \`price\` decimal(10,2) NOT NULL,
          \`quantity\` int(100) NOT NULL DEFAULT 1,
          \`image\` varchar(255) NOT NULL,
          \`options\` text DEFAULT NULL,
          \`sizeID\` int(100) DEFAULT NULL,
          \`customIDS\` varchar(255) DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const cartColumns = await query<{ Field: string }[]>('SHOW COLUMNS FROM `cart`');
      const cartFields = new Set(cartColumns.map((c) => c.Field));
      if (!cartFields.has('options')) {
        await query('ALTER TABLE `cart` ADD COLUMN `options` TEXT DEFAULT NULL');
      }
    } catch (cartErr) {
      console.warn('Notice: Cart table check:', cartErr);
    }

    // 6. Ensure `favorites` table exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`favorites\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`user_id\` int(100) NOT NULL,
          \`pid\` int(100) DEFAULT NULL,
          \`product_id\` int(100) DEFAULT NULL,
          \`name\` varchar(100) NOT NULL,
          \`price\` decimal(10,2) NOT NULL,
          \`image\` varchar(255) NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const favColumns = await query<{ Field: string }[]>('SHOW COLUMNS FROM `favorites`');
      const favFields = new Set(favColumns.map((c) => c.Field));
      if (!favFields.has('product_id')) {
        await query('ALTER TABLE `favorites` ADD COLUMN `product_id` int(100) DEFAULT NULL');
      }
      if (!favFields.has('pid')) {
        await query('ALTER TABLE `favorites` ADD COLUMN `pid` int(100) DEFAULT NULL');
      }
    } catch (favErr) {
      console.warn('Notice: Favorites table check:', favErr);
    }

    // 7. Ensure `orders` and `order_items` tables exist
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`orders\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`user_id\` int(100) NOT NULL,
          \`name\` varchar(100) NOT NULL,
          \`number\` varchar(30) NOT NULL,
          \`email\` varchar(100) DEFAULT NULL,
          \`method\` varchar(50) NOT NULL,
          \`address\` text NOT NULL,
          \`order_type\` ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery',
          \`order_status\` ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
          \`total_products\` text NOT NULL,
          \`total_price\` decimal(10,2) NOT NULL,
          \`placed_on\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`payment_status\` varchar(30) NOT NULL DEFAULT 'pending',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const orderColumns = await query<{ Field: string }[]>('SHOW COLUMNS FROM `orders`');
      const orderFields = new Set(orderColumns.map((c) => c.Field));

      if (!orderFields.has('order_type')) {
        await query("ALTER TABLE `orders` ADD COLUMN `order_type` ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery'");
      }
      if (!orderFields.has('order_status')) {
        await query("ALTER TABLE `orders` ADD COLUMN `order_status` ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'");
      }
      if (!orderFields.has('payment_proof')) {
        await query('ALTER TABLE `orders` ADD COLUMN `payment_proof` VARCHAR(255) DEFAULT NULL');
      }
      if (!orderFields.has('delivery_notes')) {
        await query('ALTER TABLE `orders` ADD COLUMN `delivery_notes` TEXT DEFAULT NULL');
      }
      if (!orderFields.has('cancellation_reason')) {
        await query('ALTER TABLE `orders` ADD COLUMN `cancellation_reason` TEXT DEFAULT NULL');
      }
      if (!orderFields.has('lat')) {
        await query('ALTER TABLE `orders` ADD COLUMN `lat` DECIMAL(10, 8) DEFAULT NULL');
      }
      if (!orderFields.has('lng')) {
        await query('ALTER TABLE `orders` ADD COLUMN `lng` DECIMAL(11, 8) DEFAULT NULL');
      }

      await query(`
        CREATE TABLE IF NOT EXISTS \`order_items\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`order_id\` int(100) NOT NULL,
          \`product_id\` int(100) NOT NULL,
          \`name\` varchar(100) NOT NULL,
          \`price\` decimal(10,2) NOT NULL,
          \`quantity\` int(11) NOT NULL DEFAULT 1,
          \`size\` varchar(100) DEFAULT NULL,
          \`customizations\` text DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (orderErr) {
      console.warn('Notice: Orders table check:', orderErr);
    }

    // 8. Ensure `sales` table exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`sales\` (
          \`id\` int(100) NOT NULL AUTO_INCREMENT,
          \`product_id\` int(100) NOT NULL,
          \`price\` decimal(10,2) NOT NULL,
          \`qty\` int(100) NOT NULL DEFAULT 1,
          \`sizeID\` varchar(100) DEFAULT NULL,
          \`cusIDs\` varchar(255) DEFAULT NULL,
          \`date\` timestamp DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (salesErr) {
      console.warn('Notice: Sales table check:', salesErr);
    }

    migrationExecuted = true;
  } catch (globalErr) {
    console.warn('Notice: ensureDatabaseSchema background execution:', globalErr);
  }
}
