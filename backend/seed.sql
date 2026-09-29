-- Initial Seed Data for Cloth Shop Clearance Platform

INSERT OR REPLACE INTO merchants (id, name, tagline, phone, address, google_maps_url, upi_id, timing) 
VALUES (
    'm-001',
    'Shree Durga Cloth Store',
    'Exclusive Clearance & Factory Seconds Stock',
    '+91 98765 43210',
    'Shop #14, Main Market, Near Clock Tower, Gandhinagar',
    'https://maps.google.com/?q=Shree+Durga+Cloth+Store',
    'shreedurgacloth@upi',
    '10:30 AM - 09:30 PM (All 7 Days Open)'
);

INSERT OR REPLACE INTO products (
    id, title, description, category, gender, size, original_price, discounted_price, cashback_amount, total_quantity, available_quantity, image_url, status
) VALUES 
(
    'prod-001',
    'Levi''s Slim Fit Dark Indigo Jeans',
    'Original stock clearance. Premium stretch denim with classic 5-pocket styling. Perfect for casual wear.',
    'Jeans',
    'Men',
    '32',
    2999.00,
    999.00,
    100.00,
    2,
    2,
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
),
(
    'prod-002',
    'Pure Linen Sky Blue Casual Shirt',
    '100% Breathable European linen. Full sleeves, tailored fit, mother of pearl buttons.',
    'Shirt',
    'Men',
    'L',
    1799.00,
    599.00,
    75.00,
    3,
    3,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
),
(
    'prod-003',
    'Anarkali Golden Embroidered Festive Kurti',
    'Festive clearance! Rayon cotton blend with delicate zari work around the neckline and borders.',
    'Kurti & Ethnic',
    'Women',
    'M',
    2499.00,
    799.00,
    100.00,
    1,
    1,
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
),
(
    'prod-004',
    'Vintage Suede Bomber Winter Jacket',
    'End of season clearance. Sherpa-lined collar with heavy metal zipper and ribbed cuffs.',
    'Jacket & Winter',
    'Men',
    'XL',
    3999.00,
    1399.00,
    150.00,
    1,
    1,
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
),
(
    'prod-005',
    'Classic Khaki Slim-Fit Chino Trousers',
    'Stretch cotton twill fabric with wrinkle-resistant finish. Great for office and weekend.',
    'Trousers',
    'Men',
    '34',
    1999.00,
    649.00,
    75.00,
    2,
    2,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
),
(
    'prod-006',
    'Banarasi Silk Weave Party Wear Saree',
    'Clearance batch. Rich floral golden brocade pallu with matching unstitched blouse piece.',
    'Saree',
    'Women',
    'Free Size',
    4999.00,
    1799.00,
    200.00,
    2,
    2,
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
),
(
    'prod-007',
    'Kids Graphic Fleece Warm Hoodie',
    'Super soft brush fleece with kangaroo pocket and vibrant adventure graphic.',
    'Kids Wear',
    'Kids',
    'S',
    1299.00,
    399.00,
    50.00,
    3,
    3,
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
),
(
    'prod-008',
    'Floral Tropical Beach Vacation Shirt',
    'Lightweight rayon fabric, cuban camp collar, relaxed fit for summer outings.',
    'Shirt',
    'Unisex',
    'M',
    1499.00,
    449.00,
    50.00,
    2,
    2,
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE'
);
