// Regenera public/.well-known/mcp/server-card.json desde el MCP remoto EN VIVO.
//
//   node scripts/generateMcpServerCard.js
//
// El card no se escribe a mano: sus serverInfo, instructions y las 13 tools (con inputSchema y
// annotations) salen del initialize y del tools/list del servidor, asi que no puede divergir de
// lo que el endpoint realmente sirve. Correrlo cada vez que cambie una tool del MCP
// (uvd-backend/services/new-applicants/mcpTools.js) y commitear el JSON resultante.

const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'public', '.well-known', 'mcp', 'server-card.json');
const ENDPOINT = 'https://api.ultravioletadao.xyz/mcp';

(async () => {
  const call = async (method, params) => {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
  };
  const init = await call('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'server-card-generator', version: '1' } });
  const { tools } = await call('tools/list');

  const card = {
    name: 'UltravioletaDAO MCP Server',
    version: '2.0.0',
    description:
      'Remote MCP server of ultravioletadao.xyz: public read-only data of UltravioletaDAO (Latin American Web3 DAO) — UVD token, Safe treasury, Snapshot governance, x402 facilitator networks, Twitch stream memory and the c0der-measured product ecosystem with its live pulse — plus one write tool for membership applications. Same tool names and schemas the site exposes in-browser through WebMCP.',
    serverInfo: {
      ...init.serverInfo,
      homepage: 'https://ultravioletadao.xyz/ecosystem',
      contact: 'mailto:ultravioletadao@gmail.com',
      license: 'MIT',
    },
    instructions: init.instructions,
    transport: [
      {
        type: 'streamable-http',
        url: ENDPOINT,
        methods: ['POST'],
        protocolVersions: ['2025-06-18', '2025-03-26', '2024-11-05'],
        'x-note':
          'Direct JSON responses (no SSE channel): GET returns 405 with Allow: POST, OPTIONS. Stateless — the server issues no mcp-session-id. CORS is open to the ultravioletadao.xyz origins; any server-side MCP client (claude.ai connectors, Claude Desktop, Cursor) can connect without restriction.',
      },
    ],
    capabilities: { tools: true, resources: false, prompts: false, sampling: false },
    auth: {
      type: 'none',
      description:
        'No authentication and no payments: every tool reads public sources. apply_dao_membership writes a membership application through the same public POST https://api.ultravioletadao.xyz/apply endpoint.',
    },
    tools,
    'x-webmcp': {
      description:
        'The site also registers these same data tools plus 6 UI tools in the browser through WebMCP (document.modelContext), for agents running inside the tab. The remote MCP is the subset that makes sense without an open tab.',
      documentation: 'https://ultravioletadao.xyz/llms-full.txt',
      'ui-only-tools': ['navigate_to', 'set_language', 'focus_ecosystem_node', 'open_terminal', 'set_desk_mode', 'run_ecosystem_command'],
    },
    'x-data': [
      {
        url: 'https://ultravioletadao.xyz/ecosystem/graph.json',
        name: 'Ecosystem graph (measured by c0der)',
        description:
          'Public products of the UltravioletaDAO ecosystem as nodes and their measured integrations (API calls, facilitator usage, latent links) as edges with evidence counts. schema_version 1. Also served by the get_ecosystem_map and list_ecosystem_products tools.',
        mimeType: 'application/json',
      },
    ],
    x402: {
      facilitator: 'https://facilitator.ultravioletadao.xyz',
      supported: 'https://facilitator.ultravioletadao.xyz/supported',
      verify: 'https://facilitator.ultravioletadao.xyz/verify',
      settle: 'https://facilitator.ultravioletadao.xyz/settle',
      description:
        'x402 v1 gasless micropayments (scheme "exact", EIP-3009). Verify/settle are plain HTTP endpoints of the facilitator, not MCP tools; the get_facilitator_networks tool reads the live network list. This MCP server never charges for anything.',
    },
  };

  fs.writeFileSync(OUT, `${JSON.stringify(card, null, 2)}\n`);
  console.log('tools en la card:', tools.length, '| bytes:', fs.statSync(OUT).size);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
