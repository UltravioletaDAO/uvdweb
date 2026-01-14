# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UltraVioleta DAO web application - A React-based platform for Latin American Web3 community governance, treasury management, and member engagement. Built with Create React App, TailwindCSS, and extensive Web3 integrations.

## Essential Commands

```bash
# Development
npm start          # Start development server on http://localhost:3000
npm run build      # Production build to /build directory
npm test           # Run test suite
npm run eject      # One-way operation to eject from CRA (use with caution)

# Utility Scripts
npm run generate:sitemap    # Generate sitemap.xml for SEO
npm run update:applicants   # Update approved applicants list
npm run server:install      # Install server dependencies
npm run server:dev          # Run backend server in development mode
```

## Architecture & Structure

### Core Technologies
- **React 18** with Create React App
- **TailwindCSS** for styling with custom design system
- **React Query (@tanstack/react-query)** for data fetching and caching
- **Framer Motion** for animations
- **i18next** for internationalization (ES/EN/PT/FR)

### External API Integrations
- **Snapshot GraphQL API** (`hub.snapshot.org/graphql`): Governance voting
- **Thirdweb SDK**: Web3 wallet connections and smart contract interactions
- **Avalanche C-Chain**: Primary blockchain for treasury and token (UVD)
- **OpenAI API**: AI-powered DAO storytelling with GPT-3.5
- **ElevenLabs API**: Text-to-speech with multilingual support
- **Safe (Gnosis) API**: Multi-signature wallet management
- **CoinGecko API**: Token price and market data

### Key Architectural Patterns

1. **Service Layer Pattern** (`/src/services/`)
   - Centralized API interaction logic
   - Consistent error handling across services
   - Each service focuses on a specific domain

2. **Custom Hooks** (`/src/hooks/`)
   - Data fetching hooks with React Query integration
   - Automatic caching and refetching strategies
   - Examples: `useSnapshotData`, `useCombinedSnapshotData`, `useTokenMetrics`, `useSafeAvalanche`

3. **Component Organization**
   - `/src/components/`: Reusable UI components
   - `/src/pages/`: Route-level components
   - `/src/components/sections/`: Page-specific sections
   - Components follow composition pattern with clear prop interfaces

4. **State Management**
   - React Query for server state and caching
   - Local component state for UI interactions
   - i18next for language state management

### Critical Configuration

**Environment Variables** (`.env`):
```env
REACT_APP_API_URL=https://api.ultravioletadao.xyz
REACT_APP_OPENAI_API_KEY=<optional-for-ai-storyteller>
REACT_APP_ELEVENLABS_API_KEY=<optional-for-tts>
REACT_APP_DEBUG_ENABLED=false
REACT_APP_TTS_ENABLED=true
REACT_APP_WHEEL_VERIFY_WALLET=true
REACT_APP_SHOW_SIGNUP_BUTTONS=true
REACT_APP_TWITCH_CLIENT_ID=bk2tvufdg3nodg70rzyt7pxbfwuho8
```

**Key Contract Addresses** (Avalanche C-Chain):
- Safe Multisig: `0x52110a2Cc8B6bBf846101265edAAe34E753f3389`
- UVD Token: `0x4Ffe7e01832243e03668E090706F17726c26d6B2`
- WAVAX: `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7`
- Arena Router (DEX): `0xf56d524d651b90e4b84dc2fffd83079698b9066e`

**Snapshot Spaces**:
- Primary: `ultravioletadao.eth`
- Secondary: `cuchorapido.eth` (for specific governance proposals)

### Key Features & Components

1. **MetricsDashboard** (`/src/pages/MetricsDashboard.js`)
   - Central hub for DAO metrics and analytics
   - Integrates governance, token, and treasury data
   - Real-time updates via React Query
   - Sections: SnapshotSection, TokenSection, FundsSection

2. **DaoStoryteller** (`/src/components/DaoStoryteller.js`)
   - AI-powered community narrative generation
   - Uses OpenAI GPT-3.5 with structured prompts
   - Multi-language TTS with ElevenLabs (fallback to browser TTS)
   - Audio caching for performance optimization

3. **Swap & Token Features** (`/src/components/SwapWidget.js`, `WrapWidget.js`)
   - Direct token swaps on Arena DEX
   - AVAX ↔ UVD trading pairs
   - Wrapping/unwrapping functionality
   - Real-time price quotes and slippage settings

### API Integration Patterns

