#!/usr/bin/env node
/*
  Updates public/db/applicants_approved.json from MongoDB (uvdweb.applicants)
  and generates public/db/contributor_handles.json mapping currentDaoMembers → X handle.

  Matching strategy:
  - Exact and partial includes on normalized keys (name, username, discord, telegram, twitter)
  - Fuzzy similarity using Levenshtein (>= 0.8)
  - Optional LLM assist when REACT_APP_OPENAI_API_KEY is set, for unresolved members

  Usage:
    MONGODB_URI="mongodb+srv://..." node scripts/updateApplicantsApproved.js
    or via npm script: npm run update:applicants
*/

const fs = require('fs/promises');
const path = require('path');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load env files (prefer .env.local over .env)
const ENV_LOCAL = path.resolve(__dirname, '..', '.env.local');
const ENV_FILE = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: ENV_FILE });
dotenv.config({ path: ENV_LOCAL, override: true });
let OpenAI = null;
try {
  // Lazy load to avoid requiring if not needed
  OpenAI = require('openai');
} catch (_) {
  OpenAI = null;
}

const ROOT = path.resolve(__dirname, '..');
const CONTRIBUTORS_FILE = path.join(
  ROOT,
  'src/components/metricDashboard/ContributorSection.jsx',
);
const OUTPUT_APPLICANTS = path.join(ROOT, 'public/db/applicants_approved.json');
const OUTPUT_HANDLES = path.join(ROOT, 'public/db/contributor_handles.json');

function logInfo(message) {
  process.stdout.write(`\u001b[36m[info]\u001b[0m ${message}\n`);
}

function logWarn(message) {
  process.stdout.write(`\u001b[33m[warn]\u001b[0m ${message}\n`);
}

function logError(message) {
  process.stderr.write(`\u001b[31m[error]\u001b[0m ${message}\n`);
}

function normalizeString(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, '');
}

function cleanTwitterHandle(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/^@+/, '');
  s = s
    .replace(/^https?:\/\/(www\.)?x\.com\//i, '')
    .replace(/^https?:\/\/(www\.)?twitter\.com\//i, '');
  if (s.includes('/')) s = s.split('/')[0];
  s = s.replace(/^@+/, '');
  return s;
}

// Levenshtein distance
function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[a.length][b.length];
}

