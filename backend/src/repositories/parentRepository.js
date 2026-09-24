import Parent from '../models/Parent.js';

const BASE_FILTER = { isDeleted: { $ne: true } };

export async function findAll({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } }) {
  const query = { ...BASE_FILTER, ...filter };
  const [data, total] = await Promise.all([
    Parent.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Parent.countDocuments(query),
  ]);
  return { data, total };
}

export async function findById(id) {
  return Parent.findOne({ _id: id, ...BASE_FILTER });
}

export async function findByEmail(email) {
  return Parent.findOne({ email: email.toLowerCase(), ...BASE_FILTER });
}

export async function findOne(filter) {
  return Parent.findOne({ ...filter, ...BASE_FILTER });
}

export async function create(data) {
  return Parent.create(data);
}

export async function updateById(id, data) {
  return Parent.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function softDeleteById(id) {
  return Parent.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: { isDeleted: true, deletedAt: new Date(), isActive: false } },
    { new: true }
  );
}
