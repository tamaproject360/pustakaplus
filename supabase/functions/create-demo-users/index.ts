import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const demoUsers = [
  { email: 'admin@pustakaplus.go.id', password: 'Demo@1234', name: 'Super Administrator', role: 'super_admin', unit_kerja: 'Divisi Teknologi Informasi' },
  { email: 'pustakawan@pustakaplus.go.id', password: 'Demo@1234', name: 'Budi Santoso', role: 'pustakawan', unit_kerja: 'Unit Perpustakaan' },
  { email: 'kontributor@pustakaplus.go.id', password: 'Demo@1234', name: 'Siti Rahayu', role: 'kontributor', unit_kerja: 'Divisi Penelitian & Pengembangan' },
  { email: 'pembaca@pustakaplus.go.id', password: 'Demo@1234', name: 'Ahmad Fauzi', role: 'pembaca', unit_kerja: 'Divisi Umum' },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const u of demoUsers) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', u.email)
        .maybeSingle();

      if (existing) {
        results.push({ email: u.email, status: 'already_exists' });
        continue;
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name, role: u.role },
      });

      if (authError) {
        results.push({ email: u.email, status: 'error', message: authError.message });
        continue;
      }

      if (authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: u.email,
          name: u.name,
          role: u.role,
          unit_kerja: u.unit_kerja,
          is_active: true,
        });
        results.push({ email: u.email, status: 'created', role: u.role });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
