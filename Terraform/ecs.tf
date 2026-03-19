resource "aws_ecs_cluster" "main" {
  name = "watchdog-cluster"
}

# Backend Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256" # Minimal for free tier
  memory                   = "512"

  container_definitions = jsonencode([{
    name  = "ai-backend"
    image = "hrishikesh/ai-backend:latest" # Teri Docker Hub image
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
    }]
  }])
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([{
    name  = "ai-frontend"
    image = "hrishikesh/ai-frontend:latest"
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
    }]
  }])
}