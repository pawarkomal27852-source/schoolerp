import React, { useState, useEffect, useMemo } from 'react';
import { classService } from '../../services/classService';
import { PageHeader, StatusBadge, SearchBar } from '../../components/common/StatusBadge';
import { Button, Input, Select } from '../../components/common/Button';
import { DataTable } from '../../components/tables/DataTable';
import { Modal, ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export const Classes = () => {
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [saving, setSaving] = useState(false);

  // Deactivation confirmation modal state
  const [deactivatingClass, setDeactivatingClass] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    section: 'A',
    academicYear: '2024–2025',
    teacher: '',
    capacity: 40,
    room: '',
    status: 'Active',
  });
  const [errors, setErrors] = useState({});

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getClasses();
      setClasses(data);
    } catch {
      showToast('Error loading classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      section: 'A',
      academicYear: '2024–2025',
      teacher: '',
      capacity: 40,
      room: '',
      status: 'Active',
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      section: cls.section,
      academicYear: cls.academicYear,
      teacher: cls.teacher,
      capacity: cls.capacity || 40,
      room: cls.room || '',
      status: cls.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Class name is required (e.g. Class VIII)';
    if (!formData.section.trim()) errs.section = 'Section is required';
    if (!formData.teacher.trim()) errs.teacher = 'Assigned class teacher is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingClass) {
        await classService.updateClass(editingClass.id, formData);
        showToast('Class configuration updated successfully', 'success');
      } else {
        await classService.createClass(formData);
        showToast('New class section created successfully', 'success');
      }
      setModalOpen(false);
      fetchClasses();
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingClass) return;
    setActionLoading(true);
    try {
      await classService.deactivateClass(deactivatingClass.id);
      showToast(`${deactivatingClass.name}-${deactivatingClass.section} marked Inactive`, 'success');
      setDeactivatingClass(null);
      fetchClasses();
    } catch {
      showToast('Failed to deactivate class', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (cls) => {
    try {
      await classService.activateClass(cls.id);
      showToast(`${cls.name}-${cls.section} activated`, 'success');
      fetchClasses();
    } catch {
      showToast('Failed to activate class', 'error');
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        c.name.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q) ||
        (c.room && c.room.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [classes, search, statusFilter]);

  const columns = [
    {
      header: 'Class & Section',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#061449] font-bold flex items-center justify-center text-xs shrink-0 border border-[#d3e4fe]">
            <span className="material-symbols-outlined text-[18px]">co_present</span>
          </div>
          <div>
            <div className="font-bold text-[#0b1c30] text-sm">
              {c.name} - Section {c.section}
            </div>
            <div className="text-[11px] text-[#767680]">
              {c.room ? `Room ${c.room}` : 'Main Wing'} • AY {c.academicYear}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Class Teacher',
      render: (c) => (
        <div className="text-xs">
          <div className="font-semibold text-[#0b1c30]">{c.teacher}</div>
          <div className="text-[11px] text-[#767680]">Faculty Head</div>
        </div>
      ),
    },
    {
      header: 'Enrolled Strength',
      render: (c) => {
        const percent = Math.min(100, Math.round(((c.studentCount || 0) / (c.capacity || 40)) * 100));
        return (
          <div className="w-36">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-[#0b1c30]">{c.studentCount || 0} Students</span>
              <span className="text-[#767680] text-[11px]">Cap {c.capacity || 40}</span>
            </div>
            <div className="w-full bg-[#eff4ff] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percent > 90 ? 'bg-[#ba1a1a]' : 'bg-[#006a61]'
                }`}
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(c)}
            className="p-1.5 text-[#767680] hover:text-[#061449] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer"
            title="Edit Class Configuration"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          {c.status === 'Active' ? (
            <button
              onClick={() => setDeactivatingClass(c)}
              className="p-1.5 text-[#767680] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
              title="Deactivate Class"
            >
              <span className="material-symbols-outlined text-[18px]">block</span>
            </button>
          ) : (
            <button
              onClick={() => handleActivate(c)}
              className="p-1.5 text-[#767680] hover:text-[#006a61] hover:bg-[#86f2e4]/30 rounded-lg transition-colors cursor-pointer"
              title="Re-activate Class"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Classroom Management"
        subtitle="Manage grades, class sections, allocated class teachers, and student capacities"
        icon="co_present"
        badge={`${classes.length} Sections`}
        actions={
          <Button variant="primary" icon="add" onClick={openAddModal}>
            Add Class Section
          </Button>
        }
      />

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by class, section, teacher, or room..."
          className="w-full sm:max-w-md"
        />

        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs font-medium bg-[#eff4ff] text-[#0b1c30] border border-transparent focus:border-[#061449] rounded-xl px-3 py-2"
          >
            <option value="all">All Class Statuses</option>
            <option value="Active">Active Sections Only</option>
            <option value="Inactive">Inactive Sections</option>
          </select>
        </div>
      </div>

      {/* Classes Table */}
      <DataTable
        columns={columns}
        data={filteredClasses}
        loading={loading}
        emptyMessage="No classes match current filter criteria."
      />

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClass ? 'Edit Class Section' : 'Create Class Section'}
        subtitle="Academic year curriculum assignment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Class Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Class IX"
              error={errors.name}
              required
            />

            <Input
              label="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              placeholder="e.g. A"
              error={errors.section}
              required
            />
          </div>

          <Input
            label="Class Teacher"
            value={formData.teacher}
            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
            placeholder="e.g. Smt. Sunita Rao"
            error={errors.teacher}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />

            <Input
              label="Room #"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. 204-B"
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>

          <Input
            label="Academic Year"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            placeholder="2024–2025"
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5eeff]">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} icon="check">
              {editingClass ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Class Deactivation */}
      <ConfirmationModal
        isOpen={!!deactivatingClass}
        onClose={() => setDeactivatingClass(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Class Section"
        message={`Are you sure you want to deactivate ${deactivatingClass?.name}-${deactivatingClass?.section}? Inactive classes will NOT be selectable for new student admissions.`}
        confirmText="Deactivate Class"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default Classes;
