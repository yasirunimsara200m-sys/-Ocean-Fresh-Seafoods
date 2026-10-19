import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

// Neon PostgreSQL connection string (defaults to direct host for max reliability)
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_P9RJfYm1kzSh@ep-rapid-sound-b5bk0lta.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Converts SQLite '?' placeholders to PostgreSQL '$1, $2, ...'
export function convertPlaceholders(query: string): string {
  let paramIndex = 1;
  return query.replace(/\?/g, () => `$${paramIndex++}`);
}

class PreparedStatement {
  private pgSql: string;

  constructor(sql: string) {
    this.pgSql = convertPlaceholders(sql);
  }

  async all(...params: any[]): Promise<any[]> {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    const res = await pool.query(this.pgSql, flatParams);
    return res.rows;
  }

  async get(...params: any[]): Promise<any> {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    const res = await pool.query(this.pgSql, flatParams);
    return res.rows[0] || null;
  }

  async run(...params: any[]): Promise<{ changes: number }> {
    const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
    const res = await pool.query(this.pgSql, flatParams);
    return { changes: res.rowCount || 0 };
  }
}

export const db = {
  prepare: (sql: string) => new PreparedStatement(sql),
  query: (sql: string, params: any[] = []) => pool.query(sql, params)
};

export async function initDatabase() {
  try {
    // Create tables in PostgreSQL if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        base_price NUMERIC NOT NULL,
        original_price NUMERIC,
        unit TEXT DEFAULT '1 KG',
        in_stock INTEGER DEFAULT 1,
        stock_quantity INTEGER DEFAULT 50,
        is_featured INTEGER DEFAULT 0,
        is_best_seller INTEGER DEFAULT 0,
        image_url TEXT NOT NULL,
        gallery_json TEXT DEFAULT '[]',
        variants_json TEXT DEFAULT '[]',
        freshness_badge TEXT DEFAULT 'Export Quality',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        subtotal NUMERIC NOT NULL,
        delivery_fee NUMERIC DEFAULT 350,
        total_amount NUMERIC NOT NULL,
        items_json TEXT NOT NULL,
        special_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        author_name TEXT NOT NULL,
        location TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        review_text TEXT NOT NULL,
        is_approved INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Verify / Seed default admin if none exists
    const adminRes = await pool.query('SELECT COUNT(*) as count FROM admins');
    if (parseInt(adminRes.rows[0].count, 10) === 0) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('admin123', salt);
      await pool.query(
        `INSERT INTO admins (id, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)`,
        ['admin-1', 'admin', passwordHash, 'Store Administrator', 'superadmin']
      );
      console.log('Seeded default admin: admin / admin123');
    }

    // Verify / Seed Outlets if none exist
    const outletRes = await pool.query('SELECT COUNT(*) as count FROM outlets');
    if (parseInt(outletRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO outlets (id, name, slug, city, address, phone, email, opening_hours, is_active)
        VALUES (
          'outlet-athurugiriya',
          'Athurugiriya Central Fulfillment Hub',
          'athurugiriya',
          'Athurugiriya',
          '304/A, Godagama Road, Athurugiriya',
          '+94 72 342 6084',
          'orders@oceanfresh.lk',
          '8:00 AM - 7:30 PM (Daily Online Orders & Direct Home Delivery)',
          1
        )
      `);
      console.log('Seeded Athurugiriya fulfillment hub.');
    }

    // Verify / Seed Categories if none exist
    const catRes = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (parseInt(catRes.rows[0].count, 10) === 0) {
      const categoriesData = [
        ['cat-prawns', 'Prawns & Shrimps', 'prawns-shrimps', 'Peeled, deveined, tiger prawns and wild sea caught shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80', 1],
        ['cat-fish', 'Fresh Fish', 'fish', 'Prime Seer fish, Yellowfin Tuna steaks, Thalapath, Modha & Snapper', 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80', 2],
        ['cat-squid', 'Squid & Cuttlefish', 'squid', 'Whole cleaned squid, calamari rings, and tender cuttlefish fillets', 'https://images.unsplash.com/photo-1606850246029-dd00bd5df9e3?auto=format&fit=crop&w=800&q=80', 4],
        ['cat-imported', 'Imported Gourmet', 'imported-seafood', 'Norwegian Atlantic Salmon fillets, Chilean Sea Bass, and Scallops', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', 5],
        ['cat-dumplings', 'Dumplings & Bites', 'dumplings-bites', 'Handcrafted artisan seafood dumplings and ready-to-fry crispy prawn bites', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80', 6]
      ];
      for (const cat of categoriesData) {
        await pool.query(
          `INSERT INTO categories (id, name, slug, description, image_url, display_order) VALUES ($1, $2, $3, $4, $5, $6)`,
          cat
        );
      }
      console.log('Seeded categories successfully.');
    }

    // Verify / Seed Products if none exist
    const prodRes = await pool.query('SELECT COUNT(*) as count FROM products');
    if (parseInt(prodRes.rows[0].count, 10) === 0) {
      console.log('No products found in DB. You can add them via Admin Dashboard.');
    }

    console.log('🐘 PostgreSQL connected and schema verified.');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
  }
}
