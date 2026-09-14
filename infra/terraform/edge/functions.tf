# Las dos CloudFront Functions. El código vive en functions/*.js.tftpl y Terraform le
# inyecta el mapa de rutas y la estimación de tokens (cuatro caracteres por token, la
# misma heurística que usan los conversores) calculada sobre los .md del repo al aplicar.

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

  code = templatefile("${path.module}/functions/viewer-request.js.tftpl", {
    domain   = var.domain
    routes   = jsonencode(var.markdown_routes)
    fallback = var.markdown_fallback
  })
}

resource "aws_cloudfront_function" "response" {
  name    = "uvdweb-markdown-negotiation-response"
  runtime = "cloudfront-js-2.0"
  comment = "Vary: Accept, charset y x-markdown-tokens en las respuestas Markdown"
  publish = true

  code = templatefile("${path.module}/functions/viewer-response.js.tftpl", {
    tokens = jsonencode(local.markdown_token_estimates)
  })
}
