import React, { useState } from 'react';
import { Button } from '../common/Button';

export const StudentIdCardModal = ({ student, isOpen, onClose }) => {
  const [viewSide, setViewSide] = useState('front'); // 'front' | 'back'

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#061449] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
                Institutional Student ID Card
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Credential & Access Pass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Side Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewSide('front')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewSide === 'front'
                  ? 'bg-white dark:bg-slate-900 text-[#061449] dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Front Side
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewSide === 'back'
                  ? 'bg-white dark:bg-slate-900 text-[#061449] dark:text-teal-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Back Side & Rules
            </button>
          </div>
        </div>

        {/* Card Canvas Container (CR80 Standard ID Card Ratio) */}
        <div className="flex justify-center py-1">
          {viewSide === 'front' ? (
            /* FRONT CARD */
            <div
              id="student-id-card-print"
              className="w-[340px] h-[510px] rounded-2xl bg-white border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col justify-between relative text-slate-900 select-none print:shadow-none"
            >
              {/* Header Band */}
              <div className="bg-[#061449] text-white p-4 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-white text-[#061449] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                  </div>
                  <span className="text-sm font-extrabold tracking-wide font-headline">
                    GREENWOOD ACADEMY
                  </span>
                </div>
                <div className="text-[9px] uppercase tracking-widest text-[#86f2e4] font-semibold">
                  CBSE Affiliation #1030489
                </div>
                <div className="text-[9px] text-white/70">
                  Campus Road, Civil Lines • AY 2024–2025
                </div>
              </div>

              {/* Photo & Identity Section */}
              <div className="px-5 pt-3 pb-2 flex flex-col items-center flex-1">
                {/* Photo with Frame */}
                <div className="w-24 h-28 rounded-xl bg-slate-100 border-2 border-[#061449] p-0.5 shadow-sm overflow-hidden mb-3 relative">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.firstName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[#061449] bg-slate-100">
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </div>
                  )}
                </div>

                {/* Student Full Name */}
                <h4 className="text-base font-extrabold text-[#061449] tracking-tight font-headline text-center leading-tight">
                  {student.firstName} {student.lastName}
                </h4>

                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#061449] border border-[#d3e4fe]">
                  {student.studentId}
                </span>

                {/* Details Grid */}
                <div className="w-full mt-4 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Class & Sec:</span>
                    <span className="font-bold text-slate-800">
                      {student.className} {student.section ? `(${student.section})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Roll Number:</span>
                    <span className="font-bold text-slate-800">#{student.rollNo || '14'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Blood Group:</span>
                    <span className="font-bold text-[#ba1a1a]">{student.bloodGroup || 'O+'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Emergency:</span>
                    <span className="font-bold text-slate-800">{student.parentPhone || '+91 98765 43210'}</span>
                  </div>
                </div>

                {/* Barcode & Signature */}
                <div className="w-full mt-3 flex items-center justify-between pt-2 border-t border-dashed border-slate-200">
                  <div className="text-left">
                    <div className="font-mono text-[9px] tracking-widest text-slate-400">
                      ||| | || |||| | ||| |||| |
                    </div>
                    <div className="text-[8px] font-mono text-slate-500 tracking-wider">
                      *{student.studentId}*
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-serif italic font-bold text-[#061449]">
                      A. Sharma
                    </div>
                    <div className="text-[8px] text-slate-400 uppercase font-semibold">
                      Principal Signature
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Stripe */}
              <div className="bg-[#006a61] py-1 text-center text-[9px] font-semibold text-white tracking-wider">
                STUDENT IDENTIFICATION PASS
              </div>
            </div>
          ) : (
            /* BACK CARD */
            <div className="w-[340px] h-[510px] rounded-2xl bg-white border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col justify-between p-5 text-slate-900 select-none">
              <div>
                <div className="text-center pb-3 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-[#061449] uppercase tracking-wider font-headline">
                    Terms of Cardholder Access
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Greenwood Academy Institutional Policy
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-[11px] text-slate-600 leading-relaxed">
                  <p>1. This card is non-transferable and remains property of Greenwood Academy.</p>
                  <p>2. Mandatory display during campus hours, bus transit, examinations, and laboratory access.</p>
                  <p>3. If found, please return to School Administration Office, Civil Lines Campus.</p>
                  <p>4. Report loss or damage immediately to administrative desk for reprint.</p>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <div className="font-bold text-slate-800">Campus Contact:</div>
                  <div className="text-slate-600">Helpline: +91 11 2345 6789</div>
                  <div className="text-slate-600">Email: helpdesk@greenwood.edu.in</div>
                  <div className="text-slate-600">Web: https://greenwood.edu.in</div>
                </div>
              </div>

              {/* QR Code representation */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-16 h-16 bg-white border border-slate-300 p-1 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 2h2v2h-2v-2zm3 2h3v4h-2v-2h-1v-2zm-5 2h3v2h-3v-2zm2 2h3v2h-3v-2z" />
                  </svg>
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1">
                  SECURE PASS: {student.studentId}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="flip"
              onClick={() => setViewSide((s) => (s === 'front' ? 'back' : 'front'))}
            >
              Flip Card
            </Button>
            <Button variant="primary" size="sm" icon="print" onClick={handlePrint}>
              Print ID Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
