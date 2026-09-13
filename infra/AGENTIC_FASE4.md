# Markdown for Agents en ultravioletadao.xyz (borde propio delante de Amplify)

**Qué hace:** cuando un agente pide una página con `Accept: text/markdown`, el dominio de
marca responde el Markdown que la representa (`Content-Type: text/markdown; charset=utf-8`,
`Vary: Accept`, `x-markdown-tokens`). Los navegadores siguen recibiendo HTML. Es el check
`markdownNegotiation` de isitagentready.com y la convención que Cloudflare documenta como
[Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/).

**Por qué así:** el sitio vive en Amplify Hosting. La distribución de CloudFront que Amplify
crea está en la cuenta de Amplify, no en la nuestra: no aparece en `aws cloudfront
list-distributions` y no admite funciones. Las reglas de Amplify solo redirigen por ruta,
nunca por cabecera. La única forma de negociar por `Accept` es una distribución nuestra
con Amplify como origen. Vive en `infra/terraform/edge/` (estado en
`s3://ultravioleta-terraform-state/uvdweb/edge/terraform.tfstate`).

## Piezas

| Recurso | Qué hace |
|---|---|
| `aws_acm_certificate.edge` | Certificado apex + www en us-east-1, validado por DNS en Route53 |
| `aws_cloudfront_distribution.edge` | Origen `main.dhck0d8f8ypxv.amplifyapp.com`, **sin caché** (Amplify manda `s-maxage` de un año y solo su CDN sabe invalidar en cada deploy) |
| `aws_cloudfront_function.request` | `www` → apex 301 (la regla que antes hacía Amplify) y `Accept: text/markdown` → reescribe la página a su `.md` (`var.markdown_routes`, fallback `/index.md`); marca la request con `x-uvd-markdown` |
| `aws_cloudfront_function.response` | `Vary: Accept` en páginas HTML y Markdown; charset y `x-markdown-tokens` en el Markdown negociado |
| `aws_route53_record.apex_a`, `.www` | El dominio de marca, bajo estado. `var.dns_target` decide a dónde apuntan |

Los `.md` que se sirven son los que publica la SPA en `public/` (`index.md`, `auth.md`).
Una página nueva con Markdown propio se agrega en `var.markdown_routes` y en
`var.markdown_files` (de ahí sale la estimación de tokens, cuatro caracteres por token).

## Probar antes del cutover

El borde responde en su dominio `cloudfront.net` aunque el DNS siga en Amplify:

```bash
cd infra/terraform/edge
EDGE=$(terraform output -raw distribution_domain)
curl -sI https://$EDGE/ | grep -i content-type                            # text/html
curl -sI -H "Accept: text/markdown" https://$EDGE/ | grep -i -E "content-type|vary|x-markdown-tokens"
curl -s  -H "Accept: text/markdown" https://$EDGE/ | head -3              # # UltravioletaDAO ...
curl -sI -H "Accept: text/markdown" https://$EDGE/static/js/x.js          # los assets no se tocan
```

## Cutover (con OK explícito del dueño: tiene ventana sin servicio)

**La trampa medida (2026-09-12):** un alias de CloudFront solo puede vivir en una
distribución en todo AWS. Hoy `ultravioletadao.xyz` y `www` los tiene la distribución de
Amplify, que está en la cuenta de Amplify. Mover un alias desde otra cuenta exige
deshabilitar la distribución origen (imposible, es de Amplify) y el truco del comodín no
aplica al apex. Quedan dos caminos:

1. **Soltar el dominio desde Amplify y adjuntarlo al borde.** Ventana sin servicio de unos
   minutos en apex y www (`dev` no se toca): entre que Amplify libera el alias y CloudFront
   termina de desplegar el nuestro.
2. **Ticket a AWS Support** para que muevan el apex sin caída (el TXT `_ultravioletadao.xyz`
   que crea este módulo es la prueba de propiedad que piden). Tarda días.

Camino 1, en orden y sin pausas entre pasos. **El orden importa y se midió mal la primera
vez (2026-09-12):** CloudFront rechaza `UpdateDistribution` con el alias mientras el DNS
del alias apunte a OTRA distribución (`CNAMEAlreadyExists: ... incorrectly configured DNS
record that points to another CloudFront distribution`). Primero el DNS al borde, después
el alias; al revés, cada reintento falla igual y la ventana se alarga.

```bash
# 0. La distribución del borde ya está desplegada y probada (sección anterior).
# 1. Amplify suelta apex y www; conserva dev (branch develop). Deja de servir el apex
#    en segundos (TLS falla): aquí empieza la ventana.
aws amplify update-domain-association --app-id dhck0d8f8ypxv --domain-name ultravioletadao.xyz \
  --region us-east-2 --sub-domain-settings prefix=dev,branchName=develop
# 2. DNS al borde PRIMERO (sin alias todavía).
cd infra/terraform/edge
terraform apply -var attach_aliases=false -var dns_target=edge
# 3. Alias al borde. CloudFront tarda ~1 min en ver el DNS nuevo: reintentar cada 20 s
#    mientras devuelva CNAMEAlreadyExists. El deploy del alias toma ~3 min; ahí cierra la ventana.
terraform apply -var attach_aliases=true -var dns_target=edge
# 4. Verificar.
curl -sI -H "Accept: text/markdown" https://ultravioletadao.xyz/ | grep -i -E "content-type|x-markdown-tokens"
curl -sI https://www.ultravioletadao.xyz/wheel | grep -i -E "^HTTP|location"   # 301 al apex
curl -sI https://dev.ultravioletadao.xyz/ | grep -i "^HTTP"                     # sigue en Amplify
```

**Ventana medida el 2026-09-12:** apex caído de 20:50:54 a ~21:16:30 (unos 26 min). Con el
orden correcto habrían sido ~5 min: 20 de esos minutos fueron reintentos del paso 3 hecho
antes del paso 2. `dev` no se cayó.

Después del cutover, `attach_aliases=true` y `dns_target=edge` son los valores por defecto
en `variables.tf` para que un apply sin variables no deshaga nada.

## Reversa

```bash
terraform apply -var attach_aliases=false -var dns_target=amplify   # el borde suelta los alias
aws amplify update-domain-association --app-id dhck0d8f8ypxv --domain-name ultravioletadao.xyz \
  --region us-east-2 --sub-domain-settings prefix=,branchName=main prefix=www,branchName=main prefix=dev,branchName=develop
```

Misma ventana de minutos, en sentido contrario. Amplify no está en Terraform (nunca lo
estuvo), por eso ese paso es CLI.

## Trampas medidas

- **No cachear en el borde.** `Managed-CachingDisabled`: Amplify invalida su CDN en cada
  deploy; una segunda capa con caché mostraría el sitio viejo hasta un año.
- **Los archivos `.md` deben existir en el origen con `text/markdown`.** Amplify ya los
  sirve así (`/index.md`); la función de respuesta solo agrega charset y cabeceras.
- **`dev.ultravioletadao.xyz` no negocia**: sigue apuntando a Amplify. Es deliberado.
- El scanner de isitagentready.com solo mira la raíz; el fallback a `/index.md` en las
  demás páginas es para que un agente nunca reciba el `index.html` vacío de la SPA.
