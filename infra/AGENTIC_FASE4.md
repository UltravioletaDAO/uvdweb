# Fase 4 — CloudFront Function: Markdown for Agents

Pasos para adjuntar `cloudfront-markdown-negotiation.js` a la distribución de Amplify.

## Prerequisitos

- AWS CLI configurado con permisos `cloudfront:*` en us-east-1
- `index.md` ya desplegado en Amplify (Fase 1 completada)

## Paso 1 — Obtener el Distribution ID de Amplify

```bash
# Opción A: via CLI de Amplify
aws amplify list-apps --region us-east-1 --query 'apps[].{name:name,appId:appId}'

# Opción B: buscar en CloudFront por dominio de origen
aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(to_string(Origins.Items[0].DomainName), 'amplifyapp')].{Id:Id,Domain:DomainName}" \
  --output table
```

Guardar el `Distribution ID` (formato: `EXXXXXXXXXX`).

## Paso 2 — Crear la CloudFront Function

```bash
# Crear la función en us-east-1 (requerido para CloudFront Functions)
aws cloudfront create-function \
  --name "uvdao-markdown-negotiation" \
  --function-config "Comment=Rewrite to index.md for Accept:text/markdown,Runtime=cloudfront-js-2.0" \
  --function-code fileb://infra/cloudfront-markdown-negotiation.js \
  --region us-east-1

# Guardar el FunctionARN del output (formato: arn:aws:cloudfront::ACCOUNT:function/uvdao-markdown-negotiation)
```

## Paso 3 — Publicar la función (pasarla de DEVELOPMENT a LIVE)

```bash
# Obtener el ETag de la función recién creada
ETAG=$(aws cloudfront describe-function \
  --name uvdao-markdown-negotiation \
  --region us-east-1 \
  --query 'ETag' --output text)

# Publicar
aws cloudfront publish-function \
  --name uvdao-markdown-negotiation \
  --if-match "$ETAG" \
  --region us-east-1
```

## Paso 4 — Adjuntar al Distribution en viewer-request

Hay que modificar el Default Cache Behavior del distribution para agregar la función.

Amplify gestiona su distribución de CloudFront internamente. La forma más segura es hacerlo via la consola AWS, no via CLI, para evitar conflictos con el estado gestionado por Amplify.

### Via consola AWS (recomendado)

1. Ir a CloudFront → Distributions → `[Distribution ID de Paso 1]`
2. Tab "Behaviors" → seleccionar el Default (`/*`) → Edit
3. Bajar a "Function associations"
4. En "Viewer request" seleccionar: Function type = **CloudFront Functions**, Function ARN = `arn:aws:cloudfront::ACCOUNT:function/uvdao-markdown-negotiation`
5. Save changes
6. Esperar a que el estado pase de "Deploying" a "Deployed" (~2-3 minutos)

## Paso 5 — Verificar

```bash
# Debe retornar Content-Type: text/markdown y contenido markdown
curl -sI -H "Accept: text/markdown" https://ultravioletadao.xyz/ | grep -i content-type
curl -s  -H "Accept: text/markdown" https://ultravioletadao.xyz/ | head -5
```

Resultado esperado:
```
Content-Type: text/markdown
# UltravioletaDAO
```

## Notas

- Si Amplify hace un nuevo deploy, CloudFront puede resetear el cache behavior a sus defaults.
  Verificar después de cada deploy que la función sigue asociada.
- Alternativa sin CloudFront: agregar ruta `GET /index.md` en `api.ultravioletadao.xyz` que
  retorne el contenido con `Content-Type: text/markdown`. Más mantenible pero requiere
  Lambda update.
