# FROM php:8.4-fpm

# RUN apt-get update && apt-get install -y \
#     libpng-dev \
#     libjpeg-dev \
#     libfreetype6-dev \
#     zip \
#     git \
#     curl \
#     libzip-dev \
#     supervisor \
#  && rm -rf /var/lib/apt/lists/*

# RUN docker-php-ext-install pdo_mysql gd zip

# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# WORKDIR /var/www

# COPY . .

# COPY .env.example .env 

# RUN composer install && php artisan key:generate

# RUN chown -Rf www-data:www-data /var/www
# COPY supervisord.conf /etc/supervisord.conf

# EXPOSE 9000
# USER www-data
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    nginx \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev zip git curl supervisor ca-certificates tzdata \
 && rm -rf /var/lib/apt/lists/*

# 2) PHP extensions
RUN docker-php-ext-install pdo_mysql gd zip

 
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
 
WORKDIR /var/www
COPY . .
COPY .env.example .env

 
RUN composer install --no-interaction --prefer-dist --no-dev && \
    php artisan key:generate
 
RUN chown -R www-data:www-data /var/www
 
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
COPY supervisord.conf /etc/supervisord.conf
 
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log
 
EXPOSE 80 9000
 
USER root
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
