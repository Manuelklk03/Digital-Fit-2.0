# Propuesta de arquitectura de información — Fase 8

**Estado:** propuesta de producto y arquitectura de información tras el cuestionario de Manuel, parcialmente iniciada con el Dashboard y el menú móvil. El resto de la fase no está aprobado ni implementado. **Fecha:** 2026-11-26. La fase 8 y sus identificadores se proponen aquí: todavía no figuran en `roadmap.md`. La versión 2.0.0 ya está publicada; este documento describe un trabajo posterior. Las decisiones de producto recogidas abajo proceden de Manuel; los contratos, rutas nuevas y fases son propuestas técnicas sujetas a revisión.

## 1. Resumen y decisiones ya tomadas

**Visión:** Digital-Fit será un hub deportivo para descubrir lugares, entrenar con un asistente y llevar un registro unido de actividades, visitas, estadísticas, metas y retos. Descubrir lugares y entrenar tienen el mismo peso. El orden de desarrollo acordado es **estructura y navegación → funciones → diseño visual**. El orden de molestias percibidas es navegación, apariencia, mapa, progreso y entrenamientos; esa prioridad de experiencia no cambia el orden técnico anterior. Las funciones sociales se desarrollan al final y en un bloque separado, aunque los retos públicos sin amigos se podrán definir antes.

Las pantallas funcionales se organizan en **Dashboard, Entrenar, Explorar, Progreso/Retos y Perfil**. `/inicio`, `/login` y `/register` siguen siendo páginas públicas de acceso y presentación, fuera de esas cinco vistas. La administración se centra en usuarios, incidencias y moderación; debe quedar restringida a `ADMIN`. Se desarrollarán incrementos comprobables, pero Manuel prefiere **publicar el rediseño completo** tras probarlo con dos o tres personas que no conozcan la app.

El mapa deja de crear lugares verificados mediante un clic. Explorar ofrece sitios de OSM cercanos al usuario con su permiso. «Añadir» busca una dirección, muestra sitios OSM de esa zona y permite guardar una referencia en «Mis sitios». **Decisión posterior de Manuel:** si un sitio falta en OSM, la persona podrá comunicarlo desde Digital-Fit con el mínimo de pasos. El aviso será visible para todos, pero marcado **«Sin verificar»** y separado de los sitios OSM. La administración lo revisará y decidirá si envía una nota pública a OSM o edita allí el lugar. No se publicarán objetos OSM automáticamente ni se presentará el aviso como sitio verificado. Se retiran el selector de coordenadas por clic y los formularios actuales de alta de centros y lugares. **No se eliminan datos existentes en esta propuesta.**

Fuentes de la comprobación local: [`app.routes.ts`](../Frontend/digital-fit-frontend/src/app/app.routes.ts), [`header.html`](../Frontend/digital-fit-frontend/src/app/components/header/header.html), [`ExploracionOsmService.java`](../Backend/digital-fit/src/main/java/com/example/digital_fit/service/Explorar/ExploracionOsmService.java), [`ExploracionRestController.java`](../Backend/digital-fit/src/main/java/com/example/digital_fit/controller/Explorar/ExploracionRestController.java). Hay **26 definiciones** en el array de rutas: 25 entradas concretas, contando la redirección de `/`, y el comodín `**`. El enum [`TipoLugarPublico`](../Backend/digital-fit/src/main/java/com/example/digital_fit/model/Enums/TipoLugarPublico.java) contiene **22** constantes actualmente, no 21.

## 2. Mapa de rutas

La «ruta nueva» es el destino final propuesto; `/dashboard` ya existe como primer incremento, pero las demás rutas propuestas aún no. `?pestaña=...` indica estado de la vista; una subvista de detalle debe conservar un identificador estable y admitir enlace directo. Los identificadores antiguos son IDs de base de datos local, no necesariamente IDs de OSM: las redirecciones de detalle necesitarán un resolvedor de compatibilidad durante la transición. No se debe convertir un `:id` local en `osmId` por simple sustitución. Manuel quiere **conservar temporalmente las pantallas y enlaces antiguos** hasta completar la migración; por ello los destinos de la tabla describen la meta final, no una redirección que deba activarse en el primer incremento.

