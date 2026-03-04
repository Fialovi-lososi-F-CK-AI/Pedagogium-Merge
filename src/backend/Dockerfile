FROM php:8.2-alpine

WORKDIR /app

RUN apk add --no-cache bash icu-dev libzip-dev zlib-dev postgresql-dev git

RUN docker-php-ext-install pdo pdo_pgsql intl zip opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
