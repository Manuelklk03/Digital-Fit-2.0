# Flujo de Git — Digital-Fit

Digital-Fit usa **GitHub Flow**, el mismo flujo que ValveDex. No hay rama `develop` ni Git Flow.

## Reglas

1. `main` es la rama estable. No se trabaja directamente en ella.
2. Una rama por funcionalidad, corrección o cambio lógico, creada desde `main` actualizada.
3. Prefijos: `feature/`, `fix/`, `refactor/`, `docs/`, `test/`, `chore/`. Nombre corto en inglés y kebab-case: `feature/workout-history`, `fix/cors-origins`.
4. Commits pequeños y coherentes con [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).
5. Push de la rama y PR hacia `main`.
6. Revisión y comprobaciones antes del merge (ver [Checklist de PR](#checklist-de-pr)).
7. Merge con commit de merge y borrado de la rama integrada.
8. Vuelta a `main` y `git pull --ff-only`.

Criterio: una rama = un cambio completo. En los pasos intermedios, commit y `git push`; la PR se crea al terminar.

## Comandos

```bash
git switch main
git pull --ff-only
git switch -c feature/<nombre>

# ... trabajo y commits ...

git push -u origin feature/<nombre>      # la primera vez; después, git push
gh pr create --base main --fill
# revisar la PR y las comprobaciones
gh pr merge --merge --delete-branch --subject "<título del merge>" --body-file .git/MERGE_BODY.txt
git switch main
git pull --ff-only
```

- Es `gh pr`, no `git pr`. En Git Bash, si no encuentra `gh`: `export PATH="$PATH:/c/Program Files/GitHub CLI"`.
- El cuerpo del merge se guarda en `.git/MERGE_BODY.txt` (Git no versiona `.git`); en CMD/PowerShell, `notepad .git\MERGE_BODY.txt`.
- `git pull --ff-only` falla en lugar de crear un merge local si `main` local y remota han divergido. Así se detecta antes de mezclar nada por accidente.

## Mensajes de commit

El agente redacta el mensaje completo; Manuel hace el commit, salvo que pida expresamente que lo haga el agente.

Formato: título Conventional Commits en español, línea en blanco y lista breve con `- ` (las líneas que continúan un punto, sangradas con dos espacios).

```text
feat(entrenamientos): añadir paginación al historial

- El endpoint /api/entrenamientos/mi-historial acepta page y size.
- El frontend muestra controles de página y estado vacío.
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`, `ci`, `perf`. Ámbitos habituales: `auth`, `entrenamientos`, `centros`, `lugares`, `soporte`, `admin`, `mapa`, `api`, `ui`, `deploy`, `docs`.

## Checklist de PR

La plantilla está en [.github/pull_request_template.md](../.github/pull_request_template.md). Solo se exigen las comprobaciones que hoy se pueden ejecutar:

| Parte | Comando | Desde |
|---|---|---|
| Frontend: build | `npm run build` | `Frontend/digital-fit-frontend` |
| Frontend: tests | `npx ng test --watch=false` | `Frontend/digital-fit-frontend` |
| Frontend: lint | `npm run lint` (0 errores; los avisos de `any` y OnPush son deuda conocida) | `Frontend/digital-fit-frontend` |
| Backend: compilar | `mvnw.cmd -DskipTests package` (CMD), `.\mvnw.cmd …` (PowerShell) o `sh ./mvnw …` (Git Bash/Linux/macOS) | `Backend/digital-fit` |
| Backend: tests | `mvnw.cmd test` (mismas variantes) — el único test (`contextLoads`) necesita PostgreSQL accesible (`docker compose up -d postgres`) | `Backend/digital-fit` |
| Todo junto | `docker compose up --build` | raíz |

Sin Java local, el backend se compila con Docker:

```bash
docker run --rm -v "%cd%:/src:ro" maven:3.9.15-eclipse-temurin-25-alpine sh -c "cp -r /src /app && cd /app && mvn -q -B -DskipTests package"
```

Y los tests, contra el PostgreSQL de Compose (`docker compose up -d postgres` antes). El volumen `digitalfit-m2` guarda las dependencias de Maven entre ejecuciones:

```bash
docker run --rm --network digital-fit-proyecto_default -v "%cd%:/src:ro" -v digitalfit-m2:/root/.m2 -e DB_URL=jdbc:postgresql://postgres:5432/digital_fit maven:3.9.15-eclipse-temurin-25-alpine sh -c "cp -r /src /app && cd /app && mvn -B test"
```

(ejecutado en CMD desde `Backend/digital-fit`; en Git Bash, `MSYS_NO_PATHCONV=1` y `$(pwd -W)` en lugar de `%cd%`).

**CI (GitHub Actions).** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) ejecuta en cada PR hacia `main`, en cada push a `main` y a mano (pestaña *Actions → CI → Run workflow*) dos jobs en paralelo:

| Job | Qué hace |
|---|---|
| `Backend (Maven)` | Java 25 y `./mvnw -B verify` contra un PostgreSQL 17 levantado como *service container*; cobertura con JaCoCo |
| `Frontend (Angular)` | Node 22, `npm ci`, tests con cobertura (`lcov`) y `npm run build` |
| `Frontend (lint)` | Node 22, `npm ci` y `npm run lint` (ESLint): falla con errores, los avisos no bloquean |
| `SonarQube` | Espera a los dos primeros (`needs`), descarga sus informes (artefactos) y analiza el proyecto en SonarQube Cloud con `sonar-project.properties`. En las PR falla si el Quality Gate falla (bloquea el merge); en `main` solo actualiza el panel y la insignia, sin romper la CI |
| `Docker (compose)` | Construye las imágenes y levanta la aplicación completa con `docker compose up`; prueba de humo: la API responde 401 sin sesión a través de nginx, se sirven las rutas de Angular y ningún contenedor se ejecuta como root |
| `Publicar imagen backend` / `frontend` | Solo en push a `main` o tag `v*`, con todo lo anterior en verde (salvo Sonar, que no bloquea en `main`): sube a Docker Hub `<usuario>/digital-fit-backend` y `<usuario>/digital-fit-frontend` con las etiquetas `latest`, `sha-xxxxxxx` y la versión del tag (`v2.0.0` → `2.0.0`). Usa los secretos `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`; en las PR aparece como *skipping* |

El resultado aparece en la PR como checks. Ver una ejecución desde la terminal: `gh pr checks <número> --watch` o `gh run view <id> --log`.

**SonarQube Cloud.** Proyecto `Manuelklk03_Digital-Fit-Proyecto` en la organización `manuelklk03`; token en el secreto `SONAR_TOKEN`. Quality Gate *Sonar way* (decisión de Manuel, 2026-11-01): el **código nuevo** de cada PR no puede añadir bugs ni vulnerabilidades, debe tener los *Security Hotspots* revisados, menos de un 3 % de duplicación y **al menos un 80 % de cobertura**. La deuda de la v1 no bloquea, pero cada línea nueva con lógica necesita tests. Sonar no aplica las condiciones de cobertura y duplicación si el código nuevo tiene menos de 20 líneas. El Quality Gate de `main` mide el código nuevo desde la fecha de referencia de Sonar (*New Code*), hoy el primer análisis del 2026-11-01 01:23; el primer análisis completo de `main` lo suspendió (cobertura 72 %, duplicación 11,4 %) porque cuenta como nuevo todo lo cambiado ese día. Resultados: en el comentario que Sonar deja en la PR o en `https://sonarcloud.io/dashboard?id=Manuelklk03_Digital-Fit-Proyecto`.

Cobertura en local:

```bash
cd Frontend/digital-fit-frontend && npm test -- --watch=false --coverage   # informe en coverage/
# Backend: mvn verify (comando con Docker más arriba) → target/site/jacoco/index.html
```

## Versionado

Versionado semántico con tags **anotados** y GitHub Releases, creados solo sobre `main` estable.

| Versión | Significado |
|---|---|
| `v1.0.0` | Proyecto original de DAW, tal como se entregó. Commit `218f26d` (merge de la PR #22). No validado para producción. |
| `v2.0.0-alpha.N` / `-beta.N` | Opcionales: hitos de la renovación publicados en una URL de prueba. |
| `v2.0.0` | Renovación estable, desplegada y verificada (fase 7 del roadmap). |
| `v2.x.y` | Funcionalidades (`x`) y correcciones (`y`) posteriores. |

Crear una versión (cuando Manuel lo indique):

1. Rama `docs/release-vX.Y.Z`: mover «Sin publicar» del CHANGELOG a `## [X.Y.Z] — AAAA-MM-DD`, actualizar `docs/STATUS.md` y, si procede, las versiones de `package.json` y `pom.xml`. PR y merge.
2. `git switch main && git pull --ff-only`.
3. `git tag -a vX.Y.Z -m "vX.Y.Z — <resumen>"`.
4. `git push origin vX.Y.Z` (los tags no viajan con un `git push` normal).
5. `gh release create vX.Y.Z --title "vX.Y.Z — <resumen>" --notes-file <notas>.md`.

Un tag publicado no se mueve ni se sobrescribe. Si una versión sale mal, se publica otra (`vX.Y.Z+1`).

## Versión original `v1.0.0`

- Commit: `218f26d` (`218f26dfe10c0f939b16af5b73d1cd1d28ece050`, «Merge: docs: guías de la defensa y README (#22)»), último de `main` antes de la preparación de 2.0. Su contenido es idéntico al del último commit original, `3868b7b`. Contiene el código original y todos los materiales académicos (memoria, guía del centro, manuales, presentación de defensa y guías de preparación).
- Tag anotado `v1.0.0` publicado en `origin`.

Consultar o recuperar:

```bash
git fetch --tags
git show v1.0.0 --stat                          # datos del tag y del commit
git switch --detach v1.0.0                      # ver el proyecto original (sin rama)
git switch main                                 # volver
git switch -c rescate/v1 v1.0.0                 # rama a partir de la versión original
git restore --source v1.0.0 -- "Documentacion"  # traer una carpeta concreta al árbol actual
git archive --format=zip -o digital-fit-v1.0.0.zip v1.0.0   # copia comprimida
```

En GitHub: **Tags → v1.0.0 → Download ZIP**.

## Configuración del repositorio

**Aplicada el 2026-11-01** (verificada con la respuesta de la API): solo merge commits, borrado de ramas al fusionar y `main` protegida (solo por PR, también para administradores, sin force push ni borrado). Desde entonces, cualquier cambio en `main`, incluida la documentación, entra por PR.

**Checks obligatorios (tarea 1B.3, 2026-11-01).** Una PR solo se puede fusionar con los cinco checks de la CI en verde (`Backend (Maven)`, `Frontend (Angular)`, `Frontend (lint)`, desde 1B.4 `SonarQube` y desde 1B.5 `Docker (compose)`) y con la rama al día con `main` (`strict`). Los checks están ligados a la app de GitHub Actions (`app_id` 15368), así que ningún otro servicio puede publicar un check con el mismo nombre. Comprobado con una PR de prueba (#32) con un `debugger;`: el lint falló, la PR quedó `BLOCKED` y `gh pr merge` se negó a fusionarla. Si `main` avanza mientras tu PR está abierta: `gh pr update-branch <número>` (o el botón *Update branch*) y esperar a que la CI vuelva a pasar.

Si se cambia el nombre de un job en `ci.yml`, hay que actualizar también esta lista; si no, GitHub esperará un check que ya no existe y bloqueará todas las PR.

Comandos usados, por si hay que repetirlos en otro repositorio:

```bash
# Borrar la rama al fusionar y permitir solo merge commits
gh api -X PATCH repos/Manuelklk03/Digital-Fit-Proyecto -F delete_branch_on_merge=true -F allow_squash_merge=false -F allow_rebase_merge=false

# Proteger main: solo por PR (0 aprobaciones) y con los checks de la CI, también para administradores, sin force push ni borrado
gh api -X PUT repos/Manuelklk03/Digital-Fit-Proyecto/branches/main/protection --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "Backend (Maven)", "app_id": 15368 },
      { "context": "Frontend (Angular)", "app_id": 15368 },
      { "context": "Frontend (lint)", "app_id": 15368 },
      { "context": "SonarQube", "app_id": 15368 },
      { "context": "Docker (compose)", "app_id": 15368 }
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

# Local: merges a main siempre con commit de merge
git config branch.main.mergeoptions --no-ff
```

## Historial reconstruido (2026-10-26)

Hasta el 2026-10-26, `main` tenía 167 commits en línea recta, sin ramas ni PR. A petición de Manuel, se reconstruyó con GitHub Flow, como en ValveDex:

1. Copia de seguridad local en la rama `backup-main-original` (no publicada).
2. `main` en GitHub se llevó con *force push* al commit inicial `b89d468`.
3. Los 166 commits restantes entraron en 22 ramas lógicas, cada una con su PR (#1–#22), fusionada con commit de merge y borrada.
4. Los 22 commits de merge llevan la fecha de la reconstrucción.
5. Después, con `git filter-branch`, se reescribieron los mensajes de los 189 commits (Conventional Commits en español, con título y lista, redactados a partir del diff de cada commit). En el mismo paso se sustituyó por `root` una contraseña local de MySQL que aparecía en versiones antiguas de `application.properties`. Se conservan autores, fechas, estructura de merges y el contenido final. Al reescribirse, los commits tienen SHA nuevos. Las páginas de las PR #1–#22 en GitHub siguen mostrando los commits anteriores, porque GitHub no permite modificarlas.
6. El tag `v1.0.0` apunta al último merge (`218f26d`).

La contraseña retirada debe considerarse expuesta: GitHub puede seguir sirviendo los commits antiguos por su SHA (por ejemplo, desde las PR #1–#22) mientras no se pida su eliminación al soporte de GitHub.

Copias locales sin publicar: `backup-main-original` (historial lineal) y `backup-main-reconstruida` (con merges, antes de reescribir mensajes). Ambas conservan la contraseña. Para borrarlas: `git branch -D backup-main-original backup-main-reconstruida`.