| Ruta actual | Ruta nueva o destino | Acción | Redirección o compatibilidad necesaria |
|---|---|---|---|
| `/` | `/inicio` | Se mantiene la redirección | Redirección completa, como ahora. |
| `/inicio` | `/inicio` | Se mantiene | Ninguna. |
| `/login` | `/login` | Se mantiene | Tras entrar, destino previsto `/dashboard` o retorno seguro a la ruta solicitada. |
| `/register` | `/register` | Se mantiene | Tras registrarse, destino previsto `/dashboard`. |
| `/entrenar` | `/entrenar` | Se mantiene y amplía | Ninguna. |
| `/explorar` | `/explorar` | Se mantiene y amplía | Ninguna. |
| `/privados` | `/explorar?tipo=centro` | Se funde en Explorar | Alias temporal que conserva el filtro «centro». |
| `/privados/:id` | `/explorar/sitio/:id` | Pasa a subvista de detalle | Resolver el ID local; si no hay OSM, mostrar el registro legado mientras se decide su destino. |
| `/publicos` | `/explorar?tipo=publico` | Se funde en Explorar | Alias temporal con filtro «público». |
| `/publicos/:id` | `/explorar/sitio/:id` | Pasa a subvista de detalle | Igual que el detalle privado; evitar confundir IDs de ambas tablas. |
| `/entrenamientos` | `/entrenar?pestaña=catalogo` | Pasa a pestaña | Alias temporal. |
| `/entrenamientos/:id` | `/entrenar/catalogo/:id` | Pasa a subvista | Conservar el ID y el acceso directo. |
| `/entrenamientos-comunidad` | `/entrenar?pestaña=comunidad` | Pasa a pestaña | Mantener su guard de usuario. |
| `/entrenamientos-comunidad/:id` | `/entrenar/comunidad/:id` | Pasa a subvista | Conservar ID y permisos. |
| `/mis-entrenamientos` | `/entrenar?pestaña=mis-entrenamientos` | Pasa a pestaña | Alias temporal. |
| `/mis-entrenamientos/:id` | `/entrenar/mis-entrenamientos/:id` | Pasa a subvista | Conservar ID y permisos de propiedad. |
| `/mis-centros` | `/explorar?pestaña=mis-sitios&tipo=centro` | Se funde en «Mis sitios» | Alias temporal con el filtro original. |
| `/mis-centros/:id` | `/explorar/mis-sitios/:id` | Pasa a subvista | Resolver tabla e ID antiguos; comprobar propiedad en backend. |
| `/mis-lugares` | `/explorar?pestaña=mis-sitios&tipo=publico` | Se funde en «Mis sitios» | Alias temporal con el filtro original. |
| `/mis-lugares/:id` | `/explorar/mis-sitios/:id` | Pasa a subvista | Igual que «Mis centros»; IDs antiguos pueden coincidir entre tablas. |
| `/historial-entrenamientos` | `/progreso?pestaña=historial` | Pasa a pestaña | Alias temporal. |
| `/historial-entrenamientos/:id` | `/progreso/historial/:id` | Pasa a subvista | Conservar ID y propiedad. |
| `/estadisticas` | `/progreso?pestaña=estadisticas` | Se funde en Progreso/Retos | Alias temporal. |
| `/valoraciones` | `/progreso?pestaña=valoraciones` | Pasa a pestaña | Alias temporal; verificar relaciones con lugares antes de migrar. |
| `/admin/crear-admin` | `/perfil/admin/crear-admin` | Pasa a subvista restringida | Alias con guard `ADMIN` en frontend y backend. |

El comodín `**` actual redirige a `/login`. Se propone revisar los 404 y el retorno tras autenticar para no convertir cualquier URL mal escrita en una pantalla de acceso. Esta es la **definición 26**, fuera de la tabla de 25 entradas concretas. Los alias y pantallas antiguas solo se retirarían tras comprobar enlaces entrantes, favoritos, datos legados y E2E. Los detalles nuevos requieren identificadores tipados: un ID local de centro, uno de lugar, un objeto OSM y un aviso pendiente no son intercambiables.

## 3. Las cinco vistas y sus recorridos

