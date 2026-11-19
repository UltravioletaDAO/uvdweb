# Tests del borde (terraform test). Corren sin AWS: el provider es un mock.
#   cd infra/terraform/edge && terraform init -backend=false && terraform test
#
# Fijan dos trampas del borde: el código de las CloudFront Functions tiene que salir con
# LF desde cualquier checkout (Windows con autocrlf o la Mac), y la validación de ACM no
# puede adoptar en silencio un CNAME que ya validaba otro certificado de la cuenta.

mock_provider "aws" {
  override_during = plan

  # Lo que ACM devuelve al pedir el certificado: un CNAME por nombre (apex y www). Los
  # valores son inventados; lo que importa es que haya uno por nombre.
  override_resource {
    target = aws_acm_certificate.edge
    values = {
      arn = "arn:aws:acm:us-east-1:000000000000:certificate/test"
      domain_validation_options = [
        {
          domain_name           = "ultravioletadao.xyz"
          resource_record_name  = "_apex.ultravioletadao.xyz."
          resource_record_type  = "CNAME"
          resource_record_value = "_apex.test.acm-validations.aws."
        },
        {
          domain_name           = "www.ultravioletadao.xyz"
          resource_record_name  = "_www.www.ultravioletadao.xyz."
          resource_record_type  = "CNAME"
          resource_record_value = "_www.test.acm-validations.aws."
        },
      ]
    }
  }
}

run "codigo_de_las_funciones_sin_cr" {
  command = plan

  assert {
    condition     = strcontains(aws_cloudfront_function.request.code, "function handler(event)") && strcontains(aws_cloudfront_function.response.code, "function handler(event)")
    error_message = "El código de las funciones no salió de las plantillas: el test no estaría mirando nada."
  }

  assert {
    condition     = !strcontains(aws_cloudfront_function.request.code, "\r")
    error_message = "viewer-request lleva CR: un checkout de Windows despliega bytes distintos que uno de la Mac. Falta normalizar el fin de línea en functions.tf."
  }

  assert {
    condition     = !strcontains(aws_cloudfront_function.response.code, "\r")
    error_message = "viewer-response lleva CR: un checkout de Windows despliega bytes distintos que uno de la Mac. Falta normalizar el fin de línea en functions.tf."
  }
}

run "validacion_acm_no_adopta_registros_ajenos" {
  command = plan

  assert {
    condition     = length(aws_route53_record.cert_validation) == 2
    error_message = "Se esperaba un registro de validación por nombre del certificado (apex y www)."
  }

  assert {
    condition     = alltrue([for record in aws_route53_record.cert_validation : record.allow_overwrite == false])
    error_message = "allow_overwrite tiene que ser false en la validación de ACM: con true, el registro adopta el CNAME de otro certificado vigente y un destroy posterior lo deja sin renovar."
  }
}
