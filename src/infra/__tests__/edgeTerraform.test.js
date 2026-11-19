// Guardas del borde propio (infra/terraform/edge) que se sostienen en cada PR, también donde
// no hay Terraform: el CI de este repo solo corre jest. El comportamiento se prueba con
// terraform test (infra/terraform/edge/tests/borde.tftest.hcl); aquí se fija lo que
// terraform test no puede comprobar:
//   - prevent_destroy en la validación de ACM (Terraform no deja esperar ese error en un test);
//   - que .gitattributes dé eol=lf a las plantillas de las funciones en cualquier checkout;
//   - que functions.tf normalice CRLF, que en un checkout con LF no cambia nada visible.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const EDGE = 'infra/terraform/edge';
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');

// Cuerpo de un bloque resource "<tipo>" "<nombre>" { ... }, sin comentarios de línea, para
// que un prevent_destroy citado en un comentario no cuente como configurado.
const resourceBody = (source, type, name) => {
  const header = 'resource "' + type + '" "' + name + '" {';
  const start = source.indexOf(header);
  if (start === -1) throw new Error('no está el recurso ' + type + '.' + name);
  let depth = 0;
  for (let i = start + header.length - 1; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        return source
          .slice(start, i + 1)
          .split('\n')
          .map((line) => line.replace(/^\s*#.*$/, ''))
          .join('\n');
      }
    }
  }
  throw new Error('el recurso ' + type + '.' + name + ' no cierra');
};

describe('borde: validación de ACM', () => {
  const body = resourceBody(read(EDGE + '/main.tf'), 'aws_route53_record', 'cert_validation');

  it('no adopta un CNAME que ya existía fuera del estado (allow_overwrite = false)', () => {
    expect(body).toMatch(/^\s*allow_overwrite\s*=\s*false\s*$/m);
  });

  it('no lo borra al quitar un nombre del certificado (prevent_destroy)', () => {
    expect(body).toMatch(/lifecycle\s*\{[^}]*prevent_destroy\s*=\s*true[^}]*\}/);
  });
});

describe('borde: fin de línea del código de las CloudFront Functions', () => {
  const functionsTf = read(EDGE + '/functions.tf');
  const templates = fs
    .readdirSync(path.join(ROOT, EDGE, 'functions'))
    .filter((name) => name.endsWith('.tftpl'))
    .map((name) => EDGE + '/functions/' + name);

  it.each(['request', 'response'])('functions.tf normaliza CRLF en la función %s', (name) => {
    const body = resourceBody(functionsTf, 'aws_cloudfront_function', name);
    expect(body).toMatch(/code\s*=\s*replace\(templatefile\(/);
    expect(body).toMatch(/\}\),\s*"\\r\\n",\s*"\\n"\)\s*\}$/);
  });

  it('las dos plantillas existen', () => {
    expect(templates).toHaveLength(2);
  });

  it.each(templates)('.gitattributes le da eol=lf a %s', (template) => {
    const out = execFileSync('git', ['check-attr', 'text', 'eol', '--', template], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(out).toContain(template + ': text: set');
    expect(out).toContain(template + ': eol: lf');
  });
});
