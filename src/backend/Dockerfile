FROM php:8.2-alpine

WORKDIR /app

ENV APP_ENV=prod
ENV APP_DEBUG=0

RUN apk add --no-cache \
    bash icu-dev libzip-dev zlib-dev postgresql-dev git curl

RUN docker-php-ext-install pdo pdo_pgsql intl zip opcache

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

EXPOSE 80

CMD ["symfony", "serve", "--no-tls", "--allow-http", "--port=80"]
