pipeline {
    agent none

    environment {
        DB_PASSWORD = credentials('db-password') 
        DB_USERNAME = credentials('db-username') 
        DB_ROOTPASSWORD = credentials('db-rootpassword') 
        JWT_SECRET = credentials('jwt-secret')
        MQTT_AUTH_USERNAME = credentials('mqtt-auth-username')
        MQTT_AUTH_PASSWORD = credentials('mqtt-auth-password')
        PUSHER_APP_KEY= credentials('pusher-app-key')
        PUSHER_APP_SECRET= credentials('pusher-app-secret')
    }
    
    stages {
          stage('Get Branch Name') {
            agent { label 'node-01' }
            steps {
                script {
                    def branchName = env.BRANCH_NAME ?: 'unknown'
                    env.NODE_IP = sh(script: "hostname -I | awk '{print \$1}'", returnStdout: true).trim()
                    if (branchName == 'main') {
                        env.APP_ENV = "prod"
                        env.AGENT_LABEL = "built-in"
                    } else if (branchName.startsWith('dev')) {
                        env.APP_ENV = "dev"
                        env.AGENT_LABEL = "node-01"
                    } else {
                        env.APP_ENV = "staging"  
                        env.AGENT_LABEL = "node-01"
                    }    
                }
            }
        }
        stage('Cleanup') {
            agent { label "${env.AGENT_LABEL}" } 
            steps {
                sh 'docker compose -f docker-compose.yml down'
                sh 'docker image prune -a -f'
            }
        }

        stage('Build Docker Images') {
            agent { label "${env.AGENT_LABEL}" } 
            steps {
                sh 'docker compose -f docker-compose.yml build'
            }
        }

        stage('Start Services') {
            agent { label "${env.AGENT_LABEL}" } 
            steps {
                sh 'docker compose -f docker-compose.yml up -d'
            }
        }

        stage('Health Check') {
            agent { label "${env.AGENT_LABEL}" } 
            steps {
                script {
                    try {
                        sleep(20) 
                        def healthCheckUrl = "http://${env.NODE_IP}:80"
                        def response = httpRequest url: healthCheckUrl
                        echo "Health Check Status: ${response.status}"
                        if (response.status != 200) {
                            error "Health Check Failed: Received status ${response.status}"
                        }
                    } catch (e) {
                        echo "Health Check Exception: ${e.getMessage()}"
                        error("Health Check Failed")
                    }
                }
            }
        }
    }

   post {
        failure {
            echo "Deployment FAILED – check logs and containers."
            mail to: "duydeptrai2004tv@gmail.com",
                 subject: "${JOB_NAME} - Build # ${BUILD_NUMBER} - FAILURE!",
                 body: "Check console output at ${BUILD_URL} to view the results."
        }
        success {
            echo "Deployment SUCCESS – app should be live."
            mail to: "duydeptrai2004tv@gmail.com",
                 subject: "${JOB_NAME} - Build # ${BUILD_NUMBER} - SUCCESS!",
                 body: "Check console output at ${BUILD_URL} to view the results."
        }
    }
}

