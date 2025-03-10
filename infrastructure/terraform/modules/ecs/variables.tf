variable "environment" {
  description = "Environment name (e.g. production, staging)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where ECS services will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs where ECS services will be deployed"
  type        = list(string)
}

variable "security_groups" {
  description = "List of security group IDs for ECS services"
  type        = list(string)
}

variable "backend_image" {
  description = "Docker image for the backend service"
  type        = string
}

variable "frontend_image" {
  description = "Docker image for the frontend service"
  type        = string
}

variable "database_url" {
  description = "MongoDB connection URL"
  type        = string
  sensitive   = true
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for load balancer"
  type        = list(string)
}

variable "lb_security_group_id" {
  description = "Security group ID for the load balancer"
  type        = string
}