import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BountyForm = ({ onSubmit, loading, error }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setReward('');
    setEndDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        title,
        description,
        reward,
        endDate: endDate || null,
      });
      // Reset form on successful submission
      resetForm();
    } catch {
      // Error is handled by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm text-text-secondary mb-1">{t('bountyForm.title_label')}</label>
        <input
          type="text"
          id="title"
          className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm text-text-secondary mb-1">{t('bountyForm.description_label')}</label>
        <textarea
          id="description"
          className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="reward" className="block text-sm text-text-secondary mb-1">{t('bountyForm.reward_label')}</label>
        <input
          type="text"
          id="reward"
          className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="endDate" className="block text-sm text-text-secondary mb-1">{t('bountyForm.endDate_label')}</label>
        <input
          type="date"
          id="endDate"
          className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      {error && <div className="text-error text-sm bg-error/10 p-2 rounded">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 bg-ultraviolet text-white rounded-lg font-semibold hover:bg-ultraviolet-dark transition-colors disabled:opacity-60"
        disabled={loading}
      >
        {loading ? t('bountyForm.creating_button') : t('bountyForm.create_button')}
      </button>
    </form>
  );
};

export default BountyForm; 