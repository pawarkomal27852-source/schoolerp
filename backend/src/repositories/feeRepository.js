import Fee from '../models/Fee.js';

const BASE_FILTER = { isDeleted: { $ne: true } };
const CLASS_POP   = { path: 'classId', select: 'name section grade academicYear' };

export async function findAll({ filter = {}, skip = 0, limit = 50, sort = { createdAt: -1 } }) {
  const query = { ...BASE_FILTER, ...filter };
  const [data, total] = await Promise.all([
    Fee.find(query).populate(CLASS_POP).sort(sort).skip(skip).limit(limit).lean(),
    Fee.countDocuments(query),
  ]);
  return { data, total };
}

export async function findById(id) {
  return Fee.findOne({ _id: id, ...BASE_FILTER }).populate(CLASS_POP);
}

export async function findOne(filter) {
  return Fee.findOne({ ...filter, ...BASE_FILTER });
}

export async function findByClass(classId, academicYear) {
  const filter = { classId, ...BASE_FILTER };
  if (academicYear) filter.academicYear = academicYear;
  return Fee.find(filter).sort({ category: 1 }).lean();
}

/** Total fee amount for a class in a given academic year */
export async function getTotalFeeForClass(classId, academicYear) {
  const result = await Fee.aggregate([
    { $match: { classId: new (await import('mongoose')).default.Types.ObjectId(classId), academicYear, isDeleted: { $ne: true }, isActive: true } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}

export async function create(data) {
  return Fee.create(data);
}

export async function updateById(id, data) {
  return Fee.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: data },
    { new: true, runValidators: true }
  ).populate(CLASS_POP);
}

export async function softDeleteById(id) {
  return Fee.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: { isDeleted: true, deletedAt: new Date(), isActive: false } },
    { new: true }
  );
}
