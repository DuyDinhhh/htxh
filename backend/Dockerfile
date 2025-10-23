FROM php:8.4-fpm

WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    git \
    curl \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --optimize-autoloader --no-dev
RUN cp .env.example .env
# Generate key (optional for dev)
RUN php artisan key:generate

EXPOSE 8000