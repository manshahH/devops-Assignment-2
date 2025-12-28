pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // This automatically pulls code from your GitHub
                checkout scm
            }
        }

        stage('Clean Old Containers') {
            steps {
                script {
                    // Stop any existing test container to avoid conflicts
                    sh 'docker-compose -f docker-compose-pipeline.yml down || true'
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    // Start the app using the pipeline compose file
                    sh 'docker-compose -f docker-compose-pipeline.yml up -d'
                }
            }
        }
    }
}