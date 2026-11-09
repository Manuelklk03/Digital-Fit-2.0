# Arquitectura de Digital-Fit

Este documento separa **lo que existe** (comprobado en el código el 2026-10-26, versión `v1.0.0`) de **lo que se quiere** en 2.0. Las decisiones se registran al final con su estado.

## 1. Visión general

```text
Navegador ──► Frontend Angular (SPA)
                 │  peticiones /api/... con cookie de sesión
                 ▼
            Backend Spring Boot ──► PostgreSQL 17
                 │
                 └──► Nominatim (geocodificación inversa)
Navegador ──► teselas de OpenStreetMap y Nominatim (búsqueda) directamente
```

En Docker Compose, nginx sirve el frontend en el puerto 4200 y reenvía `/api/` al backend (`backend:8080`). Así navegador y API comparten origen y la cookie de sesión funciona sin CORS.

## 2. Estado actual (v1.0.0)

### Versiones

| Pieza | Versión (archivos) |
|---|---|
| Angular / CLI | `^22.2.4` / `^22.2.5` |
| TypeScript | `~6.0.3` |
| RxJS | `~7.8.0` |
| Leaflet / leaflet-control-geocoder | `^1.9.4` / `^3.3.1` |
| Vitest (tests de Angular) | `^4.0.8` |
| Spring Boot (parent) | `4.1.2` |
| Java | `25` |
| PostgreSQL (Compose) | `17-alpine` |
| Node (Dockerfile del frontend) | `22-alpine` |

### Backend (`Backend/digital-fit`)

Paquete `com.example.digital_fit`, organizado por capas y, dentro de cada una, por dominio:

| Carpeta | Contenido |
|---|---|
| `config` | `SecurityConfig` (Spring Security), `CorsConfig` |
| `controller` | 17 controladores REST; los de administración en subcarpetas `Admin` |
| `dto` | DTOs de entrada (`Crear*`) y salida (`*DTO`) |
| `model` | Entidades JPA y enums (`Rol`, `NivelEntrenamiento`…) |
| `repository` | Repositorios Spring Data JPA |
| `service` | Lógica de negocio y comprobación de propiedad |
| `exception`, `handler` | Excepciones propias y `GlobalExceptionHandler` |

**Dominios y rutas de la API**

| Dominio | Rutas | Notas |
|---|---|---|
| Auth | `/api/auth/login`, `/registro`, `/me`, `/yo`, `/logout` | `login` y `logout` los gestiona Spring Security |
| Entrenamientos base | `/api/entrenamientos` | catálogo; gestión admin en `/api/admin/entrenamientos-base` |
| Mis entrenamientos | `/api/mis-entrenamientos` | copias propias de un entrenamiento base |
| Comunidad | `/api/entrenamientos-comunidad` | entrenamientos publicados por usuarios |
| Historial | `/api/entrenamientos/mi-historial` | entrenamientos realizados |
| Centros privados | `/api/centros-privados`, `/api/mis-centros-privados` | admin en `/api/admin/centros-privados-base` |
| Lugares públicos | `/api/lugares-publicos`, `/api/mis-lugares-publicos` | admin en `/api/admin/lugares-publicos-base` |
| Valoraciones | `/api/valoraciones` | |
| Estadísticas | `/api/estadisticas` | |
| Admin | `/api/admin` | crear administradores |

**Modelo de datos.** Patrón *base / de usuario*: un catálogo común (`EntrenamientoBase`, `CentroPrivadoBase`, `LugarPublicoBase`) y copias o registros propios del usuario (`EntrenamientoUsuario`, `CentroPrivadoUsuario`, `LugarPublicoUsuario`, `HistorialEntrenamientos`), todos con `@ManyToOne` hacia `Usuario`. Se eliminó el módulo de soporte y tickets (D13).

**Persistencia.** Hibernate crea y actualiza el esquema (`ddl-auto=update`); `data.sql` inserta el catálogo y dos usuarios de ejemplo (`admin1`, `usuario1`) con `INSERT IGNORE` en cada arranque. No hay migraciones versionadas. Las contraseñas de esos usuarios no figuran en el repositorio (solo sus hashes BCrypt).

