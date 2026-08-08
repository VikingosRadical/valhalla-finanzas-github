# Base de datos de VALHALLA

## Visión general

La base de datos de VALHALLA debe organizar la información de forma estructurada para soportar finanzas, clientes, entrenamientos, nutrición, agenda y asistencias inteligentes.

## Entidades principales

### Usuario

Representa a la persona principal que utiliza la plataforma. Puede tener perfil, preferencias, configuraciones y acceso a módulos.

### Cliente

Representa a un contacto o persona asociada al usuario. Puede estar ligado a pagos, renovaciones, agenda y seguimiento de planes.

### Movimiento financiero

Registra ingresos y gastos. Debe incluir fecha, descripción, monto, categoría y referencia a un usuario o cliente cuando aplique.

### Meta

Representa un objetivo financiero, personal o profesional. Puede estar vinculada a un usuario y a movimientos financieros.

### Agenda

Contiene eventos, citas, tareas y recordatorios. Puede relacionarse con usuarios, clientes y otros módulos.

### Entrenamiento

Representa un plan o programa de entrenamiento asociado a una persona o cliente.

### Rutina

Define una secuencia de actividades o sesiones dentro de un entrenamiento.

### Ejercicio

Describe una actividad específica dentro de una rutina, con detalles como nombre, descripción y enfoque.

### Plan nutricional

Define una estrategia nutricional orientada a objetivos específicos.

### Registro nutricional

Guarda el seguimiento diario o periódico de alimentación, hábitos o consumos.

### Evaluación

Registra una valoración del estado, progreso o rendimiento de una persona en un momento dado.

### Pago

Registra pagos realizados o pendientes relacionados con clientes, servicios o renovaciones.

### Renovación

Representa la renovación de un servicio, plan o relación con un cliente.

## Relaciones principales

- Un Usuario tiene muchos Clientes, Movimientos financieros, Metas, Eventos de Agenda y Planes de Entrenamiento.
- Un Cliente puede tener muchos Pagos, Renovaciones y eventos asociados.
- Un Entrenamiento puede contener muchas Rutinas.
- Una Rutina puede contener muchos Ejercicios.
- Un Plan nutricional puede tener muchos Registros nutricionales.
- Una Evaluación puede estar vinculada a un Usuario o Cliente.
- Una Renovación suele estar relacionada con un Pago y un Cliente.

## Recomendaciones de diseño

- Mantener relaciones claras y simples.
- Usar identificadores únicos para cada entidad.
- Registrar fechas y estados para facilitar seguimiento.
- Evitar redundancia de información entre módulos.

## Esquema inicial preparado para Supabase

Se añadieron tablas para:
- profiles
- accounts
- financial_movements
- recurring_transactions
- financial_goals
- debts
- clients
- client_payments

El diseño prioriza seguridad con RLS, perfiles por usuario autenticado y separación entre datos administrativos y datos de cliente.

## VALHALLA v0.8 - Entrenamiento Real Fase 1 (modelo local)

En esta fase no se modifica Supabase. Se crea un modelo local en `localStorage` para entrenamientos reales con versión explícita:

- `trainingModelVersion`: `0.8.0`
- `trainingsV08.plans`: arreglo para planes por cliente (preparado para fases futuras)
- `trainingsV08.sessions`: sesiones ejecutadas por cliente

Estructura objetivo local:

- Cliente (`clientId`)
- Plan de entrenamiento (`planId`, opcional en Fase 1)
- Sesión
	- `id`
	- `clientId`
	- `date`
	- `title`
	- `status` (`planned`, `in_progress`, `completed`)
	- `notes`
	- `groupSessionId` (opcional para small group futuro)
- Ejercicio dentro de la sesión
	- `id`
	- `exerciseName`
	- `order`
	- `plannedSets`
	- `plannedRepMin`
	- `plannedRepMax`
	- `targetWeight`
	- `restSeconds`
	- `coachNotes`
- Serie realizada
	- `setNumber`
	- `weight`
	- `reps`
	- `completed`
	- `createdAt`
	- `techniqueStatus` (preparado)
	- `coachValidated` (preparado)
	- `personalRecord` (preparado)

### Compatibilidad y migración

- Se mantiene la estructura legacy `trainings.students` y `trainings.routines` para no romper datos previos.
- Al cargar estado, se migra de forma segura desde `trainings.routines` hacia `trainingsV08.sessions` cuando sea necesario.
- La migración es no destructiva y conserva la información anterior.

## VALHALLA v0.8 - Entrenamiento Real Fase 2 (vista alumno)

La vista alumno usa exactamente el mismo modelo `trainingsV08` definido en Fase 1.

- No se crea un modelo paralelo.
- El registro serie por serie en modo alumno escribe en `trainingsV08.sessions[].exercises[].sets[]`.
- La corrección de series actualiza el mismo objeto de serie por `setNumber`.
- La detección de `personalRecord` se mantiene como bandera local no oficial.
- `coachValidated` sigue preparado para fases posteriores.

Campos operativos usados en Fase 2:

- Sesión: `id`, `clientId`, `date`, `title`, `status`, `notes`
- Ejercicio: `exerciseName`, `plannedSets`, `plannedRepMin`, `plannedRepMax`, `targetWeight`, `restSeconds`, `coachNotes`
- Series: `setNumber`, `weight`, `reps`, `completed`, `createdAt`, `personalRecord`, `coachValidated`

Privacidad visual de vista alumno:

- Solo se muestra información de entrenamiento del cliente seleccionado.
- No se muestran pagos, mensualidades, renovaciones ni datos financieros.
- No se muestran observaciones administrativas privadas; solo instrucciones técnicas por ejercicio (`coachNotes`).

