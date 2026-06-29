pipeline {
    agent any
    environment {
        DOCKER_IMAGE      = "hrishipatil193/ai-backend"
        DOCKER_CREDS      = credentials('docker-hub-credentials')
        CHART_PATH        = './ai-app-chart'
    }
    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }
        stage('Code Analysis - SonarQube') {
            steps {
                echo "⏭️ SonarQube skipped - EC2 pe deploy hoga baad mein"
            }
        }
        stage('Build & Push Image') {
            steps {
                script {
                    dir('backend') {
                        sh "docker --version"
                        sh "docker build -t ${DOCKER_IMAGE}:latest ."
                        sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }
        stage('Deploy to Minikube') {
            steps {
                echo "Deploying to Kubernetes using Helm..."
                sh "helm upgrade --install watchdog-ai ${CHART_PATH} --namespace ai-project --create-namespace"
            }
        }
    }
    post {
        always {
            echo "Pipeline completed!"
            deleteDir()
        }
        success {
            echo "✅ Pipeline Success! Nashik mein party!"
        }
        failure {
            echo "❌ Pipeline Failed! Check logs."
        }
    }
}
