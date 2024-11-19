FROM nginx:alpine

COPY src/. /usr/share/nginx/html

EXPOSE 8080