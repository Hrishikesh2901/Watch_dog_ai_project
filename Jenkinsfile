pipeline {
    agent any

    environment {
        DOCKER_IMAGE      = "hrishipatil193/ai-backend"
        DOCKER_CREDS      = credentials('docker-hub-credentials') 
        SONAR_PROJECT_KEY = "Watchdog-AI"
        SONAR_TOKEN_CRED  = credentials('Sonar_token') 
        CHART_PATH        = './ai-app-chart'
    }

    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }

        stage('Code Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    dir('backend') {
                        echo "Starting SonarQube Analysis..."
                        withSonarQubeEnv('SonarQube') {
                            // Sabse safe tarika: SONAR_TOKEN env var scanner khud detect kar leta hai
                            withEnv(["SONAR_TOKEN=${SONAR_TOKEN_CRED}"]) {
                                sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY}"
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Push Image') {
            steps {
                script {
                    dir('backend') {
                        echo "Building Docker Image..."
                        sh "docker build -t ${DOCKER_IMAGE}:latest ."
                        
                        echo "Logging into Docker Hub..."
                        sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                        
                        echo "Pushing Image..."
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
            script {
                echo "Cleaning up workspace..."
                cleanWs()
            }
        }
        success {
            echo "Bhai, Nashik mein party! Pipeline Success."
        }
        failure {
            echo "Pipeline Fail! Check logs."
        }
    }
}