resource "aws_lb" "watchdog_alb" {
  name               = "watchdog-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
}

resource "aws_lb_target_group" "watchdog_tg" {
  name        = "watchdog-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 60
    interval            = 90 
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.watchdog_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.watchdog_tg.arn
  }
}