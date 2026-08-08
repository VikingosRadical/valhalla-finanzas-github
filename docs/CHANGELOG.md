# Changelog de VALHALLA

## v0.1 - 2026-08-04

### Proyecto inicial

- Creación de la estructura base de documentación del proyecto.
- Definición de la visión, roadmap, backlog y arquitectura inicial.
- Documentación de la base de datos, reglas de desarrollo y enfoque de IA.
- Preparación de la base para futuros avances del producto.

## VALHALLA v0.2 — Finanzas operativas - 2026-08-04

### Nuevas capacidades

- Se añadieron cuentas financieras con saldo inicial, activación y selección de cuenta principal.
- El registro rápido ahora incluye accesos rápidos, cuenta, segmento y confirmación clara al guardar.
- El dashboard incorpora saldo total, saldo operativo, deuda pendiente y resumen financiero.
- Se extendió el respaldo para incluir cuentas, movimientos, transacciones recurrentes, metas y deudas.
- Se mantuvo compatibilidad con localStorage y GitHub Pages.

## VALHALLA v0.3 — Infraestructura Supabase - 2026-08-04

### Nuevas capacidades

- Se añadió la infraestructura inicial para integrar Supabase sin modificar los módulos actuales.
- Se crearon los archivos de configuración y de conexión base para preparar la transición a cloud.
- La app sigue funcionando en modo local cuando las credenciales de Supabase no están configuradas.
- Se prepara la base para futuras operaciones de guardado y carga con Supabase manteniendo localStorage como respaldo.

## VALHALLA v0.4 — Autenticación, Finanzas y Clientes en Supabase - 2026-08-04

### Nuevas capacidades

- Se añadieron los archivos base para autenticación y operaciones cloud iniciales.
- Se preparó el esquema SQL idempotente para perfiles, finanzas, clientes y pagos.
- Se dejó listo el flujo de modo local y modo cloud sin romper la experiencia actual.
- Se documentó la arquitectura inicial del stack con Supabase para usuarios, finanzas y clientes.

## VALHALLA v0.6 — Dashboard inicial - 2026-08-04

### Nuevas capacidades

- Se creó un dashboard principal en la pantalla de inicio con tarjetas claras y responsive.
- Se incorporó una vista estructural para finanzas, clientes, agenda, alertas y objetivos.
- Se añadieron estados de vacío con mensajes de “Sin información” para preparar la integración futura de módulos.

## VALHALLA v0.6.1 — Identidad visual Vikingos Radical - 2026-08-04

### Nuevas capacidades

- Se aplicó una identidad visual oscura y premium inspirada en Vikingos Radical.
- Se actualizó la cabecera con logo preparado, versión y espacio para el usuario futuro.
- Se reforzó el contraste de formularios, tarjetas, botones y navegación inferior para móviles y escritorio.

## VALHALLA v0.6.2 — Ajustes visuales, contraste y actualización móvil - 2026-08-04

### Nuevas capacidades

- Se ajustó la paleta a una identidad más sobria, elegante y minimalista.
- Se corrigió la legibilidad de selects, inputs y opciones en el flujo de registro.
- Se mejoró el contraste de etiquetas, botones y valores financieros para PC y móvil.
- Se actualizó el service worker para refrescar estilos e imágenes en dispositivos móviles.

## VALHALLA v0.7 — Creación y listado de clientes - 2026-08-06

### Nuevas capacidades

- Se incorporó un formulario de clientes con nombre, teléfono, servicio, valor mensual, estado, pago y datos opcionales.
- Se añadió búsqueda, filtros y tarjetas de clientes con vista de ficha, edición y acceso directo a WhatsApp.
- Se preparó el guardado en modo local con prevención de duplicados y bloqueo de doble envío.
- Se conectó el modo Cloud para usar `public.clients` con `owner_id` desde la sesión autenticada.
- Se actualizó el cache del service worker para incluir los archivos modificados y la nueva experiencia de clientes.

## VALHALLA v0.7.1 — Estabilización, clientes reales y progresión básica - 2026-08-06

