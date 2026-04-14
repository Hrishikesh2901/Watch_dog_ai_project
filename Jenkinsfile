pipeline {
    agent any

    environment {
        // Docker settings
        DOCKER_IMAGE    = "hrishipatil193/ai-backend"
        DOCKER_CREDS    = credentials('docker-hub-credentials') // Jenkins ID for DockerHub
        
        // SonarQube settings
        SONAR_PROJECT_KEY = "Watchdog-AI"
        
        // Kubernetes settings
        CHART_PATH      = './ai-app-chart'
    }

    stages {
        stage('Pull Code') {
            steps {
                // Repository clone
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    dir('backend') {
                        echo "Running Security Scan (Trivy)..."
                        // Agar Trivy binary issues de, toh is stage ko temporarily skip kar dena
                        sh """
                            curl -sfL https://raw.githubusercontent.com/aquasec/trivy/main/contrib/install.sh | sh -s -- -b .
                            ./trivy fs . --severity HIGH,CRITICAL
                        """
                    }
                }
            }
        }

        stage('Code Analysis') {
            steps {
                script {
                    dir('backend') {
                        echo "Starting SonarQube Analysis..."
                        // 'SonarScanner' should be the name in Global Tool Configuration
                        def scannerHome = tool 'SonarScanner'
                        
                        // 'sonar-token' is the ID of the Secret Text credential you created in Jenkins
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
                echo "Deploying to Minikube using Helm..."
                // Helm install/upgrade
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
            echo "Bhai, Pipeline Success! Watchdog AI is live."
        }
        failure {
            echo "Pipeline Fail ho gayi. Check logs for folder paths or permissions."
        }
    }
}