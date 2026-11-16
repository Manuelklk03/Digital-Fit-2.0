FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

# Versiones exactas del package-lock.json y sin ejecutar scripts de instalación de terceros.
RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

# index.csr.html es único (el resto de index.html son páginas prerenderizadas en subcarpetas).
RUN mkdir -p /nginx-build && cp -r "$(dirname "$(find /app/dist -name index.csr.html | head -n 1)")"/* /nginx-build/

# Variante oficial de nginx que no se ejecuta como root; por eso escucha en 8080 y no en 80.
FROM nginxinc/nginx-unprivileged:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Carpeta propia: /usr/share/nginx/html trae un index.html de bienvenida que se serviría en «/».
COPY --from=build /nginx-build /usr/share/nginx/digital-fit

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]