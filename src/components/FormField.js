import React from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  value,
  onChange,
  onBlur,
  error
}) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-text-primary">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`
        w-full px-4 py-3 bg-background-input border rounded-lg
        focus:ring-2 focus:ring-ultraviolet focus:border-transparent
        ${error ? 'border-error' : 'border-ultraviolet-darker'}
        text-text-primary placeholder-text-secondary
      `}
    />
    {error && (
      <p className="text-sm text-error mt-1">{error}</p>
    )}
  </div>
);

export default FormField; 