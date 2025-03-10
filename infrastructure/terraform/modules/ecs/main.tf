resource "aws_ecs_cluster" "cluster" {
  name = "mcp-aas-${var.environment}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "mcp-aas-${var.environment}-task-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Backend Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "mcp-aas-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  
  container_definitions = jsonencode([{
    name      = "backend"
    image     = var.backend_image
    essential = true
    
    portMappings = [{
      containerPort = 3001
      hostPort      = 3001
      protocol      = "tcp"
    }]
    
    environment = [
      {
        name  = "NODE_ENV"
        value = var.environment
      },
      {
        name  = "MONGODB_URI"
        value = var.database_url
      }
    ]
    
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/mcp-aas-${var.environment}-backend"
        "awslogs-region"        = "us-west-2"
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "mcp-aas-${var.environment}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  
  container_definitions = jsonencode([{
    name      = "frontend"
    image     = var.frontend_image
    essential = true
    
    portMappings = [{
      containerPort = 80
      hostPort      = 80
      protocol      = "tcp"
    }]
    
    environment = [
      {
        name  = "REACT_APP_API_URL"
        value = "https://api.mcp-aas.com"
      }
    ]
    
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/mcp-aas-${var.environment}-frontend"
        "awslogs-region"        = "us-west-2"
        "awslogs-stream-prefix" = "frontend"
      }
    }
  }])
}

# Load Balancer
resource "aws_lb" "main" {
  name               = "mcp-aas-${var.environment}-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.lb_security_group_id]
  subnets            = var.public_subnet_ids
  
  enable_deletion_protection = var.environment == "production"
}

# Backend Target Group
resource "aws_lb_target_group" "backend" {
  name        = "mcp-aas-${var.environment}-backend-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    path                = "/health"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

# Frontend Target Group
resource "aws_lb_target_group" "frontend" {
  name        = "mcp-aas-${var.environment}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    path                = "/"
    protocol            = "HTTP"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

# Frontend Listener
resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# Backend Listener
resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.main.arn
  port              = 3001
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Backend Service
resource "aws_ecs_service" "backend" {
  name            = "mcp-aas-${var.environment}-backend"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.backend.arn
  launch_type     = "FARGATE"
  desired_count   = 2
  
  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_groups
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 3001
  }
  
  depends_on = [aws_lb_listener.backend]
}

# Frontend Service
resource "aws_ecs_service" "frontend" {
  name            = "mcp-aas-${var.environment}-frontend"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.frontend.arn
  launch_type     = "FARGATE"
  desired_count   = 2
  
  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_groups
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }
  
  depends_on = [aws_lb_listener.frontend]
}