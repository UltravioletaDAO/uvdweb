// La cifra de redes del facilitador se lee de GET /supported, no se tipea.
//
// La ficha tipeaba ocho redes (cuatro mainnets y cuatro testnets) mientras el facilitador servía 39.
// Este test falla si alguna de esas superficies vuelve a traer un número escrito a mano.
// Los comentarios no repiten el literal viejo: el cierre de la fila es un git grep que debe dar vacío.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..');
const LANGS = ['en', 'es', 'pt', 'fr'];
const dict = (lang) => JSON.parse(fs.readFileSync(path.join(SRC, 'i18n', `${lang}.json`), 'utf8'));
const pageSource = fs.readFileSync(path.join(SRC, 'pages', 'FacilitatorPage.js'), 'utf8');

// Un número pegado a networks, redes, réseaux, mainnets o testnets.
const TYPED_FIGURE = /\d+\s*(networks?|redes?|réseaux|mainnets?|testnets?)(?![\p{L}])/iu;

describe('ficha del facilitador — la cifra de redes no está tipeada', () => {
  it.each(LANGS)('%s: el chip de redes interpola {{count}} y su fallback no trae cifra', (lang) => {
    const stats = dict(lang).features.facilitator.stats;
    expect(stats.networks).toContain('{{count}}');
    expect(stats.networks).not.toMatch(/\d/);
    expect(typeof stats.networksUnknown).toBe('string');
    expect(stats.networksUnknown).not.toMatch(/\d/);
  });

  it.each(LANGS)('%s: la descripción multired no repite un conteo de redes', (lang) => {
    const { description } = dict(lang).facilitatorPage.features.multichain;
    expect(description).not.toMatch(TYPED_FIGURE);
  });

  it.each(['pages/FacilitatorPage.js', 'components/SEO.js'])('%s no trae una cifra de redes escrita a mano', (file) => {
    expect(fs.readFileSync(path.join(SRC, file), 'utf8')).not.toMatch(TYPED_FIGURE);
  });

  it('FacilitatorPage.js cuenta las redes desde el endpoint /supported de la allowlist', () => {
    expect(pageSource).toContain('ENDPOINTS.facilitator_supported.url');
    expect(pageSource).toContain('countFacilitatorNetworks');
    expect(pageSource).toContain("t('features.facilitator.stats.networks'");
    expect(pageSource).toContain("t('features.facilitator.stats.networksUnknown')");
  });
});