**Autenticación y permisos.**

- Sesión de servidor con cookie (`JSESSIONID`): `formLogin` en `POST /api/auth/login` (formulario `username`/`password`), respuestas 200/401 en lugar de redirecciones.
- Contraseñas con `BCryptPasswordEncoder`.
- `/api/auth/**` público; `/api/admin/**` exige `ROLE_ADMIN` (además de `@PreAuthorize` en los controladores admin); el resto exige sesión.
- Propiedad de recursos: los servicios reciben `authentication.getName()` y lanzan `OperacionNoPermitida` (403) si el recurso no es del usuario.
- **CSRF desactivado** y **CORS fijo a `http://localhost:4200`** (`CorsConfig`).

**Errores.** `GlobalExceptionHandler` devuelve texto plano (400/403/404) y, para la validación de DTOs, un mapa `campo → mensaje`. No hay un formato de error único.

**Otros.** Actuator y Thymeleaf están en el `pom.xml` sin uso aparente en la API. Logs en `logs/digitalfit.log`. Un único test: `contextLoads` (necesita PostgreSQL).

### Frontend (`Frontend/digital-fit-frontend`)

- Componentes standalone; rutas en `app.routes.ts` (27 rutas) con cuatro guards: `publicGuard` (login/registro), `authGuard`, `userGuard` y `adminGuard`.
- Servicios HTTP por dominio en `src/app/services`. URL relativas (`/api/...`) y `withCredentials: true` en cada llamada; no hay interceptor. Varios servicios usan `any`.
- `AuthService` guarda el usuario en un `BehaviorSubject`.
- Estilos en CSS por componente y `styles.css` global (718 líneas). Sin sistema de diseño ni librería de componentes.
- Tests: los `.spec.ts` generados por Angular CLI, con Vitest.
- `index.html` declara `lang="en"` aunque la interfaz está en español.

### Mapas y geocodificación

