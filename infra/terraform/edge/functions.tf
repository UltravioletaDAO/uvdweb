# Las dos CloudFront Functions. El código vive en functions/*.js.tftpl y Terraform le
# inyecta el mapa de rutas y la estimación de tokens (cuatro caracteres por token, la
# misma heurística que usan los conversores) calculada sobre los .md del repo al aplicar.
#
# Fin de línea: el código se normaliza a LF. Un checkout de Windows con core.autocrlf trae
# las plantillas en CRLF, y sin esto el mismo commit despliega bytes distintos según la
# máquina (y terraform plan muestra las funciones «a modificar» sin que nadie las toque).
# Medido el 2026-11-19: en un checkout de Windows las plantillas tenían CRLF y las funciones
# vivas, LF. .gitattributes fija además eol=lf para functions/*.tftpl, y
# tests/borde.tftest.hcl comprueba que el código no lleve CR.

locals {
  public_dir = "${path.module}/../../../public"

  markdown_token_estimates = {
    for uri, file in var.markdown_files :
    uri => floor(length(file("${local.public_dir}/${file}")) / 4)
  }
}

resource "aws_cloudfront_function" "request" {
  name    = "uvdweb-markdown-negotiation-request"
  runtime = "cloudfront-js-2.0"
  comment = "www -> apex y Accept: text/markdown -> .md (Markdown for Agents)"
  publish = true

  code = replace(templatefile("${path.module}/functions/viewer-request.js.tftpl", {
    domain   = var.domain
    routes   = jsonencode(var.markdown_routes)
    fallback = var.markdown_fallback
  }), "\r\n", "\n")
}

# viewer-response NO corre cuando el origen responde 400 o más: CloudFront entrega ese error
# sin pasar por esta función. Por eso aquí solo se decoran respuestas buenas (Vary, charset,
# x-markdown-tokens). Medido el 2026-11-19: los 404 de Amplify salen text/html y sin
# Vary: Accept, que esta función le pone a todo text/html. No hace falta moverlo: los 4xx
# solo salen en rutas con extensión, que la función de petición no reescribe, así que la
# respuesta es la misma pida o no Markdown, y esta capa no cachea. Lo que haya que servir en
# un 4xx (un 404 en Markdown, por ejemplo) va en la función de petición, que puede contestar
# sin ir al origen; así lo resolvió el borde del CV.
resource "aws_cloudfront_function" "response" {
  name    = "uvdweb-markdown-negotiation-response"
  runtime = "cloudfront-js-2.0"
  comment = "Vary: Accept, charset y x-markdown-tokens en las respuestas Markdown"
  publish = true

  code = replace(templatefile("${path.module}/functions/viewer-response.js.tftpl", {
    tokens = jsonencode(local.markdown_token_estimates)
  }), "\r\n", "\n")
}
