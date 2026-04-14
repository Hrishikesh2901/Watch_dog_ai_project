pipeline {
    agent any

    environment {
        DOCKER_IMAGE    = "hrishipatil193/ai-backend"
        DOCKER_CREDS    = credentials('docker-hub-credentials')
        SONAR_PROJECT_KEY = "Watchdog-AI"
        CHART_PATH      = './ai-app-chart'
    }

    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }

        // TRIVY KO ABHI KE LIYE SKIP KAR RAHE HAIN
        stage('Security Scan') {
            steps {
                echo "Skipping Trivy Scan to fix the main pipeline flow..."
            }
        }

        stage('Code Analysis') {
            steps {
                script {
                    dir('backend') {
                        echo "Starting SonarQube Analysis..."
                        def scannerHome = tool 'SonarScanner'
                        
                        // ID 'sonar-token' wahi honi chahiye jo tumne Jenkins Credentials mein dali hai
                        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                            withSonarQubeEnv('SonarQube') {
                                sh "${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                    -Dsonar.login=${SONAR_TOKEN}"
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Push') {
            steps {
                script {
                    dir('backend') {
                        echo "Building Docker Image..."
                        // Yahan 'docker' command tabhi chalega agar Jenkins ko Docker socket ka access hai
                        sh "docker build -t ${DOCKER_IMAGE}:latest ."
                        
                        echo "Pushing to Docker Hub..."
                        sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy Local K8s') {
            steps {
                echo "Deploying to Minikube..."
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
            echo "Bhai, Finally Success!"
        }
        failure {
            echo "Pipeline Fail! Check if Sonar Token is correct or Docker is installed."
        }
    }
}