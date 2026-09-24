import React, { useState, useEffect } from 'react';
import { timetableService } from '../../services/timetableService';
import { classService } from '../../services/classService';
import { PageHeader, StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const Timetable = () => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('cls-10a');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit slot modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const clsList = await classService.getClasses();
        setClasses(clsList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true);
      try {
        const data = await timetableService.getTimetable(selectedClassId);
        setTimetable(data);
      } catch (err) {
        showToast('Error loading timetable', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, [selectedClassId]);

  const handleOpenEdit = (slot, index) => {
    if (slot.isBreak) return;
    setEditingSlot({ ...slot });
    setEditingIndex(index);
    setEditModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!editingSlot || editingIndex === null) return;

    try {
      const updated = await timetableService.updatePeriod(
        selectedClassId,
        selectedDay,
        editingIndex,
        editingSlot
      );
      setTimetable({ ...updated });
      setEditModalOpen(false);
      showToast('Timetable period updated successfully!', 'success');
    } catch {
      showToast('Failed to update period', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getSubjectColor = (code) => {
    switch (code) {
      case 'MATH':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'PHY':
      case 'PHY-LAB':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'CHEM':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'BIO':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'ENG':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'CS':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'SST':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'PE':
      case 'YOGA':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const scheduleForDay = timetable?.schedule?.[selectedDay] || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Timetable & Period Schedules"
        subtitle="Manage classroom period distribution, room assignments, and faculty allocations"
        icon="schedule"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon="print" onClick={handlePrint}>
              Print / Export Timetable
            </Button>
          </div>
        }
      />

      {/* Class & Day Navigation Strip */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-[#e5eeff] dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Class selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Class:
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-sm font-semibold bg-[#eff4ff] dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-transparent focus:border-[#061449] focus:outline-none"
          >
            <option value="cls-10a">Class X - Section A (Senior Block)</option>
            <option value="cls-10b">Class X - Section B</option>
            <option value="cls-9a">Class IX - Section A</option>
            <option value="cls-8a">Class VIII - Section A</option>
            <option value="cls-7a">Class VII - Section A</option>
            <option value="cls-6a">Class VI - Section A</option>
            <option value="cls-5a">Class V - Section A</option>
          </select>
        </div>

        {/* Room & Class Teacher Pill */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-[#006a61] bg-[#86f2e4]/30 dark:bg-teal-950/80 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[16px]">meeting_room</span>
            {timetable?.room || 'Room 304, Senior Block'}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#061449] dark:text-blue-400">
              person
            </span>
            Class Teacher: {timetable?.classTeacher || 'Mr. Vikram Sen'}
          </span>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex border-b border-[#e5eeff] dark:border-slate-800 gap-1 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedDay === day
                ? 'border-[#061449] dark:border-[#86f2e4] text-[#061449] dark:text-[#86f2e4] bg-[#eff4ff]/60 dark:bg-slate-800/40 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e5eeff] dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-headline">
              {selectedDay} Schedule • {scheduleForDay.filter((s) => !s.isBreak).length} Academic Periods
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click on any period slot to edit teacher or room
          </span>
        </div>

        {/* Schedule List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {scheduleForDay.map((slot, idx) => {
            if (slot.isBreak) {
              return (
                <div
                  key={idx}
                  className="bg-amber-50/70 dark:bg-amber-950/20 px-5 py-3 flex items-center justify-between text-amber-800 dark:text-amber-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">restaurant</span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {slot.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono font-medium">
                    <span>{slot.time}</span>
                    <span className="text-[11px] text-amber-700/70 dark:text-amber-400">
                      {slot.room}
                    </span>
                  </div>
                </div>
              );
            }

            const colorClass = getSubjectColor(slot.code);

            return (
              <div
                key={idx}
                onClick={() => handleOpenEdit(slot, idx)}
                className="p-4 hover:bg-[#f8f9ff] dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                {/* Period & Subject */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    P{slot.period}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#061449] dark:group-hover:text-blue-400 transition-colors">
                        {slot.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorClass}`}
                      >
                        {slot.code || 'CORE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {slot.teacher}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                        {slot.room}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time & Quick Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-[#eff4ff] dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {slot.time}
                  </span>
                  <button
                    type="button"
                    className="p-1.5 text-slate-400 group-hover:text-[#061449] dark:group-hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
                Edit Period {editingSlot.period} ({selectedDay})
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={editingSlot.subject}
                  onChange={(e) => setEditingSlot({ ...editingSlot, subject: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={editingSlot.code || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Faculty Member
                </label>
                <input
                  type="text"
                  value={editingSlot.teacher}
                  onChange={(e) => setEditingSlot({ ...editingSlot, teacher: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    value={editingSlot.room}
                    onChange={(e) => setEditingSlot({ ...editingSlot, room: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={editingSlot.time}
                    onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                    className="w-full text-xs font-mono font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" icon="check">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
