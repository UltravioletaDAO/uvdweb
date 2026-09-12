output "distribution_id" {
  value = aws_cloudfront_distribution.edge.id
}

output "distribution_domain" {
  description = "Para probar antes del cutover: curl -H 'Accept: text/markdown' https://<este dominio>/"
  value       = aws_cloudfront_distribution.edge.domain_name
}

output "certificate_arn" {
  value = aws_acm_certificate_validation.edge.certificate_arn
}

output "dns_target" {
  description = "A dónde apunta hoy el dominio de marca según el estado."
  value       = var.dns_target
}

output "markdown_token_estimates" {
  value = local.markdown_token_estimates
}
