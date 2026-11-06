# Despliegue — Digital-Fit

Estado: **solo ejecución local**. No hay despliegue público. Netlify + Render + Neon es la propuesta documental para una prueba futura; staging y producción se prepararán antes del despliegue ([roadmap.md](roadmap.md#fase-2--viabilidad-del-despliegue-gratuito)).

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
| Frontend (nginx) | http://localhost:4200 | nginx (puerto 8080 dentro del contenedor, sin root) reenvía `/api/` al backend |
| Backend | http://localhost:8080 | /actuator/health responde `{"status":"UP"}` sin sesión; el resto de Actuator está protegido |
| PostgreSQL 17 | `localhost:5433` | base `digital_fit`; usuario y contraseña de `.env` o `digitalfit` |

Al arrancar, Flyway aplica automáticamente las migraciones versionadas (`V1__esquema_inicial.sql`, `V2__catalogos_base.sql` y `V3__usuarios_demo.sql`). En desarrollo `ddl-auto=update` y en producción `ddl-auto=validate` (D3, P4). Los usuarios de demostración iniciales con credenciales documentadas (tarea 4.5) son:

| Usuario | Contraseña | Rol | Finalidad |
|---|---|---|---|
| `admin1` | `Admin123!` | `ADMIN` | Gestión global del catálogo base y tickets de soporte (`/api/admin/**`) |
| `usuario1` | `Usuario123!` | `USER` | Pruebas de deportista: rutinas propias, mapas, favoritos e historial |

Consultar la base de datos: `docker exec -it digital-fit-postgres psql -U digitalfit -d digital_fit`.

## 2. Ejecución local sin Docker

Requisitos: JDK 25, Node.js `^22.22.3`, `^24.15.0` o `>=26` (lo exige Angular CLI 22) con npm y PostgreSQL en marcha. Lo más sencillo es levantar solo la base con Compose: `docker compose up -d postgres`.

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
| El navegador recibe 502 al arrancar | Antes del healthcheck, nginx recibía peticiones antes de que Spring estuviera listo | Ya no ocurre: Compose arranca el frontend solo cuando `/actuator/health` del backend responde. Si falla, mira `docker compose ps` y `docker compose logs backend` |
| El backend no conecta con PostgreSQL | Base parada o credenciales distintas | `docker compose up -d postgres`; revisa `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. Si cambiaste `.env` después de crear el volumen, PostgreSQL conserva el usuario antiguo: `docker compose down -v` (borra los datos) |
| Tablas o datos base no aparecen | Error en JPA o en `data.sql` (los errores de `data.sql` se ignoran por `continue-on-error=true`) | Revisa la consola del backend y `logs/digitalfit.log` |
| El frontend no arranca | Faltan dependencias | `npm ci` en `Frontend/digital-fit-frontend` |
| El frontend no recibe datos | Backend parado, otro puerto, CORS (solo admite `http://localhost:4200`) o falta de proxy en `ng serve` | Arranca el backend en 8080; usa Docker Compose |
| Puerto ocupado (5433, 4200, 8080) | Otra aplicación lo usa | Ciérrala o cambia el puerto en `docker-compose.yml` |
| `docker` no conecta con la API | Docker Desktop no está iniciado | Inicia Docker Desktop y espera a que el motor esté listo |

## 4. Despliegue público (fase 2)

Objetivo: frontend, backend y base de datos en planes **gratuitos** (no pruebas temporales ni de pago), con autenticación y persistencia reales.

Consulta de documentación oficial: **2026-11-03**. Los límites pueden cambiar. «Sin caducidad publicada» describe el plan consultado; no garantiza que el proveedor mantenga sus condiciones. Para el frontend estático, CPU, RAM y suspensión del servidor Java no aplican: Spring Boot necesita un servicio aparte.

### Frontend estático

| Proveedor | Plan y límites | Tarjeta, caducidad y encaje |
|---|---|---|
| [Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/) | Free: 500 compilaciones/mes, una simultánea, 20 min por compilación, 20 000 archivos y 25 MiB por archivo. [Node.js del entorno de compilación](https://developers.cloudflare.com/pages/configuration/build-image/) configurable. | Sin caducidad publicada; tarjeta no confirmada en la documentación consultada. [Admite Angular y vistas previas de PR](https://developers.cloudflare.com/pages/framework-guides/deploy-an-angular-site/). Entrega global. [Su archivo `_redirects` no admite proxy a dominios externos](https://developers.cloudflare.com/pages/configuration/redirects/); haría falta una Function o un Worker. |
| [Netlify](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) | Free: 300 créditos/mes, límite estricto; [15 créditos por despliegue de producción y 20 por GB servido](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/). Un build simultáneo y CDN global. | Plan de $0 sin caducidad publicada y sin recarga automática. Con el límite, el sitio puede pausarse hasta el siguiente ciclo. Tarjeta no confirmada para la cuenta actual; los planes anteriores al 4-9-2025 usan condiciones distintas. |
| [Vercel](https://vercel.com/docs/plans/hobby) | Hobby: gratis; 100 GB de transferencia rápida y [100 despliegues/día](https://vercel.com/docs/limits). Entrega global. | Sin caducidad fija, pero el plan se [limita al uso personal no comercial](https://vercel.com/legal/terms). La aptitud de este portfolio para Hobby y el proxy `/api` se deben confirmar antes de elegirlo. Tarjeta no confirmada. |
| [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | Disponible en repositorios públicos con GitHub Free; [sitio ≤1 GB, límite flexible de 100 GB/mes y 10 builds/h](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). | Sin caducidad publicada ni tarjeta documentada. Solo sirve archivos estáticos; no ofrece el proxy `/api` previsto en D9. Habría que cambiar la estrategia de sesión y CORS o usar otro proxy. |

### Backend Java en contenedor

| Proveedor | Plan y límites | Tarjeta, caducidad y encaje |
|---|---|---|
| [Render](https://render.com/docs/free) | Web Service Free: [512 MB RAM](https://render.com/pricing), 750 horas de instancia/mes por workspace. Se duerme tras 15 min sin tráfico y tarda alrededor de 1 min en despertar. Sistema de archivos efímero; admite imágenes Docker. | Sin caducidad fija publicada para el servicio web. Sin método de pago, el exceso de ancho de banda suspende servicios hasta el mes siguiente. Hay que medir si Spring Boot 4 con Java 25 cabe en 512 MB. Región concreta por elegir. |
| [Koyeb](https://www.koyeb.com/docs/reference/instances) | Una instancia Free por organización: 0,1 vCPU, 512 MB RAM y 2 GB SSD; Frankfurt o Washington. [Escala a cero tras 1 hora sin tráfico](https://www.koyeb.com/docs/run-and-scale/scale-to-zero). | [Exige tarjeta y hace una retención temporal de $29 para validarla](https://www.koyeb.com/docs/faqs/pricing). Sin caducidad fija publicada. La CPU y memoria son ajustadas para este backend; requiere prueba real. |
| [Fly.io](https://fly.io/docs/about/free-trial/) | Prueba de 7 días o 2 horas de VM, lo que se agote antes. | **Descartado como plan gratuito permanente**: al terminar la prueba, las aplicaciones se detienen hasta configurar facturación. |
| [Google Cloud Run](https://cloud.google.com/run/pricing) | Cuota gratuita mensual con facturación por petición: 180 000 vCPU-s, 360 000 GiB-s y 2 millones de peticiones (base de precios de `us-central1`). Escala a cero; las instancias no conservan archivos locales. Madrid figura entre las regiones, pero el coste depende de la región. | [Requiere cuenta de facturación](https://cloud.google.com/run/docs/quickstarts/deploy-container). La cuota gratuita no es un tope de gasto: puede haber cargos por exceso o red. Sin caducidad publicada para la cuota. No cumple la condición de coste garantizado cero sin controles adicionales. |

### PostgreSQL gestionado

| Proveedor | Plan y límites | Tarjeta, caducidad y encaje |
|---|---|---|
| [Neon](https://neon.com/pricing) | Free: 1 GB por proyecto, 100 CU-h/mes por proyecto y 5 GB de transferencia. El cómputo escala a cero tras 5 min de inactividad y vuelve con la siguiente consulta; los datos permanecen. | Sin tarjeta ni límite temporal. Si se agotan horas o transferencia, se suspende el cómputo hasta el siguiente ciclo. Región por elegir según el backend. Es el candidato más prometedor para la prueba 2.4. |
| [Supabase](https://supabase.com/pricing) | Free: 500 MB de base de datos por proyecto, 2 proyectos activos y 5 GB de salida. [Puede pausar el proyecto tras una semana de poca actividad](https://supabase.com/docs/guides/platform/free-project-pausing). | Sin caducidad fija publicada; tarjeta no confirmada. La pausa exige restauración y perjudica una demo pública poco visitada. Región por elegir. |
| [Render Postgres](https://render.com/docs/free) | Free: 1 GB, una base por workspace y sin copias de seguridad. | **Descartado para persistencia duradera**: expira a los 30 días y sus datos se eliminan tras otros 14 días si no se actualiza al plan de pago. |

**Propuesta documental (2.2):** [Netlify permite reenviar `/api/*` a una API externa](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), por lo que se propone para Angular junto con Render para Spring Boot y Neon para PostgreSQL. El navegador usaría el origen de Netlify y mantendría la sesión mediante una cookie de primera parte. Esta combinación no está desplegada ni verificada: antes del despliegue final habrá que preparar staging y producción por separado y probar en URLs reales memoria, arranque, proxy, `Set-Cookie`, CSRF, permisos, persistencia y coste de ambos entornos. No se han creado cuentas ni servicios.

Puntos que condicionan la elección:

- **Memoria**: Spring Boot con Java 25 necesita normalmente varios cientos de MB; hay que medirlo con la configuración real.
- **Sesión por cookie**: el proxy `/api/*` propuesto permite que el navegador llame al origen del frontend. Hay que comprobar que transmite `Set-Cookie` y que la cookie de primera parte funciona; CSRF debe activarse antes de publicar (decisión D2). Si se prescinde del proxy y el navegador llama a otro dominio, habrá que rediseñar la configuración de cookies y CORS.
- **Suspensión**: un backend que se duerme tarda en responder a la primera petición; la interfaz debe mostrar un estado de carga honesto.

## 5. Verificación de un despliegue

1. Backend: un endpoint de salud responde (por ejemplo `/actuator/health`, si se expone) y los logs no muestran errores de conexión.
2. Recorrido mínimo: registro → login → crear un recurso propio → cerrar sesión → volver a entrar → el recurso sigue ahí.
3. Permisos: un usuario no ve recursos de otro; `/api/admin/**` responde 403 a un usuario normal.
4. HTTPS en frontend y API; la cookie tiene `Secure`.
5. Atribución de OpenStreetMap visible en el mapa.
