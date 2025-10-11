import React from 'react';
import { useTranslation } from 'react-i18next';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  rows = 3,
  optional = false,
  maxLength,
  tabIndex
}) => {
  const { t } = useTranslation();
  
  const renderField = () => {
    const commonProps = {
      id: name,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      maxLength,
      tabIndex,
      className: `
        w-full px-4 py-3 bg-background-input border rounded-lg
        focus:ring-2 focus:ring-ultraviolet focus:border-transparent
        ${error ? 'border-error' : 'border-ultraviolet-darker'}
        text-text-primary placeholder-text-secondary
      `
    };

    if (type === 'textarea') {
      return (
        <div>
          <textarea
            {...commonProps}
            rows={rows}
            className={`${commonProps.className} resize-none`}
          />
          <div className="flex justify-end mt-1 text-sm text-text-secondary">
            <span>{value.length} {maxLength && `/ ${maxLength}`} {t('form.characters')}</span>
          </div>
        </div>
      );
    }
    
    return (
      <input
        {...commonProps}
        type={type}
      />
    );
  };

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-text-primary">
        {label} {optional && <span className="text-text-secondary text-xs">({t('form.optional')})</span>}
      </label>
      {renderField()}
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField; 