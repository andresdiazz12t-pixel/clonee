# Gestión de roles en Supabase

La política de RLS creada para `public.profiles` utiliza el campo `role` de la propia tabla para validar si la sesión autenticada pertenece a un administrador. No se requiere configurar un claim JWT adicional; basta con que el usuario autenticado tenga `role = 'admin'` en `public.profiles`.

Para actualizar el rol de un usuario se expone la función `set_user_role` como RPC desde el cliente. Esta función:

- Solo puede ser ejecutada por sesiones autenticadas.
- Valida que `auth.uid()` pertenezca a un perfil con `role = 'admin'` antes de aplicar cambios.
- Permite alternar entre los roles `admin` y `user`.

Asegúrate de asignar el rol `admin` directamente en la base de datos (por ejemplo, mediante la propia función `set_user_role`) al menos a un usuario para poder gestionar roles desde la interfaz de administración.

## Autenticación basada en Supabase Auth

- Los usuarios se autentican ahora contra Supabase Auth utilizando un correo sintético generado a partir de su número de identificación (`<identificacion>@id.local`). Este correo no se expone en la interfaz, pero debe permanecer sincronizado con `public.profiles.identification_number` para que el inicio de sesión funcione.
- La información de contacto real (correo personal, teléfono, etc.) sigue almacenada en `public.profiles`.
- Desactiva la verificación de correo en la consola de Supabase: navega a **Authentication → Providers → Email** y deshabilita **Confirm email**. Esto garantiza que los registros con correos sintéticos se activen inmediatamente.
- Si cambias el número de identificación desde la aplicación, recuerda que el correo sintético se actualizará de forma automática mediante `supabase.auth.updateUser`.
- Tras migrar usuarios existentes ejecuta `ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_id_auth_users_fkey;` para asegurar que todos los perfiles referencian a su usuario de Auth.
