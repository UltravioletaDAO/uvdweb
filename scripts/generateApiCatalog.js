// Regenera public/.well-known/api-catalog (y su copia api-catalog.json) desde el archivo de datos.
//
//   node scripts/generateApiCatalog.js          escribe los archivos que cambiaron
//   node scripts/generateApiCatalog.js --check  no escribe; sale 1 si alguno quedó desactualizado
//
// El catálogo no se edita a mano: se edita src/data/apiCatalog/services.json, se corre esto y se
// commitean los tres archivos. src/data/apiCatalog/__tests__/apiCatalog.test.js falla en CI si el
// artefacto commiteado no es el generado.
const fs = require('fs');
const path = require('path');
const { DATA_FILE, OUTPUT_FILES, buildLinkset, serialize } = require('./apiCatalog/buildLinkset');

const ROOT = path.join(__dirname, '..');
const check = process.argv.includes('--check');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, DATA_FILE), 'utf8'));
const body = serialize(buildLinkset(data));

let stale = 0;
for (const rel of OUTPUT_FILES) {
  const file = path.join(ROOT, rel);
  // Git en Windows puede dejar CRLF en el checkout; el contenido es el mismo.
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
  if (current === body) {
    console.log(`[api-catalog] al día · ${rel}`);
  } else if (check) {
    console.error(`[api-catalog] desactualizado · ${rel} (correr: node scripts/generateApiCatalog.js)`);
    stale += 1;
  } else {
    fs.writeFileSync(file, body);
    console.log(`[api-catalog] escrito · ${rel}`);
  }
}

console.log(`[api-catalog] ${data.services.length} servicios en el linkset · ${data.excluded.length} nodos fuera`);
process.exit(stale ? 1 : 0);
