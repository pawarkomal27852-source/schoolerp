import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { parentService } from '../../services/parentService';
import { PageHeader, SearchBar, Pagination } from '../../components/common/StatusBadge';
import { Button, Input } from '../../components/common/Button';
import { DataTable } from '../../components/tables/DataTable';
import { Modal } from '../../components/modals/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export const Parents = () => {
  const { showToast } = useToast();

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    relationship: 'Father',
    occupation: '',
  });
  const [errors, setErrors] = useState({});

  const fetchParents = async () => {
    try {
      setLoading(true);
      const data = await parentService.getParents();
      setParents(data);
    } catch {
      showToast('Error loading parents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const openAddModal = () => {
    setEditingParent(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      relationship: 'Father',
      occupation: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (parent) => {
    setEditingParent(parent);
    setFormData({
      name: parent.name || '',
      phone: parent.phone || '',
      email: parent.email || '',
      address: parent.address || '',
      relationship: parent.relationship || 'Father',
      occupation: parent.occupation || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Parent name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+ -]{7,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingParent) {
        await parentService.updateParent(editingParent.id, formData);
        showToast('Parent details updated successfully', 'success');
      } else {
        await parentService.createParent(formData);
        showToast('New parent record registered successfully', 'success');
      }
      setModalOpen(false);
      fetchParents();
    } catch (err) {
      showToast(typeof err === 'string' ? err : 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredParents = useMemo(() => {
    if (!search.trim()) return parents;
    const q = search.toLowerCase();
    return parents.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.students &&
          p.students.some((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)))
    );
  }, [parents, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredParents.slice(start, start + pageSize);
  }, [filteredParents, page]);

  const columns = [
    {
      header: 'Parent / Guardian',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#061449] font-bold flex items-center justify-center text-xs shrink-0 border border-[#d3e4fe]">
            {p.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[#0b1c30]">{p.name}</div>
            <div className="text-xs text-[#767680]">
              {p.relationship || 'Guardian'} {p.occupation ? `• ${p.occupation}` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (p) => (
        <div>
          <div className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#767680]">call</span>
            <span>{p.phone}</span>
          </div>
          {p.email && (
            <div className="text-[11px] text-[#767680] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px] text-[#767680]">mail</span>
              <span>{p.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Address',
      render: (p) => (
        <span className="text-xs text-[#45464f] line-clamp-2 max-w-xs">
          {p.address || '—'}
        </span>
      ),
    },
    {
      header: 'Linked Wards / Students',
      render: (p) => (
        <div className="flex flex-wrap gap-1.5">
          {p.students && p.students.length > 0 ? (
            p.students.map((s) => (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#eff4ff] hover:bg-[#d3e4fe] text-[#061449] text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[12px]">school</span>
                <span>{s.firstName} {s.lastName}</span>
                <span className="text-[10px] text-[#767680]">({s.className})</span>
              </Link>
            ))
          ) : (
            <span className="text-xs text-[#767680] italic">No active enrollments</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <button
          onClick={() => openEditModal(p)}
          className="p-1.5 text-[#767680] hover:text-[#061449] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer"
          title="Edit Parent Details"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Parents & Guardians"
        subtitle="Manage parental contacts, communication records, and associated student wards"
        icon="family_restroom"
        badge={`${filteredParents.length} Families`}
        actions={
          <Button variant="primary" icon="person_add" onClick={openAddModal}>
            Register Parent
          </Button>
        }
      />

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => setSearch('')}
          placeholder="Search by parent name, phone, email, or child name..."
          className="w-full max-w-md"
        />
      </div>

      {/* Parents Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        emptyMessage="No parent profiles match your query."
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={filteredParents.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingParent ? 'Edit Parent Profile' : 'Register New Parent / Guardian'}
        subtitle="Contact details and verified residential address"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ramesh Chandra"
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98200 12345"
              error={errors.phone}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="parent@example.com"
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="Father / Mother / Guardian"
            />

            <Input
              label="Occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="e.g. Senior Architect"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address details..."
              className="w-full text-sm text-[#0b1c30] bg-[#eff4ff] focus:bg-white rounded-xl p-3 border border-transparent focus:border-[#061449] focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5eeff]">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} icon="check">
              {editingParent ? 'Save Changes' : 'Register Parent'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Parents;
