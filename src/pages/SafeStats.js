import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardIcon, ClipboardDocumentCheckIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import {
  getMultisigTransactions,
  getSafeOwners,
  calculateOwnerStats,
  filterTransactionsByDateRange
} from '../services/safe/safeService';

const SAFE_ADDRESS = '0x52110a2Cc8B6bBf846101265edAAe34E753f3389';

const SafeStats = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);
  const [ownerStats, setOwnerStats] = useState([]);
  const [error, setError] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAndFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownersData = await getSafeOwners(SAFE_ADDRESS);
      setOwners(ownersData);
      const txData = await getMultisigTransactions(SAFE_ADDRESS, 100);
      // Filtrar por fechas si hay alguna seleccionada
      const filtered = filterTransactionsByDateRange(txData.results || [], startDate, endDate);
      setFilteredTransactions(filtered);
      setOwnerStats(calculateOwnerStats(filtered, ownersData));
    } catch (err) {
      setError(t('safestats.errors.loading_data'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async () => {
    if (!startDate && !endDate) {
      setError(t('safestats.errors.date_required'));
      return;
    }
    await fetchAndFilter();
  };

  const handleCopyAddress = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Format date for display, converting to locale format
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return t('safestats.all_time');
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) return dateString;
    // Format as YYYY/MM/DD
    return `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
  };

  return (
    <>
      <SEO
        title={t('safestats.seoTitle')}
        description={t('safestats.seoDescription')}
        keywords="Safe multisig stats, DAO treasury analytics, blockchain governance metrics, multisig transactions, crypto treasury management, Web3 analytics"
      />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background py-16 px-4"
    >
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Main Title Section */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-text-primary mb-4">
              {t('safestats.title')}
            </h1>
            <div className="w-24 h-1 bg-ultraviolet mx-auto rounded-full"></div>
          </div>

          {/* Filter Section */}
          <div className="bg-card rounded-xl p-6 shadow-lg mb-6 border border-ultraviolet/20">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t('safestats.filter.title')}
            </h2>
            <div className="flex flex-col sm:flex-row items-end gap-6">
              <div className="w-full sm:w-1/2">
                <label className="block text-text-primary mb-2 font-medium">
                  {t('safestats.filter.start_date')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="w-5 h-5 text-ultraviolet" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setError(null);
                    }}
                    className="pl-10 w-full bg-input border border-ultraviolet/40 rounded-lg p-2 text-ultraviolet-dark focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet"
                  />
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-text-primary mb-2 font-medium">
                  {t('safestats.filter.end_date')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="w-5 h-5 text-ultraviolet" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setError(null);
                    }}
                    className="pl-10 w-full bg-input border border-ultraviolet/40 rounded-lg p-2 text-ultraviolet-dark focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-start mt-6">
              <button
                onClick={applyFilter}
                className="px-6 py-2 bg-ultraviolet text-white rounded-lg font-semibold shadow hover:bg-ultraviolet-dark transition-colors duration-200 flex items-center justify-center"
                disabled={loading}
                style={{ minWidth: 140 }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('safestats.loading')}
                  </span>
                ) : t('safestats.apply_filter')}
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Stats Table */}
          {!loading && !error && filteredTransactions.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-lg overflow-hidden border border-ultraviolet/10">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('safestats.statistics_date', { 
                    start: formatDateForDisplay(startDate), 
                    end: formatDateForDisplay(endDate),
                    count: filteredTransactions.length
                  })}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-ultraviolet/20">
                  <thead className="bg-background">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        {t('safestats.table.address')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        {t('safestats.table.signatures')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        {t('safestats.table.percentage')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-ultraviolet/10">
                    {ownerStats
                      .filter(owner => owners.map(o => o.toLowerCase()).includes(owner.address.toLowerCase()))
                      .map((owner, idx) => (
                        <tr 
                          key={owner.address} 
                          className={`${idx % 2 === 0 ? 'bg-ultraviolet/5' : ''} 
                            ${owner.signatureCount === 0 ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-text-secondary">
                            <div className="flex items-center group">
                              <span className="font-mono break-all mr-2">{owner.address}</span>
                              <button
                                onClick={() => handleCopyAddress(owner.address)}
                                className="p-1 rounded hover:bg-ultraviolet/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={copiedAddress === owner.address ? t('safestats.copied') : t('safestats.copy')}
                              >
                                {copiedAddress === owner.address ? (
                                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
                                ) : (
                                  <ClipboardIcon className="w-5 h-5 text-ultraviolet" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            <span className={owner.signatureCount === 0 ? 'text-red-500 font-semibold' : ''}>
                              {owner.signatureCount}
                            </span> / {filteredTransactions.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            <div className="flex items-center">
                              <div className="w-full bg-ultraviolet/20 rounded-full h-2.5 mr-2 dark:bg-ultraviolet/30">
                                <div 
                                  className={`h-2.5 rounded-full ${owner.signatureCount === 0 ? 'bg-red-500' : 'bg-ultraviolet'}`}
                                  style={{ width: `${owner.percentage}%` }}
                                ></div>
                              </div>
                              <span className={owner.signatureCount === 0 ? 'text-red-500 font-semibold' : 'text-text-secondary'}>
                                {owner.percentage.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No transactions message */}
          {!loading && !error && filteredTransactions.length === 0 && (
            <div className="bg-card rounded-xl p-6 shadow-lg text-center border border-ultraviolet/10">
              <p className="text-ultraviolet-dark">{t('safestats.no_transactions')}</p>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-ultraviolet"></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default SafeStats; 