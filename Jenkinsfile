pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose.yml docker-compose.dev.yml"
    }

    stages {
        stage('Build Docker Images') {
            steps {
                sh 'docker compose -f $DOCKER_COMPOSE_FILE build'
            }
        }

        stage('Start Services') {
            steps {
                sh 'docker compose -f $DOCKER_COMPOSE_FILE up -d'
            }
        }

        stage('Test Containers') {
            steps {
                sh 'docker ps'  // list running containers
            }
        }
    }

    post {
        always {
            sh 'docker-compose -f $DOCKER_COMPOSE_FILE down' // optional cleanup
        }
    }
}

