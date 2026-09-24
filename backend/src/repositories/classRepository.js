import Class from '../models/Class.js';

const BASE_FILTER = { isDeleted: { $ne: true } };

/**
 * All database operations for the Class collection.
 */

export async function findAll({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } }) {
  const query = { ...BASE_FILTER, ...filter };
  const [data, total] = await Promise.all([
    Class.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Class.countDocuments(query),
  ]);
  return { data, total };
}

export async function findById(id) {
  return Class.findOne({ _id: id, ...BASE_FILTER });
}

export async function findOne(filter) {
  return Class.findOne({ ...filter, ...BASE_FILTER });
}

export async function create(data) {
  return Class.create(data);
}

export async function updateById(id, data) {
  return Class.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function softDeleteById(id) {
  return Class.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: { isDeleted: true, deletedAt: new Date(), isActive: false } },
    { new: true }
  );
}

export async function countAll(filter = {}) {
  return Class.countDocuments({ ...BASE_FILTER, ...filter });
}
