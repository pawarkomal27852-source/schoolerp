import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { classService } from '../../services/classService';
import { PageHeader, StatusBadge } from '../../components/common/StatusBadge';
import { Button, Input, Select } from '../../components/common/Button';
import { DataTable } from '../../components/tables/DataTable';
import { Modal } from '../../components/modals/ConfirmationModal';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const FeeStructure = () => {
  const { showToast } = useToast();

  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    className: '',
    tuitionFee: 18000,
    developmentFee: 3000,
    labLibraryFee: 3000,
    annualFee: 24000,
    termFee: 12000,
    status: 'Active',
  });

  const fetchStructures = async () => {
    try {
      setLoading(true);
      const [feeData, classData] = await Promise.all([
        feeService.getFeeStructures(),
        classService.getClasses(),
      ]);
      setStructures(feeData);
      setClasses(classData);
    } catch {
      showToast('Error loading fee structures', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const openAddModal = () => {
    setEditingStructure(null);
    setFormData({
      className: classes[0]?.name || 'Class I',
      tuitionFee: 18000,
      developmentFee: 3000,
      labLibraryFee: 3000,
      annualFee: 24000,
      termFee: 12000,
      status: 'Active',
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingStructure(item);
    setFormData({
      className: item.className,
      tuitionFee: item.tuitionFee || Math.round(item.annualFee * 0.75),
      developmentFee: item.developmentFee || Math.round(item.annualFee * 0.15),
      labLibraryFee: item.labLibraryFee || Math.round(item.annualFee * 0.1),
      annualFee: item.annualFee,
      termFee: item.termFee,
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleAnnualChange = (val) => {
    const annual = Number(val) || 0;
    setFormData((prev) => ({
      ...prev,
      annualFee: annual,
      termFee: Math.round(annual / 2),
      tuitionFee: Math.round(annual * 0.75),
      developmentFee: Math.round(annual * 0.15),
      labLibraryFee: Math.round(annual * 0.1),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStructure) {
        await feeService.updateFeeStructure(editingStructure.id, formData);
        showToast('Fee structure updated', 'success');
      } else {
        await feeService.createFeeStructure(formData);
        showToast('New fee structure created', 'success');
      }
      setModalOpen(false);
      fetchStructures();
    } catch {
      showToast('Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Class / Grade',
      render: (s) => (
        <span className="font-bold text-[#0b1c30] text-sm">{s.className}</span>
      ),
    },
    {
      header: 'Tuition Fee (75%)',
      align: 'right',
      render: (s) => (
        <span className="text-xs text-[#767680]">
          {formatCurrency(s.tuitionFee || Math.round(s.annualFee * 0.75))}
        </span>
      ),
    },
    {
      header: 'Dev & Facilities',
      align: 'right',
      render: (s) => (
        <span className="text-xs text-[#767680]">
          {formatCurrency(s.developmentFee || Math.round(s.annualFee * 0.15))}
        </span>
      ),
    },
    {
      header: 'Term Fee (Semi-Annual)',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-semibold text-[#006a61]">
          {formatCurrency(s.termFee)}
        </span>
      ),
    },
    {
      header: 'Total Annual Fee',
      align: 'right',
      render: (s) => (
        <span className="text-sm font-extrabold text-[#061449]">
          {formatCurrency(s.annualFee)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <button
          onClick={() => openEditModal(s)}
          className="p-1.5 text-[#767680] hover:text-[#061449] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer"
          title="Edit Fee Schedule"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structure & Schedules"
        subtitle="Manage academic curriculum, development, and tuition charges per grade for AY 2024–25"
        icon="tune"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: 'Structure' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/fees/collect">
              <Button variant="outline" size="sm" icon="payments">
                Fee Counter
              </Button>
            </Link>
            <Button variant="primary" size="sm" icon="add" onClick={openAddModal}>
              Add Class Structure
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={structures}
        loading={loading}
        emptyMessage="No fee structures configured."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStructure ? 'Edit Fee Structure' : 'Create Class Fee Structure'}
        subtitle="Standardized annual & term billing schedule"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class / Grade Name"
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            placeholder="e.g. Class IX"
            required
          />

          <Input
            label="Total Annual Fee (₹)"
            type="number"
            value={formData.annualFee}
            onChange={(e) => handleAnnualChange(e.target.value)}
            helperText="Auto-calculates standard term and component breakdowns"
            required
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input
              label="Term Fee (Semi-Annual)"
              type="number"
              value={formData.termFee}
              onChange={(e) => setFormData({ ...formData, termFee: Number(e.target.value) })}
            />
            <Input
              label="Tuition Component (₹)"
              type="number"
              value={formData.tuitionFee}
              onChange={(e) => setFormData({ ...formData, tuitionFee: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5eeff]">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} icon="check">
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeStructure;
