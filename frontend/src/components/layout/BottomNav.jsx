import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomNav = () => {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/students', label: 'Students', icon: 'group' },
    { to: '/attendance', label: 'Attendance', icon: 'event_available' },
    { to: '/fees', label: 'Fees', icon: 'payments' },
    { to: '/settings', label: 'Settings', icon: 'tune' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pb-safe bg-[#f8f9ff]/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-[#e5eeff] dark:border-slate-800 shadow-[0_-1px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 min-w-[44px] h-14 flex flex-col items-center justify-center gap-0.5 transition-all text-xs ${
                isActive
                  ? 'text-[#061449] dark:text-[#86f2e4] font-bold'
                  : 'text-[#45464f] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`pill flex items-center justify-center px-4 py-0.5 rounded-full transition-all ${
                    isActive
                      ? 'bg-[#1e2a5e] dark:bg-blue-600 text-white shadow-sm'
                      : 'text-[#767680] dark:text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                </div>
                <span className="text-[11px] leading-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
