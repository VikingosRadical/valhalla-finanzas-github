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
