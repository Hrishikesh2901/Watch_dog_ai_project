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
                    echo "Installing and Running Trivy scan in workspace..."
                    sh """
                        # 1. Download the installer
                        curl -sfL https://raw.githubusercontent.com/aquasec/trivy/main/contrib/install.sh -o install_trivy.sh
                        
                        # 2. Run the installer to place the binary in the current directory
                        sh install_trivy.sh -b . v0.48.3
                        
                        # 3. Force execution permissions
                        chmod +x ./trivy
                        
                        # 4. Verify file exists and run it
                        if [ -f "./trivy" ]; then
                            ./trivy fs . --severity HIGH,CRITICAL
                        else
                            echo "Trivy binary was not found after installation!"
                            exit 1
                        fi
                    """
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
                    echo