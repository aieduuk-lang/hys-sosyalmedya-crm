'use server';

import { createClient } from '@supabase/supabase-js';

export async function inviteUser(email: string): Promise<{ error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: 'Supabase yapılandırması eksik. SUPABASE_SERVICE_ROLE_KEY kontrol edin.' };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { error: 'Bu e-posta adresi zaten kayıtlı.' };
    }
    return { error: error.message };
  }

  return {};
}
