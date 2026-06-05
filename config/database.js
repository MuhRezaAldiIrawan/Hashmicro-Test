/**
 * Database Configuration
 * Uses NeDB - a lightweight embedded database for Node.js
 * Stores data as JSON files (no separate DB server needed)
 */

const Datastore = require('@seald-io/nedb');
const path = require('path');

const DB_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
const fs = require('fs');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = {
  users: new Datastore({
    filename: path.join(DB_DIR, 'users.db'),
    autoload: true,
  }),

  products: new Datastore({
    filename: path.join(DB_DIR, 'products.db'),
    autoload: true,
  }),

  transactions: new Datastore({
    filename: path.join(DB_DIR, 'transactions.db'),
    autoload: true,
  }),
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
