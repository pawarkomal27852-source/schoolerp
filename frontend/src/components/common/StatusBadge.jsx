import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase();

  if (norm === 'active' || norm === 'completed' || norm === 'present') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#86f2e4]/30 text-[#006f66] border border-[#006a61]/20 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
        <span>{status}</span>
      </span>
    );
  }

  if (norm === 'inactive' || norm === 'absent' || norm === 'overdue' || norm === 'failed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/20 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
        <span>{status}</span>
      </span>
    );
  }

  if (norm === 'pending' || norm === 'partial') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dce9ff] text-[#061449] border border-[#505b92]/20 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#505b92]"></span>
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e5eeff] text-[#45464f] ${className}`}
    >
      {status}
    </span>
  );
};

export const KpiCard = ({
  title,
  value,
  subtext,
  badgeText,
  badgeType = 'positive',
  icon,
  iconBg = 'bg-[#e5eeff]',
  iconColor = 'text-[#061449]',
  progressPercent,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#e5eeff] flex flex-col justify-between min-h-[136px] transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-[#b9c3ff]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-[#45464f] tracking-tight">
          {title}
        </span>
        {icon && (
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
              {icon}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight tabular-nums font-headline">
          {value}
        </div>

        {progressPercent !== undefined && (
          <div className="w-full bg-[#e5eeff] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#006a61] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            ></div>
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#45464f]">
          {badgeText && (
            <span
              className={`px-1.5 py-0.5 rounded font-bold text-[10px] sm:text-xs ${
                badgeType === 'negative'
                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                  : badgeType === 'neutral'
                  ? 'bg-[#e5eeff] text-[#061449]'
                  : 'bg-[#86f2e4]/30 text-[#006f66]'
              }`}
            >
              {badgeText}
            </span>
          )}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      </div>
    </div>
  );
};

export const EmptyState = ({
  icon = 'inbox',
  title = 'No records found',
  description = 'There is currently no data to display.',
  action,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#e5eeff] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#061449] flex items-center justify-center mb-3.5 shadow-inner">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] mb-1 font-headline">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#45464f] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export const LoadingState = ({ message = 'Loading school records...' }) => {
  return (
    <div className="bg-white/80 rounded-2xl border border-[#e5eeff] p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
      <div className="w-10 h-10 border-3 border-[#e5eeff] border-t-[#061449] rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium text-[#45464f] animate-pulse">{message}</p>
    </div>
  );
};

export const PageHeader = ({
  title,
  subtitle,
  badge,
  icon,
  actions,
  breadcrumbs = [],
}) => {
  return (
    <div className="flex flex-col gap-1.5 pb-4 sm:pb-5">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#767680] mb-1">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-[#061449] transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[#061449] font-semibold">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-9 h-9 rounded-xl bg-[#061449] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30] font-headline tracking-tight">
                {title}
              </h1>
              {badge && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#86f2e4]/30 text-[#006f66]">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#45464f] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search records...',
  onClear,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="material-symbols-outlined absolute left-3.5 text-[#767680] text-[18px] pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full text-sm text-[#0b1c30] bg-white border border-[#c6c5d1] hover:border-[#505b92] focus:border-[#061449] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#061449] rounded-xl pl-10 pr-9 py-2 transition-all shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 text-[#767680] hover:text-[#0b1c30] p-1 rounded-md"
          title="Clear search"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e5eeff] text-xs text-[#45464f]">
      <div>
        Showing <span className="font-bold text-[#0b1c30]">{startItem}</span> to{' '}
        <span className="font-bold text-[#0b1c30]">{endItem}</span> of{' '}
        <span className="font-bold text-[#0b1c30]">{totalItems}</span> entries
      </div>
      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2.5 py-1.5 rounded-lg border border-[#c6c5d1] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eff4ff] transition-colors"
        >
          Previous
        </button>
        <span className="px-3 py-1 font-semibold text-[#061449]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2.5 py-1.5 rounded-lg border border-[#c6c5d1] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eff4ff] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};
