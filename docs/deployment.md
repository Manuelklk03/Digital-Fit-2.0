# Despliegue — Digital-Fit

Estado: **solo ejecución local**. No hay despliegue público todavía; el alojamiento gratuito se estudia en la fase 2 ([roadmap.md](roadmap.md#fase-2--viabilidad-del-despliegue-gratuito)).

## 1. Ejecución local con Docker (recomendada)

Requisitos: Docker Desktop **en marcha** (si no, `docker` responde «failed to connect to the docker API»).

```bash
docker compose up --build      # desde la raíz del repositorio
docker compose down            # parar (los datos de PostgreSQL se conservan en el volumen)
docker compose down -v         # parar y BORRAR los datos de PostgreSQL
```

Credenciales: sin `.env`, Compose usa `digitalfit`/`digitalfit` (solo desarrollo). Para cambiarlas, copia `.env.example` como `.env` en la raíz y edítalo; `.env` no se versiona.

| Servicio | URL / puerto | Notas |
|---|---|---|
| Frontend (nginx) | http://localhost:4200 | nginx reenvía `/api/` al backend |
| Backend | http://localhost:8080 | |
| PostgreSQL 17 | `localhost:5433` | base `digital_fit`; usuario y contraseña de `.env` o `digitalfit` |

Al arrancar, Hibernate crea o actualiza las tablas a partir de las entidades (`ddl-auto=update`) y `data.sql` inserta el catálogo base y dos usuarios de ejemplo (`admin1` y `usuario1`) con `ON CONFLICT DO NOTHING`, así que reiniciar no duplica datos. Las contraseñas de esos usuarios no están documentadas en el repositorio; para probar, registra un usuario nuevo desde la aplicación.

Consultar la base de datos: `docker exec -it digital-fit-postgres psql -U digitalfit -d digital_fit`.

## 2. Ejecución local sin Docker

Requisitos: JDK 25, Node.js `^20.19`, `^22.12` o `>=24` (lo exige Angular CLI 21) con npm y PostgreSQL en marcha. Lo más sencillo es levantar solo la base con Compose: `docker compose up -d postgres`.

**Base de datos.** La conexión se configura con variables de entorno; si no existen, se usan los valores por defecto de `application.properties`, que apuntan al PostgreSQL de Compose:

| Variable | Por defecto |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/digital_fit` |
| `DB_USERNAME` | `digitalfit` |
| `DB_PASSWORD` | `digitalfit` |

**Backend**

```bash
cd Backend/digital-fit
mvnw.cmd spring-boot:run        # Windows, CMD
.\mvnw.cmd spring-boot:run      # Windows, PowerShell
sh ./mvnw spring-boot:run       # Linux/macOS/Git Bash
```

En Linux/macOS también funciona `./mvnw` (es ejecutable desde la tarea 1.6).

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
| El backend no conecta con PostgreSQL | Base parada o credenciales distintas | `docker compose up -d postgres`; revisa `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. Si cambiaste `.env` después de crear el volumen, PostgreSQL conserva el usuario antiguo: `docker compose down -v` (borra los datos) |
| Tablas o datos base no aparecen | Error en JPA o en `data.sql` (los errores de `data.sql` se ignoran por `continue-on-error=true`) | Revisa la consola del backend y `logs/digitalfit.log` |
| El frontend no arranca | Faltan dependencias | `npm ci` en `Frontend/digital-fit-frontend` |
| El frontend no recibe datos | Backend parado, otro puerto, CORS (solo admite `http://localhost:4200`) o falta de proxy en `ng serve` | Arranca el backend en 8080; usa Docker Compose |
| Puerto ocupado (5433, 4200, 8080) | Otra aplicación lo usa | Ciérrala o cambia el puerto en `docker-compose.yml` |
| `docker` no conecta con la API | Docker Desktop no está iniciado | Inicia Docker Desktop y espera a que el motor esté listo |

## 4. Despliegue público (fase 2)

Objetivo: frontend, backend y base de datos en planes **gratuitos** (no pruebas temporales ni de pago), con autenticación y persistencia reales.

Para cada candidato se registrará, a partir de su documentación oficial y con fecha de consulta: límites de CPU y memoria, suspensión por inactividad y tiempo de arranque, persistencia, si pide tarjeta, caducidad del plan y región.

| Parte | Candidatos a evaluar | Datos verificados |
|---|---|---|
| Frontend estático | Cloudflare Pages, Netlify, Vercel, GitHub Pages | _pendiente_ |
| Backend (contenedor Java) | Render, Koyeb, Fly.io, Google Cloud Run | _pendiente_ |
| PostgreSQL | Neon, Supabase, Render Postgres | _pendiente_ |

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
