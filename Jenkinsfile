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
                    // Moving into backend folder for the scan
                    dir('backend') {
                        echo "Installing and Running Trivy in backend folder..."
                        sh """
                            curl -sfL https://raw.githubusercontent.com/aquasec/trivy/main/contrib/install.sh | sh -s -- -b . v0.48.3
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
                        def scannerHome = tool 'SonarScanner'
                        withSonarQubeEnv('SonarQube') {
                            sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=Watchdog-AI"
                        }
                    }
                }
            }
        }

        stage('Build & Push') {
            steps {
                script {
                    // This mirrors your successful local command
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
                echo "Deploying to Local Cluster using Helm..."
                // Assuming ai-app-chart is at the root. If it's inside backend, wrap this in dir() too.
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
            echo "Success: Watchdog AI Pipeline finished successfully!"
        }
        failure {
            echo "Error: Pipeline failed. Check the folder paths in Jenkins."
        }
    }
}