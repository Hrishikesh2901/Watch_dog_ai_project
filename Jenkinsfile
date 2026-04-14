pipeline {
    agent any

    environment {
        // Docker Hub Details
        DOCKER_IMAGE      = "hrishipatil193/ai-backend"
        DOCKER_CREDS      = credentials('docker-hub-credentials') // Jenkins Credential ID
        
        // SonarQube Details
        SONAR_PROJECT_KEY = "Watchdog-AI"
        SONAR_TOKEN_CRED  = credentials('Sonar_token') // Jenkins Credential ID
        
        // Deployment Details
        CHART_PATH        = './ai-app-chart'
    }

    stages {
        stage('Pull Code') {
            steps {
                // SCM se code pull karega (GitHub)
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }

        stage('Code Analysis') {
            steps {
                script {
                    // backend folder ke andar jaakar scan run karega
                    dir('backend') {
                        echo "Starting SonarQube Analysis..."
                        def scannerHome = tool 'SonarScanner'
                        
                        // 'SonarQube' should match the name in Manage Jenkins -> System
                        withSonarQubeEnv('SonarQube') {
                            sh "${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                -Dsonar.token=${SONAR_TOKEN_CRED}"
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
                        
                        echo "Pushing to Docker Hub..."
                        // Username aur Password automatically variables mein store ho jate hain
                        sh "echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                echo "Deploying using Helm..."
                // --create-namespace ensures naya cluster hone par bhi fail na ho
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
            echo "Bhai, Party! Watchdog-AI Pipeline Successfully Run ho gayi."
        }
        failure {
            echo "Pipeline Fail! Console logs check kar, shayad permission ya path ka issue hai."
        }
    }
}