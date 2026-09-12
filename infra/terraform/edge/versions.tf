terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.60, < 7.0"
    }
  }

  # Mismo bucket y convención que describe-net (config/estado por proyecto, lock nativo en S3).
  backend "s3" {
    bucket       = "ultravioleta-terraform-state"
    key          = "uvdweb/edge/terraform.tfstate"
    region       = "us-east-2"
    encrypt      = true
    use_lockfile = true
  }
}

# ACM para CloudFront y las CloudFront Functions viven obligatoriamente en us-east-1.
provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "uvdweb"
      Component = "edge"
      ManagedBy = "terraform"
    }
  }
}
