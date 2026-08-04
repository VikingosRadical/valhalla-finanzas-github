# VALHALLA Finanzas

Aplicación web modular y responsive para controlar ingresos, gastos, clientes, renovaciones, entrenamientos y proyecciones mensuales.

## Estructura del proyecto
- [index.html](index.html): estructura principal y navegación móvil.
- [assets/css/styles.css](assets/css/styles.css): estilos del diseño limpio y responsive.
- [assets/js/data.js](assets/js/data.js): estado inicial, persistencia y carga desde localStorage.
- [assets/js/finance.js](assets/js/finance.js): lógica financiera, validaciones y cálculos.
- [assets/js/app.js](assets/js/app.js): interacción de la interfaz y renderizado.
- [manifest.json](manifest.json): configuración PWA para instalación.
- [service-worker.js](service-worker.js): caché para GitHub Pages y uso offline básico.

## Publicar con GitHub Pages
1. Sube el contenido del repositorio a GitHub.
2. Abre Settings > Pages.
3. Elige Deploy from a branch.
4. Selecciona la rama principal y la carpeta raíz.
5. Guarda y espera a que se publique la web.

La app usa rutas relativas como ./assets/... y ./service-worker.js para ser compatible con GitHub Pages.

## Guardado de datos
Los datos se guardan automáticamente en localStorage bajo la clave valhalla_v05.
Eso permite conservar movimientos, compromisos, clientes y rutinas en el navegador del usuario.

## Respaldos y exportación
- En Ajustes puedes exportar todos los datos en un archivo valhalla.json.
- El mismo panel permite importar un respaldo sin perder datos válidos del estado actual.
- Para crear un respaldo, usa Exportar y guarda el archivo en tu equipo.
