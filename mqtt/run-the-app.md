# Application Setup Guide

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** and **Docker Compose**
- Access to an MQTT broker (if required)

---

## Step 1: Environment Configuration

### Create `.env` File

Create a `.env` file in the **root directory** of your project with the following configuration:

```env
# General Application Settings
APP_NAME=Laravel
APP_ENV=local
APP_KEY= <put app-key here>
APP_URL=http://localhost

# Database Settings
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=user-feedback-app
DB_USERNAME=john
DB_PASSWORD=password123

# Session Settings
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false

# Redis Settings
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Mail Settings (optional, for local dev purposes, you can leave this as is)
MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# MQTT Settings
MQTT_HOST=10.10.1.22
MQTT_AUTH_PASSWORD=1111
MQTT_PORT=1884
MQTT_AUTH_USERNAME=appuser

# JWT Secret
JWT_SECRET= <put secret-key here>
```

### Generate Laravel APP_KEY and JWT_SECRET

Quick way to generate new `APP_KEY` and `JWT_SECRET`:

```bash
docker run --rm composer:latest php -r "echo 'APP_KEY=base64:' . base64_encode(random_bytes(32)) . PHP_EOL; echo 'JWT_SECRET=' . bin2hex(random_bytes(32)) . PHP_EOL;"
```

**Replace the generated keys** in your `.env` file with the output from this command.

---

## Step 2: Build and Run Docker Containers

### Start the Application

Run the following command to build and start all containers:

```bash
docker compose up --build
```

Or run in detached mode (background):

```bash
docker compose up --build -d
```

### Verify Containers are Running

Check if all containers are up and running:

```bash
docker ps
```

You should see containers for:

- Backend (Laravel/PHP-FPM)
- Frontend (Nginx)
- Database (MySQL)
- Nginx Backend Proxy

---

## Step 3: Database Setup

### Access the Backend Container

Find your backend container name from `docker ps`, then access it:

```bash
docker exec -it <backend-container-name> sh
```

Example:

```bash
docker exec -it htxh-backend-1 sh
```

### Run Database Migrations

Inside the container, run the migrations to set up the database schema:

```bash
php artisan migrate
```

### Seed Foundation Data

Seed the database with initial configuration and user data:

```bash
php artisan db:seed --class=ConfigsTableSeeder
php artisan db:seed --class=UsersTableSeeder
```

### Exit the Container

```bash
exit
```

---

## Step 4: Access the Application

Your application should now be running! Access it at:

- **Frontend**: `http://localhost` with `user: admin password admin123` (or the configured port)
- **Backend API**: Check your docker-compose.yml for the backend port

---

## 🎉 You're All Set!

**Explore the application** and start developing!

---

## Troubleshooting

### Check Container Logs

View logs for all services:

```bash
docker compose logs -f
```

View logs for a specific service:

```bash
docker compose logs -f backend
```

### Rebuild Containers

If you encounter issues, try rebuilding:

```bash
docker compose down
docker compose up --build --force-recreate
```
