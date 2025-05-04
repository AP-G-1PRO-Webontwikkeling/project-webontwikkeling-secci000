# Gebruik een kleine webserver image
FROM nginx:alpine

# Kopieer de inhoud naar de Nginx public folder
COPY . /usr/share/nginx/html

# Expose poort 80
EXPOSE 80
