# Arquitectura de VALHALLA

## Enfoque general

VALHALLA se diseñará con una arquitectura modular, donde cada dominio funcional tiene responsabilidades claras y puede evolucionar de forma independiente sin afectar el conjunto del sistema.

## Módulos principales

### Dashboard

Responsable de presentar una vista general del estado del sistema. Debe concentrar indicadores clave, resúmenes y accesos rápidos a módulos principales.

### Finanzas

Encargado de la gestión de ingresos, gastos, metas y balances. Debe permitir visualizar la salud financiera de forma clara y organizada.

### Clientes

Gestiona la información de clientes, estados, pagos, renovaciones y relaciones comerciales. Debe servir como base para la administración operativa.

### Entrenamientos

Administra planes, rutinas, ejercicios y seguimiento del progreso. Su propósito es dar estructura a las actividades formativas y de desarrollo.

### Nutrición

Coordina planes nutricionales, registros y seguimiento de hábitos relacionados con la salud y el rendimiento.

### Agenda

Centraliza eventos, tareas, compromisos y recordatorios. Debe facilitar la organización temporal y la conexión con otros módulos.

### IA

Provee capacidades de análisis y recomendación. Debe detectar patrones, resumir información y proponer acciones, siempre bajo aprobación humana.

### Configuración

Contiene parámetros generales del sistema, preferencias de usuario, opciones de visualización y ajustes del entorno.

## Principios de arquitectura

- Separación clara de responsabilidades por módulo.
- Comunicación simple entre módulos.
- Diseño escalable para futuras integraciones.
- Compatibilidad con despliegue en GitHub Pages.
- Enfoque en claridad, mantenibilidad y experiencia de usuario.

## Arquitectura Supabase preparada

La aplicación ahora incorpora una capa inicial para Supabase orientada a:
- autenticación y perfiles de usuario;
- finanzas personales y de Vikingos;
- clientes, renovaciones y pagos.

La arquitectura sigue respetando el modo local y localStorage como respaldo. No se desplaza automáticamente la persistencia ni se migran datos sin confirmación.
