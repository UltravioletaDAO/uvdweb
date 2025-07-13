import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const VotingSystem = ({ bounty, submissions, walletAddress, tokenBalance, onVoteSubmitted }) => {
  const { t } = useTranslation();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [voteAmount, setVoteAmount] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [votingError, setVotingError] = useState('');
  const [votes, setVotes] = useState({});

  useEffect(() => {
    if (submissions && submissions.length > 0) {
      // Inicializar el estado de votos
      const initialVotes = {};
      submissions.forEach(submission => {
        initialVotes[submission._id] = {
          totalVotes: 0,
          voters: []
        };
      });
      setVotes(initialVotes);
    }
  }, [submissions]);

  const handleVote = async () => {
    if (!selectedSubmission || !voteAmount || !walletAddress) {
      setVotingError(t('voting.missing_requirements'));
      return;
    }

    const voteValue = parseFloat(voteAmount);
    if (voteValue <= 0 || voteValue > tokenBalance) {
      setVotingError(t('voting.invalid_amount'));
      return;
    }

    setIsVoting(true);
    setVotingError('');

    try {
      // Aquí iría la lógica para enviar el voto al smart contract
      // Por ahora, simulamos el proceso
      
      // Simular transacción
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar el estado local
      const updatedVotes = { ...votes };
      if (!updatedVotes[selectedSubmission]) {
        updatedVotes[selectedSubmission] = { totalVotes: 0, voters: [] };
      }
      
      updatedVotes[selectedSubmission].totalVotes += voteValue;
      updatedVotes[selectedSubmission].voters.push({
        address: walletAddress,
        amount: voteValue,
        timestamp: new Date().toISOString()
      });
      
      setVotes(updatedVotes);

      // Notificar al componente padre
      if (onVoteSubmitted) {
        onVoteSubmitted({
          bountyId: bounty._id,
          submissionId: selectedSubmission,
          voterAddress: walletAddress,
          voteAmount: voteValue,
          timestamp: new Date().toISOString()
        });
      }

      // Limpiar formulario
      setSelectedSubmission(null);
      setVoteAmount('');
      
      alert(t('voting.vote_success'));

    } catch (error) {
      console.error('Error submitting vote:', error);
      setVotingError(t('voting.vote_error'));
    } finally {
      setIsVoting(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getSubmissionVoteCount = (submissionId) => {
    return votes[submissionId]?.totalVotes || 0;
  };

  const getSubmissionVoterCount = (submissionId) => {
    return votes[submissionId]?.voters?.length || 0;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-ultraviolet/20">
        <h3 className="text-lg font-bold text-white mb-4">
          {t('voting.vote_for_winner')}
        </h3>
        
        <div className="space-y-4">
          {/* Selección de submission */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('voting.select_submission')}
            </label>
            <select
              value={selectedSubmission || ''}
              onChange={(e) => setSelectedSubmission(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ultraviolet"
            >
              <option value="">{t('voting.choose_submission')}</option>
              {submissions && submissions.map(submission => (
                <option key={submission._id} value={submission._id}>
                  {submission.submitterName || formatAddress(submission.submittedBy)} - {submission.submissionContent.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad de tokens a votar */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('voting.vote_amount')} (UVT)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={voteAmount}
                onChange={(e) => setVoteAmount(e.target.value)}
                min="0"
                max={tokenBalance}
                step="0.01"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-ultraviolet"
                placeholder={`0 - ${tokenBalance} UVT`}
              />
              <button
                onClick={() => setVoteAmount(tokenBalance.toString())}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
              >
                {t('voting.max')}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              {t('voting.available_tokens')}: {tokenBalance} UVT
            </p>
          </div>

          {/* Botón de votar */}
          <button
            onClick={handleVote}
            disabled={!selectedSubmission || !voteAmount || isVoting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVoting ? t('voting.submitting_vote') : t('voting.submit_vote')}
          </button>

          {votingError && (
            <p className="text-red-400 text-sm">{votingError}</p>
          )}
        </div>
      </div>

      {/* Resultados de votación */}
      {submissions && submissions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-ultraviolet/20">
          <h4 className="text-md font-bold text-white mb-3">
            {t('voting.current_results')}
          </h4>
          <div className="space-y-2">
            {submissions.map(submission => {
              const voteCount = getSubmissionVoteCount(submission._id);
              const voterCount = getSubmissionVoterCount(submission._id);
              const percentage = submissions.length > 0 ? (voteCount / Math.max(...submissions.map(s => getSubmissionVoteCount(s._id)))) * 100 : 0;
              
              return (
                <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {submission.submitterName || formatAddress(submission.submittedBy)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {submission.submissionContent.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{voteCount.toFixed(2)} UVT</p>
                    <p className="text-gray-400 text-sm">{voterCount} {t('voting.voters')}</p>
                    <div className="w-20 bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className="bg-ultraviolet h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingSystem; 