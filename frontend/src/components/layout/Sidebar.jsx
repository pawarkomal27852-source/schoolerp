import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/students', label: 'Students', icon: 'group' },
    { to: '/parents', label: 'Parents', icon: 'family_restroom' },
    { to: '/classes', label: 'Classes', icon: 'co_present' },
    { to: '/timetable', label: 'Timetable', icon: 'schedule' },
    { to: '/attendance', label: 'Attendance', icon: 'event_available' },
    {
      to: '/fees',
      label: 'Fees',
      icon: 'payments',
      badge: '42',
      badgeClass: 'bg-[#ffdad6] text-[#ba1a1a]',
    },
    { to: '/payments', label: 'Payments', icon: 'receipt_long' },
    { to: '/reports', label: 'Reports', icon: 'analytics' },
    { to: '/settings', label: 'Settings', icon: 'tune' },
  ];

  const handleLogout = () => {
    logout();
    showToast('Signed out of SchoolERP');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#061449]/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-[#e5eeff] dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo Branding */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#e5eeff] dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#061449] dark:bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-[#061449] dark:text-white tracking-tight font-headline">
                  SchoolERP
                </span>
                <span className="text-[10px] text-[#767680] dark:text-slate-400 font-semibold tracking-wider uppercase">
                  v1.4 • Single Window
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden text-[#767680] hover:text-[#0b1c30] dark:hover:text-white p-1.5 rounded-lg"
              aria-label="Close navigation"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#061449] dark:bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-[#45464f] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-[20px] transition-colors ${
                          isActive
                            ? 'text-[#86f2e4]'
                            : 'text-[#767680] dark:text-slate-400 group-hover:text-[#061449] dark:group-hover:text-white'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeClass || 'bg-[#e5eeff] dark:bg-slate-800 text-[#061449] dark:text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: Admin Profile & Logout */}
        <div className="p-3 border-t border-[#e5eeff] dark:border-slate-800 bg-[#f8f9ff] dark:bg-slate-900/60">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#e5eeff] dark:border-slate-700 flex items-center justify-between shadow-xs mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user?.avatar ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRXMJ0KBBOQOsJ-Yoaer7ZJIetY6ORR1Ww5nh6AWsr_oTAAmnHXfjsR71IhZlF4sQANyXvAuH5vszqtEdstFL5oNfq4TMNyweZUvT4j8UX_keIe7FyJrwMZ-UQpXc0sw10CWdCgxpakqYqkkriHW1sgKRUsfeSqGn5ZEHdSKNhJ7NZYYLljSC0Isig7PhnSa-_T4WohXA2ji5cHVnKYB5TifENxeO1fB-ZQonf9W0yV7Y2rZZUwiAQ'
                }
                alt="Admin"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#d3e4fe] dark:border-slate-600"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0b1c30] dark:text-white truncate">
                  {user?.name || 'Dr. Anjali Sharma'}
                </div>
                <div className="text-[10px] text-[#006a61] dark:text-[#86f2e4] font-semibold truncate">
                  Administrator
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-[#767680] hover:text-[#ba1a1a] dark:text-slate-400 dark:hover:text-red-400 hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#767680] dark:text-slate-400 px-1">
            <span>CBSE Affiliated</span>
            <span className="flex items-center gap-1 text-[#006a61] dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] dark:bg-emerald-400"></span>
              Sync Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
