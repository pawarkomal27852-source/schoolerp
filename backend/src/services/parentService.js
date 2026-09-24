import * as parentRepo    from '../repositories/parentRepository.js';
import { AppError }       from '../middleware/errorHandler.js';
import { buildPagination } from '../utils/apiResponse.js';

function parseQuery(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

export async function getAllParents(query) {
  const { page, limit, skip } = parseQuery(query);

  const filter = {};
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: 'i' } },
      { lastName:  { $regex: query.search, $options: 'i' } },
      { email:     { $regex: query.search, $options: 'i' } },
      { phone:     { $regex: query.search, $options: 'i' } },
    ];
  }

  const { data, total } = await parentRepo.findAll({ filter, skip, limit });
  return { data, pagination: buildPagination(total, page, limit) };
}

export async function getParentById(id) {
  const parent = await parentRepo.findById(id);
  if (!parent) throw new AppError('Parent not found.', 404);
  return parent;
}

export async function createParent(body) {
  const existing = await parentRepo.findByEmail(body.email);
  if (existing) throw new AppError(`A parent with email "${body.email}" already exists.`, 409);
  return parentRepo.create(body);
}

export async function updateParent(id, body) {
  const parent = await parentRepo.findById(id);
  if (!parent) throw new AppError('Parent not found.', 404);

  // Email uniqueness check on update
  if (body.email && body.email.toLowerCase() !== parent.email) {
    const conflict = await parentRepo.findOne({
      email: body.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (conflict) throw new AppError(`Email "${body.email}" is already in use.`, 409);
  }

  return parentRepo.updateById(id, body);
}

export async function deleteParent(id) {
  const parent = await parentRepo.findById(id);
  if (!parent) throw new AppError('Parent not found.', 404);
  return parentRepo.softDeleteById(id);
}