## VALHALLA v0.8 - Fase 3 (sincronización Cloud de clientes y entrenamientos)

En Fase 3, cuando existe sesión autenticada en Cloud, `clients` y `trainingsV08` pasan a usar Supabase como fuente compartida.

- En sesión Cloud: se leen y escriben clientes/entrenamientos en Supabase.
- Sin sesión Cloud: se mantiene modo local.
- No se ejecuta migración automática de local hacia Cloud.

### Tablas nuevas de entrenamientos v0.8

- `training_plans`
- `training_sessions`
- `training_exercises`
- `training_sets`

Relación principal por `client_id` y `owner_id`.

Campos clave de series (`training_sets`):

- `weight`
- `reps`
- `set_number`
- `completed`
- `created_at`

Campos preparados:

- `technique_status`
- `coach_validated`
- `personal_record`

### Seguridad y RLS

- Admin: puede gestionar sus propios clientes y entrenamientos (`owner_id = auth.uid()`).
- Trainer: estructura preparada para fase futura, sin permisos temporales en esta fase.
- Client: solo lectura de sus propios entrenamientos, resolviendo por `clients.auth_user_id = auth.uid()`.
- No se habilitan políticas de escritura para clientes en entrenamientos en esta fase.

### Sincronización y conflictos

- En Cloud, la app sincroniza sesiones, ejercicios y series al guardar.
- El modo local se conserva como fallback cuando no hay sesión Cloud.
- Se evita usar local como fuente paralela de clientes/entrenamientos en sesión Cloud para no crear conflicto de autoridad.

### Flujo coach -> alumno -> registro

- El coach crea sesiones por cliente activo y define estado `planned`, `in_progress` o `completed`.
- Cada sesión contiene ejercicios ordenados por `exercise_order` con planificación de series/repeticiones/peso/descanso.
- El alumno registra series reales (`weight`, `reps`, `completed`) desde vista móvil de entrenamiento.
- El estado de sesión pasa a `in_progress` al registrar series y a `completed` al finalizar entrenamiento.

### Integridad de sincronización

- La sincronización profunda en Cloud aplica inserciones y actualizaciones.
- También limpia ejercicios y series eliminadas localmente para que Supabase refleje el estado real de la sesión.
- No se crean tablas adicionales ni se modifica `schema.sql` en este sprint.

## VALHALLA v0.8 - Sprint Plantillas y Asignación

En este sprint no se modifica base de datos. Se reutilizan las tablas existentes:

- `training_plans`: contenedor de plantillas reutilizables.
- `training_sessions`: sesión asignada a cliente (snapshot operativo).
- `training_exercises`: ejercicios planificados por sesión.
- `training_sets`: resultados ejecutados serie por serie.

Estrategia de plantillas en Cloud:

- El nombre de plantilla se almacena en `training_plans.name`.
- La estructura de ejercicios de la plantilla se serializa en `training_plans.notes` (JSON), manteniendo compatibilidad con notas de texto.
- Las sesiones creadas desde plantilla guardan `plan_id` en `training_sessions`.

Reglas clave:

- Una plantilla no guarda `sets` realizados.
- Al asignar plantilla o duplicar sesión, se copian solo campos de planificación.
- El historial de cargas sigue siendo individual por cliente y se consulta desde sesiones/sets previos.

Deuda técnica registrada:

- `training_plans.client_id` es obligatorio en esquema actual. Se utiliza como referencia de origen para mantener compatibilidad sin migración.
- Para plantillas globales puras desacopladas de cliente, se recomienda migración futura de esquema.

## VALHALLA v0.8 - Sprint Ficha Deportiva v1

Se agregan tres entidades nuevas para separar la información deportiva del cliente de finanzas, sesiones y resultados:

- `client_sports_profiles`
- `client_sports_considerations`
- `client_movement_statuses`

### Objetivo del diseño

- Evitar guardar la ficha como texto libre.
- Evitar reutilizar columnas de `clients` con otro propósito.
- Evitar mezclar restricciones deportivas o estados técnicos dentro de `training_sets`.
- Mantener el historial real en `training_sessions`, `training_exercises` y `training_sets`.

### client_sports_profiles

Una fila por cliente.

Campos principales:

- `primary_goal`
- `secondary_goal`
- `goal_notes`
- `experience_level`
- `experience_months`
- `coach_start_date`
- `sessions_per_week`
- `session_duration_minutes`
- `coach_notes`

### client_sports_considerations

Múltiples filas por cliente para restricciones, observaciones o antecedentes relevantes de entrenamiento.

Campos principales:

- `title`
- `description`
- `status` (`activa`, `en_observacion`, `resuelta`)
- `noted_on`
- `review_date`

### client_movement_statuses

Relación entre cliente y movimiento/ejercicio, usando nombre + clave normalizada temporal mientras no exista Biblioteca avanzada.

Campos principales:

- `movement_name`
- `movement_key`
- `status`
- `coach_note`
- `evaluated_1rm` (opcional)
- `last_evaluated_on`

### Marcas y progreso

- `Mejor carga registrada` se deriva del historial real en `training_sets`.
- No se calcula 1RM automáticamente.
- `evaluated_1rm` queda como campo opcional, explícito y separado.

### Seguridad

- Todas las tablas nuevas usan `owner_id` + `client_id`.
- Todas quedan cubiertas por RLS admin (`owner_id = auth.uid()` y `current_user_role() = 'admin'`).
- No se relajaron políticas existentes de clientes ni de entrenamientos.

### Migración manual futura

Se deja preparada una función manual futura:

- `Subir datos locales a Cloud`

No se dispara automáticamente en esta fase.