| Vista | Responsabilidad y datos | Recorrido principal | Funciones actuales que reúne |
|---|---|---|---|
| **Dashboard** `/dashboard` | Primer incremento implementado: accesos a Explorar, Progreso, catálogo de entrenamientos, rutinas propias e historial; totales reales de actividad. | Meta final: «¿Qué quieres hacer hoy?» con Explorar, Progreso y Entrenar; después resumen de actividad y próxima sesión. Los bloques futuros muestran sitios cercanos o guardados, sesiones y tiempo, meta y retos, y opciones para continuar, repetir o iniciar libre. Cada bloque lleva a su vista para profundizar; en móvil el resumen es corto. La próxima sesión y las métricas semanales aún no existen. | Extractos de entrenamiento, historial, estadísticas y lugares, sin duplicar pantallas completas. |
| **Entrenar** `/entrenar` | Rutinas base, propias y de comunidad; sesiones activas y libres. | Elegir rutina o sesión libre; alternar guía paso a paso y lista completa; registrar series o datos específicos de la actividad; descanso manual o automático; continuar, guardar como incompleta o descartar una sesión interrumpida. Los cambios de sesión pueden guardarse en la rutina futura cuando el usuario lo solicite. | `/entrenar`, catálogos y detalles base, propios y de comunidad. |
| **Explorar** `/explorar` | Descubrir sitios, consultar detalles y gestionar «Mis sitios». | Abrir lista ordenada por distancia en móvil, alternar mapa, buscar dirección o cercanía con permiso, filtrar, guardar como favorito/habitual/pendiente, registrar visitas y comunicar sitios ausentes. | `/privados`, `/publicos`, `/mis-centros`, `/mis-lugares` y detalles. |
| **Progreso/Retos** `/progreso` | Fuente de verdad del historial, estadísticas, metas, retos y logros. | Ver resumen conjunto, lista o calendario; abrir y corregir una actividad; consultar constancia, rendimiento y variedad; crear metas y participar en retos individuales o públicos. Las clasificaciones son opcionales por reto y la aparición pública requiere elección del participante. | Historial y detalle, estadísticas y valoraciones; debe revisarse si las valoraciones corresponden mejor al objeto valorado. |
| **Perfil** `/perfil` | Cuenta, idioma, tema, privacidad, datos personales y sesiones abiertas. | Configurar qué se comparte, exportar o borrar datos, gestionar seguridad y, en la fase social, amigos. Administración restringida para `ADMIN`. | Estado de usuario y salida de la cabecera; administración actual. |

### Primera visita y sesión

La guía inicial será **opcional, saltable y recuperable**: actividades favoritas, primera meta, primer sitio y primera rutina. Si se omite, la app funciona y muestra un recordatorio discreto. La ubicación se solicita al pulsar «Ver sitios cercanos», con explicación previa. El Dashboard sin datos guía las primeras acciones; no muestra estadísticas ficticias. Tras entrar, la ruta propuesta es `/dashboard`, salvo que haya un enlace directo privado al que regresar de forma segura.

### Una actividad, varios contextos

Un entrenamiento vinculado a un sitio aparece tanto en Entrenar/Historial como en la actividad de ese sitio, **sin duplicar duración, visitas ni puntos**. También se puede registrar una visita sin entrenamiento guiado, con actividad, fecha, duración y nota opcional. Los formularios parten de categorías amplias (fuerza, resistencia, agua, raqueta, equipo y otras) y añaden campos específicos gradualmente; no fuerzan series y repeticiones a deportes que no las usan. La lista y el calendario leen los mismos registros. Se admiten varias actividades por día: el calendario resume cantidad y tipo y permite abrir todas.

Una actividad completada podrá corregirse. Se conserva una trazabilidad interna de los cambios y las metas personales se recalculan. Los retos públicos distinguen resultados **declarados** de los calculados con datos suficientes. Manuel prefiere reglas por tipo de reto y evitar cambios retroactivos en puntos o logros; antes de codificar habrá que definir cómo impedir que una corrección convierta una clasificación o premio en un resultado incoherente.

La interfaz puede tener pestañas y detalles, pero la navegación principal presenta cinco destinos. La autorización continúa en el backend: un guard de Angular solo mejora la navegación.

## 4. Navegación, estados y diseño visual

- **Tres estructuras para comparar antes de elegir:** A) cabecera de cinco destinos en escritorio y barra inferior de cinco en móvil; B) barra lateral en escritorio y barra inferior de cinco en móvil; C) cabecera en escritorio y barra móvil de tres destinos con Dashboard en el logotipo y Perfil en el avatar. Manuel quiere ver las tres en contexto antes de decidir. No se declara ninguna implementada o aprobada.
- **Estado de navegación:** al salir de Explorar y volver durante la misma sesión, se conservan filtros, zona y vista de lista o mapa. Volver desde un detalle restaura la lista y la posición de desplazamiento. Las subrutas mantienen enlaces directos. El mapa permite alternar lista/mapa y mantiene atribución visible.
- **Sin sesión:** `/inicio`, `/login` y `/register` permanecen públicos; las cinco vistas privadas solicitan acceso. No se activa geolocalización en la portada.
- **Con sesión:** entrada prevista a Dashboard y retorno seguro a enlaces privados solicitados. Administración solo aparece para `ADMIN`, con controles reales en backend. Se muestran estados de carga, error, vacío y éxito. Teclado, foco visible y movimiento reducido se comprueban en las tres estructuras.
- **Apariencia:** se replantea de forma completa después de definir estructura y funciones, con tema claro y oscuro según sistema y opción de cambio. La vista determina si predominan acciones, datos o mapa. La interfaz ofrece información suficiente para actuar rápido y puede plegar controles avanzados. La prioridad visual declarada por Manuel no autoriza a adelantar una implementación visual sin cerrar la estructura.

