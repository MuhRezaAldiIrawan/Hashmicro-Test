/**
 * Seeder Script - Populates admin user
 * Run: node src/seeders/seed.js
 */

const UserModel = require('../models/UserModel');

async function seed() {
  console.log('Seeding database...');

  // Seed admin
  await UserModel.seedAdmin();

  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
