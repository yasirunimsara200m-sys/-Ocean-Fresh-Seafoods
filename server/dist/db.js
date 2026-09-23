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
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
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
    const outletCount = db.prepare('SELECT COUNT(*) as count FROM outlets').get();
    if (outletCount.count === 0) {
        const outletsData = [
            {
                id: 'outlet-kirulapone',
                name: 'Kirulapone Flagship Store & Hub',
                slug: 'kirulapone',
                city: 'Kirulapone, Colombo 5',
                address: 'No. 142, High Level Road, Kirulapone, Colombo 5',
                phone: '+94 78 479 8095',
                email: 'orders@ceyloncatch.lk',
                opening_hours: '7:30 AM - 7:30 PM (Daily Fresh Catch & Delivery)',
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
        console.log('Seeded Kirulapone outlet successfully.');
    }
    // Seed Categories if none exist
    const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
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
                id: 'cat-crab',
                name: 'Mud Crab & Meat',
                slug: 'crab',
                description: 'Live lagoon mud crabs, cut swimmer crab, picked claw & lump meat',
                image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
                display_order: 3
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
    const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    if (prodCount.count === 0) {
        const productsData = [
            {
                id: 'prod-seer-fish',
                name: 'Premium Seer Fish (Thora) Steaks',
                slug: 'premium-seer-fish-thora-steaks',
                category_id: 'cat-fish',
                short_description: 'Freshly cut, thick, bone-in steaks of pristine Sri Lankan Seer fish.',
                description: 'Recognized as the king of fish in Sri Lanka. Sourced directly from deep-sea day boats off the southern and eastern shores. Sliced to perfection with high-protein, firm, flaky white flesh ideal for classic fish curries, pan-searing, and tandoori grills.',
                base_price: 3850,
                original_price: 4200,
                unit: '1 KG',
                in_stock: 1,
                stock_quantity: 45,
                is_featured: 1,
                is_best_seller: 1,
                freshness_badge: 'Day-Boat Fresh',
                image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([
                    'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'
                ]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g Sliced Steaks', price: 1950, weight: '500g', cut: 'Steaks' },
                    { id: 'v2', name: '1 KG Sliced Steaks', price: 3850, weight: '1 KG', cut: 'Steaks' },
                    { id: 'v3', name: '1 KG Boneless Curry Cubes', price: 4400, weight: '1 KG', cut: 'Boneless Cubes' },
                    { id: 'v4', name: '2 KG Whole Gutted & Cleaned', price: 7400, weight: '2 KG', cut: 'Whole Cleaned' }
                ])
            },
            {
                id: 'prod-yellowfin-tuna',
                name: 'Export Grade Yellowfin Tuna Steaks',
                slug: 'export-grade-yellowfin-tuna-steaks',
                category_id: 'cat-fish',
                short_description: 'Ruby red, lean, sashimi-standard yellowfin tuna from sustainable longline fisheries.',
                description: 'CeylonCatch grade AAA yellowfin tuna carefully processed in HACCP & EU-certified processing facilities. Rich in Omega-3 fatty acids and packed with wholesome goodness. Perfect for seared tuna steaks with sesame crust or fresh sashimi.',
                base_price: 2950,
                original_price: 3300,
                unit: '1 KG',
                in_stock: 1,
                stock_quantity: 60,
                is_featured: 1,
                is_best_seller: 1,
                freshness_badge: 'Sashimi Grade',
                image_url: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([
                    'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80'
                ]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g Loin Portions', price: 1500, weight: '500g', cut: 'Loins' },
                    { id: 'v2', name: '1 KG Cut Steaks', price: 2950, weight: '1 KG', cut: 'Steaks' },
                    { id: 'v3', name: '1 KG Boneless Cubes', price: 3100, weight: '1 KG', cut: 'Boneless Cubes' }
                ])
            },
            {
                id: 'prod-clean-prawns',
                name: 'Cleaned Prawns (P&D) Tail-On 1KG',
                slug: 'cleaned-prawns-pd-tail-on-1kg',
                category_id: 'cat-prawns',
                short_description: 'Hygienically peeled, deveined, sweet succulent prawns ready to toss into your pan.',
                description: 'Save prep time with our spotless, peeled and deveined sea prawns with the tail preserved for presentation. Tender, naturally sweet, and never treated with harsh chemicals. Excellent for garlic butter sauté, devilled prawns, and prawn biryani.',
                base_price: 3600,
                original_price: 3950,
                unit: '1 KG',
                in_stock: 1,
                stock_quantity: 80,
                is_featured: 1,
                is_best_seller: 1,
                freshness_badge: 'Export Quality',
                image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([
                    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80'
                ]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g P&D Tail-On', price: 1850, weight: '500g', cut: 'Tail-On' },
                    { id: 'v2', name: '1 KG P&D Tail-On (Medium)', price: 3600, weight: '1 KG', cut: 'Tail-On' },
                    { id: 'v3', name: '1 KG Tail-Off Complete', price: 3700, weight: '1 KG', cut: 'Tail-Off' }
                ])
            },
            {
                id: 'prod-jumbo-tiger-prawns',
                name: 'Jumbo Black Tiger Prawns (Whole)',
                slug: 'jumbo-black-tiger-prawns-whole',
                category_id: 'cat-prawns',
                short_description: 'Massive, juicy jumbo tiger prawns with tiger-striped shells and firm meat.',
                description: 'Wild lagoon and coastal black tiger prawns known for their impressive size and robust flavour. The firm texture holds up beautifully over open charcoal barbecues, sizzling garlic platters, and fine-dining banquets.',
                base_price: 4900,
                original_price: 5400,
                unit: '1 KG (8-12 pieces)',
                in_stock: 1,
                stock_quantity: 35,
                is_featured: 1,
                is_best_seller: 0,
                freshness_badge: 'Jumbo Size',
                image_url: 'https://images.unsplash.com/photo-1559742811-82286364ceaf?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([
                    'https://images.unsplash.com/photo-1559742811-82286364ceaf?auto=format&fit=crop&w=800&q=80'
                ]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '1 KG Whole Shell-On (8-12 pcs)', price: 4900, weight: '1 KG', cut: 'Whole Shell-On' },
                    { id: 'v2', name: '1 KG Butterflied & Cleaned', price: 5200, weight: '1 KG', cut: 'Butterflied' }
                ])
            },
            {
                id: 'prod-mud-crab',
                name: 'Live Ceylon Lagoon Mud Crab',
                slug: 'live-ceylon-lagoon-mud-crab',
                category_id: 'cat-crab',
                short_description: 'World-renowned Sri Lankan mud crab famed for its sweet, succulent, meaty claws.',
                description: 'Sourced from pristine coastal mangrove lagoons in Negombo and Puttalam. Each crab is hand-graded for shell density and claw fullness. The gold standard for authentic Singapore chilli crab, fiery Sri Lankan black pepper crab, or Jaffna crab curry.',
                base_price: 4800,
                original_price: 5200,
                unit: '1 KG',
                in_stock: 1,
                stock_quantity: 25,
                is_featured: 1,
                is_best_seller: 1,
                freshness_badge: 'Live & Cleaned Option',
                image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([
                    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80'
                ]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: 'Medium Crab (600g-800g)', price: 3400, weight: 'approx 700g', cut: 'Whole Cleaned' },
                    { id: 'v2', name: 'Large Crab (800g - 1 KG)', price: 4800, weight: '1 KG', cut: 'Whole Cleaned' },
                    { id: 'v3', name: 'Jumbo Crab (1.2 KG+)', price: 6200, weight: '1.2 KG', cut: 'Whole Cleaned' }
                ])
            },
            {
                id: 'prod-crab-claw-meat',
                name: 'Pure Crab Claw Meat (Ready-to-Cook)',
                slug: 'pure-crab-claw-meat-ready-to-cook',
                category_id: 'cat-crab',
                short_description: 'Hand-picked premium crab claw meat with 100% shell-free purity.',
                description: 'Extracted with surgical precision and vacuum packed in food-grade chilled containers. No preservatives, no filler. Tender, deeply flavorful claw meat ready for gourmet crab cakes, bisque, crab fried rice, or pasta.',
                base_price: 3200,
                original_price: 3500,
                unit: '500g Pack',
                in_stock: 1,
                stock_quantity: 30,
                is_featured: 0,
                is_best_seller: 1,
                freshness_badge: '100% Hand Picked',
                image_url: 'https://images.unsplash.com/photo-1559742811-82286364ceaf?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '250g Container', price: 1700, weight: '250g', cut: 'Picked Meat' },
                    { id: 'v2', name: '500g Container', price: 3200, weight: '500g', cut: 'Picked Meat' }
                ])
            },
            {
                id: 'prod-squid-rings',
                name: 'Whole Cleaned Squid & Calamari Rings',
                slug: 'whole-cleaned-squid-calamari-rings',
                category_id: 'cat-squid',
                short_description: 'Tender ocean squid cleaned inside and out with skin and quill completely removed.',
                description: 'Silky smooth, tender ocean squid sourced fresh daily. Can be scored for salt-and-pepper calamari, sliced into delicate rings, or stuffed with spicy rice or breadcrumbs. Never rubbery when cooked correctly.',
                base_price: 2450,
                original_price: 2750,
                unit: '1 KG',
                in_stock: 1,
                stock_quantity: 50,
                is_featured: 1,
                is_best_seller: 0,
                freshness_badge: 'Tender Catch',
                image_url: 'https://images.unsplash.com/photo-1606850246029-dd00bd5df9e3?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g Cleaned Tubes', price: 1300, weight: '500g', cut: 'Tubes' },
                    { id: 'v2', name: '1 KG Calamari Rings Cut', price: 2550, weight: '1 KG', cut: 'Rings' },
                    { id: 'v3', name: '1 KG Whole Cleaned Tube & Tentacle', price: 2450, weight: '1 KG', cut: 'Whole Cleaned' }
                ])
            },
            {
                id: 'prod-atlantic-salmon',
                name: 'Norwegian Atlantic Salmon Portions',
                slug: 'norwegian-atlantic-salmon-portions',
                category_id: 'cat-imported',
                short_description: 'Rich, buttery, salmon fillet portions air-flown directly from Norwegian fjords.',
                description: 'Certified premium Atlantic salmon with pristine fat marbling and vibrant coral colour. Rich in heart-healthy EPA & DHA fatty acids. Pan-sears with a delectable crispy skin and succulent medium-rare center.',
                base_price: 8900,
                original_price: 9500,
                unit: '1 KG (5-6 fillets)',
                in_stock: 1,
                stock_quantity: 20,
                is_featured: 1,
                is_best_seller: 1,
                freshness_badge: 'Air Flown Weekly',
                image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g Portions (2-3 fillets)', price: 4600, weight: '500g', cut: 'Skin-On Fillet' },
                    { id: 'v2', name: '1 KG Portions (5-6 fillets)', price: 8900, weight: '1 KG', cut: 'Skin-On Fillet' }
                ])
            },
            {
                id: 'prod-modha-barramundi',
                name: 'Fresh Barramundi (Modha) Fillets',
                slug: 'fresh-barramundi-modha-fillets',
                category_id: 'cat-fish',
                short_description: 'Mild, sweet-flavored ocean Barramundi with large flaky white meat.',
                description: 'Loved by Sri Lanka\'s finest restaurant chefs. Modha has a clean, buttery taste and high moisture retention that excels in baking, steaming with ginger and scallions, or crisp batter-frying.',
                base_price: 3400,
                original_price: 3800,
                unit: '1 KG',
                in_stock: 1,
                stock_quantity: 40,
                is_featured: 0,
                is_best_seller: 0,
                freshness_badge: 'Local Specialty',
                image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g Boneless Fillet', price: 1750, weight: '500g', cut: 'Fillet' },
                    { id: 'v2', name: '1 KG Boneless Fillet', price: 3400, weight: '1 KG', cut: 'Fillet' },
                    { id: 'v3', name: '1.5 KG Whole Cleaned Fish', price: 4600, weight: '1.5 KG', cut: 'Whole Cleaned' }
                ])
            },
            {
                id: 'prod-artisan-prawn-dumplings',
                name: 'Artisan Prawn Dumplings (12 pcs)',
                slug: 'artisan-prawn-dumplings-12-pcs',
                category_id: 'cat-dumplings',
                short_description: 'Handmade thin-skinned dumplings filled with whole prawn chunks and water chestnuts.',
                description: 'Authentic dim-sum style dumplings crafted in small batches using our freshest wild prawns. Simply steam for 6-8 minutes or pan-fry into crispy potstickers. Includes dipping chili soy sauce packet.',
                base_price: 1850,
                original_price: 2100,
                unit: 'Box of 12 (360g)',
                in_stock: 1,
                stock_quantity: 75,
                is_featured: 0,
                is_best_seller: 1,
                freshness_badge: 'Chef Handcrafted',
                image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: 'Standard Pack (12 pcs)', price: 1850, weight: '360g', cut: 'Frozen Ready-to-cook' },
                    { id: 'v2', name: 'Family Value Pack (24 pcs)', price: 3500, weight: '720g', cut: 'Frozen Ready-to-cook' }
                ])
            },
            {
                id: 'prod-crispy-prawn-bites',
                name: 'Golden Prawn Bites (500g)',
                slug: 'golden-prawn-bites-500g',
                category_id: 'cat-dumplings',
                short_description: 'Crispy panko-breaded seasoned prawn patties ready to air-fry or deep fry.',
                description: 'Delicious snack favorites loved by kids and adults alike. Made from 100% natural minced prawn with mild herb seasoning and crunchy Japanese panko coating. Zero artificial coloring.',
                base_price: 1650,
                original_price: 1900,
                unit: '500g Pack',
                in_stock: 1,
                stock_quantity: 65,
                is_featured: 0,
                is_best_seller: 0,
                freshness_badge: 'Party Favorite',
                image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g Pack (approx 15 pcs)', price: 1650, weight: '500g', cut: 'Ready-to-fry' },
                    { id: 'v2', name: '1 KG Twin Pack (approx 30 pcs)', price: 3100, weight: '1 KG', cut: 'Ready-to-fry' }
                ])
            },
            {
                id: 'prod-red-snapper',
                name: 'Red Snapper (Rathu Gal Maalu) Slices',
                slug: 'red-snapper-rathu-gal-maalu-slices',
                category_id: 'cat-fish',
                short_description: 'Bright red ocean reef snapper with firm, sweet, lean white meat.',
                description: 'Caught along rocky reefs of the southern coastline. A beloved classic in Sri Lankan household cooking and beachside seafood grills. Retains moisture and absorbs marinades with unmatched flavor.',
                base_price: 2800,
                original_price: 3100,
                unit: '1 KG',
                in_stock: 1,
                stock_quantity: 35,
                is_featured: 1,
                is_best_seller: 0,
                freshness_badge: 'Reef Catch',
                image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
                gallery_json: JSON.stringify([]),
                variants_json: JSON.stringify([
                    { id: 'v1', name: '500g Slices', price: 1450, weight: '500g', cut: 'Slices' },
                    { id: 'v2', name: '1 KG Slices', price: 2800, weight: '1 KG', cut: 'Slices' },
                    { id: 'v3', name: '1.2 KG Whole Fish Scaled & Gutted', price: 3200, weight: '1.2 KG', cut: 'Whole Cleaned' }
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
    // Seed sample customer reviews if none exist
    const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
    if (reviewCount.count === 0) {
        const reviewsData = [
            {
                id: 'rev-1',
                author_name: 'Dushani Weliwitawithanage',
                location: 'Colombo 7',
                rating: 5,
                review_text: 'Excellent and efficient service! Reasonably priced with good quality, fresh seafood (fish, prawns and crabs). Worth every rupee spent and delivered in chilled insulated packaging.'
            },
            {
                id: 'rev-2',
                author_name: 'Amanda Tennekoon',
                location: 'Colombo 5',
                rating: 5,
                review_text: 'Thank you for the prompt response when I inquired. The jumbo prawns I ordered were massive in size and packed super clean. Arrived right on time!'
            },
            {
                id: 'rev-3',
                author_name: 'Nilupa Kiringoda',
                location: 'Battaramulla',
                rating: 5,
                review_text: 'The quality and hygiene standards are on another level. Export quality seafood right at our doorstep. My family favorites are the Seer slices and cleaned mud crab!'
            },
            {
                id: 'rev-4',
                author_name: 'Tharanga Dias',
                location: 'Nawala',
                rating: 5,
                review_text: 'I have made repeat orders multiple times which alone proves how satisfied I am. The fish items are fresh, bone-free cuts, and well packed with cooling gel packs.'
            }
        ];
        const insertReview = db.prepare(`
      INSERT INTO reviews (id, author_name, location, rating, review_text)
      VALUES (@id, @author_name, @location, @rating, @review_text)
    `);
        for (const r of reviewsData) {
            insertReview.run(r);
        }
        console.log('Seeded customer reviews successfully.');
    }
    // Seed 2 sample initial orders so admin dashboard has realistic data immediately
    const sampleOrderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    if (sampleOrderCount.count === 0) {
        db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        delivery_address, delivery_city, outlet_id, delivery_date, delivery_time_slot,
        payment_method, payment_status, order_status, subtotal, delivery_fee,
        total_amount, items_json, special_notes
      ) VALUES (
        'ord-1001', 'CC-92841', 'Kasun Perera', 'kasun.perera@gmail.com', '+94 77 123 4567',
        'No. 45/2, Alfred House Gardens', 'Colombo 3', 'outlet-kirulapone',
        'Tomorrow', 'Morning (9:00 AM - 1:00 PM)', 'card', 'paid', 'processing',
        6800, 350, 7150,
        '[{"product_id":"prod-seer-fish","name":"Premium Seer Fish (Thora) Steaks","variant_name":"1 KG Sliced Steaks","price":3850,"quantity":1,"image_url":"https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80"},{"product_id":"prod-yellowfin-tuna","name":"Export Grade Yellowfin Tuna Steaks","variant_name":"1 KG Cut Steaks","price":2950,"quantity":1,"image_url":"https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80"}]',
        'Please call 10 mins before arrival'
      )
    `).run();
        db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        delivery_address, delivery_city, outlet_id, delivery_date, delivery_time_slot,
        payment_method, payment_status, order_status, subtotal, delivery_fee,
        total_amount, items_json, special_notes
      ) VALUES (
        'ord-1002', 'CC-92842', 'Dr. Ruwan Wickramasinghe', 'ruwan.w@outlook.com', '+94 71 889 9001',
        'Villa 12, Lake Drive', 'Rajagiriya', 'outlet-kirulapone',
        'Tomorrow', 'Afternoon (2:00 PM - 6:00 PM)', 'cod', 'pending', 'pending',
        4800, 350, 5150,
        '[{"product_id":"prod-mud-crab","name":"Live Ceylon Lagoon Mud Crab","variant_name":"Large Crab (800g - 1 KG)","price":4800,"quantity":1,"image_url":"https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80"}]',
        'Pack with extra ice packs please'
      )
    `).run();
    }
}
