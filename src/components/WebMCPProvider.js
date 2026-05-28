import { useEffect } from 'react';

/**
 * WebMCP Provider — expone las acciones del sitio a agentes IA via browser API.
 * Spec: https://webmachinelearning.github.io/webmcp/
 * Se monta una sola vez en App. No renderiza nada en UI.
 */
const WebMCPProvider = () => {
  useEffect(() => {
    // Solo si el browser soporta WebMCP (Chrome 128+ con flag, o futuro standard)
    if (!navigator.modelContext?.provideContext) {
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
        name: 'check_application_status',
        description:
          'Check the status of a UltravioletaDAO membership application by email address.',
        inputSchema: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' }
          }
        },
        execute: async ({ email }) => {
          const res = await fetch(
            `https://api.ultravioletadao.xyz/apply/status/${encodeURIComponent(email)}`
          );
          if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
          return res.json();
        }
      },
      {
        name: 'list_open_bounties',
        description:
          'List currently open bounties in the UltravioletaDAO ecosystem. ' +
          'Returns title, description, reward, and deadline for each bounty.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              default: 10,
              maximum: 50,
              description: 'Max number of bounties to return'
            }
          }
        },
        execute: async ({ limit = 10 } = {}) => {
          const res = await fetch(
            `https://api.ultravioletadao.xyz/bounties?status=open&limit=${limit}`
          );
          if (!res.ok) throw new Error(`Bounties fetch failed: ${res.status}`);
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
              agent_discovery: 'https://ultravioletadao.xyz/agent-discovery',
              facilitator: 'https://facilitator.ultravioletadao.xyz',
              github: 'https://github.com/ultravioletadao',
              discord: 'https://discord.gg/ultravioleta'
            }
          };
        }
      }
    ];

    try {
      navigator.modelContext.provideContext({ tools });
    } catch (err) {
      // WebMCP no disponible o error — no bloquear la app
      if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
        console.warn('[WebMCP] provideContext failed:', err);
      }
    }
  }, []);

  return null; // No renderiza nada
};

export default WebMCPProvider;
