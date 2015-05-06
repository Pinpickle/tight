cd ./dist
composer update --no-dev --optimize-autoloader --prefer-dist
cd ./extensions
composer update --no-dev --optimize-autoloader --prefer-dist
cd ../..
