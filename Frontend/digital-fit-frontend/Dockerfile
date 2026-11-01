FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

# Versiones exactas del package-lock.json y sin ejecutar scripts de instalación de terceros.
RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

RUN mkdir -p /nginx-build && cp -r "$(dirname "$(find /app/dist -name index.html | head -n 1)")"/* /nginx-build/

# Variante oficial de nginx que no se ejecuta como root; por eso escucha en 8080 y no en 80.
FROM nginxinc/nginx-unprivileged:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /nginx-build /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]