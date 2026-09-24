import * as classRepo     from '../repositories/classRepository.js';
import { AppError }       from '../middleware/errorHandler.js';
import { buildPagination } from '../utils/apiResponse.js';

/**
 * Parse and normalise list query parameters.
 */
function parseQuery(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

export async function getAllClasses(query) {
  const { page, limit, skip } = parseQuery(query);

  const filter = {};
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name:    { $regex: query.search, $options: 'i' } },
      { section: { $regex: query.search, $options: 'i' } },
      { grade:   { $regex: query.search, $options: 'i' } },
    ];
  }

  const { data, total } = await classRepo.findAll({ filter, skip, limit });
  return { data, pagination: buildPagination(total, page, limit) };
}

export async function getClassById(id) {
  const cls = await classRepo.findById(id);
  if (!cls) throw new AppError('Class not found.', 404);
  return cls;
}

export async function createClass(body) {
  // Unique check: name + section + academicYear
  const existing = await classRepo.findOne({
    name:         body.name.trim(),
    section:      body.section.trim().toUpperCase(),
    academicYear: body.academicYear,
  });
  if (existing) {
    throw new AppError(
      `Class "${body.name} - ${body.section}" already exists for academic year ${body.academicYear}.`,
      409
    );
  }
  return classRepo.create(body);
}

export async function updateClass(id, body) {
  const cls = await classRepo.findById(id);
  if (!cls) throw new AppError('Class not found.', 404);

  // If name/section/year changes, check uniqueness
  const newName  = body.name         || cls.name;
  const newSec   = body.section      || cls.section;
  const newYear  = body.academicYear || cls.academicYear;

  if (
    newName !== cls.name ||
    newSec  !== cls.section ||
    newYear !== cls.academicYear
  ) {
    const conflict = await classRepo.findOne({
      name:         newName.trim(),
      section:      newSec.trim().toUpperCase(),
      academicYear: newYear,
      _id:          { $ne: id },
    });
    if (conflict) {
      throw new AppError(
        `Class "${newName} - ${newSec}" already exists for academic year ${newYear}.`,
        409
      );
    }
  }

  return classRepo.updateById(id, body);
}

export async function deleteClass(id) {
  const cls = await classRepo.findById(id);
  if (!cls) throw new AppError('Class not found.', 404);
  return classRepo.softDeleteById(id);
}
