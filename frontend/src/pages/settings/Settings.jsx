import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { PageHeader } from '../../components/common/StatusBadge';
import { Button, Input } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export const Settings = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch {
        showToast('Error loading institutional settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      showToast('Institutional profile updated successfully!', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = () => {
    settingsService.resetAllData();
    showToast('Database reset to fresh baseline mock dataset!', 'info');
    setResetModal(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading || !settings) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Institutional Settings"
        subtitle="Configure school identity, official contact coordinates, academic calendar, and system parameters"
        icon="tune"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* School Profile */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              apartment
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              School Profile & Legal Entity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="School Name"
              value={settings.schoolName || ''}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              required
            />

            <Input
              label="Affiliation Code / Registration #"
              value={settings.affiliationCode || 'CBSE/AFF/2024-9128'}
              onChange={(e) => handleChange('affiliationCode', e.target.value)}
            />

            <Input
              label="Official Contact Phone"
              value={settings.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />

            <Input
              label="General Enquiry Email"
              type="email"
              value={settings.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />

            <Input
              label="Principal / Admin Email"
              type="email"
              value={settings.adminEmail || ''}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              required
            />

            <Input
              label="Official Website URL"
              value={settings.website || 'https://greenwood.edu.in'}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider">
              Permanent Postal Address
            </label>
            <textarea
              rows={3}
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full text-sm text-[#0b1c30] bg-[#eff4ff] focus:bg-white rounded-xl p-3 border border-transparent focus:border-[#061449] focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Academic Session & Currency */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              event
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              Academic Session & Fiscal Defaults
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Active Academic Year"
              value={settings.academicYear || '2024–2025'}
              onChange={(e) => handleChange('academicYear', e.target.value)}
              required
            />

            <Input
              label="Active Term"
              value={settings.currentTerm || 'Term 2'}
              onChange={(e) => handleChange('currentTerm', e.target.value)}
              required
            />

            <Input
              label="Currency Code"
              value={settings.currency || 'INR (₹)'}
              disabled
              helperText="Fixed to Indian Rupee format"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            icon="check"
          >
            Save Institutional Settings
          </Button>
        </div>
      </form>

      {/* Developer & Evaluator Playground Actions */}
      <div className="bg-[#eff4ff] p-5 rounded-2xl border border-[#d3e4fe] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#061449] font-headline">
            System State & Mock Data Reset
          </h3>
          <p className="text-xs text-[#45464f] mt-0.5 max-w-md">
            Restore all student rosters, parents, attendance logs, and fee ledgers back to their baseline demonstration state.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon="restart_alt"
          onClick={() => setResetModal(true)}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* Reset Confirmation */}
      <ConfirmationModal
        isOpen={resetModal}
        onClose={() => setResetModal(false)}
        onConfirm={handleResetData}
        title="Reset All SchoolERP Data"
        message="Are you sure you want to revert all records back to default mock data? Any newly registered students, payments, or attendance entries will be reset."
        confirmText="Reset Everything"
        isDanger={true}
      />
    </div>
  );
};

export default Settings;
