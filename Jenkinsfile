pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Clean Up') {
            steps {
                // Remove old containers
                sh 'docker-compose -f docker-compose-pipeline.yml down --rmi local || true'
            }
        }

        stage('Build & Deploy App') {
            steps {
                // Start the App in background (-d)
                sh 'docker-compose -f docker-compose-pipeline.yml up -d expense-app-pipeline'
                // Wait 10 seconds for app to be ready
                sleep 10
            }
        }

        stage('Run Selenium Tests') {
            steps {
                // Run the tester container. If it fails, the pipeline fails.
                // --exit-code-from expense-tester means if tests fail, Jenkins marks build as Failed
                sh 'docker-compose -f docker-compose-pipeline.yml up --exit-code-from expense-tester expense-tester'
            }
        }
    }

    // Email Notification Block
    post {
        always {
            // Replace with your email details
            emailext body: "Build URL: ${env.BUILD_URL}.\n\nStatus: ${currentBuild.currentResult}",
                     subject: "Jenkins Build ${currentBuild.currentResult}: Assignment 3",
                     to: 'qasimalik@gmail.com' // Send to collaborator as requested
        }
    }
}