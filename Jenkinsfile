pipeline {
    agent any

    environment {
        DOCKER_IMAGE    = "hrishipatil193/ai-backend"
        CHART_PATH      = './ai-app-chart'
        DOCKER_CREDS    = credentials('docker-hub-credentials')
        // AWS_CREDS hata diya hai yahan se
    }

    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }

        stage('Security Scan') {
            steps {
                sh "trivy fs . --severity HIGH,CRITICAL"
            }
        }

        stage('Code Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=Watchdog-AI"
                    }
                }
            }
        }

        stage('Build & Push') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:latest ."
                    sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy Local K8s') {
            steps {
                sh "helm upgrade --install watchdog-ai ${CHART_PATH} --namespace ai-project --create-namespace"
            }
        }
    }

    // Post block ko node ke andar hi rakhne ke liye yahan shift kiya
    post {
        always {
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "Build and Local Deployment Successful!"
        }
        failure {
            echo "Build Failed. Check logs above."
        }
    }
}