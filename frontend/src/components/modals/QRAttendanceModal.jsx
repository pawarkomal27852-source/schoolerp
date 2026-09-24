import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const QRAttendanceModal = ({
  isOpen,
  onClose,
  students = [],
  classInfo,
  onMarkPresent,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'cards'
  const [scannedLogs, setScannedLogs] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  if (!isOpen) return null;

  const handleSimulateScan = (student) => {
    if (!student) return;

    const time = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const isAlreadyScanned = scannedLogs.some((l) => l.studentId === student.studentId);

    if (isAlreadyScanned) {
      showToast(`${student.firstName} ${student.lastName} is already checked in!`, 'info');
      return;
    }

    const newLog = {
      studentId: student.studentId,
      name: `${student.firstName} ${student.lastName}`,
      time,
      status: 'Present',
    };

    setScannedLogs((prev) => [newLog, ...prev]);
    if (onMarkPresent) {
      onMarkPresent(student.studentId);
    }
    showToast(`✓ QR Check-in: ${student.firstName} marked Present!`, 'success');
  };

  const handleManualScanSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const query = manualInput.trim().toLowerCase();
    const found = students.find(
      (s) =>
        s.studentId.toLowerCase() === query ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(query)
    );

    if (found) {
      handleSimulateScan(found);
      setManualInput('');
    } else {
      showToast(`No student found matching "${manualInput}"`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#061449] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
                QR Code Attendance Station
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {classInfo?.name ? `${classInfo.name} • Section ${classInfo.section || 'A'}` : 'Instant Daily Check-in'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex justify-center shrink-0">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-white dark:bg-slate-900 text-[#061449] dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Live Scanner Station
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-[#061449] dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Class QR Passes ({students.length})
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Scanner Viewport Simulation */}
              <div className="bg-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 text-white min-h-[220px]">
                {/* Scanning reticle */}
                <div className="w-40 h-40 border-2 border-teal-400/80 rounded-2xl relative flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-300"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-300"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-300"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-300"></div>

                  {/* Laser line */}
                  <div className="w-full h-0.5 bg-teal-400 shadow-[0_0_12px_#2dd4bf] animate-bounce"></div>

                  <span className="material-symbols-outlined text-[48px] text-white/20 pointer-events-none">
                    qr_code_2
                  </span>
                </div>

                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal-400">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                    <span>Camera Reader Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Align student QR ID badge inside frame
                  </p>
                </div>
              </div>

              {/* Quick Scan Simulator */}
              <div className="space-y-3">
                <form onSubmit={handleManualScanSubmit} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Fast Barcode / ID Input
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. STU-2024-001 or Name"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <Button type="submit" variant="primary" size="sm">
                      Check-In
                    </Button>
                  </div>
                </form>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Simulate Student Scan:
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {students.slice(0, 8).map((s) => {
                      const already = scannedLogs.some((l) => l.studentId === s.studentId);
                      return (
                        <button
                          key={s.studentId}
                          type="button"
                          onClick={() => handleSimulateScan(s)}
                          disabled={already}
                          className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between border transition-all cursor-pointer ${
                            already
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">
                              {already ? 'check_circle' : 'qr_code'}
                            </span>
                            <span className="font-semibold">{s.firstName} {s.lastName}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {s.studentId}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Scanned Live Log */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    history
                  </span>
                  <span>Session Check-in Stream ({scannedLogs.length})</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  Auto-synced with Daily Roll Call
                </span>
              </div>

              {scannedLogs.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No check-ins yet. Scan a badge or pick a student above!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {scannedLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-between text-xs border border-slate-200 dark:border-slate-700 animate-in fade-in"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-slate-800 dark:text-white">{log.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">({log.studentId})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Present
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CLASS QR PASSES */}
        {activeTab === 'cards' && (
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Printable student quick-scan QR passes</span>
              <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
                Print All Badges
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {students.map((s) => (
                <div
                  key={s.studentId}
                  className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-between shadow-xs"
                >
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl flex items-center justify-center">
                    <svg className="w-full h-full text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-1h2v2h-2v-2zm-3 2h2v2h-2v-2zm3 2h3v4h-2v-2h-1v-2zm-5 2h3v2h-3v-2zm2 2h3v2h-3v-2z" />
                    </svg>
                  </div>
                  <div className="mt-2 min-w-0 w-full">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {s.firstName} {s.lastName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {s.studentId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500">
            {scannedLogs.length} Checked in this session
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done Marking
          </Button>
        </div>
      </div>
    </div>
  );
};
