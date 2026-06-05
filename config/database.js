/**
 * Database Configuration
 * Uses NeDB - a lightweight embedded database for Node.js
 * Running in in-memory mode for Vercel serverless compatibility
 * (Vercel has a read-only filesystem; data is seeded fresh on each cold start)
 */

const Datastore = require('@seald-io/nedb');
const path = require('path');

// In production (Vercel), use in-memory mode (no file persistence).
// In development, persist to local files for a better dev experience.
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const makeStore = (filename) => {
  if (isProduction) {
    return new Datastore({ autoload: true });
  }
  const DB_DIR = path.join(__dirname, '../data');
  const fs = require('fs');
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  return new Datastore({ filename: path.join(DB_DIR, filename), autoload: true });
};

const db = {
  users: makeStore('users.db'),
  products: makeStore('products.db'),
  transactions: makeStore('transactions.db'),
};

// Promisify NeDB methods for cleaner async/await usage
const promisify = (db) => {
  return {
    find: (query = {}, projection = {}) =>
      new Promise((resolve, reject) =>
        db.find(query, projection, (err, docs) => (err ? reject(err) : resolve(docs)))
      ),
    findOne: (query) =>
      new Promise((resolve, reject) =>
        db.findOne(query, (err, doc) => (err ? reject(err) : resolve(doc)))
      ),
    insert: (doc) =>
      new Promise((resolve, reject) =>
        db.insert(doc, (err, newDoc) => (err ? reject(err) : resolve(newDoc)))
      ),
    update: (query, update, options = {}) =>
      new Promise((resolve, reject) =>
        db.update(query, update, options, (err, numReplaced) =>
          err ? reject(err) : resolve(numReplaced)
        )
      ),
    remove: (query, options = {}) =>
      new Promise((resolve, reject) =>
        db.remove(query, options, (err, numRemoved) =>
          err ? reject(err) : resolve(numRemoved)
        )
      ),
    count: (query = {}) =>
      new Promise((resolve, reject) =>
        db.count(query, (err, count) => (err ? reject(err) : resolve(count)))
      ),
  };
};

module.exports = {
  users: promisify(db.users),
  products: promisify(db.products),
  transactions: promisify(db.transactions),
};