function similarityRatio(a, b) {
  const A = normalizeString(a);
  const B = normalizeString(b);
  if (!A && !B) return 1;
  if (!A || !B) return 0;
  const dist = levenshteinDistance(A, B);
  const maxLen = Math.max(A.length, B.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

function extractTokens(raw) {
  if (!raw) return [];
  const s = String(raw)
    .replace(/[#@]/g, ' ')
    .replace(/https?:\/\/[^\s]+/g, ' ');
  return s
    .split(/[\s._\-]+/)
    .map((t) => normalizeString(t))
    .filter((t) => t && t.length >= 2);
}

function addAltFormsToSet(set, token) {
  if (!token) return;
  set.add(token);
  // Add concatenated variants are handled elsewhere; here add 0x/zerox swaps
  if (token.startsWith('0x')) {
    const rest = token.slice(2);
    if (rest) set.add(rest);
    set.add(`zerox${rest}`);
  }
  if (token.startsWith('zerox')) {
    const rest = token.slice('zerox'.length);
    if (rest) set.add(rest);
    set.add(`0x${rest}`);
  }
}

function buildTokenSetFromApplicant(app) {
  const tokenSet = new Set();
  const addTokens = (val) => {
    for (const t of extractTokens(val)) addAltFormsToSet(tokenSet, t);
  };
  addTokens(app.fullName);
  addTokens(app.name);
  addTokens(app.username);
  addTokens(app.handle);
  // Discord without discriminator
  const discordName = app.discord ? String(app.discord).split('#')[0] : '';
  addTokens(discordName);
  // Telegram w/o leading @
  const telegramRaw = (app.telegram || '').replace(/^@/, '');
  addTokens(telegramRaw);
  // Twitter/X
  addTokens(cleanTwitterHandle(app.twitter || app.x || ''));
  // Email local part
  const emailLocal = app.email ? String(app.email).split('@')[0] : '';
  addTokens(emailLocal);
  // Twitch
  addTokens((app.twitch || '').replace(/^@/, ''));
  // Wallet
  addTokens(app.walletAddress);

  // Bigram concatenations of existing tokens to capture joined names
  const tokens = Array.from(tokenSet);
  for (let i = 0; i < tokens.length - 1; i++) {
    addAltFormsToSet(tokenSet, `${tokens[i]}${tokens[i + 1]}`);
  }
  return tokenSet;
}

function jaccardSimilarityFromSets(setA, setB) {
  if (!setA.size && !setB.size) return 1;
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const v of setA) if (setB.has(v)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 1 : inter / union;
}

async function readCurrentDaoMembers() {
  const source = await fs.readFile(CONTRIBUTORS_FILE, 'utf8');
  const match = source.match(
    /const\s+currentDaoMembers\s*=\s*\[([\s\S]*?)\];/m,
  );
  if (!match) {
    throw new Error('Unable to find currentDaoMembers array in ContributorSection.jsx');
  }
  const arrayBody = `[${match[1]}]`;
  // Evaluate array literal safely
  // eslint-disable-next-line no-new-func
  const arr = Function(`"use strict"; return (${arrayBody});`)();
  if (!Array.isArray(arr)) {
    throw new Error('Parsed currentDaoMembers is not an array');
  }
  return arr.map(String);
}

async function fetchApprovedApplicants(mongoUri) {
  const client = new MongoClient(mongoUri, {
    maxPoolSize: 5,
  });
  await client.connect();
  try {
    const db = client.db('uvdweb');
    const col = db.collection('applicants');
    const cursor = col
      .find({ status: 'approved' })
      .project({
        fullName: 1,
        name: 1,
        twitter: 1,
        x: 1,
        telegram: 1,
        discord: 1,
        username: 1,
        handle: 1,
        email: 1,
        twitch: 1,
        walletAddress: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 1,
      });
    const docs = await cursor.toArray();
    return docs.map((d) => {
      const twitterClean = cleanTwitterHandle(d.twitter || d.x || '');
      return {
        fullName: d.fullName || d.name || '',
        telegram: d.telegram || '',
        discord: d.discord || '',
        username: d.username || d.handle || '',
        email: d.email || '',
        twitch: d.twitch || '',
        walletAddress: d.walletAddress || '',
        twitter: twitterClean ? `@${twitterClean}` : '',
        status: d.status || 'approved',
      };
    });
  } finally {
    await client.close();
  }
}

function getCandidateKeysFromApplicant(app) {
  const acc = new Set();

  const add = (val) => {
    const n = normalizeString(val);
    if (n && n.length >= 3) acc.add(n);
  };

  const addTokens = (val) => {
    if (!val) return;
    const raw = String(val);
    // split by whitespace and common separators
    const parts = raw
      .replace(/[@#]/g, ' ')
      .split(/[\s._\-]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    for (const p of parts) add(p);
    // also add concatenated without spaces
    const concat = raw.replace(/\s+/g, '');
    add(concat);
  };

  // Names
  add(app.fullName);
  add(app.name);
  addTokens(app.fullName);
  addTokens(app.name);

  // Usernames/handles
  add(app.username);
  add(app.handle);
  addTokens(app.username);
  addTokens(app.handle);

  // Discord (strip discriminator if present)
  const discordName = app.discord ? String(app.discord).split('#')[0] : '';
  add(discordName);
  addTokens(discordName);

  // Telegram (remove leading @; handle spaces)
  const telegramRaw = (app.telegram || '').replace(/^@/, '');
  add(telegramRaw);
  addTokens(telegramRaw);

  // Twitter/X
  const tw = cleanTwitterHandle(app.twitter || app.x || '');
  add(tw);

  // Email (local part)
  const emailLocal = app.email ? String(app.email).split('@')[0] : '';
  add(emailLocal);
  addTokens(emailLocal);

  // Twitch
  const twitchName = (app.twitch || '').replace(/^@/, '');
  add(twitchName);
  addTokens(twitchName);

  // Wallet address
  add(app.walletAddress);

  return Array.from(acc);
}

function computeMemberFeatures(member) {
  const memberKey = normalizeString(member);
  const memberTokenSet = new Set();
  for (const t of extractTokens(member)) addAltFormsToSet(memberTokenSet, t);
  const memberTokens = Array.from(memberTokenSet);
  for (let i = 0; i < memberTokens.length - 1; i++) {
    addAltFormsToSet(memberTokenSet, `${memberTokens[i]}${memberTokens[i + 1]}`);
  }
  return { memberKey, memberTokenSet };
}

function buildContributorHandleMap(members, applicants, opts = {}) {
  const {
    similarityThreshold = 0.92,
    marginThreshold = 0.06, // require clear separation between top1 and top2
  } = opts;

  const candidatesByApplicant = applicants.map((app) => {
    const twitterHandle = cleanTwitterHandle(app.twitter);
    return {
      raw: app,
      keys: getCandidateKeysFromApplicant(app),
      tokenSet: buildTokenSetFromApplicant(app),
      twitterHandle, // without @
    };
  });

  const proposals = [];

  for (const member of members) {
    const { memberKey, memberTokenSet } = computeMemberFeatures(member);

    const scored = [];
    for (const cand of candidatesByApplicant) {
      const { keys, tokenSet, twitterHandle } = cand;
      if (!twitterHandle) continue;

      const exact = keys.some((k) => k === memberKey);
      const includes = keys.some(
        (k) => k.length >= 3 && (k.includes(memberKey) || memberKey.includes(k)),
      );

      let score = 0;
      if (exact) score = 1;
      else if (includes) score = 0.97;

      // Max string similarity across candidate keys
      let strSim = 0;
      for (const k of keys) {
        if (!k) continue;
        const sim = similarityRatio(k, memberKey);
        if (sim > strSim) strSim = sim;
      }
      // Token-set similarity
      const tokSim = jaccardSimilarityFromSets(memberTokenSet, tokenSet);
      if (!exact && !includes) score = Math.max(strSim, tokSim);
      else score = Math.max(score, strSim, tokSim);

      scored.push({ member, twitterHandle, score });
    }

    if (scored.length === 0) continue;
    scored.sort((a, b) => b.score - a.score);
    const top1 = scored[0];
    const top2 = scored[1];
    const hasClearLead = !top2 || top1.score - top2.score >= marginThreshold;
    if (top1.score >= similarityThreshold && hasClearLead) {
      proposals.push(top1);
    } else {
      logWarn(`Skip ambiguous/low-confidence match for member "${member}" (top=${top1.score.toFixed(3)}${top2 ? `, second=${top2.score.toFixed(3)}` : ''})`);
    }
  }

  // Greedy assign ensuring unique handles and members
  proposals.sort((a, b) => b.score - a.score);
  const assignedHandles = new Set();
  const assignedMembers = new Set();
  const memberToHandle = {};
  for (const p of proposals) {
    if (assignedMembers.has(p.member)) continue;
    if (assignedHandles.has(p.twitterHandle)) continue;
    assignedMembers.add(p.member);
    assignedHandles.add(p.twitterHandle);
    memberToHandle[p.member] = p.twitterHandle;
  }

  return memberToHandle;
}

async function llmAssistMatches(members, applicants, preMap) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey || !OpenAI) {
    logWarn('LLM assist skipped: REACT_APP_OPENAI_API_KEY not set or openai not installed');
    return {};
  }
  const unresolved = members.filter((m) => !preMap[m]);
  if (unresolved.length === 0) return {};

  const client = new OpenAI({ apiKey });
  const maxToAsk = Math.min(unresolved.length, 40);
  const slice = unresolved.slice(0, maxToAsk);

  // Build condensed candidates list
  const candidates = applicants
    .map((a, idx) => ({
      i: idx,
      name: a.fullName || '',
      telegram: (a.telegram || '').replace(/^@/, ''),
      discord: a.discord || '',
      username: a.username || '',
      twitter: cleanTwitterHandle(a.twitter || a.x || ''),
    }))
    .slice(0, 200);

  const system = 'You match DAO member display names to applicant records. Return JSON mapping with exact applicant twitter handles (no @), only when highly confident.';
  const user = {
    members: slice,
    candidates,
    instructions:
      'For each member, pick the best candidate index if strong match by name/telegram/discord/username/twitter aliases. Return { matches: [{ member, twitter }...] }. twitter must be just the handle (no @). If unsure, skip.',
  };

  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: JSON.stringify(user),
        },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });
    const content = resp.choices?.[0]?.message?.content;
    let json = {};
    try {
      json = JSON.parse(content || '{}');
    } catch (e) {
      logWarn('Failed to parse LLM JSON');
      return {};
    }
    const out = {};
    const arr = Array.isArray(json.matches) ? json.matches : [];
    // Validate LLM matches strictly: must map to an exact applicant twitter handle and pass high score
    const handleToApplicant = new Map();
    for (const a of applicants) {
      const h = cleanTwitterHandle(a.twitter || a.x || '');
      if (h) handleToApplicant.set(h, a);
    }
    const usedHandles = new Set(Object.values(preMap));
    for (const m of arr) {
      if (!(m && m.member && m.twitter)) continue;
      const handle = cleanTwitterHandle(m.twitter);
      if (!handle) continue;
      if (usedHandles.has(handle)) continue;
      const app = handleToApplicant.get(handle);
      if (!app) continue;
      // compute score
      const { memberKey, memberTokenSet } = computeMemberFeatures(m.member);
      const cand = {
        keys: getCandidateKeysFromApplicant(app),
        tokenSet: buildTokenSetFromApplicant(app),
      };
      const exact = cand.keys.some((k) => k === memberKey);
      const includes = cand.keys.some(
        (k) => k.length >= 3 && (k.includes(memberKey) || memberKey.includes(k)),
      );
      let score = 0;
      if (exact) score = 1;
      else if (includes) score = 0.97;
      let strSim = 0;
      for (const k of cand.keys) {
        const sim = similarityRatio(k, memberKey);
        if (sim > strSim) strSim = sim;
      }
      const tokSim = jaccardSimilarityFromSets(memberTokenSet, cand.tokenSet);
      score = Math.max(score, strSim, tokSim);
      if (score >= 0.96) {
        out[m.member] = handle;
        usedHandles.add(handle);
      }
    }
    return out;
  } catch (e) {
    logWarn(`LLM assist error: ${e.message}`);
    return {};
  }
}

async function ensureDirFor(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.REACT_APP_MONGODB_URI;
  if (!mongoUri) {
    logError('MONGODB_URI (o REACT_APP_MONGODB_URI) no está definido. Crea .env.local en la raíz con MONGODB_URI=...');
    process.exit(1);
  }

  logInfo('Reading currentDaoMembers from ContributorSection.jsx');
  const members = await readCurrentDaoMembers();
  logInfo(`Found ${members.length} members`);

  logInfo('Fetching approved applicants from MongoDB (uvdweb.applicants)');
  const applicants = await fetchApprovedApplicants(mongoUri);
  logInfo(`Fetched ${applicants.length} approved applicants`);

  logInfo('Writing applicants snapshot to public/db/applicants_approved.json (twitter only)');
  await ensureDirFor(OUTPUT_APPLICANTS);
  const applicantsPublic = applicants
    .map((a) => ({ twitter: a.twitter || '' }))
    .filter((o) => o.twitter);
  await fs.writeFile(OUTPUT_APPLICANTS, JSON.stringify(applicantsPublic, null, 2), 'utf8');

  logInfo('Building contributor handle map (fuzzy ≥ 0.8)');
  let memberToHandle = buildContributorHandleMap(members, applicants, {
    similarityThreshold: 0.8,
  });
  const preCount = Object.keys(memberToHandle).length;
  logInfo(`Fuzzy matched ${preCount} members`);

  // LLM assist for unresolved
  const llmAdditions = await llmAssistMatches(members, applicants, memberToHandle);
  const added = Object.keys(llmAdditions).length;
  if (added > 0) {
    memberToHandle = { ...memberToHandle, ...llmAdditions };
    logInfo(`LLM added ${added} matches`);
  }
  logInfo(`Mapped ${Object.keys(memberToHandle).length} members → X handles`);

  logInfo('Writing handle map to public/db/contributor_handles.json');
  await ensureDirFor(OUTPUT_HANDLES);
  await fs.writeFile(
    OUTPUT_HANDLES,
    JSON.stringify(memberToHandle, null, 2),
    'utf8',
  );

  logInfo('Done');
}

main().catch((err) => {
  logError(err.stack || String(err));
  process.exit(1);
});


