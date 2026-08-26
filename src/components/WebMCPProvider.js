import { useEffect } from 'react';

/**
 * WebMCP Provider — expone las acciones del sitio a agentes IA via browser API.
 * Spec: https://webmachinelearning.github.io/webmcp/
 * Se monta una sola vez en App. No renderiza nada en UI.
 */
const WebMCPProvider = () => {
  useEffect(() => {
    // Spec actual: document.modelContext.registerTool (navigator.modelContext es un alias deprecado).
    // Feature-detect por método, no por objeto: provideContext ya no existe en Chrome/Edge 151.
    const mc = document.modelContext ?? navigator.modelContext;
    if (typeof mc?.registerTool !== 'function') {
      return;
    }

    const tools = [
      {
        name: 'apply_dao_membership',
        description:
          'Submit a membership application to UltravioletaDAO (Latin America Web3 community). ' +
          'Provide name, email, skills array, and motivation text.',
        inputSchema: {
          type: 'object',
          required: ['name', 'email', 'skills', 'motivation'],
          properties: {
            name: { type: 'string', description: 'Full name of the applicant' },
            email: { type: 'string', format: 'email' },
            skills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Technical skills (e.g. ["Solidity", "React", "DeFi"])'
            },
            motivation: {
              type: 'string',
              maxLength: 1000,
              description: 'Why the applicant wants to join the DAO'
            }
          }
        },
        execute: async ({ name, email, skills, motivation }) => {
          const res = await fetch('https://api.ultravioletadao.xyz/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, skills, motivation })
          });
          if (!res.ok) throw new Error(`Apply failed: ${res.status}`);
          return res.json();
        }
      },
      {
        name: 'get_facilitator_networks',
        description:
          'Get the list of blockchain networks supported by the UltravioletaDAO x402 ' +
          'gasless payment facilitator. Returns chain IDs, token contracts, and fee info.',
        inputSchema: { type: 'object', properties: {} },
        execute: async () => {
          const res = await fetch('https://facilitator.ultravioletadao.xyz/supported');
          if (!res.ok) throw new Error(`Facilitator query failed: ${res.status}`);
          return res.json();
        }
      },
      {
        name: 'get_dao_info',
        description:
          'Get public information about UltravioletaDAO: governance stats, treasury balance, ' +
          'token metrics, and member count.',
        inputSchema: { type: 'object', properties: {} },
        execute: async () => {
          return {
            name: 'UltravioletaDAO',
            description: 'Latin American Web3 community DAO focused on agentic economy infrastructure',
            token: {
              symbol: 'UVD',
              contract: '0x4Ffe7e01832243e03668E090706F17726c26d6B2',
              network: 'Avalanche C-Chain (chainId: 43114)'
            },
            treasury: {
              address: '0x52110a2Cc8B6bBf846101265edAAe34E753f3389',
              type: 'Safe Multisig',
              network: 'Avalanche C-Chain'
            },
            governance: {
              snapshot_space: 'ultravioletadao.eth',
              url: 'https://snapshot.org/#/ultravioletadao.eth'
            },
            links: {
              website: 'https://ultravioletadao.xyz',
              agent_discovery: 'https://ultravioletadao.xyz/agents',
              facilitator: 'https://facilitator.ultravioletadao.xyz',
              github: 'https://github.com/ultravioletadao',
              discord: 'https://discord.gg/ultravioleta'
            }
          };
        }
      }
    ];

    const warn = (err) => {
      // WebMCP no disponible o error — no bloquear la app (AbortError = cleanup esperado)
      if (err?.name !== 'AbortError' && process.env.REACT_APP_DEBUG_ENABLED === 'true') {
        console.warn('[WebMCP] registerTool failed:', err);
      }
    };

    // El AbortSignal des-registra los tools en el cleanup (sin él, el doble efecto de
    // StrictMode lanza InvalidStateError: Duplicate tool name).
    const controller = new AbortController();
    tools.forEach((tool) => {
      try {
        Promise.resolve(mc.registerTool(tool, { signal: controller.signal })).catch(warn);
      } catch (err) {
        warn(err);
      }
    });

    return () => controller.abort();
  }, []);

  return null; // No renderiza nada
};

export default WebMCPProvider;
