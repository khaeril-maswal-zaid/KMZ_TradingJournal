FROM php:8.4-fpm-alpine AS build

RUN apk add --no-cache \
    bash git curl nodejs npm \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    oniguruma-dev icu-dev openldap-dev \
    zip unzip

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo pdo_mysql mbstring gd intl ldap

WORKDIR /var/www

COPY composer.json composer.lock ./
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

RUN php artisan package:discover --ansi
RUN npm run build

FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    bash curl \
    libpng libjpeg-turbo freetype \
    oniguruma icu openldap \
    zip unzip mysql-client

RUN docker-php-ext-install pdo pdo_mysql

WORKDIR /var/www

COPY --from=build /var/www /var/www

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
