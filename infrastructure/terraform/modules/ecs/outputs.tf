output "cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.cluster.id
}

output "backend_service_name" {
  description = "ECS backend service name"
  value       = aws_ecs_service.backend.name
}

output "frontend_service_name" {
  description = "ECS frontend service name"
  value       = aws_ecs_service.frontend.name
}

output "frontend_url" {
  description = "URL of the frontend load balancer"
  value       = "http://${aws_lb.main.dns_name}"
}

output "backend_url" {
  description = "URL of the backend API"
  value       = "http://${aws_lb.main.dns_name}:3001"
}