/**
 * BaseModel - Abstract base class for all models
 *
 * OOP Concept: This is the parent class that all models inherit from.
 * It provides shared CRUD operations and utility methods so child models
 * don't duplicate code (DRY principle).
 *
 * Design Pattern: Template Method + Active Record (simplified)
 */

class BaseModel {
  /**
   * @param {Object} db - NeDB promisified instance for this model's collection
   * @param {string} modelName - human-readable model name for error messages
   */
  constructor(db, modelName) {
    if (new.target === BaseModel) {
      throw new Error('BaseModel is abstract and cannot be instantiated directly.');
    }
    this.db = db;
    this.modelName = modelName;
  }

  /**
   * Find all records matching a query
   * @param {Object} query - NeDB query object
   * @returns {Promise<Array>}
   */
  async findAll(query = {}) {
    try {
      const records = await this.db.find(query);
      return records;
    } catch (error) {
      throw new Error(`[${this.modelName}] findAll failed: ${error.message}`);
    }
  }

  /**
   * Find a single record by ID
   * @param {string} id - NeDB _id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    try {
      const record = await this.db.findOne({ _id: id });
      return record;
    } catch (error) {
      throw new Error(`[${this.modelName}] findById failed: ${error.message}`);
    }
  }

  /**
   * Find a single record by arbitrary query
   * @param {Object} query
   * @returns {Promise<Object|null>}
   */
  async findOne(query) {
    try {
      return await this.db.findOne(query);
    } catch (error) {
      throw new Error(`[${this.modelName}] findOne failed: ${error.message}`);
    }
  }

  /**
   * Create a new record
   * Calls beforeCreate hook (can be overridden by subclasses)
   * @param {Object} data
   * @returns {Promise<Object>} - the inserted document
   */
  async create(data) {
    try {
      const prepared = await this.beforeCreate({ ...data, createdAt: new Date(), updatedAt: new Date() });
      const record = await this.db.insert(prepared);
      return record;
    } catch (error) {
      throw new Error(`[${this.modelName}] create failed: ${error.message}`);
    }
  }

  /**
   * Update a record by ID
   * @param {string} id
   * @param {Object} data - fields to update
   * @returns {Promise<number>} - number of records updated
   */
  async update(id, data) {
    try {
      const prepared = await this.beforeUpdate({ ...data, updatedAt: new Date() });
      return await this.db.update({ _id: id }, { $set: prepared });
    } catch (error) {
      throw new Error(`[${this.modelName}] update failed: ${error.message}`);
    }
  }

  /**
   * Delete a record by ID
   * @param {string} id
   * @returns {Promise<number>} - number of records removed
   */
  async delete(id) {
    try {
      return await this.db.remove({ _id: id });
    } catch (error) {
      throw new Error(`[${this.modelName}] delete failed: ${error.message}`);
    }
  }

  /**
   * Count total records
   * @param {Object} query
   * @returns {Promise<number>}
   */
  async count(query = {}) {
    return await this.db.count(query);
  }

  // ─── Hooks (Template Method Pattern) ────────────────────────────────────────
  // Subclasses can override these to add custom logic before saving

  async beforeCreate(data) { return data; }
  async beforeUpdate(data) { return data; }
}

module.exports = BaseModel;