Hoy `header.html` muestra Inicio, Explorar, Entrenar y, según rol, Mi espacio y las vistas privadas o Crear admin. En móvil se abre mediante un botón de menú accesible. Esta cabecera **todavía no** implementa la navegación final de cinco vistas.

## 5. Rediseño del mapa

### Recorridos

**Explorar:** 1) abrir lista ordenada por distancia, con mapa alternativo en móvil; 2) al pulsar «Ver sitios cercanos», explicar y pedir permiso de ubicación; 3) consultar mediante backend o buscar manualmente por dirección si el permiso se niega; 4) permitir radio ajustable, zona visible del mapa y «Buscar en esta zona»; 5) aplicar actividad, distancia y tipo de sitio; 6) abrir detalle. Los filtros de precio y disponibilidad solo aparecen si hay cobertura suficiente; cuando el precio de un resultado falte, se indica «Precio desconocido». Horarios y enlaces de reserva se muestran si existen. Las plazas libres requieren integración con el centro: no se infieren de OSM. La ubicación precisa se usa para la consulta y no se guarda en el perfil por defecto.

**Añadir un sitio OSM:** 1) introducir dirección y pulsar «Buscar»; 2) el backend consulta Nominatim y devuelve zonas candidatas; 3) elegir zona y listar sitios OSM mediante Overpass; 4) elegir un sitio desde lista o mapa; 5) guardarlo como favorito, habitual o pendiente, con nota privada opcional. Si ya estaba guardado, mostrar «Ya está guardado» y abrir sus opciones, sin duplicarlo. En el detalle, la acción destacada depende del estado del sitio. Las tarjetas muestran únicamente datos disponibles: nombre, actividad, distancia, dirección, horario, precio y estado de guardado/visita cuando existan. Si OSM cambia o retira un sitio guardado, se conserva la última información conocida, se advierte y se permite quitarlo.

**Comunicar un sitio ausente:** desde la búsqueda, el usuario confirma el punto y aporta como mínimo nombre y actividad; la app prepara el contexto. El aviso se muestra a todos **separado de los resultados OSM y marcado «Sin verificar»**. Se puede consultar, aportar información y guardarlo en «Mis sitios» con esa marca; no registrar visitas ni usarlo como lugar confirmado. El servidor limita abuso y duplicados. La administración revisa el aviso y decide, según el caso, si edita OSM manualmente o publica una nota OSM con información comprobada y sin datos personales. La nota no equivale a un objeto OSM ni garantiza su alta. Un aviso falso se retira conservando registro interno; un duplicado se fusiona con el sitio correcto manteniendo guardados. Esta capa de avisos **es un cambio de decisión posterior al primer borrador**: es dato temporal propio, no un CRUD de lugares verificados.

Actualmente el backend expone `/api/explorar/lugares`, `/api/explorar/geocodificar` y `/api/explorar/geocodificar/inversa`. `ExploracionOsmService` consulta `leisure=fitness_centre`, `amenity=gym`, `leisure=fitness_station`, `leisure=sports_centre`, `leisure=swimming_pool`, `leisure=pitch` y `leisure=track`; asigna resultados a categorías Gimnasio, Calistenia, Polideportivo, Piscina u Otro. También mezcla registros locales. Existen CRUD de bases y de recursos de usuario, incluidos `POST /api/mis-centros-privados/centros-app/{id}` y `POST /api/mis-lugares-publicos/base/{idBase}` para copiar un registro base a la lista propia. `POST /api/mis-centros-privados/centros-maps` sigue existiendo. Estos contratos no sirven por sí solos para guardar cualquier objeto OSM: el backend necesita un contrato nuevo o una adaptación explícita. En frontend siguen presentes `components/mapa-selector` y `pages/lugares/` con `formulario-sitio`, listado, detalle, filtro y tarjeta.

### Catálogo y medición 8.M1

