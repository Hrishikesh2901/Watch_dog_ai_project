pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: trivy
    image: aquasec/trivy:0.48.3
    command: ['sleep']
    args: ['99d']
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ['sleep']
    args: ['99d']
    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker
  volumes:
  - name: docker-config
    projected:
      sources:
      - secret:
          name: docker-hub-credentials
          items:
            - key: .dockerconfigjson
              path: config.json
"""
        }
    }

    environment {
        DOCKER_IMAGE    = "hrishipatil193/ai-backend"
        CHART_PATH      = './ai-app-chart'
    }

    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Hrishikesh2901/Watch_dog_ai_project.git'
            }
        }

        stage('Security Scan') {
            steps {
                container('trivy') {
                    echo "Running Trivy scan..."
                    // No installation needed, the binary is already in the image
                    sh "trivy fs . --severity HIGH,CRITICAL"
                }
            }
        }

        stage('Code Analysis') {
            steps {
                script {
                    // This assumes you have SonarScanner configured in Jenkins Global Tool Configuration
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=Watchdog-AI"
                    }
                }
            }
        }

        stage('Build & Push') {
            steps {
                container('kaniko') {
                    echo "Building and Pushing Image using Kaniko..."
                    // Kaniko builds images without needing a Docker daemon
                    sh """
                    /kaniko/executor --context `pwd` \
                        --dockerfile Dockerfile \
                        --destination ${DOCKER_IMAGE}:latest
                    """
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
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "Success: Watchdog AI Pipeline completed successfully!"
        }
        failure {
            echo "Error: Pipeline failed. Please check the logs above."
        }
    }
}