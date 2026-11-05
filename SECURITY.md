# Política de Seguridad — Digital-Fit

Digital-Fit se compromete con la seguridad, la privacidad y la integridad de los datos de sus usuarios y del código de la aplicación. Este documento detalla nuestras directrices de seguridad, cómo reportar vulnerabilidades y los estándares aplicados en **Digital-Fit 2.0**.

---

## 1. Versiones soportadas

| Versión | Estado | Soporte de seguridad |
| :--- | :--- | :--- |
| **2.x** (Digital-Fit 2.0) | En desarrollo activo / Producción | :white_check_mark: Soportada con parches activos |
| **1.0.0** (DAW final) | Versión archivada / Tag estático | :x: No soportada (código histórico de entrega) |

---

## 2. Reporte responsable de vulnerabilidades

Agradecemos la colaboración de la comunidad de seguridad y de los desarrolladores para identificar y corregir fallos de forma responsable antes de su divulgación pública.

### Cómo notificar una vulnerabilidad

1. **GitHub Security Advisories (Recomendado):**  
   Si tienes acceso al repositorio en GitHub, utiliza la pestaña **Security** → **Advisories** → **Report a vulnerability** para abrir un reporte privado y confidencial.
2. **Contacto directo:**  
   Envía un correo electrónico al mantenedor del proyecto (**Manuel**) describiendo:
   - Tipo y gravedad de la vulnerabilidad detectada.
   - Pasos detallados para reproducir el fallo (incluyendo payloads o peticiones HTTP de ejemplo).
   - Componentes o endpoints afectados (frontend, backend, base de datos o Docker).
   - Cualquier sugerencia de mitigación o parche.

### Tiempos de respuesta y compromiso

- **Acuse de recibo:** En un plazo máximo de **48 horas**.
- **Evaluación y triaje:** En un plazo máximo de **7 días hábiles**.
- **Publicación de la corrección:** Los parches de seguridad críticos se publican en una versión correctiva previa a cualquier anuncio público.

Por favor, **no abras issues públicos ni compartas públicamente información de vulnerabilidades** hasta que hayan sido evaluadas y corregidas.

---

## 3. Arquitectura y estándares de seguridad en Digital-Fit 2.0

### A. Gestión de secretos y credenciales
- **Cero secretos en el repositorio:** Ningún token de API, contraseña de base de datos o clave criptográfica se guarda en el control de versiones.
- Todas las credenciales sensibles se inyectan en tiempo de ejecución mediante variables de entorno del sistema (`.env` local ignorado en `.gitignore`, GitHub Actions Secrets en CI/CD y gestores de secretos en hosting).

### B. Autenticación y control de accesos (RBAC)
- **Spring Security en el backend:** Control de sesiones mediante cookies HTTP seguras (`HttpOnly`, `SameSite` y bandera `Secure` en producción).
- **Autorización por capas:**
  - Las rutas administrativas `/api/admin/**` están protegidas estrictamente a nivel de seguridad HTTP exigiendo el rol `ROLE_ADMIN`.
  - Los recursos propios de cada usuario (rutinas, entrenamientos, lugares y favoritos) verifican la pertenencia en la capa de servicio (`Service`) contrastando el propietario del recurso contra el usuario autenticado (`SecurityContextHolder`).
  - Los guards de Angular sirven únicamente para mejorar la experiencia de usuario y la navegación; la seguridad real reside 100% en el backend.

### C. Validación y prevención de inyecciones
- **Validación en la frontera HTTP:** Bean Validation (`@Valid`, `@NotNull`, `@Size`, `@Pattern`) en todos los DTOs de entrada.
- **SQL Injection:** Uso exclusivo de Spring Data JPA y consultas JPQL/HQL parametrizadas. Se auditan las consultas nativas para garantizar el uso de parámetros enlazados (`bind parameters`).
- **Log Injection:** Saneamiento y filtrado de caracteres de control (CRLF) en cualquier dato proveniente de la petición antes de emitirlo a los registros de logs.
- **Cross-Site Scripting (XSS):** El frontend en Angular utiliza interpolación de texto segura y escapado contextual nativo.

### D. Integración de servicios de mapas y geocodificación
- Las consultas a APIs externas de OpenStreetMap (Nominatim y Overpass) se realizan exclusivamente a través del backend mediante proxies con rate limiting (máximo 1 petición por segundo) y cabecera `User-Agent` identificativa, cumpliendo con las políticas de uso responsable de OSM y evitando la exposición de consultas no controladas desde el navegador cliente.

### E. Integración continua y análisis estático (CI/CD)
- Cada pull request hacia la rama principal `main` ejecuta automáticamente:
  - Suite completa de tests unitarios y de integración.
  - Análisis de calidad y seguridad estática de código con **SonarQube Cloud** (Quality Gate estricto: 0 vulnerabilidades, 0 fallos de seguridad y cobertura mínima requerida).
  - Verificación de linting y dependencias libres de vulnerabilidades conocidas.