All external APIs use consistent error handling and caching:
```javascript
// Standard service pattern
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// React Query usage
const { data, isLoading, error } = useQuery({
  queryKey: ['dataKey'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Testing Approach

Tests should focus on:
- Component rendering and user interactions
- Service layer API mocking
- Hook behavior with React Testing Library
- Web3 interaction mocking with jest

### Development Workflow

1. **Feature Development**:
   - Create feature branch from `develop`
   - Implement components in isolation
   - Add corresponding hooks for data fetching
   - Update translations in `/src/i18n/*.json` for all 4 languages
   - Test with all language options

2. **Web3 Features**:
   - Test on Avalanche testnet first
   - Mock Web3 responses for development
   - Handle wallet connection states properly
   - Implement proper error boundaries

3. **Performance Considerations**:
   - Use React.memo for expensive components
   - Implement virtual scrolling for large lists
   - Optimize images and lazy load when possible
   - Leverage React Query caching strategies

### Common Tasks

**Adding a new metric**:
1. Create/update service in `/src/services/`
2. Create custom hook in `/src/hooks/`
3. Add MetricCard component instance
4. Update translations in both languages

**Adding a new page**:
1. Create component in `/src/pages/`
2. Add route in App.js
3. Update navigation in Header component
4. Add translations in all language files
5. Update sitemap generation in `/scripts/generateSitemap.js`
6. Add SEO component with meta tags

**Integrating new Web3 feature**:
1. Define contract ABI and addresses
2. Create contract interaction logic using thirdweb SDK
3. Create custom hook for contract calls
4. Handle wallet connection states properly
5. Add error handling for transaction failures
6. Test on testnet before mainnet deployment

### Important Project Conventions

- **Debugging**: All console.log statements must be wrapped with `if (process.env.REACT_APP_DEBUG_ENABLED === 'true')`
- **i18n Updates**: Always update all 4 language files (`en.json`, `es.json`, `pt.json`, `fr.json`) when adding new text
- **Comments**: Add detailed comments to README.md after each implementation
- **SEO**: Use React Helmet for meta tags and ensure all pages have proper SEO configuration
- **Error Handling**: Implement fallbacks for all external API calls
- **Performance**: Use React.memo for expensive components and implement lazy loading where appropriate
- **Git Commits**: NEVER include "Co-Authored-By: Claude <noreply@anthropic.com>" in commit messages. Always remove Claude as a committer.
- **File Organization**:
  - All `.md` documentation files must go in the `/docs/` folder to avoid main directory pollution
  - All test files must go in the `/tests/` folder
  - All utility scripts (data massaging, automation, etc.) must go in the `/scripts/` folder


   Using Gemini CLI for large codebase analysis

When a task involves many files or directories and might overflow your context window, prefer using the local gemini CLI and then summarize its output. Use gemini -p with the @ path syntax to let Gemini read the files while Claude focuses on planning and editing.

File and directory syntax

Paths are relative to the directory where you run the gemini command, and @ tells Gemini CLI which files or folders to load into context.

Examples

Single file

gemini -p "@src/main.py Describe what this file does and how it is structured."

Multiple files

gemini -p "@package.json @src/index.js Analyze the dependencies and how they are used in the codebase."

One directory

gemini -p "@src/ Summarize the architecture, main modules, and data flow of this codebase."

Several directories

gemini -p "@src/ @tests/ Explain how the test suite covers the source code and where the gaps are."

Whole project tree

gemini -p "@./ Give me a high-level overview of this project: tech stack, structure, and main responsibilities of each area."

Using all tracked files

gemini --all_files -p "Analyze the project layout, build system, and external dependencies."

Implementation checks

Use Gemini CLI to confirm whether specific features or patterns exist across the repo:

Feature present?

gemini -p "@src/ @lib/ Is dark mode implemented? List the relevant files and functions."

Authentication

gemini -p "@src/ @middleware/ How is authentication implemented (e.g. JWT/session)? List auth-related endpoints and middleware."

WebSocket hooks

gemini -p "@src/ Do we have React hooks or utilities that manage WebSocket connections? Show them with file paths."

Error handling

gemini -p "@src/ @api/ Is error handling consistent for API endpoints? Show representative try/catch or error-handling logic."

Rate limiting

gemini -p "@backend/ @middleware/ Is there any rate limiting in place for the API? Describe the implementation."

Caching

gemini -p "@src/ @lib/ @services/ Is Redis (or any cache layer) used? List cache-related functions and how they are used."

Security measures

gemini -p "@src/ @api/ How are inputs sanitized to avoid SQL injection and similar attacks?"

Tests for a feature

gemini -p "@src/payment/ @tests/ How well is the payment module tested? List the main test cases."

When Claude should call Gemini

Prefer calling gemini -p via the bash tool when:

You need to reason about an entire codebase or large folders.

Comparing or scanning many big files at once.

Investigating project-wide patterns, architecture, or cross-cutting concerns.

Total relevant files are likely > 100 KB of text.

Verifying whether specific features, patterns, or security practices exist.

Searching for coding patterns across many files.

Important notes

Treat Gemini CLI output as an external report: read it, then answer in your own words.

@ paths are always relative to the current working directory where gemini is executed.

The CLI injects file contents directly into Gemini’s context, so Claude does not spend its own context window on those files.

For read-only analysis you do not need any destructive flags.

Be explicit in the -p prompt about what you want Gemini to look for; this produces more accurate results.