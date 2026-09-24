import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Route to friendly title mapping
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/students/new')) return 'New Admission';
    if (pathname.includes('/edit') && pathname.startsWith('/students')) return 'Edit Student';
    if (pathname.startsWith('/students/')) return 'Student Profile';
    if (pathname.startsWith('/students')) return 'Students';
    if (pathname.startsWith('/parents')) return 'Parents';
    if (pathname.startsWith('/classes')) return 'Classes';
    if (pathname.startsWith('/timetable')) return 'Timetable & Periods';
    if (pathname.startsWith('/attendance/history')) return 'Attendance History';
    if (pathname.startsWith('/attendance')) return 'Daily Attendance';
    if (pathname.startsWith('/fees/structure')) return 'Fee Structure';
    if (pathname.startsWith('/fees/pending')) return 'Pending Dues';
    if (pathname.startsWith('/fees/collect')) return 'Fee Collection';
    if (pathname.startsWith('/fees')) return 'Fee Collection & Dues';
    if (pathname.startsWith('/payments')) return 'Payment History';
    if (pathname.startsWith('/reports')) return 'Institutional Reports';
    if (pathname.startsWith('/settings')) return 'School Settings';
    return 'Dashboard';
  };

  const currentTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#f8f9ff]/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-[#e5eeff] dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Mobile Menu Toggle & Brand Lockup */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-[#45464f] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#e5eeff] dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-9 h-9 rounded-xl bg-[#061449] dark:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base font-bold text-[#0b1c30] dark:text-white truncate font-headline leading-tight">
                  Greenwood Academy
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-[#45464f] dark:text-slate-400">
                  <span className="font-semibold text-[#006a61] dark:text-[#86f2e4] uppercase tracking-wider">
                    AY 2024–25
                  </span>
                  <span className="text-[#c6c5d1] dark:text-slate-600">•</span>
                  <span className="text-[#061449] dark:text-blue-400 font-semibold truncate">
                    {currentTitle}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-[#d3e4fe] dark:border-slate-700 flex items-center justify-between text-xs text-slate-400 hover:border-[#061449] dark:hover:border-slate-500 transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#061449] dark:group-hover:text-white">
                  search
                </span>
                <span>Search students, parents, classes, receipts...</span>
              </div>
              <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right: Actions (Theme Toggle, Notifications, Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#45464f] dark:text-slate-300 hover:bg-[#e5eeff] dark:hover:bg-slate-800"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[#45464f] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#e5eeff] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notification Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[#45464f] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#e5eeff] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ba1a1a]"></span>
                </span>
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#d3e4fe] dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff] dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#061449] dark:text-[#86f2e4]">
                      Administrative Alerts
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#ffdad6] dark:bg-red-950 text-[#ba1a1a] dark:text-red-300 font-bold">
                      2 Urgent
                    </span>
                  </div>
                  <div className="space-y-2.5 mt-3 text-xs">
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/fees/pending');
                      }}
                      className="p-2.5 rounded-xl bg-[#eff4ff] dark:bg-slate-800 border border-[#d3e4fe] dark:border-slate-700 cursor-pointer hover:border-[#061449]"
                    >
                      <div className="flex items-center justify-between font-bold text-[#0b1c30] dark:text-white">
                        <span>Term 2 Fee Deadline</span>
                        <span className="text-[#ba1a1a] dark:text-red-400">7 Days Left</span>
                      </div>
                      <p className="text-[#45464f] dark:text-slate-300 mt-1 leading-normal">
                        42 families have balances pending verification for Class VIII & X.
                      </p>
                    </div>

                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/attendance');
                      }}
                      className="p-2.5 rounded-xl bg-[#f8f9ff] dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:border-[#006a61]"
                    >
                      <div className="flex items-center justify-between font-bold text-[#0b1c30] dark:text-white">
                        <span>Daily Pulse Logged</span>
                        <span className="text-[#006a61] dark:text-[#86f2e4]">94.6%</span>
                      </div>
                      <p className="text-[#45464f] dark:text-slate-400 mt-1 leading-normal">
                        456 of 482 students marked present today across wings.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#e5eeff] dark:hover:bg-slate-800 transition-all ring-1 ring-[#c6c5d1]/40 dark:ring-slate-700 cursor-pointer"
                aria-label="User profile menu"
              >
                <img
                  src={
                    user?.avatar ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDRXMJ0KBBOQOsJ-Yoaer7ZJIetY6ORR1Ww5nh6AWsr_oTAAmnHXfjsR71IhZlF4sQANyXvAuH5vszqtEdstFL5oNfq4TMNyweZUvT4j8UX_keIe7FyJrwMZ-UQpXc0sw10CWdCgxpakqYqkkriHW1sgKRUsfeSqGn5ZEHdSKNhJ7NZYYLljSC0Isig7PhnSa-_T4WohXA2ji5cHVnKYB5TifENxeO1fB-ZQonf9W0yV7Y2rZZUwiAQ'
                  }
                  alt="Principal Sharma"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-[#e5eeff] dark:border-slate-700"
                />
                <span className="hidden sm:block text-xs font-bold text-[#0b1c30] dark:text-white pr-1">
                  {user?.name || 'Principal Sharma'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#767680] dark:text-slate-400 hidden sm:block">
                  expand_more
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#d3e4fe] dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-[#eff4ff] dark:bg-slate-800 rounded-xl mb-2 flex items-center gap-3">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#0b1c30] dark:text-white truncate">
                        {user?.name || 'Dr. Anjali Sharma'}
                      </h4>
                      <p className="text-[11px] text-[#006a61] dark:text-[#86f2e4] font-semibold">
                        {user?.role || 'Principal & School Owner'}
                      </p>
                      <p className="text-[10px] text-[#767680] dark:text-slate-400 truncate mt-0.5">
                        {user?.email || 'admin@greenwood.edu.in'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464f] dark:text-slate-300 hover:text-[#061449] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        settings
                      </span>
                      <span>School Settings</span>
                    </Link>
                    <Link
                      to="/timetable"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464f] dark:text-slate-300 hover:text-[#061449] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        schedule
                      </span>
                      <span>Timetable Management</span>
                    </Link>
                    <Link
                      to="/reports"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464f] dark:text-slate-300 hover:text-[#061449] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        analytics
                      </span>
                      <span>Reports & Summaries</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#e5eeff] dark:border-slate-800 mt-2 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#ba1a1a] dark:text-red-400 hover:bg-[#ffdad6]/40 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
