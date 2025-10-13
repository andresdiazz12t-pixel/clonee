# Gestión de roles en Supabase

La política de RLS creada para `public.profiles` utiliza el campo `role` de la propia tabla para validar si la sesión autenticada pertenece a un administrador. No se requiere configurar un claim JWT adicional; basta con que el usuario autenticado tenga `role = 'admin'` en `public.profiles`.

Para actualizar el rol de un usuario se expone la función `set_user_role` como RPC desde el cliente. Esta función:

- Solo puede ser ejecutada por sesiones autenticadas.
- Valida que `auth.uid()` pertenezca a un perfil con `role = 'admin'` antes de aplicar cambios.
- Permite alternar entre los roles `admin` y `user`.

Asegúrate de asignar el rol `admin` directamente en la base de datos (por ejemplo, mediante la propia función `set_user_role`) al menos a un usuario para poder gestionar roles desde la interfaz de administración.
