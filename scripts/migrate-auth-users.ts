import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import type { Database } from '../src/lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

type MigrationResult = {
  identificationNumber: string;
  syntheticEmail: string;
  temporaryPassword?: string;
  status: 'created' | 'existing' | 'skipped';
  notes?: string;
};

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL (o VITE_SUPABASE_URL) no está definido en el entorno.');
}

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY no está definido en el entorno.');
}

const adminClient = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

const generateTemporaryPassword = () => `Temp-${randomBytes(8).toString('hex')}`;

async function fetchProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron leer los perfiles: ${error.message}`);
  }

  return data ?? [];
}

async function createAuthUser(
  profile: ProfileRow
): Promise<{ userId: string | null; temporaryPassword?: string; status: MigrationResult['status']; notes?: string }> {
  if (!profile.identification_number) {
    return {
      userId: null,
      status: 'skipped',
      notes: 'El perfil no tiene número de identificación.'
    };
  }

  const syntheticEmail = `${profile.identification_number}@id.local`.toLowerCase();

  const existingUser = await adminClient.auth.admin.getUserByEmail(syntheticEmail);

  if (existingUser.data?.user) {
    return {
      userId: existingUser.data.user.id,
      status: 'existing'
    };
  }

  const temporaryPassword = generateTemporaryPassword();

  const { data, error } = await adminClient.auth.admin.createUser({
    email: syntheticEmail,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      identification_number: profile.identification_number,
      legacy_profile_id: profile.id
    }
  });

  if (error || !data.user) {
    return {
      userId: null,
      status: 'skipped',
      notes: error?.message ?? 'Supabase Auth no devolvió un usuario.'
    };
  }

  return {
    userId: data.user.id,
    temporaryPassword,
    status: 'created'
  };
}

async function updateProfileId(oldId: string, newId: string) {
  if (oldId === newId) {
    return;
  }

  const { error } = await adminClient
    .from('profiles')
    .update({ id: newId })
    .eq('id', oldId);

  if (error) {
    throw new Error(`No se pudo actualizar el perfil ${oldId} -> ${newId}: ${error.message}`);
  }
}

async function synchronizeMetadata(profileId: string, identificationNumber: string) {
  const { error } = await adminClient.auth.admin.updateUserById(profileId, {
    email: `${identificationNumber}@id.local`.toLowerCase(),
    email_confirm: true,
    user_metadata: {
      identification_number: identificationNumber
    }
  });

  if (error) {
    throw new Error(`No se pudo sincronizar el metadata del usuario ${profileId}: ${error.message}`);
  }
}

async function main() {
  const profiles = await fetchProfiles();
  const results: MigrationResult[] = [];

  for (const profile of profiles) {
    const syntheticEmail = profile.identification_number
      ? `${profile.identification_number}@id.local`.toLowerCase()
      : 'sin-identificacion';

    try {
      const { userId, temporaryPassword, status, notes } = await createAuthUser(profile);

      if (!userId) {
        results.push({
          identificationNumber: profile.identification_number ?? 'N/D',
          syntheticEmail,
          status,
          notes
        });
        continue;
      }

      await updateProfileId(profile.id, userId);
      await synchronizeMetadata(userId, profile.identification_number);

      results.push({
        identificationNumber: profile.identification_number,
        syntheticEmail,
        temporaryPassword,
        status,
        notes
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        identificationNumber: profile.identification_number ?? 'N/D',
        syntheticEmail,
        status: 'skipped',
        notes: message
      });
    }
  }

  console.table(results);
  console.info('\nGuarda las contraseñas temporales en un lugar seguro o programa un reseteo masivo.');
  console.info('Después de ejecutar este script, valida la restricción con: ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_id_auth_users_fkey;');
}

main().catch((error) => {
  console.error('Fallo la migración de usuarios de Auth:', error);
  process.exit(1);
});
