# Despliegue — Digital-Fit

Estado: **solo ejecución local**. No hay despliegue público todavía; el alojamiento gratuito se estudia en la fase 2 ([roadmap.md](roadmap.md#fase-2--viabilidad-del-despliegue-gratuito)).

## 1. Ejecución local con Docker (recomendada)

Requisitos: Docker Desktop **en marcha** (si no, `docker` responde «failed to connect to the docker API»).

```bash
docker compose up --build      # desde la raíz del repositorio
docker compose down            # parar (los datos de MySQL se conservan en el volumen)
docker compose down -v         # parar y BORRAR los datos de MySQL
```

| Servicio | URL / puerto | Notas |
|---|---|---|
| Frontend (nginx) | http://localhost:4200 | nginx reenvía `/api/` al backend |
| Backend | http://localhost:8080 | |
| MySQL | `localhost:3307` | usuario `root`, contraseña `root` (solo desarrollo) |

Al arrancar, Hibernate crea o actualiza las tablas a partir de las entidades (`ddl-auto=update`) y `data.sql` inserta el catálogo base y dos usuarios de ejemplo (`admin1` y `usuario1`). Sus contraseñas no están documentadas en el repositorio; para probar, registra un usuario nuevo desde la aplicación.

Limitación conocida: los `context` de `docker-compose.yml` usan `\` (`./Backend\digital-fit`), que funciona en Windows pero no en Linux/macOS (P9).

## 2. Ejecución local sin Docker

Requisitos: JDK 25, Node.js `^20.19`, `^22.12` o `>=24` (lo exige Angular CLI 21) con npm y MySQL 8 en marcha.

**Base de datos.** Basta con que el servidor MySQL esté activo: la base `digital_fit` se crea sola (`createDatabaseIfNotExist=true`). La conexión se configura con variables de entorno; si no existen, se usan los valores por defecto de `application.properties`:

| Variable | Por defecto |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/digital_fit?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Europe/Madrid` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | `root` |

**Backend**

```bash
cd Backend/digital-fit
mvnw.cmd spring-boot:run        # Windows, CMD
.\mvnw.cmd spring-boot:run      # Windows, PowerShell
sh ./mvnw spring-boot:run       # Linux/macOS/Git Bash
```

`mvnw` está versionado sin permiso de ejecución (`100644`), por eso se lanza con `sh`.

**Frontend**

```bash
cd Frontend/digital-fit-frontend
npm ci
npm start                       # ng serve en http://localhost:4200
```

> Pendiente de comprobar (P1): el frontend llama a rutas relativas `/api/...` y no hay `proxy.conf` para `ng serve`, así que en este modo las llamadas probablemente no llegan al backend. Hasta que se añada el proxy (fase 5), usa Docker Compose para probar la aplicación completa.

## 3. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| El backend no conecta con MySQL | MySQL parado o credenciales distintas | Arranca MySQL; revisa `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` |
| Tablas o datos base no aparecen | Error en JPA o en `data.sql` (los errores de `data.sql` se ignoran por `continue-on-error=true`) | Revisa la consola del backend y `logs/digitalfit.log` |
| El frontend no arranca | Faltan dependencias | `npm ci` en `Frontend/digital-fit-frontend` |
| El frontend no recibe datos | Backend parado, otro puerto, CORS (solo admite `http://localhost:4200`) o falta de proxy en `ng serve` | Arranca el backend en 8080; usa Docker Compose |
| Puerto ocupado (3307, 4200, 8080) | Otra aplicación lo usa | Ciérrala o cambia el puerto en `docker-compose.yml` |
| `docker` no conecta con la API | Docker Desktop no está iniciado | Inicia Docker Desktop y espera a que el motor esté listo |

## 4. Despliegue público (fase 2)

Objetivo: frontend, backend y base de datos en planes **gratuitos** (no pruebas temporales ni de pago), con autenticación y persistencia reales.

Para cada candidato se registrará, a partir de su documentación oficial y con fecha de consulta: límites de CPU y memoria, suspensión por inactividad y tiempo de arranque, persistencia, si pide tarjeta, caducidad del plan y región.

| Parte | Candidatos a evaluar | Datos verificados |
|---|---|---|
| Frontend estático | Cloudflare Pages, Netlify, Vercel, GitHub Pages | _pendiente_ |
| Backend (contenedor Java) | Render, Koyeb, Fly.io, Google Cloud Run | _pendiente_ |
| MySQL | Aiven for MySQL, TiDB Cloud Serverless (compatible con MySQL) | _pendiente_ |

Puntos que condicionan la elección:

- **Memoria**: Spring Boot con Java 25 necesita normalmente varios cientos de MB; hay que medirlo con la configuración real.
- **Cookies entre dominios**: si frontend y API están en dominios distintos, la sesión exige `SameSite=None; Secure` y CSRF activo (decisión D2).
- **Suspensión**: un backend que se duerme tarda en responder a la primera petición; la interfaz debe mostrar un estado de carga honesto.

## 5. Verificación de un despliegue

1. Backend: un endpoint de salud responde (por ejemplo `/actuator/health`, si se expone) y los logs no muestran errores de conexión.
2. Recorrido mínimo: registro → login → crear un recurso propio → cerrar sesión → volver a entrar → el recurso sigue ahí.
3. Permisos: un usuario no ve recursos de otro; `/api/admin/**` responde 403 a un usuario normal.
4. HTTPS en frontend y API; la cookie tiene `Secure`.
5. Atribución de OpenStreetMap visible en el mapa.
