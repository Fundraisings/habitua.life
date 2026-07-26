# Usa la imagen oficial de Nginx
FROM nginx:alpine

# Modifica la configuración interna de Nginx para que escuche en el puerto 8080
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Copia los archivos del sitio al directorio público de Nginx
COPY . /usr/share/nginx/html/

# Expone el puerto 8080
EXPOSE 8080

# Arranca Nginx
CMD ["nginx", "-g", "daemon off;"]
