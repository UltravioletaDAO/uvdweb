import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const currentDaoMembers = [
  "Ultra", "x4", "Colega", "Txntacion", "Alejo", "f3l1p3", "Teddy Saint",
  "Juan Jumaga", "cdt", "Cyber Paisa", "nezzcold", "Vens", "Yesi", "Fredino",
  "Waira Tamayo", "DavidZO", "Sindy Arenas", "JuanH", "DatBoi",
  "Jangx", "David Rodríguez", "Juyan", "DogonPay", "Papossa",
  "Stov3", "Brandon Heat", "lualjarami", "ACPM", "Roypi", "0xPineda", "SaemTwentyTwo",
  "Jokker", "Andres", "Cranium", "Palacio", "0xvital.nad", "iEFx", "Detx8", "D R",
  "Valenciacrypto", "0xSoulAvax", "Paloteroz", "xDream", "Poo", "Fabin",
  "Allan", "Juliboy", "Mar", "ogsebitas", "Kysaug", "Burgos Σ", "Juan Suarez",
  "1Nocty", "Sami Madrid", "Nizo", "MichaelGA", "David Barinas", "Juanmansito",
  "Zeluz", "Mabu", "21", "Julius", "OnlyZ_", "Alejandro Rosero", "Manussa21",
  "Gathus_", "Bob Cokirow", "JuanCCF", "Kadrez", "0xstiven", "Fixie",
  "San", "JuanWx_", "sxxneiderxx", "LuismiLabs", "Rehabilitation in Progress",
  "Bogotá Mag", "athan", "Karenn", "Jorge Toledo", "Ari", "ElBitterX", "r3c",
  "arracacha", "Hanma", "chocoflow", "Elian", "Pkante", "0xyuls", "Juandi",
  "painbrayan", "idk", "nich", "David zulodaes", "Agudelo", "collin", "daninft",
  "Jeinson22", "Jhon Fray", "Dylan Alexander", "knightinstruction", "Freddy Sebastian",
  "Luis0xz", "Alx Dlarch", "daniiel_zp", "Crashxh", "PitBullPrime", "Mario Peña Alcazar",
  "Crew", "Shelteer", "Alexis Cedeño", "Daniel S Morales", "Carza",
  "Andres92", "Zircon", "alejojc", "IZ", "Danieeel", "Loaiza", "juanpkante", "0xsoulavax", "JFQ", "Sandusky",
  "cabomarzo", "0xj4an", "San Valencia", "Dev Cristobal"
];

