FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    git \
    curl \
    libzip-dev \
    supervisor \
 && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

COPY .env.example .env 

RUN composer install && php artisan key:generate

RUN chown -Rf www-data:www-data /var/www
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 9000
USER www-data
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]