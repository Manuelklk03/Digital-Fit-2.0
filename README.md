# Digital-Fit

Aplicación web para organizar el entrenamiento: encontrar centros deportivos y lugares públicos donde entrenar, guardar y seguir rutinas, registrar lo que haces y ver tu progreso.

> **Estado: en renovación hacia Digital-Fit 2.0.** La versión actual funciona en local con Docker. Todavía no hay una versión publicada en internet. El plan está en el [roadmap](docs/roadmap.md) y el punto exacto en [STATUS](docs/STATUS.md).

## Qué hace hoy

- **Cuenta**: registro, inicio y cierre de sesión. Roles de usuario y administrador.
- **Entrenamientos**: catálogo base, entrenamientos propios (creados desde cero o copiados del catálogo o de la comunidad), entrenamientos publicados por la comunidad e historial de entrenamientos realizados.
- **Lugares**: centros privados y lugares públicos con mapa (Leaflet + OpenStreetMap). Cada usuario guarda los suyos desde el mapa, con la dirección completada por geocodificación.
- **Progreso**: estadísticas de actividad y valoraciones.
- **Soporte**: tickets con conversación; los administradores los gestionan y pueden crear otros administradores.

## Tecnología

| Parte | Stack |
|---|---|
| Frontend | Angular 21, TypeScript 5.9, RxJS, Leaflet |
| Backend | Java 25, Spring Boot 4, Spring Security, Spring Data JPA |
| Base de datos | MySQL 8 |
| Entorno | Docker Compose, nginx |

Arquitectura y decisiones: [docs/architecture.md](docs/architecture.md).

## Ejecutar en local

Con Docker Desktop en marcha, desde la raíz del repositorio:

```bash
docker compose up --build
```

| Servicio | Dirección |
|---|---|
| Aplicación | http://localhost:4200 |
| API | http://localhost:8080 |
| MySQL | `localhost:3307` |

Para parar: `docker compose down`. La primera vez la base de datos se crea y se rellena sola con el catálogo de ejemplo; registra un usuario para entrar.

Ejecución sin Docker, variables de entorno y problemas frecuentes: [docs/deployment.md](docs/deployment.md).

## Estructura

```text
Backend/digital-fit/             API Spring Boot
Frontend/digital-fit-frontend/   Aplicación Angular
docs/                            Estado, roadmap, arquitectura, diseño, despliegue y flujos de trabajo
docker-compose.yml               MySQL + backend + frontend
```

## Contribuir

GitHub Flow: una rama por cambio y pull request hacia `main`. Detalle en [docs/git-workflow.md](docs/git-workflow.md). Si trabajas con un agente de IA, empieza por [AGENTS.md](AGENTS.md).

## Origen y versiones

Digital-Fit nació como proyecto final del ciclo de Desarrollo de Aplicaciones Web. Esa versión, con su documentación académica, se conserva en el tag [`v1.0.0`](https://github.com/Manuelklk03/Digital-Fit-Proyecto/tree/v1.0.0). Cambios: [CHANGELOG.md](CHANGELOG.md).

## Autor

**Manuel Casinos Pérez** · [GitHub](https://github.com/Manuelklk03) · [LinkedIn](https://www.linkedin.com/in/manuel-casinos-perez/)
