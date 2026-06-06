const Datastore = require('@seald-io/nedb');
const path = require('path');

// Production/Vercel: tulis ke /tmp (satu-satunya folder writable di serverless).
// Development: tulis ke ./data lokal.
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const makeStore = (filename) => {
  const fs = require('fs');
  let dbPath;
  if (isProduction) {
    dbPath = path.join('/tmp', filename);
  } else {
    const DB_DIR = path.join(__dirname, '../data');
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    dbPath = path.join(DB_DIR, filename);
  }
  return new Datastore({ filename: dbPath, autoload: true });
};

const db = {
  users: makeStore('users.db'),
  products: makeStore('products.db'),
  transactions: makeStore('transactions.db'),
};

// Promisify NeDB callback API untuk async/await
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
