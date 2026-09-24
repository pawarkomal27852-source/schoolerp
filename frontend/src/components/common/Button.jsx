import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  onClick,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const variants = {
    primary:
      'bg-[#061449] hover:bg-[#1e2a5e] text-white shadow-sm hover:shadow',
    secondary:
      'bg-[#006a61] hover:bg-[#005049] text-white shadow-sm',
    accent:
      'bg-[#86f2e4] hover:bg-[#6bd8cb] text-[#00201d] font-semibold',
    outline:
      'border border-[#c6c5d1] hover:border-[#061449] text-[#0b1c30] hover:bg-[#eff4ff]',
    danger:
      'bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-sm',
    dangerOutline:
      'border border-[#ffdad6] bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6]',
    ghost:
      'text-[#45464f] hover:text-[#0b1c30] hover:bg-[#e5eeff]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  icon,
  rightElement,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider"
        >
          {label} {required && <span className="text-[#ba1a1a]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 text-[#767680] text-[18px] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full text-sm text-[#0b1c30] bg-[#eff4ff] hover:bg-[#e5eeff] focus:bg-white focus:outline-none rounded-xl transition-all duration-150 ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 border ${
            error
              ? 'border-[#ba1a1a] bg-[#ffdad6]/20 focus:ring-1 focus:ring-[#ba1a1a]'
              : 'border-transparent focus:border-[#061449] focus:ring-1 focus:ring-[#061449]'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#ba1a1a] flex items-center gap-1 font-medium mt-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#767680] mt-0.5">{helperText}</p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#45464f] uppercase tracking-wider"
        >
          {label} {required && <span className="text-[#ba1a1a]">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full text-sm text-[#0b1c30] bg-[#eff4ff] hover:bg-[#e5eeff] focus:bg-white focus:outline-none rounded-xl transition-all duration-150 pl-3.5 pr-10 py-2.5 border appearance-none ${
            error
              ? 'border-[#ba1a1a] bg-[#ffdad6]/20 focus:ring-1 focus:ring-[#ba1a1a]'
              : 'border-transparent focus:border-[#061449] focus:ring-1 focus:ring-[#061449]'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
              {opt.label ?? opt.name}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 pointer-events-none text-[#767680] text-[20px]">
          expand_more
        </span>
      </div>
      {error && (
        <p className="text-xs text-[#ba1a1a] flex items-center gap-1 font-medium mt-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#767680] mt-0.5">{helperText}</p>
      )}
    </div>
  );
};
