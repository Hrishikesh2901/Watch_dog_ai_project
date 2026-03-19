resource "aws_iam_role" "ecs_execution_role" {
  name = "watchdog-ecs-exec-role-final"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_cluster" "watchdog_cluster" {
  name = "watchdog-cluster"
}

resource "aws_cloudwatch_log_group" "watchdog_logs" {
  name = "/ecs/watchdog"
}

resource "aws_ecs_task_definition" "watchdog_task" {
  family                   = "watchdog-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "hrishipatil193/watchdog-frontend:v3"
      essential = true
      portMappings = [{ containerPort = 3000, hostPort = 3000 }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/watchdog"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "watchdog_service" {
  name            = "watchdog-service"
  cluster         = aws_ecs_cluster.watchdog_cluster.id
  task_definition = aws_ecs_task_definition.watchdog_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  health_check_grace_period_seconds = 300 

  network_configuration {
    subnets          = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.watchdog_tg.arn
    container_name   = "frontend"
    container_port   = 3000
  }
  depends_on = [aws_lb_listener.front_end]
}