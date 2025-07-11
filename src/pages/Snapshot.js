import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
import { formatDistanceToNow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import snapshot from '@snapshot-labs/snapshot.js';
import detectEthereumProvider from '@metamask/detect-provider';

const formatVotingPower = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}m`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

const fetchProposalsFromAPI = async (space, setProposals, setLoading, setError, fetchNames) => {
  try {
    const query = `
      query Proposals {
        proposals(
          first: 5,
          skip: 0,
          where: {
          space: "${space}"
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
        choices
          start
          end
          state
          author
        scores
        votes
        quorum
          space {
            id
            name
          }
        scores_total
        scores_state
        votes
        }
      }
    `;

    const response = await fetch('https://hub.snapshot.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    const proposals = json.data.proposals || [];
    setProposals(proposals);

    // Obtener nombres de perfiles de los autores
    const authors = proposals.map(p => p.author.toLowerCase());
    await fetchNames(authors);

    setLoading(false);
  } catch (err) {
    console.error('Error fetching proposals:', err);
    setError(err.message);
    setLoading(false);
  }
};

const ProposalModal = ({ proposal, onClose, onVote, isVoting, userVote }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  if (!proposal) return null;

  const totalVotes = proposal.scores?.reduce((a, b) => a + b, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background max-w-3xl w-full rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-text-primary">{proposal.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
          >
            <svg className="w-6 h-6 text-ultraviolet-dark hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-between items-center text-sm text-text-tertiary">
          <div className="flex items-center gap-2">
            <span>{t('snapshot.author')} {proposal.authorDisplayName || `${proposal.author?.slice(0, 6)}...${proposal.author?.slice(-4)}`}</span>
            <span>•</span>
            <span>
              {new Date(proposal.start * 1000).toLocaleDateString()}
              {' - '}
              {new Date(proposal.end * 1000).toLocaleDateString()}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full ${
            proposal.state === 'active'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-gray-500/10 text-gray-500'
          }`}>
            {t(`snapshot.states.${proposal.state}`)}
          </span>
        </div>

        <div className="prose prose-invert max-w-none mt-4">
          <div className="whitespace-pre-wrap">{proposal.body}</div>
        </div>

        <h3 className="text-lg font-semibold mb-3 mt-6">{t('snapshot.choices')}:</h3>
        <div className="space-y-2">
          {proposal.choices.map((choice, index) => {
            const voteCount = proposal.scores?.[index] || 0;
            const votePercentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const isUserVote = userVote && userVote.choice === index + 1;

            return (
              <button
                key={index}
                onClick={() => proposal.state === 'active' && onVote(proposal.id, index + 1)}
                disabled={isVoting || proposal.state !== 'active'}
                className={`w-full px-4 py-3 rounded-lg border relative
                  ${isUserVote ? 'border-ultraviolet text-ultraviolet' : 'border-ultraviolet-darker'}
                  ${proposal.state === 'active' && !isVoting ? 'hover:bg-ultraviolet-darker/10' : ''}
                  ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-center">
                    <span>{choice}</span>
                    <span className="text-text-tertiary">
                    {formatVotingPower(Number(voteCount))} $UVD ({votePercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div
                  className="absolute inset-0 bg-ultraviolet-dark/10 rounded-lg"
                  style={{ width: `${votePercentage}%` }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StateIcon = ({ state }) => {
  switch (state) {
    case 'active':
      return (
        <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'closed':
      return (
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    default:
      return null;
  }
};

const Alert = ({ message, type, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-[60]">
    <div className={`p-6 rounded-lg shadow-lg border max-w-lg w-full mx-4 ${
      type === 'error' ? 'bg-background/95 border-red-500/30 text-white' :
      type === 'info' ? 'bg-background/95 border-ultraviolet/30 text-white' :
      type === 'success' ? 'bg-background/95 border-green-500/30 text-white' :
      'bg-background/95 border-green-500/30 text-white'
    }`}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-grow">
          {type === 'error' ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : type === 'info' ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className={`text-base font-medium ${type === 'success' ? 'text-green-500' : ''}`}>{message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded flex-shrink-0"
        >
          <svg className="w-5 h-5 text-ultraviolet-dark hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const VoteReasonModal = ({ onConfirm, onClose, choice }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-background max-w-lg w-full rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-text-primary">{t('snapshot.vote_reason_title')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
          >
            <svg className="w-6 h-6 text-ultraviolet-dark hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('snapshot.vote_reason_placeholder')}
          className="w-full h-32 p-3 rounded-lg bg-background-lighter border border-ultraviolet-darker/30 
                   text-text-primary placeholder-text-tertiary resize-none focus:outline-none 
                   focus:border-ultraviolet-darker mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ultraviolet-darker/30 text-text-primary 
                     hover:bg-ultraviolet-darker/10"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 bg-ultraviolet-darker text-white rounded-lg 
                     hover:bg-ultraviolet-dark transition-colors"
          >
            {t('snapshot.vote')}
          </button>
        </div>
      </div>
    </div>
  );
};

const VotesModal = ({ proposal, onClose }) => {
  const { t } = useTranslation();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voterNames, setVoterNames] = useState({});
  const [voterProfiles, setVoterProfiles] = useState({});
  const [results, setResults] = useState([]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const query = `
          query {
            votes(
              first: 1000,
              where: {
                proposal: "${proposal.id}"
              },
              orderBy: "vp",
              orderDirection: desc
            ) {
              id
              voter
              choice
              vp
              reason
              created
            }
          }
        `;

        const votesResponse = await fetch('https://hub.snapshot.org/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        const votesJson = await votesResponse.json();
        if (votesJson.data?.votes) {
          const sortedVotes = votesJson.data.votes;
          setVotes(sortedVotes);

          // Calcular resultados
          const voteCounts = {};
          const votePower = {};
          proposal.choices.forEach((choice, index) => {
            voteCounts[index + 1] = 0;
            votePower[index + 1] = 0;
          });

          sortedVotes.forEach(vote => {
            voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + 1;
            votePower[vote.choice] = (votePower[vote.choice] || 0) + Number(vote.vp);
          });

          const totalPower = Object.values(votePower).reduce((a, b) => a + b, 0);

          const sortedResults = proposal.choices.map((choice, index) => ({
            choice,
            index: index + 1,
            votes: voteCounts[index + 1] || 0,
            power: votePower[index + 1] || 0,
            percentage: totalPower > 0 ? ((votePower[index + 1] || 0) / totalPower) * 100 : 0
          })).sort((a, b) => b.power - a.power);

          setResults(sortedResults);

          // Obtener los perfiles de los votantes
          const votersQuery = `
            query {
              users(
                where: {
                  id_in: ${JSON.stringify(sortedVotes.map(vote => vote.voter.toLowerCase()))}
                }
              ) {
                id
                name
                about
                avatar
              }
            }
          `;

          const profilesResponse = await fetch('https://hub.snapshot.org/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: votersQuery })
          });

          const profilesJson = await profilesResponse.json();
          const names = {};
          const profiles = {};
          
          if (profilesJson.data?.users) {
            profilesJson.data.users.forEach(user => {
              const lowerId = user.id.toLowerCase();
              if (user.name) names[lowerId] = user.name;
              profiles[lowerId] = user;
            });
          }
          
          setVoterNames(names);
          setVoterProfiles(profiles);
        }
      } catch (err) {
        console.error('Error fetching votes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [proposal.id, proposal.choices]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const convertIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) return null;
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background max-w-5xl w-full rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Resultados */}
          <div className="bg-background-lighter rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">{t('snapshot.results')}</h3>
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.index} className="flex items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-text-primary">{result.choice}</span>
                      <span className="text-text-secondary">
                        {result.votes} {t('snapshot.votes')} · {formatVotingPower(Math.trunc(Number(result.power)))} UVD · {result.percentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ultraviolet-darker rounded-full"
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de votos */}
          <div>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-background z-10 pb-4 border-b border-gray-800">
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] w-full gap-8 text-sm text-text-tertiary font-medium">
                <div>{t('snapshot.voter')}</div>
                <div>{t('snapshot.choice')}</div>
                <div>{t('snapshot.date')}</div>
                <div>{t('snapshot.voting_power')} ↓</div>
                <button
                  onClick={onClose}
                  className="text-lg text-ultraviolet hover:text-red-500 transition-colors text-center"
                >
                  X
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ultraviolet-darker"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {votes.map((vote) => {
                  const voterProfile = voterProfiles[vote.voter.toLowerCase()];
                  const voterName = voterNames[vote.voter.toLowerCase()];
                  const displayName = voterName || `${vote.voter.slice(0, 6)}...${vote.voter.slice(-4)}`;
                  const avatarUrl = voterProfile?.avatar ? 
                    convertIpfsUrl(voterProfile.avatar) : 
                    `https://effigy.im/a/${vote.voter}.svg`;
                  
                  return (
                    <div key={vote.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-8 items-center py-4 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://effigy.im/a/${vote.voter}.svg`;
                          }}
                        />
                        <a
                          href={`https://snapshot.org/#/profile/${vote.voter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-primary hover:text-ultraviolet transition-colors truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {displayName}
                        </a>
                      </div>
                      <div className="text-text-primary">
                        {proposal.choices[vote.choice - 1]}
                        {vote.reason && (
                          <div className="text-sm text-text-tertiary mt-1 line-clamp-5">
                            {vote.reason}
                          </div>
                        )}
                      </div>
                      <div className="text-text-tertiary">
                        {formatDate(vote.created)}
                      </div>
                      <div className="text-text-primary font-medium">
                        {formatVotingPower(Number(vote.vp))} UVD
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Snapshot = () => {
  const { t, i18n } = useTranslation();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [votingPower, setVotingPower] = useState('0');
  const [isVoting, setIsVoting] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [authorNames, setAuthorNames] = useState({});
  const [provider, setProvider] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [alert, setAlert] = useState(null);
  const [voteData, setVoteData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedVotes, setSelectedVotes] = useState(null);

  const SNAPSHOT_GRAPHQL_URL = 'https://hub.snapshot.org/graphql';
  const space = 'ultravioletadao.eth';

  // Función para convertir URLs IPFS a URLs HTTP
  const convertIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) return null;
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  // Función para obtener nombres de perfiles
  const fetchNames = async (addresses) => {
    try {
      // Asegurarnos de que las direcciones estén en minúsculas
      const normalizedAddresses = addresses.map(addr => addr.toLowerCase());
      
      const query = `
        query {
          users(
            where: {
              id_in: ${JSON.stringify(normalizedAddresses)}
            }
          ) {
            id
            name
          }
        }
      `;

      const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const json = await response.json();
      const names = {};
      
      // Obtener los nombres de los usuarios
      if (json.data?.users) {
        json.data.users.forEach(user => {
          if (user.name) {
            names[user.id.toLowerCase()] = user.name;
          }
        });
      }

      // Para las direcciones sin nombre, usar dirección recortada
      normalizedAddresses.forEach(address => {
        if (!names[address]) {
          names[address] = `${address.slice(0, 6)}...${address.slice(-4)}`;
        }
      });

      setAuthorNames(names);
    } catch (err) {
      console.error('Error fetching profile names:', err);
      // En caso de error, usar direcciones recortadas
      const names = {};
      addresses.forEach(address => {
        const lowercaseAddress = address.toLowerCase();
        names[lowercaseAddress] = `${lowercaseAddress.slice(0, 6)}...${lowercaseAddress.slice(-4)}`;
      });
      setAuthorNames(names);
    }
  };

  // Función para inicializar el proveedor
  const initializeProvider = async () => {
    try {
      const detectedProvider = await detectEthereumProvider({
        mustBeMetaMask: false,
        silent: true,
        timeout: 3000
      });

      if (detectedProvider) {
        setProvider(detectedProvider);
        setWeb3Provider(new Web3Provider(detectedProvider));
      }
    } catch (err) {
      console.error('Error initializing provider:', err);
    }
  };

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (address) => {
    try {
      const query = `
        query {
          user(id: "${address.toLowerCase()}") {
            id
            name
            about
            avatar
          }
        }
      `;

      const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const json = await response.json();
      if (json.data?.user) {
        setUserProfile(json.data.user);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Función para conectar wallet
  const connectWallet = async () => {
    try {
      setError(null);
      
      if (!provider || !web3Provider) {
        await initializeProvider();
      }

      if (!provider) {
        throw new Error(t('snapshot.errors.no_metamask'));
      }

      // Solicitar permisos y mostrar selector de wallets
      try {
        await provider.request({
          method: 'wallet_requestPermissions',
          params: [{
            eth_accounts: {}
          }]
        });
      } catch (err) {
        console.log('Error requesting permissions:', err);
        if (err.code === 4001) {
          throw new Error(t('snapshot.errors.user_rejected_connection'));
        }
        throw err;
      }

      // Limpiar el estado actual
      setAccount(null);
      setUserProfile(null);
      localStorage.removeItem('walletAddress');
      
      // Solicitar nueva conexión
      try {
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
          throw new Error(t('snapshot.errors.user_rejected_connection'));
        }

        // Actualizar el proveedor después de la nueva conexión
        setWeb3Provider(new Web3Provider(provider));
        const signer = new Web3Provider(provider).getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        localStorage.setItem('walletAddress', address);

        await Promise.all([
          fetchVotingPower(address),
          fetchUserVotes(address),
          fetchUserProfile(address)
        ]);
      } catch (err) {
        console.error('Error requesting accounts:', err);
        if (err.code === 4001) {
          throw new Error(t('snapshot.errors.user_rejected_connection'));
        }
        throw new Error(t('snapshot.errors.provider_error'));
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
    }
  };

  const fetchVotingPower = async (address) => {
    const votingPowerQuery = `
      query {
        vp(
          space: "${space}"
          voter: "${address}"
        ) {
          vp
          vp_by_strategy
        }
      }
    `;

    const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: votingPowerQuery })
    });

    const json = await response.json();
    if (json.data?.vp) {
      setVotingPower(Math.trunc(json.data.vp.vp).toString());
    }
  };

  const fetchUserVotes = async (address) => {
    const votesQuery = `
      query {
        votes(
          where: {
            voter: "${address}",
            space: "${space}"
          }
        ) {
          proposal {
            id
          }
          choice
        }
      }
    `;

    const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: votesQuery })
    });

    const json = await response.json();
    if (json.data?.votes) {
      const votesMap = {};
      json.data.votes.forEach(vote => {
        votesMap[vote.proposal.id] = vote;
      });
      setUserVotes(votesMap);
    }
  };

  const handleVoteClick = (proposalId, choice) => {
    if (!account) {
      setError(t('snapshot.errors.connect_wallet'));
      return;
    }
    setVoteData({ proposalId, choice });
  };

  const handleVoteConfirm = async (reason) => {
    try {
      setIsVoting(true);
      setError(null);
      
      if (!web3Provider) {
        await initializeProvider();
      }

      const hub = 'https://hub.snapshot.org';
      const client = new snapshot.Client712(hub);

      try {
        await client.vote(web3Provider, account, {
          space,
          proposal: voteData.proposalId,
          type: 'single-choice',
          choice: voteData.choice,
          reason,
          app: 'ultravioletadao'
        });

        await fetchProposalsFromAPI(space, setProposals, setLoading, setError, fetchNames);
        await fetchUserVotes(account);
        setSelectedProposal(null);
        setVoteData(null);
        setAlert({
          message: t('snapshot.vote_submitted'),
          type: 'success'
        });
      } catch (err) {
        if (err.code === 4001) {
          setAlert({
            message: t('snapshot.vote_cancelled'),
            type: 'info'
          });
          return;
        }
        throw err;
      }
    } catch (err) {
      if (err.code === 4001) {
        setAlert({
          message: t('snapshot.errors.user_rejected_vote'),
          type: 'info'
        });
      } else {
        setAlert({
          message: err.message || t('snapshot.errors.vote_failed'),
          type: 'error'
        });
      }
    } finally {
      setIsVoting(false);
      setVoteData(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeProvider();
      await fetchProposalsFromAPI(space, setProposals, setLoading, setError, fetchNames);
      const savedAddress = localStorage.getItem('walletAddress');
      if (savedAddress) {
        setAccount(savedAddress);
        await Promise.all([
          fetchVotingPower(savedAddress),
          fetchUserVotes(savedAddress),
          fetchUserProfile(savedAddress)
        ]);
      }
    };
    
    init();
  }, []);

  const handleCloseModal = () => {
    setSelectedProposal(null);
    setError(null);
  };

  const formatTimeLeft = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const isPastDate = isPast(date);
    const currentLanguage = i18n.language;
    const isSpanish = currentLanguage.startsWith('es');
    
    if (isPastDate) {
      if (isSpanish) {
        const distance = formatDistanceToNow(date, { 
          locale: es,
          addSuffix: true
        });
        return `Finalizada ${distance}`;
      } else {
        const distance = formatDistanceToNow(date, { 
          locale: enUS,
          addSuffix: true
        });
        return `Ended ${distance}`;
      }
    }
    
    if (isSpanish) {
      const distance = formatDistanceToNow(date, { 
        locale: es,
        addSuffix: false
      });
      return `${distance} restantes`;
    } else {
      const distance = formatDistanceToNow(date, { 
        locale: enUS,
        addSuffix: false
      });
      return `${distance} left`;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setVotingPower('0');
    setUserVotes({});
    localStorage.removeItem('walletAddress');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ultraviolet-darker"></div>
      </div>
    );
  }

  const selectedProposalData = proposals.find(p => p.id === selectedProposal);
  if (selectedProposalData) {
    selectedProposalData.authorDisplayName = authorNames[selectedProposalData.author.toLowerCase()];
  }

  return (
    <div className="min-h-screen bg-background">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      {voteData && (
        <VoteReasonModal
          choice={voteData.choice}
          onConfirm={handleVoteConfirm}
          onClose={() => setVoteData(null)}
        />
      )}
      {selectedVotes && (
        <VotesModal
          proposal={selectedVotes}
          onClose={() => setSelectedVotes(null)}
        />
      )}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src="/logo.png" alt="UltravioletaDAO" className="w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          {t('snapshot.title')}
        </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative group">
                <a
                  href="https://snapshot.box/#/s:ultravioletadao.eth/create/stv2t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-ultraviolet-darker text-white rounded-lg hover:bg-ultraviolet-dark transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-ultraviolet-darker text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {t('snapshot.new_proposal')}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mt-1">
                    <div className="border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              </div>

              {account ? (
                <button
                  onClick={disconnectWallet}
                  className="px-3 sm:px-4 py-2 bg-ultraviolet-darker rounded-lg text-white text-sm sm:text-base hover:bg-red-600 transition-colors group"
                >
                  <span className="block group-hover:hidden">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                  <span className="hidden group-hover:block">{t('common.disconnect')}</span>
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-3 sm:px-6 py-2 bg-ultraviolet-darker text-white text-sm sm:text-base rounded-lg hover:bg-ultraviolet-dark transition-colors"
                >
                  {t('snapshot.connect_wallet')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-text-tertiary hover:text-ultraviolet transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('success.back_home')}
        </a>
      </div>

      {account && (
        <div className="border-b border-gray-800 bg-background-lighter">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <img 
                src={userProfile?.avatar ? convertIpfsUrl(userProfile.avatar) : `https://effigy.im/a/${account}.svg`} 
                alt="Profile" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-ultraviolet-darker"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://effigy.im/a/${account}.svg`;
                }}
              />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-text-primary">
                  {userProfile?.name || `${account.slice(0, 6)}...${account.slice(-4)}`}
                </h2>
                <div className="text-sm sm:text-base text-text-secondary">
                  {t('snapshot.voting_power')}: {formatVotingPower(Number(votingPower))} $UVD
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-2 sm:px-4 mt-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const totalVotes = proposal.scores?.reduce((a, b) => a + b, 0) || 0;
            const quorumPercentage = proposal.quorum > 0 ? ((totalVotes / proposal.quorum) * 100).toFixed(1) : 0;

            return (
            <div
              key={proposal.id}
                className="w-full text-left bg-background-lighter rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div 
                    className="flex-grow cursor-pointer w-full sm:w-auto" 
                    onClick={() => setSelectedProposal(proposal.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <StateIcon state={proposal.state} />
                      <h3 className="text-lg sm:text-xl font-semibold text-text-primary line-clamp-2">
                {proposal.title}
              </h3>
                    </div>
                    <p className="text-text-secondary text-sm sm:text-base line-clamp-3 mb-4">
                {proposal.body}
              </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-tertiary">
                <span>
                        {t('snapshot.author')} {authorNames[proposal.author.toLowerCase()] || `${proposal.author.slice(0, 6)}...${proposal.author.slice(-4)}`}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatTimeLeft(proposal.end)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{t('snapshot.votes_count', { count: proposal.votes })}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{t('snapshot.quorum', { percentage: quorumPercentage })}</span>
                      {userVotes[proposal.id] && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-ultraviolet">
                            {t('snapshot.voted')}: {proposal.choices[userVotes[proposal.id].choice - 1]}
                </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm text-center ${
                  proposal.state === 'active'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-gray-500/10 text-gray-500'
                }`}>
                      {t(`snapshot.states.${proposal.state}`)}
                </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVotes(proposal);
                      }}
                      className="px-3 py-1 text-xs sm:text-sm border rounded-lg
                        text-text-primary bg-ultraviolet-darker hover:bg-ultraviolet-dark transition-colors whitespace-nowrap"
                    >
                      {t('snapshot.view_votes')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {proposals.length === 0 && (
          <div className="text-center text-text-secondary py-12">
            <p className="text-xl">{t('snapshot.no_proposals')}</p>
          </div>
        )}

        <div className="flex justify-start mt-1">
          <a
            href="https://snapshot.box/#/s:ultravioletadao.eth/proposals"
            target="_blank"
            rel="noopener noreferrer"
            className="px-0 py-4 text-white hover:text-ultraviolet-dark text-sm sm:text-base flex items-center gap-2"
          >
            {t('snapshot.view_more')}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {selectedProposalData && (
          <ProposalModal
            proposal={selectedProposalData}
            onClose={handleCloseModal}
            onVote={handleVoteClick}
            isVoting={isVoting}
            userVote={userVotes[selectedProposalData.id]}
          />
        )}
      </div>
    </div>
  );
};

export default Snapshot; 