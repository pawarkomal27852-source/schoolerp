import api from './api';
import { getStored, setStored, STORAGE_KEYS, INITIAL_SCHOOL_SETTINGS, resetToDefaults } from '../utils/mockData';

export const settingsService = {
  async getSettings() {
    try {
      const res = await api.get('/settings');
      return res.data;
    } catch {
      return getStored(STORAGE_KEYS.SETTINGS, INITIAL_SCHOOL_SETTINGS);
    }
  },

  async updateSettings(data) {
    try {
      const res = await api.put('/settings', data);
      return res.data;
    } catch {
      const current = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SCHOOL_SETTINGS);
      const updated = { ...current, ...data };
      setStored(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    }
  },

  resetAllData() {
    resetToDefaults();
  },
};

export default settingsService;
