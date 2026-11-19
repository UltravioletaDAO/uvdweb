# Borde propio delante de Amplify Hosting.
#
# Por qué existe: la distribución de CloudFront que Amplify crea vive en la cuenta de
# Amplify, no en la nuestra, y no admite funciones. Para responder Markdown cuando un
# agente manda `Accept: text/markdown` (Markdown for Agents) hace falta código en el
# borde, y la única forma es una distribución nuestra con Amplify como origen.
#
# Cache: DESACTIVADA en esta capa. Amplify manda `s-maxage=31536000` y solo su CDN sabe
# invalidar en cada deploy; si cacheáramos aquí, el sitio se quedaría viejo un año.

data "aws_route53_zone" "brand" {
  zone_id = var.hosted_zone_id
}

# ── Certificado del dominio de marca (apex + www), validado por DNS ──────────────

resource "aws_acm_certificate" "edge" {
  domain_name               = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.edge.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  # ACM entrega el MISMO CNAME de validación para el mismo nombre en toda la cuenta, en
  # cualquier región. Si el registro ya existe, no es «idéntico y por eso nuestro»: es de otro
  # certificado vigente que lo necesita para renovarse. Medido el 2026-11-19: los dos
  # registros de este módulo (apex y www) validan también el certificado de la pila `agents`
  # de uvd-backend (environments/prod/cloudfront-agents.tf), que los tiene en su propio estado.
  #
  # - allow_overwrite = false: si el registro ya existía fuera de este estado, el apply falla
  #   («already exists») en vez de adoptarlo en silencio. Para adoptarlo a propósito, primero
  #   ver qué certificados lo usan (aws acm describe-certificate) y después terraform import.
  # - prevent_destroy: quitar un nombre del certificado, cambiar el dominio o un destroy
  #   borrarían el CNAME, y el otro certificado dejaría de renovarse sin aviso. Antes del
  #   apply, sacar del estado el registro de cada nombre que sale:
  #     terraform state rm 'aws_route53_record.cert_validation["<nombre>"]'
  #   (en Windows PowerShell 5.1 las comillas dobles van escapadas: [\"<nombre>\"]).
  #   Un bloque `removed` no sirve para un nombre: no acepta claves de instancia (validate:
  #   «Resource instance keys not allowed»). Un `removed` de aws_route53_record.cert_validation
  #   con destroy = false solo vale si se borra de la config este bloque resource entero (con
  #   el bloque todavía ahí, el plan falla: «Removed resource still exists»).
  allow_overwrite = false
  zone_id         = data.aws_route53_zone.brand.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_acm_certificate_validation" "edge" {
  certificate_arn         = aws_acm_certificate.edge.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ── Distribución ──────────────────────────────────────────────────────────────────

data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_distribution" "edge" {
  enabled         = true
  comment         = "uvdweb edge: Markdown for Agents delante de Amplify (${var.domain})"
  aliases         = var.attach_aliases ? [var.domain, "www.${var.domain}"] : []
  is_ipv6_enabled = true
  http_version    = "http2and3"
  price_class     = "PriceClass_All"

  origin {
    origin_id   = "amplify"
    domain_name = var.amplify_origin

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "amplify"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = false # comprime el origen; aquí no se cachea nada

    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.request.arn
    }

    function_association {
      event_type   = "viewer-response"
      function_arn = aws_cloudfront_function.response.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Sin alias, CloudFront exige su certificado por defecto; con alias, el nuestro.
  viewer_certificate {
    cloudfront_default_certificate = var.attach_aliases ? null : true
    acm_certificate_arn            = var.attach_aliases ? aws_acm_certificate_validation.edge.certificate_arn : null
    ssl_support_method             = var.attach_aliases ? "sni-only" : null
    minimum_protocol_version       = var.attach_aliases ? "TLSv1.2_2021" : "TLSv1"
  }
}
