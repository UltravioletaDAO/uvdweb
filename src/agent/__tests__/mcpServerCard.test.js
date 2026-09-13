// La MCP server card del sitio no puede volver a negar las tools del facilitador.
//
// Decía "Verify/settle are plain HTTP endpoints of the facilitator, not MCP tools", pero el
// facilitador sirve su propio MCP (https://facilitator.ultravioletadao.xyz/mcp) con x402_verify
// y x402_settle, declarados en su server card. La card sale de scripts/generateMcpServerCard.js,
// así que el texto se vigila en las dos superficies.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const cardText = fs.readFileSync(path.join(ROOT, 'public', '.well-known', 'mcp', 'server-card.json'), 'utf8');
const card = JSON.parse(cardText);
const generator = fs.readFileSync(path.join(ROOT, 'scripts', 'generateMcpServerCard.js'), 'utf8');

const FACILITATOR_CARD = 'https://facilitator.ultravioletadao.xyz/.well-known/mcp/server-card.json';
const DENIES_MCP_TOOLS = /not\s+(an?\s+)?MCP\s+tools?/i;

describe('server-card.json — verify/settle del facilitador', () => {
  it('ni la card publicada ni su generador dicen que verify/settle no son tools MCP', () => {
    expect(cardText).not.toMatch(DENIES_MCP_TOOLS);
    expect(generator).not.toMatch(DENIES_MCP_TOOLS);
  });

  it('la card nombra x402_verify y x402_settle y cita la server card del facilitador', () => {
    const { description } = card.x402;
    expect(description).toMatch(/\bx402_verify\b/);
    expect(description).toMatch(/\bx402_settle\b/);
    expect(description).toContain(FACILITATOR_CARD);
  });

  it('el generador escribe el mismo texto que la card publicada (regenerarla no revive la frase vieja)', () => {
    expect(generator).toContain(card.x402.description);
  });
});