// Utility function to shuffle array randomly
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const ContributorSection = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [memberProfiles, setMemberProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [shuffledMembers, setShuffledMembers] = useState([]);

  useEffect(() => {
    // Shuffle members on component mount
    setShuffledMembers(shuffleArray(currentDaoMembers));
    fetchMemberProfiles();
  }, []);

  const fetchMemberProfiles = async () => {
    try {
      // Prefer a precomputed local handle map if present
      try {
        const mapRes = await fetch('/db/contributor_handles.json');
        if (mapRes.ok) {
          const mapJson = await mapRes.json();
          if (mapJson && typeof mapJson === 'object' && !Array.isArray(mapJson)) {
            setMemberProfiles(mapJson);
          }
        }
      } catch (e) {
        console.log('No local contributor_handles.json found:', e);
      }

      // Try multiple endpoints to get application data
      const endpoints = [
        `${process.env.REACT_APP_API_URL}/apply/approved`,
        `${process.env.REACT_APP_API_URL}/apply/all`,
        `${process.env.REACT_APP_API_URL}/applications`
      ];

      let allApplications = [];
      // Also attempt to load from local JSON snapshot generated from DB
      try {
        const localResponse = await fetch('/db/applicants_approved.json');
        if (localResponse.ok) {
          const localData = await localResponse.json();
          const normalized = Array.isArray(localData)
            ? localData.map(item => ({
              telegram: item.telegram || '',
              twitter: item.twitter || '',
              x: item.twitter || '',
              name: item.fullName || '',
            }))
            : [];
          allApplications = [...allApplications, ...normalized];
        }
      } catch (e) {
        console.log('Failed to fetch local applicants JSON:', e);
      }

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
              allApplications = [...allApplications, ...data.data];
            } else if (Array.isArray(data)) {
              allApplications = [...allApplications, ...data];
            }
          }
        } catch (err) {
          console.log(`Failed to fetch from ${endpoint}:`, err);
        }
      }

      const profiles = {};

      // Create a map of names to X profiles
      allApplications.forEach(app => {
        // Get all possible names from the application
        const telegramName = (app.telegram || '').replace('@', '').toLowerCase();
        const discordName = (app.discord || '').toLowerCase();
        const xProfile = app.twitter || app.x || '';
        const name = (app.name || '').toLowerCase();

        // Clean the X profile handle (robust against full URLs and paths)
        const cleanXProfile = (() => {
          if (!xProfile) return '';
          let s = String(xProfile).trim();
          // remove leading @
          s = s.replace(/^@+/, '');
          // strip protocol and domain
          s = s
            .replace(/^https?:\/\/(www\.)?x\.com\//i, '')
            .replace(/^https?:\/\/(www\.)?twitter\.com\//i, '');
          // if path segments remain (e.g., username/status/...), take the first segment
          if (s.includes('/')) s = s.split('/')[0];
          // final cleanup
          s = s.replace(/^@+/, '');
          return s;
        })();

        if (cleanXProfile) {
          // Try to find matches in our member list
          currentDaoMembers.forEach(member => {
            const memberLower = member.toLowerCase().replace(/[^a-z0-9]/g, '');
            const telegramClean = telegramName.replace(/[^a-z0-9]/g, '');
            const discordClean = discordName.replace(/[^a-z0-9]/g, '');
            const nameClean = name.replace(/[^a-z0-9]/g, '');

            // Check for exact or partial matches
            if ((telegramClean && (memberLower === telegramClean || memberLower.includes(telegramClean) || telegramClean.includes(memberLower))) ||
              (discordClean && (memberLower === discordClean || memberLower.includes(discordClean) || discordClean.includes(memberLower))) ||
              (nameClean && (memberLower === nameClean || memberLower.includes(nameClean) || nameClean.includes(memberLower)))) {
              profiles[member] = cleanXProfile;
            }
          });
        }
      });

      console.log('Matched profiles:', profiles);
      // Do not overwrite precomputed map if it already exists
      setMemberProfiles((prev) => (prev && Object.keys(prev).length ? prev : profiles));
    } catch (error) {
      console.error('Error fetching member profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = shuffledMembers.filter(member =>
    member.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get member data (handles both string and object formats)
  const getMemberData = (member) => {
    const profile = memberProfiles[member];
    if (!profile) return null;

    if (typeof profile === 'string') {
      return { twitter: profile, stream: null };
    }

    return {
      twitter: profile.twitter || '',
      stream: profile.stream || null
    };
  };

  // Helper function to get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitch':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
        );
      case 'kick':
        return (
          <Video className="w-3 h-3" />
        );
      default:
        return <Video className="w-3 h-3" />;
    }
  };

  const handleCardClick = (twitterUrl) => {
    if (twitterUrl) {
      const url = twitterUrl.startsWith('http') ? twitterUrl : `https://x.com/${twitterUrl.replace('@', '')}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl filter drop-shadow hover:scale-110 transition-transform cursor-default">👥</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {shuffledMembers.length} {t('metricsDashboard.contributorSection.title').toUpperCase()}
            </span>
          </h2>
          <p className="text-gray-400 mt-2 text-lg">
            {t('metricsDashboard.contributorSection.subtitle')}
          </p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-ultraviolet/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-background-lighter/50 backdrop-blur-md rounded-2xl border border-white/10 p-1 flex items-center focus-within:border-ultraviolet/50 transition-colors">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder={t('metricsDashboard.contributorSection.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member, index) => {
          const memberData = getMemberData(member);
          const isStreamer = memberData?.stream;
          const twitterUrl = memberData?.twitter;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleCardClick(twitterUrl)}
              className={`
                relative h-full min-h-[140px] p-6 rounded-2xl transition-all duration-300 group cursor-pointer
                ${isStreamer
                  ? 'bg-gradient-to-br from-purple-900/40 to-background border border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                  : 'glass-card hover:bg-white/5 box-border'
                }
                hover:-translate-y-1 hover:border-white/20
              `}
            >
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${isStreamer
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/5 text-gray-300 border border-white/10'
                      }`}>
                      {member.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {member}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {isStreamer ? (
                          <span className="text-purple-400 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            Streamer
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                            Contributor
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Right Icon */}
                  {twitterUrl && (
                    <div className="bg-white/5 p-2 rounded-full text-gray-400 group-hover:text-white group-hover:bg-cyan-500 transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Additional Links Row */}
                <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-mono">
                    {twitterUrl ? `@${twitterUrl.replace(/^@/, '')}` : 'No visuals'}
                  </div>

                  {isStreamer && memberData.stream && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = memberData.stream.url.startsWith('http') ? memberData.stream.url : `https://${memberData.stream.url}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-xs font-semibold uppercase tracking-wider transition-all border border-purple-500/20 hover:border-purple-500/50"
                    >
                      {getPlatformIcon(memberData.stream.platform)}
                      {memberData.stream.platform}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-ultraviolet/20 border-t-ultraviolet rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-ultraviolet/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p className="text-xl text-gray-400">No contributors found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ContributorSection;