-- Ejemplos comentados para Supabase.
-- No usar datos reales ni credenciales.

-- Ejemplo de creación de perfil de administrador:
-- insert into public.profiles (id, full_name, role, active)
-- values ('00000000-0000-0000-0000-000000000000', 'Administrador demo', 'admin', true);

-- Ejemplo de cuenta básica:
-- insert into public.accounts (owner_id, name, account_type, currency, initial_balance, operational, active)
-- values ('00000000-0000-0000-0000-000000000000', 'Cuenta demo', 'checking', 'CLP', 100000, true, true);

-- Ejemplo de cliente de prueba:
-- insert into public.clients (owner_id, full_name, service, monthly_value, payment_status, client_status, active)
-- values ('00000000-0000-0000-0000-000000000000', 'Cliente demo', 'Semi', 70000, 'pending', 'active', true);