**Medición no completada.** El 2026-11-26 se preparó un script temporal con `nwr(around:R,lat,lon)[etiqueta];out count;`, `[timeout:25]`, consultas secuenciales y pausa de 2 s. La salida HTTP del entorno falló con «Error al enviar la solicitud» en las primeras ocho consultas de Valencia; se detuvo la pasada. No hubo respuesta de Overpass ni recuentos. Xàtiva y las demás etiquetas quedaron sin consultar. «No medido» significa **sin respuesta**, nunca cero objetos. El script y su salida quedaron en el directorio temporal del sistema, fuera del repositorio; no se incorporan al producto.

| Actividad o etiqueta candidata | Valencia centro: 39.4699, -0.3763, 5 km | Xàtiva: 38.9904, -0.5207, 3 km | Uso propuesto mientras falta medición |
|---|---:|---:|---|
| `leisure=fitness_station` (calistenia) | No medido | No medido | Candidato; ya se consulta en la app. |
| `sport=calisthenics` | No medido | No medido | Candidato complementario. |
| `sport=table_tennis` (ping-pong) | No medido | No medido | Cobertura sin verificar; no prometer filtro útil. |
| `leisure=pitch` + `sport=table_tennis` | No medido | No medido | Intersección, no suma; cobertura sin verificar. |
| `shop=games` (tienda de juegos) | No medido | No medido | No equivale necesariamente a lugar para jugar. |
| `club=games` | No medido | No medido | Candidato de juegos de mesa; cobertura sin verificar. |
| `leisure=amusement_arcade` | No medido | No medido | Arcade, no necesariamente juegos de mesa. |
| `board_game=yes` | No medido | No medido | Candidato de juegos de mesa; cobertura sin verificar. |
| `sport=padel` | No medido | No medido | Candidato; distinguir pistas de complejos. |
| `sport=tennis` | No medido | No medido | Candidato; distinguir pistas de complejos. |
| `leisure=fitness_centre` (gimnasio) | No medido | No medido | Candidato; ya se consulta en la app. |
| `leisure=swimming_pool` (piscina) | No medido | No medido | Candidato; ya se consulta en la app. |
| `leisure=pitch` | No medido | No medido | Etiqueta genérica; requiere `sport` para filtrar actividad. |
| `sport=skateboard` (skatepark) | No medido | No medido | Candidato; revisar etiquetas de instalaciones. |
| `sport=climbing` (escalada) | No medido | No medido | Candidato; revisar etiquetas de instalaciones. |

**Conclusión provisional:** ningún filtro nuevo puede declararse de cobertura suficiente o marginal a partir de esta medición. Gimnasio, piscina y calistenia tienen soporte funcional actual en el servicio, pero eso tampoco prueba cobertura en estas dos zonas. Ping-pong y juegos de mesa son posibles filtros marginales, **hipótesis pendiente de datos**. El filtro «juegos de mesa» necesita además validación semántica: una tienda o un arcade no garantiza un sitio donde jugar. La decisión de filtros visibles se toma en 8.M1 tras medir y revisar una muestra de objetos.

### Modelo de «Mis sitios» y legado

Propuesta conceptual: una asociación **usuario ↔ sitio OSM** con ID interno, `usuarioId`, `osmTipo` (`node`, `way` o `relation`), `osmId` numérico, estado personal (`FAVORITO`, `HABITUAL` o `PENDIENTE`), nota privada y una instantánea mínima de nombre, coordenadas, dirección si existe, actividades y fecha de consulta. La clave externa real es **(`osmTipo`, `osmId`)**: el número por sí solo puede repetirse entre tipos. Una restricción única (`usuarioId`, `osmTipo`, `osmId`) evita guardados duplicados. El servidor obtiene el usuario de la sesión, comprueba propiedad al leer o borrar y valida/reconsulta la referencia OSM; el cliente no decide `usuarioId`. La instantánea permite mostrar la lista si OSM no responde, pero debe indicarse cuándo se actualizó. `tipo` de sitio y actividades se derivan de etiquetas, sin un enum rígido de 22 valores.

Un **aviso de sitio ausente** tiene identidad y ciclo de vida propios (`SIN_VERIFICAR`, `EN_REVISION`, `RESUELTO` o `RECHAZADO`, nombres provisionales). Guarda punto y datos mínimos, autor para moderación, fecha y referencia a una eventual nota u objeto OSM. El aviso visible no revela identidad ni nota privada del autor. Puede añadirse a «Mis sitios», pero la asociación utiliza el ID interno del aviso, nunca un `osmId` ficticio. Al resolverse contra un objeto OSM, se enlazan los guardados y se evita perderlos. Hay que limitar frecuencia, detectar duplicados, permitir reportar abusos y moderar aportaciones. Este modelo no añade automáticamente lugares a OSM.

