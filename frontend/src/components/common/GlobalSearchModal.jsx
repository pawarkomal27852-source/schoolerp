import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { paymentService } from '../../services/paymentService';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const loadSearchData = async () => {
        try {
          const [stu, cls, pay] = await Promise.all([
            studentService.getStudents(),
            classService.getClasses(),
            paymentService.getPayments(),
          ]);
          setStudents(stu);
          setClasses(cls);
          setPayments(pay);
        } catch (err) {
          console.error(err);
        }
      };
      loadSearchData();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard', category: 'Navigation' },
    { name: 'Student Directory', path: '/students', icon: 'school', category: 'Navigation' },
    { name: 'New Student Admission', path: '/students/new', icon: 'person_add', category: 'Navigation' },
    { name: 'Parent Directory', path: '/parents', icon: 'family_restroom', category: 'Navigation' },
    { name: 'Classrooms & Sections', path: '/classes', icon: 'co_present', category: 'Navigation' },
    { name: 'Daily Attendance Roll', path: '/attendance', icon: 'event_available', category: 'Navigation' },
    { name: 'Timetable & Periods', path: '/timetable', icon: 'schedule', category: 'Navigation' },
    { name: 'Fee Collection Counter', path: '/fees/collect', icon: 'payments', category: 'Navigation' },
    { name: 'Pending Defaulters', path: '/fees/pending', icon: 'warning', category: 'Navigation' },
    { name: 'Fee Structure Rules', path: '/fees/structure', icon: 'tune', category: 'Navigation' },
    { name: 'Payment Transactions Ledger', path: '/payments', icon: 'receipt_long', category: 'Navigation' },
    { name: 'Institutional Reports', path: '/reports', icon: 'analytics', category: 'Navigation' },
    { name: 'School Settings', path: '/settings', icon: 'settings', category: 'Navigation' },
  ];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        navigation: navLinks.slice(0, 5),
        students: students.slice(0, 4),
        classes: classes.slice(0, 3),
        payments: [],
      };
    }

    const filteredNav = navLinks.filter((n) => n.name.toLowerCase().includes(q));
    const filteredStudents = students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.parentPhone && s.parentPhone.includes(q))
    ).slice(0, 5);

    const filteredClasses = classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.section && c.section.toLowerCase().includes(q)) ||
        (c.classTeacher && c.classTeacher.toLowerCase().includes(q))
    ).slice(0, 3);

    const filteredPayments = payments.filter(
      (p) =>
        p.studentName.toLowerCase().includes(q) ||
        p.receiptNo.toLowerCase().includes(q) ||
        (p.referenceNo && p.referenceNo.toLowerCase().includes(q))
    ).slice(0, 3);

    return {
      navigation: filteredNav,
      students: filteredStudents,
      classes: filteredClasses,
      payments: filteredPayments,
    };
  }, [query, students, classes, payments]);

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  const totalResults =
    results.navigation.length +
    results.students.length +
    results.classes.length +
    results.payments.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px] text-slate-400">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, parents, classes, receipts, or jump to page..."
            className="flex-1 text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4">
          {totalResults === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching records found for "{query}"
            </div>
          ) : (
            <>
              {/* Students */}
              {results.students.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Students ({results.students.length})
                  </div>
                  {results.students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(`/students/${s.id}`)}
                      className="w-full p-2.5 rounded-xl text-left hover:bg-[#eff4ff] dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#eff4ff] dark:bg-slate-800 text-[#061449] dark:text-[#86f2e4] font-bold flex items-center justify-center text-xs shrink-0">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#061449] dark:group-hover:text-blue-400 truncate">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {s.className} • Roll #{s.rollNo || '—'} • Parent: {s.parentName || '—'}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {s.studentId}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Pages */}
              {results.navigation.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Quick Navigation
                  </div>
                  {results.navigation.map((n) => (
                    <button
                      key={n.path}
                      onClick={() => handleSelect(n.path)}
                      className="w-full p-2 rounded-xl text-left hover:bg-[#eff4ff] dark:hover:bg-slate-800/80 transition-colors flex items-center gap-3 cursor-pointer group text-xs text-slate-700 dark:text-slate-300"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#061449] dark:group-hover:text-[#86f2e4]">
                        {n.icon}
                      </span>
                      <span className="font-semibold group-hover:text-[#061449] dark:group-hover:text-white">
                        {n.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Classes */}
              {results.classes.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Classrooms
                  </div>
                  {results.classes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect('/classes')}
                      className="w-full p-2 rounded-xl text-left hover:bg-[#eff4ff] dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between cursor-pointer group text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          co_present
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.name} - Section {c.section}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Teacher: {c.classTeacher || 'Assigned'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Payments */}
              {results.payments.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Payment Receipts
                  </div>
                  {results.payments.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect('/payments')}
                      className="w-full p-2 rounded-xl text-left hover:bg-[#eff4ff] dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between cursor-pointer group text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          #{p.receiptNo} • {p.studentName}
                        </span>
                        <div className="text-[11px] text-slate-500">₹{p.amount?.toLocaleString('en-IN')} via {p.mode}</div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {p.date ? new Date(p.date).toLocaleDateString('en-IN') : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400 px-4">
          <span>Search anywhere with <kbd className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px]">Ctrl</kbd> + <kbd className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px]">K</kbd></span>
          <span>Greenwood Academy Central Index</span>
        </div>
      </div>
    </div>
  );
};
