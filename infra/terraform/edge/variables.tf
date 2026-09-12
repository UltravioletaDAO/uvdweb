variable "domain" {
  description = "Dominio de marca (apex). El www redirige aquí."
  type        = string
  default     = "ultravioletadao.xyz"
}

variable "hosted_zone_id" {
  description = "Zona de Route53 del dominio de marca."
  type        = string
  default     = "Z020459338J0JDK9OGP8T"
}

variable "amplify_origin" {
  description = "Dominio por defecto de la rama main en Amplify: es el origen del borde."
  type        = string
  default     = "main.dhck0d8f8ypxv.amplifyapp.com"
}

variable "amplify_cdn_domain" {
  description = "Distribución de CloudFront de Amplify a la que apuntaba el DNS antes del borde (para volver atrás)."
  type        = string
  default     = "d1ongz452rso2c.cloudfront.net"
}

variable "dns_target" {
  description = "A dónde apunta el dominio de marca: `amplify` (como estaba) o `edge` (el borde de este módulo). Cambiarlo es el cutover; volverlo es la reversa."
  type        = string
  default     = "amplify"

  validation {
    condition     = contains(["amplify", "edge"], var.dns_target)
    error_message = "dns_target debe ser `amplify` o `edge`."
  }
}

variable "attach_aliases" {
  description = "Si la distribución lleva los alias apex y www. Nace en false porque CloudFront solo permite un alias por distribución en todo AWS y hoy los tiene Amplify; se pone en true en el cutover, después de mover los alias con associate-alias (ver infra/AGENTIC_FASE4.md)."
  type        = bool
  default     = false
}

variable "markdown_routes" {
  description = "Ruta de página → archivo Markdown que la representa cuando el agente pide Accept: text/markdown. Lo que no esté aquí cae en markdown_fallback."
  type        = map(string)
  default = {
    "/" = "/index.md"
  }
}

variable "markdown_fallback" {
  description = "Markdown que se sirve para cualquier página sin entrada propia en markdown_routes."
  type        = string
  default     = "/index.md"
}

variable "markdown_files" {
  description = "Archivos Markdown publicados por la SPA (relativos a public/), para estimar x-markdown-tokens en el apply."
  type        = map(string)
  default = {
    "/index.md" = "index.md"
    "/auth.md"  = "auth.md"
  }
}
