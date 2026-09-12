# El dominio de marca entra al estado con `allow_overwrite`: el primer apply con
# dns_target = "amplify" deja los registros exactamente como estaban (mismo destino) y
# desde ahí Terraform los gobierna. El cutover es `dns_target = "edge"`; la reversa,
# volver a "amplify". El subdominio `dev` no se toca: sigue directo en Amplify.

locals {
  dns_targets = {
    amplify = {
      domain  = var.amplify_cdn_domain
      zone_id = "Z2FDTNDATAQYW2" # zona global de CloudFront, la que usa el alias actual
    }
    edge = {
      domain  = aws_cloudfront_distribution.edge.domain_name
      zone_id = aws_cloudfront_distribution.edge.hosted_zone_id
    }
  }
  dns_target = local.dns_targets[var.dns_target]
}

# Prueba de propiedad que pide AWS Support para mover un alias desde otra cuenta (Amplify):
# un TXT `_<alias>` que apunte al dominio de la distribución destino. Solo para `www`:
# `_ultravioletadao.xyz` no es un nombre dentro de la zona y Route53 lo rechaza (medido
# 2026-09-12); si se abre el ticket por el apex, Support indica el nombre exacto.
resource "aws_route53_record" "alias_ownership" {
  for_each = toset(["www.${var.domain}"])

  zone_id = data.aws_route53_zone.brand.zone_id
  name    = "_${each.value}"
  type    = "TXT"
  ttl     = 60
  records = [aws_cloudfront_distribution.edge.domain_name]
}

resource "aws_route53_record" "apex_a" {
  zone_id         = data.aws_route53_zone.brand.zone_id
  name            = var.domain
  type            = "A"
  allow_overwrite = true

  alias {
    name                   = local.dns_target.domain
    zone_id                = local.dns_target.zone_id
    evaluate_target_health = false
  }
}

# IPv6 solo con el borde propio (Amplify no lo anunciaba en el alias original).
resource "aws_route53_record" "apex_aaaa" {
  count = var.dns_target == "edge" ? 1 : 0

  zone_id = data.aws_route53_zone.brand.zone_id
  name    = var.domain
  type    = "AAAA"

  alias {
    name                   = local.dns_target.domain
    zone_id                = local.dns_target.zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id         = data.aws_route53_zone.brand.zone_id
  name            = "www.${var.domain}"
  type            = "CNAME"
  ttl             = 300
  allow_overwrite = true
  records         = [local.dns_target.domain]
}
