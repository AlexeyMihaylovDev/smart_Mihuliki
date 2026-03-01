pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        stage('Build Frontend') {
            steps {
                sh 'npm run build --workspace=frontend'
            }
        }
        stage('Build Backend') {
            steps {
                sh 'npm run build --workspace=backend'
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t smart-home-frontend:latest -f frontend/Dockerfile .'
                sh 'docker build -t smart-home-backend:latest -f backend/Dockerfile .'
            }
        }
    }
}