- `mapa-selector` usa Leaflet con teselas de `tile.openstreetmap.org` y busca direcciones llamando a `nominatim.openstreetmap.org/search` **desde el navegador**.
- El backend completa direcciones con `nominatim.openstreetmap.org/reverse`, enviando un `User-Agent` propio.
- Las [políticas de uso de las teselas de OSM](https://operations.osmfoundation.org/policies/tiles/) y de [Nominatim](https://operations.osmfoundation.org/policies/nominatim/) limitan el uso intensivo (Nominatim: máximo 1 petición por segundo, identificación de la aplicación, sin autocompletado por pulsación) y exigen atribución visible. Antes de publicar se revisará su cumplimiento (fase 4).

### Docker

`docker-compose.yml` levanta `postgres:17-alpine` (puerto 5433 en el host, credenciales de `.env` o `digitalfit` en desarrollo), backend (8080) y frontend con nginx (4200 → 80). Los `context` usan `/`, válidos en Windows, Linux y macOS.

### Problemas detectados (no corregidos todavía)

| # | Problema | Dónde | Fase |
|---|---|---|---|
| P1 | `npm start` no tiene proxy hacia el backend: con `ng serve` las llamadas `/api` van a `localhost:4200` (sin comprobar en ejecución) | `angular.json` | 4 |
| P2 | CSRF desactivado con autenticación por cookie | `SecurityConfig` | 4 |
| P3 | CORS con origen fijo; sin configuración por entorno | `CorsConfig` | Resuelto en 4.1 (`CORS_ALLOWED_ORIGINS`) |
| P4 | `ddl-auto=update` y `data.sql` en cada arranque, `continue-on-error=true`; sin migraciones | `application.properties` | Resuelto en 4.4 (Flyway V1, V2, V3) |
| P5 | Errores de la API sin formato común (texto o mapa) | `GlobalExceptionHandler` | Resuelto en 4.3 (`ProblemDetail` RFC 7807) |
| P6 | Sin paginación en ningún listado | servicios/repositorios | 4 |
| P7 | `any` en servicios y modelos del frontend | `src/app/services` | 5 |
| P10 | `show-sql=true` y logs DEBUG por defecto | `application.properties` | Resuelto en 4.7 (perfiles dev y prod) |
| P11 | Búsqueda Nominatim desde el navegador sin limitación ni atribución revisada | `mapa-selector` | Resuelto en 3.7 (proxy en backend) |
| P12 | Imágenes sueltas o sin uso aparente (`public/img/.png`, `e.ico`, `e2.ico`) | `public/` | 5 |
| P13 | Endpoint duplicado `/api/auth/yo` y `/me` | `AuthController` | Resuelto en 4.1 (eliminado `/yo`) |

## 3. Arquitectura objetivo (2.0)

Propuesta; cada punto se confirma en su fase.

- **Mismo stack**: Angular, TypeScript, Spring Boot. La base de datos pasa a PostgreSQL (D4).
- **Despliegue separado**: frontend estático en un CDN, backend en un contenedor y base de datos gestionada (fase 2).
- **Configuración por entornos**: `dev` para desarrollo local; `staging` para validar cambios con base de datos y secretos propios; `prod` para la aplicación pública. Cada entorno tendrá sus variables para base de datos, orígenes permitidos y cookies. La viabilidad de mantener staging y producción en planes gratuitos se comprobará antes del despliegue; todavía no hay entornos remotos creados.
- **Autenticación**: se conserva la sesión con cookie y se propone que Netlify reenvíe `/api/*` a Render, de modo que el navegador use el origen del frontend. La cookie debe ser de primera parte, `Secure` y sin atributo `Domain`; se activará la protección CSRF antes de publicar. La transmisión de `Set-Cookie`, la sesión y CSRF se validarán en la prueba 2.4 (D2). No hay despliegue público todavía.
- **API**: errores con `ProblemDetail` (RFC 9457, soportado por Spring), paginación en los listados, validación completa de DTOs y tests de integración de permisos.
- **Datos**: migraciones versionadas (Flyway) y datos de demostración separados del esquema.
- **Frontend**: modelos tipados, interceptor HTTP para credenciales y errores, estados de carga/error/vacío, sistema de diseño propio ([design-system.md](design-system.md)) y rutas cargadas bajo demanda (`loadComponent`).

## 4. Registro de decisiones

| ID | Decisión | Motivo | Consecuencias | Estado |
|---|---|---|---|---|
| D1 | GitHub Flow sin `develop` | Proyecto individual; `main` siempre estable | Toda modificación entra por PR | Aceptada (2026-10-26) |
| D2 | Mantener la sesión por cookie mediante el proxy `/api` de Netlify | El navegador llamará al origen del frontend, mientras Netlify reenviará las peticiones a Render; evita depender de cookies de terceros entre dominios | Cookie `Secure` sin `Domain`; activar CSRF antes de publicar. Comprobar `Set-Cookie`, login, logout y permisos en la prueba 2.4; si falla, revisar el modelo antes de desplegar | Elegida para la prueba (2026-11-03); no implementada ni verificada |
| D3 | Flyway para el esquema | `ddl-auto=update` no es reproducible ni seguro en producción | Hay que generar la migración inicial desde el esquema actual | Propuesta (fase 4) |
| D4 | Migrar de MySQL a PostgreSQL | Más opciones gratuitas gestionadas (Neon, Supabase, Render) y estándar actual | Cambian driver, URL, imagen de Compose y los `INSERT IGNORE` de `data.sql` (→ `ON CONFLICT DO NOTHING`); las consultas nativas son SQL estándar. Tarea 1.9 | Aceptada (2026-11-01) |
| D5 | Materiales académicos fuera de 2.0, conservados en `v1.0.0` | La rama de trabajo debe ser un proyecto profesional | Se consultan con `git show v1.0.0` | Aceptada (2026-10-26) |
| D6 | Librerías de UI compatibles con Angular (sin React) | Evitar dos frameworks en el cliente | shadcn/ui y React Bits solo como referencia visual | Aceptada (2026-10-26) |
| D7 | SonarQube Cloud para el análisis de calidad | Gratis en repositorios públicos y accesible desde GitHub Actions (un SonarQube local no lo es) | Token `SONAR_TOKEN` como secreto de GitHub; Quality Gate como check de PR | Aceptada y aplicada (2026-11-01): Quality Gate *Sonar way* (80 % de cobertura en código nuevo) |
| D8 | Imágenes publicadas en Docker Hub desde GitHub Actions | Despliegue reproducible a partir de imágenes versionadas | Token de Docker Hub como secreto de GitHub, nunca en el repositorio | Aceptada (2026-11-01) |
| D9 | Probar frontend Angular en Netlify, backend Spring Boot en Render desde Docker Hub y PostgreSQL en Neon | [Netlify admite proxy a una API externa](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/); Render y Neon ofrecen planes gratuitos sin la caducidad de una prueba temporal ([comparativa](deployment.md#4-despliegue-público-fase-2)) | `/api/*` se reenviará desde Netlify a Render; habrá que medir si Java 25 cabe en los 512 MB de Render y vigilar los créditos de Netlify y las cuotas de Neon. El *deploy hook* queda para cuando se despliegue | Elección documental provisional (2026-11-03); sin cuentas, configuración ni despliegue |
| D10 | Búsqueda de lugares con datos de OpenStreetMap (Overpass) a través del backend, y mapa Leaflet Dark Matter | Gratis y sin tarjeta; incluye zonas de calistenia; Google Places exige facturación y prohíbe sus datos en mapas que no sean de Google | Implementado en 3.7 con ExploracionOsmService (fusión con BD local, rate limit de 1s y caché geográfica) y GeocodificacionService (proxy Nominatim sin llamadas cliente) | Aceptada e implementada (3.7, 2026-11-05) |
| D11 | Interfaz multilingüe: español (por defecto), valenciano, inglés y francés | Portfolio, público de Valencia y proyección internacional | Servicio reactivo I18nService en Angular con Signals, diccionarios tipados desacoplados en src/app/i18n, persistencia en localStorage y selector accesible en cabecera | Aceptada y aplicada (2026-11-06; tarea 3.8) |
| D12 | Modelo de entrenamiento interactivo (series, repeticiones, peso, cronómetro) y gamificación (metas, retos, amigos) | Evolución de CRUD estático a asistente deportivo real | Cambian las entidades de entrenamiento e historial, y se añade lógica de retos y marcas personales | Aceptada (2026-11-03) |
| D13 | Retirar módulo de tickets de soporte y consolidar 27 rutas en 5 vistas | Reducir deuda técnica, eliminar duplicación de pantallas espejo y enfocar la app a producto fitness real | Se eliminan rutas y controladores de soporte; la app se centra en Dashboard, Entrenar, Explorar, Progreso y Perfil | Aceptada y completada (2026-11-09) |
| D14 | Tokens de diseño desacoplados («Neutral Sport») | Permitir avanzar en lógica y componentes sin bloquear por la decisión final de la paleta/tema | Variables CSS semánticas en :root que permiten cambiar el tema visual modificando pocas líneas | Aceptada (2026-11-03) |
| D15 | Portada `/inicio` con animación al hacer scroll (GSAP ScrollTrigger y Lenis, skill `cinematic-scroll-storytelling`); sin Three.js ni vídeo por scroll | La portada explica el producto por secciones y es la única página larga; el resto de pantallas son herramientas de uso diario y el mapa será MapLibre (D10) | Condiciones: (1) después de cerrar 3.3 y 3.4; (2) solo en `/inicio`, con carga diferida, para que el resto de pantallas no paguen el peso; (3) alternativa estática con `prefers-reduced-motion`; (4) contenido en HTML real, no en canvas, para que la prerenderización de 3.9 lo indexe; (5) medir el peso real de las librerías al instalarlas contra el presupuesto de 500 kB (aviso) y 1 MB (error) del bundle inicial | Aplicada (2026-11-06; tarea 3.5) |
