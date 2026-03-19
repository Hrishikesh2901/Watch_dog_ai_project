pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'hrishipatil193'
        DOCKER_IMAGE    = "hrishipatil193/ai-backend"
        CHART_PATH      = './ai-app-chart'
        // Jenkins Credentials ID
        DOCKER_CREDS    = credentials('docker-hub-credentials')
        AWS_CREDS       = credentials('aws-credentials')
    }

    stages {
        stage('Checkout & Poll') {
            steps {
                // Poll SCM trigger automatically yahan se code uthayega
                git branch: 'main', url: 'https://github.com/hrishikesh2901/Watchdog_project.git'
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                script {
                    echo "Scanning for vulnerabilities..."
                    // fs . matlab pura folder scan karega build se pehle
                    sh "trivy fs . --severity HIGH,CRITICAL"
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:latest ./backend"
                    sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('AWS Infrastructure (Terraform)') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']]) {
                    dir('terraform') {
                        sh "terraform init"
                        sh "terraform apply -auto-approve"
                    }
                }
            }
        }

        stage('Kubernetes Deploy (Helm)') {
            steps {
                sh "helm upgrade --install ai-backend ${CHART_PATH} --namespace ai-project --create-namespace"
            }
        }
    }

    post {
        success {
            echo "Bhai, Deployment Successful! Ab Grafana check karo."
        }
        always {
            cleanWs()
        }
    }
}