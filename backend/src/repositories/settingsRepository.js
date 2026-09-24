import SchoolSettings from '../models/SchoolSettings.js';

const SINGLETON_FILTER = { singleton: 'default' };

export async function getSettings() {
  return SchoolSettings.findOne(SINGLETON_FILTER);
}

export async function upsertSettings(data) {
  // Remove singleton field from update data to prevent override
  const { singleton: _s, ...updateData } = data;

  return SchoolSettings.findOneAndUpdate(
    SINGLETON_FILTER,
    { $set: updateData },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}
