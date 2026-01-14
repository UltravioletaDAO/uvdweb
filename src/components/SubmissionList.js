import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { bountiesAPI } from '../services/api';
import { LinkifyText } from '../utils/linkify';

const SubmissionList = ({ bountyId }) => {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileMap, setProfileMap] = useState({}); // wallet -> { name, avatar }
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Convierte IPFS a HTTP
  const convertIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) return null;
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  // Consulta el perfil de Snapshot para una wallet
  const fetchSnapshotProfile = async (wallet) => {
    try {
      const query = `
        query {
          user(id: "${wallet.toLowerCase()}") {
            id
            name
            avatar
          }
        }
      `;
      const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const json = await response.json();
      if (json.data?.user) {
        return {
          name: json.data.user.name,
          avatar: json.data.user.avatar
        };
      }
    } catch (error) {
      console.error('Error fetching Snapshot profile:', error);
    }
    return {};
  };

  // Fetch de submissions por bountyId
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await bountiesAPI.getSubmissions(bountyId);
        const submissionsData = data.data || data;
        setSubmissions(submissionsData);
        // Buscar perfiles para las wallets únicas
        const wallets = Array.from(new Set(submissionsData.map(s => s.submitterName).filter(Boolean)));
        const map = {};
        await Promise.all(wallets.map(async (wallet) => {
          map[wallet] = await fetchSnapshotProfile(wallet);
        }));
        setProfileMap(map);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (bountyId) {
      fetchSubmissions();
    }
  }, [bountyId]);

  if (loading) {
    return <div className="text-center text-text-secondary opacity-60 mt-4">{t('submissionList.loading')}</div>;
  }
  if (error) {
    return <div className="text-error text-sm bg-error/10 p-2 rounded mt-4">{error}</div>;
  }
  if (submissions.length === 0) {
    return <div className="text-center text-text-secondary opacity-60 mt-4">{t('submissionList.no_submissions')}</div>;
  }

  return (
    <div className="mt-4 pt-4 border-t border-ultraviolet-darker/20">
      <h4 className="text-md font-semibold text-text-primary mb-2">{t('submissionList.submissions_title')}</h4>
      <div className="space-y-3">
        {submissions.map((submission) => {
          const profile = profileMap[submission.submitterName] || {};
          const displayName = profile.name || (submission.submitterName ? submission.submitterName.slice(0, 6) + '...' + submission.submitterName.slice(-4) : t('common.anonymous'));
          const avatarUrl = profile.avatar ? convertIpfsUrl(profile.avatar) : (submission.submitterName ? `https://effigy.im/a/${submission.submitterName}.svg` : null);
          return (
            <div key={submission._id} className="bg-background/50 p-3 rounded-lg border border-ultraviolet/10 flex items-center gap-3">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border border-ultraviolet/40 bg-background"
                  onError={e => { e.target.onerror = null; e.target.src = submission.submitterName ? `https://effigy.im/a/${submission.submitterName}.svg` : ''; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <LinkifyText
                  as="p"
                  className="text-sm text-text-primary break-words line-clamp-2"
                >
                  {submission.submissionContent}
                </LinkifyText>
                <p className="text-xs text-text-secondary mt-1">
                  {t('submissionList.submitted_by')} {displayName}
                </p>
                <button
                  className="text-ultraviolet hover:underline text-xs mt-1 block"
                  onClick={() => { setShowModal(true); setModalContent({ content: submission.submissionContent, displayName, avatarUrl }); }}
                >
                  {t('submissionList.view_more')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="flex items-center gap-3 mb-4">
            {modalContent?.avatarUrl && (
              <img src={modalContent.avatarUrl} alt={modalContent.displayName} className="w-10 h-10 rounded-full border border-ultraviolet/40 bg-background" />
            )}
            <span className="font-semibold text-text-primary">{modalContent?.displayName}</span>
          </div>
          <LinkifyText
            as="div"
            className="whitespace-pre-wrap text-text-primary text-base"
          >
            {modalContent?.content}
          </LinkifyText>
        </Modal>
      )}
    </div>
  );
};

export default SubmissionList; 