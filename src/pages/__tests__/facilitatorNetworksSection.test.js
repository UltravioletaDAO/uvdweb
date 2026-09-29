// La sección "Supported Networks" de /facilitator sale de lo que publica el facilitador, no de una
// lista tipeada: GET /networks.json, si no responde GET /supported agrupado por red, si tampoco el
// replay grabado de /supported; sin nada, el texto sin lista. Se renderiza la página con dobles de
// fetch: ningún test sale a la red.
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '../../i18n/config';
import FacilitatorPage from '../FacilitatorPage';
import { loadSnapshot } from '../../services/ecosystem/endpoints';

jest.mock('../../services/ecosystem/endpoints', () => ({
  ...jest.requireActual('../../services/ecosystem/endpoints'),
  loadSnapshot: jest.fn(),
}));

const fs = require('fs');
const path = require('path');

const NETWORKS_JSON = 'https://facilitator.ultravioletadao.xyz/networks.json';
const SUPPORTED = 'https://facilitator.ultravioletadao.xyz/supported';

// Doble de GET /networks.json con la forma de x402-rs src/networks_json.rs (filas = /supported).
const networksDoc = {
  networks: [
    { id: 'avalanche', caip2: 'eip155:43114', family: 'evm', chainId: 43114, testnet: false, displayName: 'Avalanche' },
    { id: 'hyperevm', caip2: 'eip155:999', family: 'evm', chainId: 999, testnet: false, displayName: 'HyperEVM' },
    { id: 'solana', caip2: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', family: 'svm', chainId: null, testnet: false, displayName: 'Solana' },
    { id: 'base-sepolia', caip2: 'eip155:84532', family: 'evm', chainId: 84532, testnet: true, displayName: 'Base Sepolia' },
    { id: 'hyperevm-testnet', caip2: 'eip155:998', family: 'evm', chainId: 998, testnet: true, displayName: 'HyperEVM Testnet' },
  ],
};

const kind = (x402Version, network, networkAliases) => ({ x402Version, scheme: 'exact', network, networkAliases });
const supportedDoc = {
  kinds: [
    kind(1, 'hyperevm', ['hyperevm', 'eip155:999']),
    kind(2, 'eip155:999', ['hyperevm', 'eip155:999']),
    kind(1, 'avalanche-fuji', ['avalanche-fuji', 'eip155:43113']),
    kind(2, 'eip155:43113', ['avalanche-fuji', 'eip155:43113']),
  ],
};

const json = (body) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
const down = () => Promise.reject(new Error('sin red en los tests'));

let container;
let root;

const mount = async (routes) => {
  global.fetch = jest.fn((url) => (routes[url] ? json(routes[url]) : down()));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/facilitator']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <FacilitatorPage />
        </MemoryRouter>
      </HelmetProvider>
    );
  });
};

const section = () => container.querySelector('section[data-networks-source]');
const list = (which) => container.querySelector(`[data-network-list="${which}"]`);
const rows = (which) => [...(list(which)?.children || [])].map((row) => row.textContent);

const settle = async (done) => {
  for (let i = 0; i < 50 && !done(); i++) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
};

describe('/facilitator — sección de redes', () => {
  beforeAll(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    window.localStorage.clear();
    loadSnapshot.mockReset();
    loadSnapshot.mockImplementation(jest.requireActual('../../services/ecosystem/endpoints').loadSnapshot);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete global.fetch;
  });

  it('con /networks.json muestra HyperEVM mainnet con chain id 999 y los testnets aparte', async () => {
    await mount({ [NETWORKS_JSON]: networksDoc, [SUPPORTED]: supportedDoc });
    await settle(() => list('mainnets'));

    expect(section().getAttribute('data-networks-source')).toBe('networks.json');
    expect(rows('mainnets')).toEqual(['AvalancheChain ID: 43114', 'HyperEVMChain ID: 999', 'Solana']);
    expect(rows('testnets')).toEqual(['Base SepoliaChain ID: 84532', 'HyperEVM TestnetChain ID: 998']);
    expect(list('mainnets').textContent).not.toContain('998');
  });

  it('si /networks.json no responde, lista /supported agrupado por red (una fila por red)', async () => {
    await mount({ [SUPPORTED]: supportedDoc });
    await settle(() => list('mainnets'));

    expect(section().getAttribute('data-networks-source')).toBe('supported');
    expect(rows('mainnets')).toEqual(['hyperevmChain ID: 999']);
    expect(rows('testnets')).toEqual(['avalanche-fujiChain ID: 43113']);
  });

  it('si tampoco responde /supported, cae al replay grabado de /supported', async () => {
    await mount({});
    await settle(() => list('mainnets'));

    const replay = require('../../data/ecosystem/replays/facilitator_supported.json');
    const expected = new Set(replay.json.kinds.map((k) => [...k.networkAliases].sort().join('|'))).size;
    expect(section().getAttribute('data-networks-source')).toBe('replay');
    expect(loadSnapshot).toHaveBeenCalledWith('facilitator_supported');
    expect(rows('mainnets').length + rows('testnets').length).toBe(expected);
  });

  it('sin ningún dato no inventa una lista: queda el texto con el enlace al facilitador', async () => {
    loadSnapshot.mockImplementation(() => Promise.resolve(null));
    await mount({});
    await settle(() => loadSnapshot.mock.calls.length > 0);
    await settle(() => false);

    expect(section().getAttribute('data-networks-source')).toBe('none');
    expect(list('mainnets')).toBeNull();
    expect(list('testnets')).toBeNull();
    expect(section().querySelector('a[href="https://facilitator.ultravioletadao.xyz/networks"]')).not.toBeNull();
    expect(section().textContent).not.toMatch(/Chain ID/);
  });
});

describe('FacilitatorPage.js no tipea redes', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'FacilitatorPage.js'), 'utf8');

  it('no trae chain ids literales ni el array de mainnets/testnets', () => {
    expect(source).not.toMatch(/chainId\s*:\s*\d/);
    expect(source).not.toMatch(/mainnets\s*:\s*\[/);
    expect(source).not.toMatch(/testnets\s*:\s*\[/);
  });

  it('no nombra la lista cerrada de cuatro redes', () => {
    expect(source).not.toContain('(Avalanche, Base, Celo');
    expect(source).not.toMatch(/Celo gasless|HyperEVM gasless/);
  });

  it('las redes salen del hook que lee /networks.json y /supported', () => {
    expect(source).toContain('useFacilitatorNetworks()');
  });
});

describe('SEO de /facilitator sin la lista cerrada de cuatro redes', () => {
  const SRC = path.join(__dirname, '..', '..');
  const CLOSED_LIST = /HyperEVM|Avalanche, Base, Celo|Celo (gasless|sin gas|sem gas|sans gas)/;

  it.each(['en', 'es', 'pt', 'fr'])('%s: seo.facilitator y facilitatorPage no la nombran', (lang) => {
    const dict = JSON.parse(fs.readFileSync(path.join(SRC, 'i18n', `${lang}.json`), 'utf8'));
    expect(JSON.stringify(dict.seo.facilitator)).not.toMatch(CLOSED_LIST);
    expect(JSON.stringify(dict.facilitatorPage)).not.toMatch(CLOSED_LIST);
  });

  it('el JSON-LD del facilitador en SEO.js no la nombra', () => {
    expect(fs.readFileSync(path.join(SRC, 'components', 'SEO.js'), 'utf8')).not.toMatch(CLOSED_LIST);
  });
});
