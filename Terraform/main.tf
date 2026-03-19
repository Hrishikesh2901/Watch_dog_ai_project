# 1. Create a VPC (Virtual Private Cloud)
resource "aws_vpc" "ai_project_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "AI-Project-VPC"
  }
}

# 2. Create a Public Subnet inside the VPC
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.ai_project_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "AI-Public-Subnet"
  }
}

# 3. Create an S3 Bucket for your CSV Datasets
resource "aws_s3_bucket" "ai_data_storage" {
  bucket = "ai-transparency-datasets-2026" # Bucket name globally unique hona chahiye

  tags = {
    Name        = "AI-Data-Storage"
    Environment = "Dev"
  }
}