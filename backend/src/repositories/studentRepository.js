import Student from '../models/Student.js';

const BASE_FILTER = { isDeleted: { $ne: true } };
const POPULATE = [
  { path: 'classId',  select: 'name section grade academicYear' },
  { path: 'parentId', select: 'firstName lastName email phone relationship' },
];

export async function findAll({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } }) {
  const query = { ...BASE_FILTER, ...filter };
  const [data, total] = await Promise.all([
    Student.find(query).populate(POPULATE).sort(sort).skip(skip).limit(limit).lean(),
    Student.countDocuments(query),
  ]);
  return { data, total };
}

export async function findById(id) {
  return Student.findOne({ _id: id, ...BASE_FILTER }).populate(POPULATE);
}

export async function findByStudentId(studentId) {
  return Student.findOne({ studentId: studentId.toUpperCase(), ...BASE_FILTER });
}

export async function findOne(filter) {
  return Student.findOne({ ...filter, ...BASE_FILTER });
}

export async function create(data) {
  return Student.create(data);
}

export async function updateById(id, data) {
  return Student.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: data },
    { new: true, runValidators: true }
  ).populate(POPULATE);
}

export async function softDeleteById(id) {
  return Student.findOneAndUpdate(
    { _id: id, ...BASE_FILTER },
    { $set: { isDeleted: true, deletedAt: new Date(), status: 'inactive' } },
    { new: true }
  );
}

export async function countByClass(classId) {
  return Student.countDocuments({ classId, status: 'active', ...BASE_FILTER });
}

export async function countAll(filter = {}) {
  return Student.countDocuments({ ...BASE_FILTER, ...filter });
}

/** Lightweight list of all active students for dropdown/bulk use */
export async function findAllBasic(filter = {}) {
  return Student.find({ ...BASE_FILTER, status: 'active', ...filter })
    .select('_id studentId firstName lastName classId')
    .populate({ path: 'classId', select: 'name section' })
    .sort({ firstName: 1 })
    .lean();
}
