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
                    echo "Downloading and Running Trivy (Standalone Mode)..."
                    /* We download the tarball directly, extract it, and run it. 
                       This is the most reliable way when 'docker' is missing.
                    */
                    sh """
                        curl -sfL https://raw.githubusercontent.com/aquasec/trivy/main/contrib/install.sh | sh -s -- -b .
                        ./trivy fs . --severity HIGH,CRITICAL
                    """
                }
            }
        }

        stage('Code Analysis') {
            steps {
                script {
                    // Ensure 'SonarScanner' name matches your Global Tool Config
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
                    echo "Building Image..."
                    /* WARNING: If 'docker' was not found in the Scan stage, 
                       it will also NOT be found here. 
                       To build images without Docker, you must use Kaniko.
                    */
                    sh "docker build -t ${DOCKER_IMAGE}:latest ."
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
            echo "Success: Watchdog AI Pipeline completed!"
        }
        failure {
            echo "Error: Pipeline failed. Check if your Jenkins node has the required tools."
        }
    }
}