import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { PageHeader, LoadingState } from '../../components/common/StatusBadge';
import { Button, Input, Select } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const [student, classesData] = await Promise.all([
          studentService.getStudentById(id),
          classService.getClasses(),
        ]);
        setFormData(student);
        setClasses(classesData);
      } catch (err) {
        showToast('Failed to load student details', 'error');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [id, navigate, showToast]);

  const handleClassChange = (classId) => {
    const selected = classes.find((c) => c.id === classId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        classId: selected.id,
        className: selected.name,
        section: selected.section,
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!formData.parentName.trim()) errs.parentName = 'Parent name is required';
    if (!formData.parentPhone.trim()) errs.parentPhone = 'Parent phone is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    setSaving(true);
    try {
      await studentService.updateStudent(id, formData);
      showToast('Student information updated successfully!', 'success');
      navigate(`/students/${id}`);
    } catch (err) {
      showToast(typeof err === 'string' ? err : err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <LoadingState message="Fetching student information..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Edit: ${formData.firstName} ${formData.lastName}`}
        subtitle={`Student Registration ID: ${formData.studentId}`}
        icon="edit"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: `${formData.firstName} ${formData.lastName}`, href: `/students/${id}` },
          { label: 'Edit' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Student Information */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              badge
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              1. Student Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
              required
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
              required
            />

            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob || ''}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
            />

            <Select
              label="Gender"
              value={formData.gender || 'Male'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
              required
            />

            <Input
              label="Student Unique ID"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              error={errors.studentId}
              required
            />

            <Select
              label="Enrollment Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              required
            />
          </div>
        </div>

        {/* Section 2: Academic Assignment */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              class
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              2. Academic Allocation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider">
                Assigned Class
              </label>
              <select
                value={formData.classId || ''}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full text-sm text-[#0b1c30] bg-[#eff4ff] focus:bg-white rounded-xl px-3.5 py-2.5 border border-transparent focus:border-[#061449] focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - Section {c.section} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Roll Number"
              value={formData.rollNo || ''}
              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Parent Contact */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              family_restroom
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              3. Parent / Guardian Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Parent Full Name"
              value={formData.parentName || ''}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              error={errors.parentName}
              required
            />

            <Input
              label="Contact Phone"
              value={formData.parentPhone || ''}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              error={errors.parentPhone}
              required
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider">
              Permanent Address
            </label>
            <textarea
              rows={3}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-sm text-[#0b1c30] bg-[#eff4ff] hover:bg-[#e5eeff] focus:bg-white rounded-xl p-3 border border-transparent focus:border-[#061449] focus:outline-none"
            ></textarea>
            {errors.address && (
              <p className="text-xs text-[#ba1a1a]">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Section 4: Fees Info */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              payments
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              4. Fee Stance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Annual Fee (₹)"
              type="number"
              value={formData.totalFee || 0}
              onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
            />
            <Input
              label="Paid to Date (₹)"
              type="number"
              value={formData.paidFee || 0}
              disabled
              helperText="Updated automatically via fee collections"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to={`/students/${id}`}>
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            icon="save"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;
