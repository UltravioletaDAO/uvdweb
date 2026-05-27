// cloudfront-markdown-negotiation.js
// CloudFront Function — Viewer Request event
// Reescribe la request a /index.md cuando el cliente envía Accept: text/markdown
// Adjuntar a la distribución de Amplify en el evento viewer-request del behavior '/*'
//
// Runtime: cloudfront-js-2.0
// Región: us-east-1 (CloudFront Functions siempre en us-east-1)

function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var accept = headers['accept'] ? headers['accept'].value : '';

  // Solo para la homepage (raíz) — evitar reescribir assets y rutas SPA
  if (request.uri === '/' && accept.includes('text/markdown')) {
    request.uri = '/index.md';
  }

  return request;
}
