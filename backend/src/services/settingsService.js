import * as settingsRepo from '../repositories/settingsRepository.js';

export async function getSettings() {
  const settings = await settingsRepo.getSettings();
  // Return empty object if not configured yet (upsert on first update)
  return settings || {};
}

export async function updateSettings(body) {
  return settingsRepo.upsertSettings(body);
}
