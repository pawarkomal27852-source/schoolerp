import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { parentService } from '../../services/parentService';
import { PageHeader } from '../../components/common/StatusBadge';
import { Button, Input, Select } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AddStudent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    studentId: `STU-2024-${Math.floor(100 + Math.random() * 900)}`,
    admissionDate: new Date().toISOString().split('T')[0],
    classId: '',
    className: '',
    section: '',
    rollNo: '',
    parentId: '',
    parentName: '',
    parentPhone: '',
    address: '',
    totalFee: '24000',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [classesData, parentsData] = await Promise.all([
          classService.getClasses(),
          parentService.getParents(),
        ]);
        // Only active classes selectable
        const activeClasses = classesData.filter((c) => c.status === 'Active');
        setClasses(activeClasses);
        setParents(parentsData);

        if (activeClasses.length > 0) {
          setFormData((prev) => ({
            ...prev,
            classId: activeClasses[0].id,
            className: activeClasses[0].name,
            section: activeClasses[0].section,
          }));
        }
      } catch {
        showToast('Error initializing form data', 'error');
      }
    };
    loadPrerequisites();
  }, []);

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

  const handleParentSelect = (parentId) => {
    if (parentId === 'new') {
      setFormData((prev) => ({
        ...prev,
        parentId: '',
        parentName: '',
        parentPhone: '',
      }));
      return;
    }
    const selected = parents.find((p) => p.id === parentId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        parentId: selected.id,
        parentName: selected.name,
        parentPhone: selected.phone,
        address: selected.address || prev.address,
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!formData.dob) errs.dob = 'Date of birth is required';
    if (!formData.classId) errs.classId = 'Please select a class';
    if (!formData.parentName.trim()) errs.parentName = 'Parent name is required';
    if (!formData.parentPhone.trim()) {
      errs.parentPhone = 'Parent phone is required';
    } else if (!/^[0-9+ -]{7,15}$/.test(formData.parentPhone.trim())) {
      errs.parentPhone = 'Please enter a valid contact number';
    }
    if (!formData.admissionDate) errs.admissionDate = 'Admission date is required';
    if (!formData.address.trim()) errs.address = 'Residential address is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the form errors before saving', 'error');
      return;
    }

    setLoading(true);
    try {
      await studentService.createStudent(formData);
      showToast(`Student ${formData.firstName} ${formData.lastName} enrolled successfully!`, 'success');
      navigate('/students');
    } catch (err) {
      showToast(typeof err === 'string' ? err : err.message || 'Failed to save student', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="New Student Admission"
        subtitle="Register a new student and link academic, parent, and institutional records"
        icon="person_add"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: 'New Admission' },
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
              1. Student Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g. Aarav"
              error={errors.firstName}
              required
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g. Sharma"
              error={errors.lastName}
              required
            />

            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              error={errors.dob}
              required
            />

            <Select
              label="Gender"
              value={formData.gender}
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
              placeholder="e.g. STU-2024-042"
              helperText="Institutional registration number (must be unique)"
              error={errors.studentId}
              required
            />

            <Input
              label="Admission Date"
              type="date"
              value={formData.admissionDate}
              onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
              error={errors.admissionDate}
              required
            />
          </div>
        </div>

        {/* Section 2: Academic Information */}
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
                Assign Class <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full text-sm text-[#0b1c30] bg-[#eff4ff] focus:bg-white rounded-xl px-3.5 py-2.5 border border-transparent focus:border-[#061449] focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - Section {c.section} (Teacher: {c.teacher})
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="text-xs text-[#ba1a1a]">{errors.classId}</p>
              )}
            </div>

            <Input
              label="Roll Number"
              value={formData.rollNo}
              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
              placeholder="e.g. 18"
              helperText="Class register number"
            />
          </div>
        </div>

        {/* Section 3: Parent Information */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              family_restroom
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              3. Parent / Guardian Details
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider">
              Link Existing Parent Record
            </label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => handleParentSelect(e.target.value)}
              className="w-full text-sm text-[#0b1c30] bg-[#eff4ff] focus:bg-white rounded-xl px-3.5 py-2.5 border border-transparent focus:border-[#061449] focus:outline-none"
            >
              <option value="new">+ Enter New Parent Below</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone}) — {p.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Parent / Guardian Full Name"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              placeholder="e.g. Rajesh Sharma"
              error={errors.parentName}
              required
            />

            <Input
              label="Contact Phone Number"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              placeholder="+91 98201 44821"
              error={errors.parentPhone}
              required
            />
          </div>
        </div>

        {/* Section 4: Address & Billing */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#061449] text-[20px]">
              home
            </span>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              4. Residential Address & Fee Assignment
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider">
              Permanent Residential Address <span className="text-[#ba1a1a]">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Flat/House No., Building Name, Street, Area, City, Pin Code"
              className="w-full text-sm text-[#0b1c30] bg-[#eff4ff] hover:bg-[#e5eeff] focus:bg-white rounded-xl p-3 border border-transparent focus:border-[#061449] focus:outline-none"
            ></textarea>
            {errors.address && (
              <p className="text-xs text-[#ba1a1a]">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Annual Fee Allocation (₹)"
              type="number"
              value={formData.totalFee}
              onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
              helperText="Default annual curriculum & facility fee"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/students">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon="check"
          >
            Save Student Record
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
