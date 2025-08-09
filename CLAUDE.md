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

# Code Quality
npm run lint       # ESLint checks (if configured)
npm run format     # Prettier formatting (if configured)
```

## Architecture & Structure

### Core Technologies
- **React 18** with Create React App
- **TailwindCSS** for styling with custom design system
- **React Query** for data fetching and caching
- **Framer Motion** for animations
- **i18next** for internationalization (Spanish/English)

### Web3 Integrations
- **Snapshot.js**: Decentralized governance voting
- **Thirdweb SDK**: Wallet connections and Web3 interactions
- **Avalanche Network**: Primary blockchain for treasury and tokens
- **OpenAI API**: AI-powered DAO storytelling and analysis

### Key Architectural Patterns

1. **Service Layer Pattern** (`/src/services/`)
   - `api.js`: Central API configuration with axios
   - `snapshot.js`: Snapshot.org GraphQL integration for governance
   - `thirdweb.js`: Web3 wallet and contract interactions
   - `openai.js`: AI integration for DAO analysis
   - Each service handles specific domain logic and external API calls

2. **Custom Hooks** (`/src/hooks/`)
   - Data fetching hooks with React Query integration
   - Automatic caching and refetching strategies
   - Example: `useProposals`, `useMembers`, `useTreasuryData`

3. **Component Organization**
   - `/src/components/`: Reusable UI components
   - `/src/pages/`: Route-level components
   - `/src/components/sections/`: Page-specific sections
   - Components follow composition pattern with clear prop interfaces

4. **State Management**
   - React Context for global state (AuthContext, LanguageContext)
   - React Query for server state
   - Local component state for UI interactions

### Critical Configuration

**Environment Variables** (`.env`):
```
REACT_APP_SNAPSHOT_SPACE_ID=ultravioletadao.eth
REACT_APP_COINGECKO_API_KEY=<required>
REACT_APP_OPENAI_API_KEY=<required>
REACT_APP_THIRDWEB_CLIENT_ID=<required>
```

**Multi-signature Treasury**:
- Safe address: `0x80ae3B3847E4e8Bd27A389f7686486CAC9C3f3e8` (Avalanche)
- 3 of 5 signature requirement for treasury operations

### Key Features & Components

1. **MetricsDashboard** (`/src/pages/MetricsDashboard.jsx`)
   - Central hub for DAO metrics and analytics
   - Integrates governance, token, and treasury data
   - Real-time updates via React Query

2. **DaoStoryteller** (`/src/components/DaoStoryteller.jsx`)
   - AI-powered community narrative generation
   - Uses OpenAI API with structured prompts
   - Fallback to default content on API failure

3. **Governance System**
   - Snapshot.org integration for proposals
   - Vote tracking and participation metrics
   - Delegation support

4. **Treasury Management**
   - Multi-sig balance tracking
   - Transaction history
   - Token distribution analytics

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
   - Update translations in `/public/locales/`
   - Test with both languages

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
4. Add translations for new content

**Integrating new Web3 feature**:
1. Add contract interaction in thirdweb.js service
2. Create hook for contract calls
3. Handle wallet connection states
4. Add error handling for transaction failures


- agrega comentarios al README.md principal detallados, despues de cada implementacion.

- siempre que hagas un cambio asegurate de actualizar las traducciones de i18n