### Nuevas capacidades

- Se estabilizó el módulo de entrenamientos para usar clientes activos reales como alumnos.
- Se añadieron campos de ejecución real de sesión: peso, repeticiones, completada y observación técnica.
- Se incorporó un resumen de progresión por cliente y ejercicio con último registro y mejor peso histórico.
- Se retiraron de accesos rápidos visibles las categorías Mariela y Magic sin eliminar datos históricos.
- Se ocultó la pestaña Nutrición de la navegación principal sin eliminar su código ni su información.
- Se ajustó el logo de cabecera con tamaño mayor y fallback visible en caso de error de carga.

## VALHALLA v0.8 — Entrenamiento Real Fase 1 - 2026-08-07

### Nuevas capacidades

- Se creó un modelo local versionado para entrenamientos reales (`trainingModelVersion: 0.8.0`) con estructura cliente -> sesión -> ejercicio -> series.
- Se añadió migración segura desde el modelo legacy (`trainings.routines`) hacia `trainingsV08.sessions` sin borrar datos anteriores.
- El identificador oficial para entrenamientos pasa a `clientId`, manteniendo compatibilidad con estados previos.
- Se implementó registro serie por serie con corrección de series ya registradas.
- Se añadió vista de último registro por ejercicio antes de iniciar una nueva serie.
- Se incorporaron botones rápidos de ajuste de peso (`-5`, `-2,5`, `+2,5`, `+5`) manteniendo edición manual.
- Se normalizó el descanso por ejercicio en segundos (`60`, `90`, `95` o personalizado).
- Se agregó resumen del entrenador por cliente con ejercicios realizados, series completadas, último peso y mejor peso.
- Se añadió detección local de posible nuevo récord (`personalRecord`) y campo preparado de validación (`coachValidated`).
- Se mejoró la experiencia móvil del flujo de entrenamientos para ejecución rápida entre descansos.

## VALHALLA v0.8 — Entrenamiento Real Fase 2 — Vista Alumno - 2026-08-07

### Nuevas capacidades

- Se creó un modo alumno local de prueba accesible desde la ficha de clientes activos.
- Se añadió una pantalla móvil de sesión del día con progreso por ejercicio y avance total de sesión.
- Se incorporó tarjeta de ejercicio con planificación, descanso, historial y mejor marca histórica.
- Se habilitó registro serie por serie con inputs grandes, botones rápidos de peso y corrección de series.
- Se añadió avance operativo por ejercicio con opción de pasar al siguiente sin forzar completitud total.
- Se incorporó mensaje motivador para `🏆 Posible nuevo récord` y botón futuro `Validar por entrenador`.
- Se añadió cierre de sesión con resumen de ejercicios completados, series y récords potenciales.
- Se implementó descanso manual con cuenta regresiva local, `+15 s`, `Saltar` y aviso por vibración/sonido cuando es posible.
- Se reforzó privacidad visual en vista alumno ocultando datos financieros y administrativos sensibles.

## VALHALLA v0.8 — Fase 3 — Sincronización Cloud de Clientes y Entrenamientos - 2026-08-07

### Nuevas capacidades

- Se completó el flujo cloud de clientes con listado, creación y edición en Supabase usando `owner_id` del usuario autenticado.
- Se incorporó sincronización cloud para entrenamientos v0.8 con persistencia de sesiones, ejercicios y series.
- Se añadieron operaciones cloud para `training_plans`, `training_sessions`, `training_exercises` y `training_sets`.
- Se mantienen todas las funciones actuales de entrenamiento: series individuales, corrección, historial, último peso, botones rápidos, récord potencial y descanso.
- Se reforzó el indicador operativo en interfaz para mostrar `Modo Cloud` cuando existe sesión cloud y `Modo Local` en fallback.
- Se añadió preparación explícita de función manual futura `Subir datos locales a Cloud` sin ejecución automática.

## VALHALLA v0.8 — Sprint Coach -> Alumno -> Registro Cloud - 2026-08-07

### Nuevas capacidades

