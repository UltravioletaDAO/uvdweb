import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const currentDaoMembers = [
  "0x Ultravioleta", "x4", "Colega", "Txntacion", "Alejo", "f3l1p3", "Teddy Saint", 
  "Juan Jumaga", "cdt", "Cyber Paisa", "nezzcold", "Vens", "Yesi", "Fredino", 
  "Waira Tamayo", "DavidZO", "Sindy Arenas", "JuanH", "DatBoi", 
  "Jangx", "David Rodríguez", "Juyan", "DogonPay", "Papossa", 
  "Stov3", "Brandon Heat", "lualjarami", "ACPM", "Roypi", "0xPineda", "SaemTwentyTwo", 
  "Jokker", "Andres", "Cranium", "Palacio", "0xvital.nad", "iEFx", "Detx8", "D R", 
  "Valenciacrypto", "0xSoulAvax", "Paloteroz", "xDream", "Poo", "Fabin", 
  "Allan", "Juliboy", "Mar", "ogsebitas", "Kysaug", "Burgos Σ", "Juan Suarez", 
  "1Nocty", "Sami Madrid", "Nizo", "MichaelGA", "David Barinas", "Juanmansito", 
  "Zeluz", "Mabu", "21", "Julius", "OnlyZ_", "Alejandro Rosero", "Manussa21", 
  "Gathus_", "Bob Cokirow", "JuanCCF", "Kadrez", "0xstiven", "loaiza", "Fixie", 
  "San", "JuanWx_", "sxxneiderxx", "LuismiLabs", "Rehabilitation in Progress", 
  "Bogotá Mag", "athan", "Karenn", "Jorge Toledo", "Ari", "ElBitterX", "r3c", 
  "arracacha", "Hanma", "chocoflow", "Elian", "Pkante", "0xyuls", "Juandi", 
  "painbrayan", "idk", "nich", "David zulodaes", "Agudelo", "collin", "daninft", 
  "Jeinson22", "Jhon Fray", "Dylan Alexander", "knightinstruction", "Freddy Sebastian", 
  "Luis0xz", "Alx Dlarch", "daniiel_zp", "Crashxh", "PitBullPrime", "Mario Peña Alcazar", 
  "Crew", "Shelteer", "Alexis Cedeño", "Daniel S Morales", "Carza", 
  "Andres92", "Zircon", "alejojc", "IZ", "Danieeel", "Loaiza", "juanpkante", "0xsoulavax"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/15">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-primary">{shuffledMembers.length} {t('metricsDashboard.contributorSection.title').toUpperCase()}</span>
          </h2>
          <p className="text-sm text-muted-foreground ml-11">
            {t('metricsDashboard.contributorSection.subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-500 font-semibold text-sm">
              {t('metricsDashboard.contributorSection.underConstruction.title')}
            </p>
            <p className="text-text-secondary text-sm mt-1">
              {t('metricsDashboard.contributorSection.underConstruction.message')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-background-lighter rounded-xl p-6 border border-ultraviolet-darker/20">
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="text"
              placeholder={t('metricsDashboard.contributorSection.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-ultraviolet-darker/20 rounded-lg
                focus:ring-2 focus:ring-ultraviolet focus:border-transparent
                text-text-primary placeholder-text-secondary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className="bg-background rounded-lg px-4 py-4 text-sm text-text-primary
                border border-ultraviolet-darker/10 hover:border-ultraviolet/30 
                hover:bg-ultraviolet/5 transition-all cursor-pointer group
                flex flex-col items-start min-h-[80px] justify-between"
            >
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 group-hover:animate-pulse flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight break-words">{member}</span>
                </div>
                {memberProfiles[member] && (
                  <a 
                    href={memberProfiles[member].startsWith('http') ? memberProfiles[member] : `https://x.com/${memberProfiles[member].replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ultraviolet hover:text-ultraviolet-light flex items-center gap-1 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="break-all">@{memberProfiles[member].replace(/^@/, '')}</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-ultraviolet border-t-transparent" />
          </div>
        )}

      </div>
    </div>
  );
};

export default ContributorSection;