Una **actividad** es el registro común al historial, estadísticas, visitas, metas y retos. Puede enlazar un sitio OSM verificado; una visita sin rutina es también actividad. Una sesión de entrenamiento vinculada a un sitio produce una actividad con ambas dimensiones, no dos registros que se sumen. Los borradores incompletos, correcciones y eliminaciones necesitan estados y trazabilidad. Las reglas de puntos y clasificaciones deben evitar duplicados y efectos inconsistentes al corregir datos.

**Decisión de Manuel sobre el legado:** conservar las tablas actuales de centros y lugares base y de usuario en **modo lectura** mientras se inventarían datos, valoraciones y enlaces. No se migran ni borran en esta propuesta. La eventual migración de referencias OSM exige ensayo reversible, informe de excepciones y aprobación expresa. Las pantallas y rutas antiguas también permanecen temporalmente para enlaces existentes.

### Identificadores públicos

Manuel quiere estudiar **UUID** para enlaces públicos y futuros clientes sin exponer IDs internos consecutivos. El diseño deberá decidir si se añade un identificador público estable a entidades existentes o si se cambian claves internas; no se asume una migración global. Un UUID no concede permiso: cada lectura y escritura privada comprueba autorización en backend. Los detalles legados requieren resolver tipo de origen e ID antes de generar un enlace nuevo.

## 6. Límites y riesgos

