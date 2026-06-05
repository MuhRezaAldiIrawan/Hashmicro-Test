/**
 * Seeder Script - Populates demo data for testing
 * Run: node src/seeders/seed.js
 */

const ProductModel = require('../models/ProductModel');
const UserModel = require('../models/UserModel');

const sampleProducts = [
  { name: 'Laptop Dell XPS 15', category: 'Electronics', price: 18500000, stock: 12, minStock: 3, description: 'High-performance laptop for professionals' },
  { name: 'Monitor LG 27" 4K', category: 'Electronics', price: 5200000, stock: 8, minStock: 2, description: '4K UHD monitor with HDR support' },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 850000, stock: 25, minStock: 5 },
  { name: 'Wireless Mouse', category: 'Electronics', price: 320000, stock: 2, minStock: 5 },
  { name: 'USB-C Hub 7-in-1', category: 'Electronics', price: 280000, stock: 0, minStock: 5 },
  { name: 'Office Chair Ergonomic', category: 'Office Supplies', price: 3200000, stock: 6, minStock: 2 },
  { name: 'Standing Desk', category: 'Office Supplies', price: 4500000, stock: 4, minStock: 2 },
  { name: 'Whiteboard 120x90cm', category: 'Office Supplies', price: 650000, stock: 10, minStock: 2 },
  { name: 'Ballpoint Pen Box', category: 'Office Supplies', price: 45000, stock: 1, minStock: 10 },
  { name: 'A4 Paper Ream', category: 'Office Supplies', price: 55000, stock: 45, minStock: 20 },
  { name: 'T-Shirt Cotton Premium', category: 'Clothing', price: 185000, stock: 50, minStock: 10 },
  { name: 'Hoodie Fleece', category: 'Clothing', price: 320000, stock: 18, minStock: 5 },
  { name: 'Work Boots Steel Toe', category: 'Clothing', price: 850000, stock: 3, minStock: 5 },
  { name: 'Instant Noodles (Box)', category: 'Food & Beverage', price: 85000, stock: 60, minStock: 20 },
  { name: 'Bottled Water 600ml (Case)', category: 'Food & Beverage', price: 40000, stock: 30, minStock: 15 },
  { name: 'Coffee Sachet Box', category: 'Food & Beverage', price: 120000, stock: 0, minStock: 5 },
  { name: 'Cordless Drill', category: 'Tools', price: 780000, stock: 7, minStock: 2 },
  { name: 'Screwdriver Set', category: 'Tools', price: 145000, stock: 15, minStock: 4 },
];

async function seed() {
  console.log('Seeding database...');

  // Seed admin
  await UserModel.seedAdmin();

  // Seed products
  const existingCount = await ProductModel.count();
  if (existingCount === 0) {
    for (const p of sampleProducts) {
      await ProductModel.create(p);
    }
    console.log(`✓ Seeded ${sampleProducts.length} products`);
  } else {
    console.log(`Skipping products (${existingCount} already exist)`);
  }

  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
