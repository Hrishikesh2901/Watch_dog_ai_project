pipeline {
    agent any

    environment {
        DOCKER_IMAGE    = "hrishipatil193/ai-backend"
        CHART_PATH      = './ai-app-chart'
        DOCKER_CREDS    = credentials('docker-hub-credentials')
    }

    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    echo "Running Trivy scan via Docker..."
                    // Using ${WORKSPACE} ensures the correct path is mapped inside the container
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ${WORKSPACE}:/src aquasec/trivy:latest fs /src --severity HIGH,CRITICAL"
                }
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
                    echo "Building Docker Image..."
                    sh "docker build -t ${DOCKER_IMAGE}:latest ."
                    
                    echo "Pushing to Docker Hub..."
                    sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy Local K8s') {
            steps {
                echo "Deploying to Local Cluster using Helm..."
                sh "helm upgrade --install watchdog-ai ${CHART_PATH} --namespace ai-project --create-namespace"
            }
        }
    }

    post {
        always {
            script {
                echo "Cleaning up workspace..."
                cleanWs()
            }
        }
        success {
            echo "Success: Build and Local Deployment completed successfully!"
        }
        failure {
            echo "Error: Pipeline failed. Please check the logs above."
        }
    }
}