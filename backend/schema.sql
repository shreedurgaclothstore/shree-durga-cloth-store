-- Cloudflare D1 Database Schema for Cloth Shop Clearance Platform

-- 1. Merchants / Store Details
CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    google_maps_url TEXT,
    upi_id TEXT,
    timing TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Shoppers)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    fcm_token TEXT,
    total_cashback_earned REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products (Clearance & Deadstock Inventory)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    size TEXT NOT NULL,
    original_price REAL NOT NULL,
    discounted_price REAL NOT NULL,
    cashback_amount REAL NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 1,
    available_quantity INTEGER NOT NULL DEFAULT 1,
    image_url TEXT NOT NULL,
    status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'SOLD_OUT', 'ARCHIVED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 24-Hour Clearance Tokens
CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY, -- e.g., 'TK-948210'
    qr_payload TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_title TEXT NOT NULL,
    product_size TEXT NOT NULL,
    product_image TEXT NOT NULL,
    original_price REAL NOT NULL,
    discounted_price REAL NOT NULL,
    cashback_amount REAL NOT NULL,
    final_payable_amount REAL NOT NULL,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLAIMED', 'EXPIRED', 'CANCELLED'
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    claimed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid lookup
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_email);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON tokens(expires_at);
