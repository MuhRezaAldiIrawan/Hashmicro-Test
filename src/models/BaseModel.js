class BaseModel {
  constructor(db, modelName) {
    if (new.target === BaseModel) {
      throw new Error('BaseModel is abstract and cannot be instantiated directly.');
    }
    this.db = db;
    this.modelName = modelName;
  }

  async findAll(query = {}) {
    try {
      const records = await this.db.find(query);
      return records;
    } catch (error) {
      throw new Error(`[${this.modelName}] findAll failed: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const record = await this.db.findOne({ _id: id });
      return record;
    } catch (error) {
      throw new Error(`[${this.modelName}] findById failed: ${error.message}`);
    }
  }

  async findOne(query) {
    try {
      return await this.db.findOne(query);
    } catch (error) {
      throw new Error(`[${this.modelName}] findOne failed: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const prepared = await this.beforeCreate({ ...data, createdAt: new Date(), updatedAt: new Date() });
      const record = await this.db.insert(prepared);
      return record;
    } catch (error) {
      throw new Error(`[${this.modelName}] create failed: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const prepared = await this.beforeUpdate({ ...data, updatedAt: new Date() });
      return await this.db.update({ _id: id }, { $set: prepared });
    } catch (error) {
      throw new Error(`[${this.modelName}] update failed: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await this.db.remove({ _id: id });
    } catch (error) {
      throw new Error(`[${this.modelName}] delete failed: ${error.message}`);
    }
  }

  async count(query = {}) {
    return await this.db.count(query);
  }

  // Hooks: override di subclass untuk tambah logika sebelum save
  async beforeCreate(data) { return data; }
  async beforeUpdate(data) { return data; }
}

module.exports = BaseModel;
