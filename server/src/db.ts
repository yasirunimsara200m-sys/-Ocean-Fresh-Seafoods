import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'seafood.db');
export const db = new Database(dbPath);

// Enable foreign keys & WAL mode for performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS outlets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      opening_hours TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id TEXT NOT NULL,
      outlet_id TEXT,
      short_description TEXT,
      description TEXT,
      base_price REAL NOT NULL,
      original_price REAL,
      unit TEXT DEFAULT '1 KG',
      in_stock INTEGER DEFAULT 1,
      stock_quantity INTEGER DEFAULT 50,
      is_featured INTEGER DEFAULT 0,
      is_best_seller INTEGER DEFAULT 0,
      image_url TEXT NOT NULL,
      gallery_json TEXT DEFAULT '[]',
      variants_json TEXT DEFAULT '[]',
      freshness_badge TEXT DEFAULT 'Export Quality',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_city TEXT NOT NULL,
      outlet_id TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      delivery_time_slot TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'pending',
      subtotal REAL NOT NULL,
      delivery_fee REAL DEFAULT 350,
      total_amount REAL NOT NULL,
      items_json TEXT NOT NULL,
      special_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      author_name TEXT NOT NULL,
      location TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      review_text TEXT NOT NULL,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
  if (adminCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO admins (id, username, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin-1', 'admin', passwordHash, 'Store Administrator', 'superadmin');
    console.log('Default admin seeded: admin / admin123');
  }

  // Seed Outlets if none exist
  const outletCount = db.prepare('SELECT COUNT(*) as count FROM outlets').get() as { count: number };
  if (outletCount.count === 0) {
    const outletsData = [
      {
        id: 'outlet-athurugiriya',
        name: 'Athurugiriya Central Fulfillment Hub',
        slug: 'athurugiriya',
        city: 'Athurugiriya',
        address: '304/A, Godagama Road, Athurugiriya',
        phone: '+94 72 342 6084',
        email: 'orders@oceanfresh.lk',
        opening_hours: '8:00 AM - 7:30 PM (Daily Online Orders & Direct Home Delivery)',
        is_active: 1
      }
    ];

    const insertOutlet = db.prepare(`
      INSERT INTO outlets (id, name, slug, city, address, phone, email, opening_hours, is_active)
      VALUES (@id, @name, @slug, @city, @address, @phone, @email, @opening_hours, @is_active)
    `);

    for (const out of outletsData) {
      insertOutlet.run(out);
    }
    console.log('Seeded Athurugiriya fulfillment hub successfully.');
  }

  // Seed Categories if none exist
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (catCount.count === 0) {
    const categoriesData = [
      {
        id: 'cat-prawns',
        name: 'Prawns & Shrimps',
        slug: 'prawns-shrimps',
        description: 'Peeled, deveined, tiger prawns and wild sea caught shrimp',
        image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
        display_order: 1
      },
      {
        id: 'cat-fish',
        name: 'Fresh Fish',
        slug: 'fish',
        description: 'Prime Seer fish, Yellowfin Tuna steaks, Thalapath, Modha & Snapper',
        image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
        display_order: 2
      },
      {
        id: 'cat-squid',
        name: 'Squid & Cuttlefish',
        slug: 'squid',
        description: 'Whole cleaned squid, calamari rings, and tender cuttlefish fillets',
        image_url: 'https://images.unsplash.com/photo-1606850246029-dd00bd5df9e3?auto=format&fit=crop&w=800&q=80',
        display_order: 4
      },
      {
        id: 'cat-imported',
        name: 'Imported Gourmet',
        slug: 'imported-seafood',
        description: 'Norwegian Atlantic Salmon fillets, Chilean Sea Bass, and Scallops',
        image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        display_order: 5
      },
      {
        id: 'cat-dumplings',
        name: 'Dumplings & Bites',
        slug: 'dumplings-bites',
        description: 'Handcrafted artisan seafood dumplings and ready-to-fry crispy prawn bites',
        image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
        display_order: 6
      }
    ];

    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, image_url, display_order)
      VALUES (@id, @name, @slug, @description, @image_url, @display_order)
    `);

    for (const c of categoriesData) {
      insertCat.run(c);
    }
    console.log('Seeded categories successfully.');
  }

  // Seed Products if none exist
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (prodCount.count === 0) {
    const productsData = [
      {
        id: 'prod-squid-1kg',
        name: 'Cleaned Squid 1 KG',
        slug: 'cleaned-squid-1kg',
        category_id: 'cat-squid',
        short_description: 'Fresh ocean squid cleaned inside and out, available in U3 and U5 grading.',
        description: 'Tender ocean squid cleaned inside and out with skin and quill completely removed. Ideal for salt-and-pepper calamari, spicy devilled squid, or rich coconut curries.',
        base_price: 1900,
        original_price: 2150,
        unit: '1 KG',
        in_stock: 1,
        stock_quantity: 40,
        is_featured: 1,
        is_best_seller: 1,
        freshness_badge: 'Day Catch',
        image_url: 'https://images.unsplash.com/photo-1606850246029-dd00bd5df9e3?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([
          'https://images.unsplash.com/photo-1606850246029-dd00bd5df9e3?auto=format&fit=crop&w=800&q=80'
        ]),
        variants_json: JSON.stringify([
          { id: 'v-u3', name: 'U3 (Large) - 1 KG', price: 1900, weight: '1 KG', cut: 'U3 Grade' },
          { id: 'v-u5', name: 'U5 (Medium) - 1 KG', price: 2000, weight: '1 KG', cut: 'U5 Grade' }
        ])
      },
      {
        id: 'prod-tuna-cubes-500g',
        name: 'Yellowfin Tuna Cubes 500g',
        slug: 'yellowfin-tuna-cubes-500g',
        category_id: 'cat-fish',
        short_description: 'Boneless, skinless Yellowfin Tuna cubes freshly cut from export grade loins.',
        description: 'Deep red, lean, boneless Yellowfin Tuna cubes. Perfect for classic Sri Lankan ambul thiyal, fiery black fish curry, or sizzling devilled dishes.',
        base_price: 1950,
        original_price: 2200,
        unit: '500g',
        in_stock: 1,
        stock_quantity: 50,
        is_featured: 1,
        is_best_seller: 1,
        freshness_badge: 'Export Grade',
        image_url: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([]),
        variants_json: JSON.stringify([
          { id: 'v1', name: '500g Boneless Cubes', price: 1950, weight: '500g', cut: 'Boneless Cubes' },
          { id: 'v2', name: '1 KG Boneless Cubes', price: 3900, weight: '1 KG', cut: 'Boneless Cubes' }
        ])
      },
      {
        id: 'prod-white-fish-fillet-1kg',
        name: 'White Fish Fillet 1 KG',
        slug: 'white-fish-fillet-1kg',
        category_id: 'cat-fish',
        short_description: 'Skinless, boneless tender white fish fillets with a mild, sweet delicate taste.',
        description: 'Prime boneless white fish fillets with tender, flaky texture. Super versatile for crisp fish and chips, pan-searing with lemon butter, or creamy baked fish casseroles.',
        base_price: 2000,
        original_price: 2300,
        unit: '1 KG',
        in_stock: 1,
        stock_quantity: 45,
        is_featured: 1,
        is_best_seller: 1,
        freshness_badge: 'Boneless & Cleaned',
        image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([]),
        variants_json: JSON.stringify([
          { id: 'v1', name: '1 KG Boneless Fillet', price: 2000, weight: '1 KG', cut: 'Skinless Fillet' }
        ])
      },
      {
        id: 'prod-barramundi-fillet-1kg',
        name: 'Barramundi (Modha) Fillet 1 KG',
        slug: 'barramundi-modha-fillet-1kg',
        category_id: 'cat-fish',
        short_description: 'Premium ocean Barramundi (Modha) boneless fillet with flaky, buttery white meat.',
        description: 'Fresh ocean Barramundi (Modha) carefully filleted and pin-bone removed. Revered for its buttery, moist texture. Ideal for grilling, pan-frying with crispy skin, or steaming.',
        base_price: 4200,
        original_price: 4600,
        unit: '1 KG',
        in_stock: 1,
        stock_quantity: 35,
        is_featured: 1,
        is_best_seller: 0,
        freshness_badge: 'Chef Favorite',
        image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([]),
        variants_json: JSON.stringify([
          { id: 'v1', name: '1 KG Boneless Fillet', price: 4200, weight: '1 KG', cut: 'Boneless Fillet' }
        ])
      },
      {
        id: 'prod-seer-fish-cubes-500g',
        name: 'Seer Fish (Thora) Cubes 500g',
        slug: 'seer-fish-thora-cubes-500g',
        category_id: 'cat-fish',
        short_description: 'Premium boneless Seer fish (Thora) cut into succulent, firm cooking cubes.',
        description: 'Cut from pristine day-boat Sri Lankan Seer fish. 100% boneless, firm white flesh that absorbs spices and marinades deliciously for curries, pan-searing, and gourmet grills.',
        base_price: 2500,
        original_price: 2800,
        unit: '500g',
        in_stock: 1,
        stock_quantity: 50,
        is_featured: 1,
        is_best_seller: 1,
        freshness_badge: 'Day-Boat Fresh',
        image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([]),
        variants_json: JSON.stringify([
          { id: 'v1', name: '500g Boneless Cubes', price: 2500, weight: '500g', cut: 'Boneless Cubes' },
          { id: 'v2', name: '1 KG Boneless Cubes', price: 5000, weight: '1 KG', cut: 'Boneless Cubes' }
        ])
      },
      {
        id: 'prod-salmon-steak-226g',
        name: 'Salmon Steak 226g',
        slug: 'salmon-steak-226g',
        category_id: 'cat-imported',
        short_description: 'Norwegian Atlantic Salmon steak portion packed with rich Omega-3 fatty acids.',
        description: 'Certified premium Atlantic salmon portion with vibrant coral pink colour and succulent fat marbling. Perfect for searing with garlic herbs, teriyaki glaze, or baking.',
        base_price: 3000,
        original_price: 3400,
        unit: '226g (Portion)',
        in_stock: 1,
        stock_quantity: 40,
        is_featured: 1,
        is_best_seller: 1,
        freshness_badge: 'Air Flown Premium',
        image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([]),
        variants_json: JSON.stringify([
          { id: 'v1', name: '226g Steak Portion', price: 3000, weight: '226g', cut: 'Steak Portion' }
        ])
      },
      {
        id: 'prod-clean-prawns',
        name: 'Cleaned Prawns (P&D Tail-On) 1 KG',
        slug: 'cleaned-prawns-pd-tail-on-1kg',
        category_id: 'cat-prawns',
        short_description: 'Hygienically peeled & deveined fresh prawns available in Small, Medium Small, Medium Large, Large, and Jumbo sizes.',
        description: 'Cleaned, peeled and deveined sea prawns ready for cooking. Naturally sweet, firm and delicious for devilled curries, garlic butter sauté, and crispy tempura.',
        base_price: 3200,
        original_price: 3600,
        unit: '1 KG',
        in_stock: 1,
        stock_quantity: 60,
        is_featured: 1,
        is_best_seller: 1,
        freshness_badge: 'Cleaned & Ready',
        image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([
          'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80'
        ]),
        variants_json: JSON.stringify([
          { id: 'v-prawn-small', name: 'Small 1 KG', price: 3200, weight: '1 KG', cut: 'Small (Cleaned)' },
          { id: 'v-prawn-med-small', name: 'Medium Small 1 KG', price: 3600, weight: '1 KG', cut: 'Medium Small' },
          { id: 'v-prawn-med-large', name: 'Medium Large 1 KG', price: 3900, weight: '1 KG', cut: 'Medium Large' },
          { id: 'v-prawn-large', name: 'Large 1 KG', price: 4500, weight: '1 KG', cut: 'Large' },
          { id: 'v-prawn-jumbo', name: 'Jumbo 1 KG', price: 5000, weight: '1 KG', cut: 'Jumbo' }
        ])
      },
      {
        id: 'prod-dumplings',
        name: 'Handcrafted Dumplings (Chicken / Seafood)',
        slug: 'handcrafted-dumplings-chicken-seafood',
        category_id: 'cat-dumplings',
        short_description: 'Artisan handcrafted thin-skin dumplings packed with succulent Chicken or Seafood filling.',
        description: 'Authentic gourmet dumplings crafted with fresh ingredients. Simply steam for 6-8 minutes or pan-fry into crispy potstickers. Available in delicious Chicken and Seafood varieties.',
        base_price: 1850,
        original_price: 2100,
        unit: 'Pack of 12 pcs',
        in_stock: 1,
        stock_quantity: 50,
        is_featured: 1,
        is_best_seller: 1,
        freshness_badge: 'Handcrafted',
        image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
        gallery_json: JSON.stringify([]),
        variants_json: JSON.stringify([
          { id: 'v-dump-chicken', name: 'Chicken Dumplings (12 pcs)', price: 1850, weight: '12 pcs', cut: 'Chicken' },
          { id: 'v-dump-seafood', name: 'Seafood Dumplings (12 pcs)', price: 2100, weight: '12 pcs', cut: 'Seafood' }
        ])
      }
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, slug, category_id, short_description, description, base_price,
        original_price, unit, in_stock, stock_quantity, is_featured, is_best_seller,
        freshness_badge, image_url, gallery_json, variants_json
      )
      VALUES (
        @id, @name, @slug, @category_id, @short_description, @description, @base_price,
        @original_price, @unit, @in_stock, @stock_quantity, @is_featured, @is_best_seller,
        @freshness_badge, @image_url, @gallery_json, @variants_json
      )
    `);

    for (const p of productsData) {
      insertProd.run(p);
    }
    console.log('Seeded products successfully.');
  }
}