- Se implementó planificación explícita de sesión por cliente activo con acción `Nueva sesión` y selección de sesión activa.
- Se añadió gestión completa de ejercicios dentro de la sesión: agregar, editar, eliminar y reordenar (`Subir`/`Bajar`).
- Se habilitó visualización de sesiones del cliente por estado operativo: `HOY`, `PRÓXIMAS` y `COMPLETADAS`.
- Se mantuvo la vista alumno de prueba y se reforzó el flujo serie por serie con persistencia inmediata en Cloud cuando existe sesión autenticada.
- Se incorporó continuidad del estado de sesión (`planned` -> `in_progress` -> `completed`) durante ejecución real.
- Se mantuvo detección de `🏆 Posible nuevo récord` sin validación oficial automática.
- Se mejoró el fallback local para que la misma UI funcione sin sesión Cloud.

### Sincronización Cloud

- La sincronización profunda de sesiones ahora refleja también eliminaciones y reordenamientos de ejercicios/series para evitar desalineación con Supabase.
- Se conservan las tablas existentes (`training_plans`, `training_sessions`, `training_exercises`, `training_sets`) sin cambios de esquema.

## VALHALLA v0.8 — Sprint Plantillas y Asignación - 2026-08-08

### Nuevas capacidades

- Se incorporó gestión funcional de `plantillas` de entrenamiento con CRUD básico: crear, editar, duplicar, eliminar y usar.
- Se agregó acción `Guardar como plantilla` desde una sesión ya planificada.
- Se agregó `Nueva sesión` en dos modos: `Desde cero` y `Desde plantilla`.
- Se incorporó `Asignar plantilla` por cliente y fecha para crear sesión `planned` rápidamente.
- Se agregó `Duplicar sesión` para copiar planificación a una nueva fecha sin copiar resultados.

### Reglas de negocio aplicadas

- Las plantillas guardan solo estructura (ejercicios, orden, series, reps, descanso, nota técnica).
- Las sesiones generadas desde plantilla son snapshots independientes.
- No se copian resultados (`sets`, `completed`, `personalRecord`, `coachValidated`) al asignar plantilla ni al duplicar sesión.
- Se mantiene el historial individual por cliente para mostrar `Última vez` y `Mejor marca` durante ejecución.

### Cloud y fallback

- Se usa la tabla existente `training_plans` para persistir plantillas en Cloud sin cambios de esquema.
- Se mantiene fallback local con la misma experiencia funcional cuando no hay sesión Cloud.

## VALHALLA v0.8 — Sprint Ficha Deportiva v1 - 2026-08-08

### Nuevas capacidades

- Se añadió una Ficha Deportiva por cliente con objetivo principal/secundario, nivel, meses de experiencia, inicio con el coach, frecuencia semanal y duración habitual.
- Se incorporó registro de consideraciones del coach con estado (`activa`, `en_observacion`, `resuelta`) y fechas de revisión.
- Se añadió estado por movimiento/ejercicio (`DOMINADO`, `TOLERADO`, `EN_APRENDIZAJE`, `NO_EVALUADO`, `ADAPTAR`, `RESTRINGIDO`) con nota del coach y 1RM evaluado opcional.
- Se agregaron marcas derivadas del historial existente de entrenamientos para mostrar `Mejor carga registrada` sin duplicar `training_sets`.

### Cloud y seguridad

- Se agregaron tablas nuevas multi-tenant para ficha deportiva con `owner_id` y `client_id`.
- Se mantienen políticas admin ligadas a `owner_id = auth.uid()` y `public.current_user_role() = 'admin'`.
- No se modificó la arquitectura de sesiones, series, plantillas ni autenticación.

### Seguridad

- Se preparó el esquema SQL con RLS para que admin gestione sus propios datos por `owner_id`.
- Se añadió lectura de entrenamientos para cliente autenticado solo sobre sus propios registros.
- No se habilitaron permisos temporales para `trainer` en esta fase.
- No se expone información financiera en el flujo alumno de entrenamientos.
