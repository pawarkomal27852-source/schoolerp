import * as feeRepo    from '../repositories/feeRepository.js';
import * as classRepo  from '../repositories/classRepository.js';
import { AppError }    from '../middleware/errorHandler.js';
import { buildPagination } from '../utils/apiResponse.js';

function parseQuery(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

export async function getAllFees(query) {
  const { page, limit, skip } = parseQuery(query);
  const filter = {};
  if (query.classId)      filter.classId      = query.classId;
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.category)     filter.category     = query.category;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const { data, total } = await feeRepo.findAll({ filter, skip, limit });
  return { data, pagination: buildPagination(total, page, limit) };
}

export async function getFeeById(id) {
  const fee = await feeRepo.findById(id);
  if (!fee) throw new AppError('Fee structure not found.', 404);
  return fee;
}

export async function getFeesByClass(classId, academicYear) {
  const cls = await classRepo.findById(classId);
  if (!cls) throw new AppError('Class not found.', 404);
  return feeRepo.findByClass(classId, academicYear);
}

export async function createFee(body) {
  const cls = await classRepo.findById(body.classId);
  if (!cls) throw new AppError('Class not found.', 404);

  // Unique: one category per class per academic year
  const existing = await feeRepo.findOne({
    classId:      body.classId,
    academicYear: body.academicYear,
    category:     body.category,
  });
  if (existing) {
    throw new AppError(
      `A fee for category "${body.category}" already exists for this class in ${body.academicYear}.`,
      409
    );
  }
  return feeRepo.create(body);
}

export async function updateFee(id, body) {
  const fee = await feeRepo.findById(id);
  if (!fee) throw new AppError('Fee structure not found.', 404);

  // Check uniqueness if category/class/year changes
  const newCategory = body.category     || fee.category;
  const newClassId  = body.classId      || String(fee.classId?._id || fee.classId);
  const newYear     = body.academicYear || fee.academicYear;

  if (
    newCategory !== fee.category ||
    String(newClassId) !== String(fee.classId?._id || fee.classId) ||
    newYear !== fee.academicYear
  ) {
    const conflict = await feeRepo.findOne({
      classId: newClassId, academicYear: newYear, category: newCategory,
      _id: { $ne: id },
    });
    if (conflict) {
      throw new AppError(
        `A fee for "${newCategory}" already exists for this class in ${newYear}.`,
        409
      );
    }
  }
  return feeRepo.updateById(id, body);
}

export async function deleteFee(id) {
  const fee = await feeRepo.findById(id);
  if (!fee) throw new AppError('Fee structure not found.', 404);
  return feeRepo.softDeleteById(id);
}
