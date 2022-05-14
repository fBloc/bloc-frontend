FROM nginx:latest

WORKDIR /app

COPY dist ./
COPY nginx.conf /etc/nginx/conf.d/bloc_frontend.conf

COPY nginx-entrypoint.sh /

ENTRYPOINT [ "sh", "/nginx-entrypoint.sh" ]