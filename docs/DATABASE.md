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
