FROM php:8.4-fpm-alpine

COPY ./php-fpm-www.conf /usr/local/etc/php-fpm.d/www.conf
 
RUN apk add --no-cache \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    zlib \
    git \
    supervisor \
    && apk add --no-cache --virtual .build-deps \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        zlib-dev \
        autoconf \
        g++ \
        make \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd zip \
    && apk del .build-deps

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .
COPY .env.example .env

RUN composer install --no-interaction --prefer-dist --no-dev

RUN mkdir -p storage bootstrap/cache /var/log/supervisor \
    && chown -R www-data:www-data storage bootstrap/cache /var/log/supervisor /var/www

COPY supervisord.conf /etc/supervisord.conf

EXPOSE 9000

USER www-data
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
