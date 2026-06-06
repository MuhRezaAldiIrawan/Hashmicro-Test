const { createClient } = require('@supabase/supabase-js');

let client = null;

function getClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required.');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

function fromRow(row) {
  if (!row) return null;
  const { id, min_stock, created_at, updated_at, user_id, ...rest } = row;
  const doc = { _id: id, ...rest };
  if (min_stock !== undefined) doc.minStock = min_stock;
  if (created_at !== undefined) doc.createdAt = created_at;
  if (updated_at !== undefined) doc.updatedAt = updated_at;
  if (user_id !== undefined) doc.userId = user_id;
  return doc;
}

function toRow(doc) {
  const { _id, minStock, createdAt, updatedAt, userId, ...rest } = doc;
  const row = { ...rest };
  if (_id !== undefined) row.id = _id;
  if (minStock !== undefined) row.min_stock = minStock;
  if (createdAt !== undefined) row.created_at = createdAt;
  if (updatedAt !== undefined) row.updated_at = updatedAt;
  if (userId !== undefined) row.user_id = userId;
  return row;
}

const makeStore = (tableName) => ({
  find: async (query = {}) => {
    let req = getClient().from(tableName).select('*');
    for (const [key, val] of Object.entries(toRow(query))) {
      req = req.eq(key, val);
    }
    const { data, error } = await req;
    if (error) throw new Error(error.message);
    return (data || []).map(fromRow);
  },

  findOne: async (query) => {
    let req = getClient().from(tableName).select('*');
    for (const [key, val] of Object.entries(toRow(query))) {
      req = req.eq(key, val);
    }
    const { data, error } = await req.limit(1);
    if (error) throw new Error(error.message);
    return fromRow(data?.[0] || null);
  },

  insert: async (doc) => {
    const { data, error } = await getClient()
      .from(tableName).insert(toRow(doc)).select().single();
    if (error) throw new Error(error.message);
    return fromRow(data);
  },

  update: async (query, update) => {
    const rowData = toRow(update.$set || update);
    let req = getClient().from(tableName).update(rowData);
    for (const [key, val] of Object.entries(toRow(query))) {
      req = req.eq(key, val);
    }
    const { error } = await req;
    if (error) throw new Error(error.message);
    return 1;
  },

  remove: async (query) => {
    let req = getClient().from(tableName).delete();
    for (const [key, val] of Object.entries(toRow(query))) {
      req = req.eq(key, val);
    }
    const { error } = await req;
    if (error) throw new Error(error.message);
    return 1;
  },

  count: async (query = {}) => {
    let req = getClient().from(tableName).select('*', { count: 'exact', head: true });
    for (const [key, val] of Object.entries(toRow(query))) {
      req = req.eq(key, val);
    }
    const { count, error } = await req;
    if (error) throw new Error(error.message);
    return count || 0;
  },
});

module.exports = {
  users: makeStore('users'),
  products: makeStore('products'),
  transactions: makeStore('transactions'),
};
