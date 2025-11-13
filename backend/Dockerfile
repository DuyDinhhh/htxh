FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev zip git curl supervisor ca-certificates tzdata \
 && rm -rf /var/lib/apt/lists/*

 
RUN docker-php-ext-install pdo_mysql gd zip

 
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
 
WORKDIR /var/www
COPY . .
COPY .env.example .env

 
RUN composer install --no-interaction --prefer-dist --no-dev && \
    php artisan key:generate
 
RUN chown -R www-data:www-data /var/www

COPY supervisord.conf /etc/supervisord.conf
 
EXPOSE 9000
 
USER www-data
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]