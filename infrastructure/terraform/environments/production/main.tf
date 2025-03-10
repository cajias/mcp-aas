provider "aws" {
  region = "us-west-2"
}

terraform {
  backend "s3" {
    bucket = "mcp-aas-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-west-2"
  }
}

module "networking" {
  source = "../../modules/networking"
  
  environment = "production"
  vpc_cidr    = "10.0.0.0/16"
}

module "database" {
  source = "../../modules/database"
  
  environment     = "production"
  vpc_id          = module.networking.vpc_id
  subnet_ids      = module.networking.private_subnet_ids
  security_groups = [module.networking.database_security_group_id]
}

module "ecs" {
  source = "../../modules/ecs"
  
  environment     = "production"
  vpc_id          = module.networking.vpc_id
  subnet_ids      = module.networking.private_subnet_ids
  security_groups = [module.networking.ecs_security_group_id]
  
  backend_image  = "mcpaas/backend:latest"
  frontend_image = "mcpaas/frontend:latest"
  
  database_url = module.database.database_url
  
  # Load balancer settings
  public_subnet_ids = module.networking.public_subnet_ids
  lb_security_group_id = module.networking.lb_security_group_id
}

output "frontend_url" {
  value = module.ecs.frontend_url
}