- **Nominatim público:** máximo absoluto de 1 petición/s para toda la aplicación, identificación por `User-Agent` o `Referer`, atribución visible, caché y posibilidad de cambiar de proveedor. Sin autocompletado mientras se escribe ni consultas sistemáticas de POI. El proxy backend existente es el lugar para aplicar límites globales; confirmar su comportamiento al ampliar el flujo. [Política oficial](https://operations.osmfoundation.org/policies/nominatim/).
- **Overpass público:** usar consultas acotadas, caché, límites de frecuencia y degradación cuando falle; no depender de la instancia pública como backend sin revisar capacidad. La medición 8.M1 pendiente impide prometer cobertura. [Manual de Overpass](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html).
- **Datos OSM:** objetos incompletos, etiquetas inconsistentes, cambios o borrados. Mostrar fuente y atribución, revisar la licencia ODbL para los datos almacenados y manejar «sin resultados». No convertir tiendas de juegos en instalaciones deportivas sin validación.
- **Avisos OSM:** la publicación automática de objetos cartográficos no forma parte del flujo. La política de [ediciones automatizadas](https://wiki.openstreetmap.org/wiki/Mechanical_Edit_Policy) exige cautela y revisión; la [API de notas](https://wiki.openstreetmap.org/wiki/Api06) advierte contra la generación masiva por scripts o agentes. Un aviso visible en Digital-Fit sigue sin verificar aunque se haya enviado una nota a OSM. Controlar abusos, datos falsos, duplicados y exposición de datos personales.
- **Privacidad y seguridad social:** cuenta privada por defecto, preferencia general y decisión por contenido. Si el usuario activa compartir actividad con amigos, puede incluir estadísticas y sitio; cada entrada puede ocultarse. Perfil público configurable por campo; correo y datos de cuenta nunca públicos. Sugerencias por ubicación aproximada solo con consentimiento explícito, sin mostrar distancias. Los enlaces externos son accesibles a quien los posea y revocables; bloqueo impide búsqueda, contacto y acceso a contenido de amigos, y se revisan interacciones previas. Comprobar permisos de lectura y escritura en servidor, no solo guards.
- **Ubicación:** pedir permiso al pulsar «Ver sitios cercanos», ofrecer búsqueda manual y no registrar coordenadas precisas ni asociarlas a cuentas innecesariamente. Acotar su vida en cachés y logs. Evitar que los sitios habituales compartidos revelen rutinas de ubicación sin una elección informada.
- **Autenticación actual y futura:** el código actual usa sesión de servidor con cookie `HttpOnly`, `SameSite=Lax` y protección CSRF; no usa JWT/refresh tokens. Manuel quiere permanencia de sesión, listado y cierre por dispositivo, recuperación de contraseña, correo verificado y segundo factor obligatorio para todos, inicialmente app autenticadora y códigos de recuperación. Web y móvil propios están previstos; API de terceros solo ante una necesidad concreta, con permisos explícitos y revocables. **No se decide aquí cambiar a tokens:** comparar modelos y amenazas antes de alterar autenticación, cierre de sesión o CSRF. Ver [OWASP: sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) y [OWASP: autorización](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- **Derechos sobre datos:** exportación, eliminación selectiva y borrado de cuenta. Para retos públicos, Manuel prefiere conservar resultados anónimos tras el borrado; antes de implementar hay que comprobar que los datos retenidos no permitan reidentificar a la persona y definir reglas de conservación y auditoría.
- **Disponibilidad y reservas:** OSM puede aportar horarios o un enlace, pero las plazas en tiempo real y reservas dentro de la app requieren un proveedor/integración verificable. Primera etapa: enlace al sistema oficial cuando exista; no prometer disponibilidad en vivo si no hay contrato de datos.
- **SEO y prerender:** [`app.routes.server.ts`](../Frontend/digital-fit-frontend/src/app/app.routes.server.ts) genera `/inicio`, `/login` y `/register`; [`sitemap.xml`](../Frontend/digital-fit-frontend/public/sitemap.xml) lista esas tres. Las nuevas vistas privadas no deben entrar en sitemap ni hacerse indexables. Revisar el comodín y los alias para no perjudicar las páginas públicas.
- **i18n:** las cuatro lenguas existentes son español, valenciano (`ca`), inglés y francés. Traducir nombres de navegación, estados, filtros y errores; conservar nombres propios OSM. Revisar foco, contraste, teclado y movimiento reducido en ambas disposiciones.
- **E2E:** existe la suite [`e2e/`](../e2e/) con rutas actuales; inventariar pruebas y enlaces antes de sustituir rutas, actualizar recorridos y comprobar alias mientras estén activos.
- **Publicación y revisión:** Manuel quiere una salida pública conjunta, precedida por pruebas con él y dos o tres personas nuevas, auditoría de código, pruebas de permisos, privacidad y recuperación, y una revisión externa si se organiza. La skill `codex-security:deep-security-scan` está disponible para una auditoría posterior; **no se ha ejecutado**. Ningún hallazgo se declara resuelto sin comprobar la corrección.

## 7. Plan propuesto y comprobación

La aprobación de esta arquitectura precede a cualquier implementación. Cada paso se divide en cambios pequeños y comprobables, aunque la publicación al público se haga al completar el rediseño. La lógica del mapa y del backend se explica a Manuel en modo guiado según `AGENTS.md`. Para trabajo complejo o repetitivo, Codex prepara un prompt cerrado y Manuel decide si lo pasa a Antigravity; el prompt debe fijar archivos, contrato, límites y verificaciones. «Responsable» indica coordinación, no permiso para ejecutar fases automáticamente. **La documentación se incorpora a PR funcionales; no se abren commits ni PR solo de documentación.**

| Paso | Responsable | Entrega | Criterio de comprobación |
|---|---|---|---|
| **8.M1** | Manuel decide; Antigravity apoya medición | Conteos por etiqueta en Valencia y Xàtiva, más revisión de muestras. | Una consulta por etiqueta y zona, resultados y errores registrados; decisión de filtros basada en datos. **Pendiente por fallo de conexión.** |
| **8.1** | Manuel decide; Codex estructura | Aprobar mapa de rutas, recorridos, permisos y tres prototipos de navegación. | Tabla de 25 entradas y comodín revisados; elegir una navegación tras verla en móvil/escritorio y resolver colisiones de IDs. |
| **8.S1** | Manuel decide; Codex analiza; Antigravity si se encarga implementación | Modelo de amenazas y decisión sobre sesión actual, móvil, API externa e identificadores públicos. | Comparativa documentada; pruebas de revocación, CSRF y permisos definidas antes de modificar autenticación. |
| **8.2** | Claude (frontend), guiado o por encargo de Manuel | Navegación de cinco vistas, Dashboard breve, Perfil estructural y guía inicial opcional. | Escritorio/móvil, teclado, guards, enlaces directos y guía saltable/recuperable; rutas públicas intactas. |
| **8.M2** | Manuel + Antigravity (backend), en modo guiado | Contratos de sitio OSM, aviso sin verificar, «Mis sitios», actividad vinculada y catálogo de actividades. | DTOs, estados, ciclo de revisión, propiedad, node/way/relation, duplicados y no doble conteo definidos antes del código. |
| **8.M3** | Antigravity (backend), guiado con Manuel | Búsqueda por zona, filtros y caché Overpass; geocodificación con límite global. | Tests de etiquetas, límites, fallo externo y respuestas vacías; cumplimiento de políticas revisado. |
| **8.M4** | Antigravity (backend), guiado con Manuel | Guardar/listar/quitar «Mis sitios» y moderar avisos sin verificar. | Tests de propiedad, abuso, duplicados, resolución y referencia obsoleta; avisos no se confunden con objetos OSM. |
| **8.M5** | Claude (frontend), lógica de mapa guiada con Manuel | Explorar/Añadir, «Mis sitios», visitas y avisos conectados. | Permiso concedido/denegado, búsqueda manual, restauración de filtros y posición, aviso falso/duplicado, móvil y teclado. |
| **8.M6** | Manuel decide; Antigravity prepara | Inventario y archivo legible de centros/lugares actuales, con posible ensayo reversible de migración posterior. | Datos, valoraciones, IDs y enlaces conservados; ninguna eliminación o migración definitiva sin nueva decisión. |
| **8.3** | Claude (frontend), Antigravity para API; Manuel guía lógica | Entrenar, sesiones libres, categorías de actividad e historial común. | Continuar/incompleta/descartar, distintas actividades, correcciones y vínculo a sitio sin doble conteo probados. |
| **8.4** | Claude (frontend), Antigravity para API | Progreso: lista/calendario, estadísticas, metas y retos individuales/públicos. | Varias actividades por día, recálculo de metas, resultados declarados/calculados y clasificación opcional comprobados. |
| **8.S2** | Manuel decide; Antigravity para backend, Claude para interfaz | Seguridad de cuentas y datos: correo, recuperación, segundo factor, sesiones, exportación y borrado. | Pruebas de acceso, revocación, recuperación, bloqueo, privacidad por defecto y borrado sin reidentificación. |
| **8.5** | Claude (frontend), Manuel revisa | Diseño visual completo y temas claro/oscuro sobre recorridos estabilizados. | Móvil/escritorio, contraste, foco, movimiento reducido, cuatro idiomas y pruebas con dos o tres personas nuevas. |
| **8.6** | Claude (frontend), Antigravity para API; Manuel decide | Social al final: amigos, compartir, retos entre amigos y bloqueo. | Visibilidad por campo/contenido, enlaces revocables, ubicación opcional y permisos de bloqueo probados. |
| **8.S3** | Codex revisa; Manuel organiza revisión externa | Auditoría de seguridad y corrección de hallazgos verificables. | Escaneo de código/dependencias, pruebas de permisos y privacidad, regresión tras correcciones y revisión externa si se realiza. |
| **8.7** | Claude (frontend), Antigravity (backend), Manuel valida | Compatibilidad de rutas, SEO, E2E, documentación y publicación conjunta. | Build, tests pertinentes, sitemap/prerender, datos legados, enlaces entrantes y recorrido real verificados; aprobación de Manuel antes de publicar. |

Dependencias: 8.M1 alimenta 8.M2 y los filtros de 8.M3; 8.S1 precede a cualquier cambio de autenticación o de claves; 8.M2 precede a 8.M3/8.M4; 8.M3 y 8.M4 preceden a 8.M5. El archivo legado 8.M6 precede a retirar pantallas antiguas. 8.6 se inicia después de estabilizar estructura, funciones y diseño. 8.S3 y las pruebas de personas nuevas preceden a 8.7.

## 8. Decisiones pendientes de validación, sin reabrir el cuestionario

| Tema | Estado y siguiente comprobación |
|---|---|
| Cobertura OSM | 8.M1 sigue sin cifras; medir antes de decidir qué filtros mostrar. |
| Navegación | Manuel pidió comparar tres estructuras visuales; ninguna está elegida. |
| Avisos de sitios | Definir moderación, límites de abuso y cuándo una nota OSM aporta valor; validar contra normas OSM antes de integrar. |
| Identificadores | Diseñar UUID público o migración interna a partir de casos reales y compatibilidad con rutas legadas. |
| Autenticación | Estudiar si web/móvil necesitan sesiones, tokens o modelos distintos. No se presupone refresh token. |
| Retos y puntos | Concretar reglas al corregir actividades, anonimización al borrar cuenta y elegibilidad de clasificaciones. |
| Datos legados | Inventariar relaciones y mantener modo lectura; ninguna eliminación aprobada. |
| Auditoría externa | Manuel la desea antes de publicar; alcance y disponibilidad aún sin confirmar. |

**Punto de parada:** esta propuesta incorpora las decisiones del cuestionario y queda preparada para revisión. No se modifica `docs/STATUS.md`, no se implementa la fase 8 y no se hace commit ni PR solo de documentación.
