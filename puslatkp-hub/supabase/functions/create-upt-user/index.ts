// @ts-nocheck
// Supabase Edge Function: create-upt-user (Secured)
// Verifikasi caller role admin, validasi input (email regex, min pass 8, whitelist upt_key),
// dan proteksi rollback transaksi (mencegah orphaned users).
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // 1. Verifikasi token pemanggil
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Sesi token tidak valid atau telah kedaluwarsa' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Verifikasi apakah pemanggil memiliki role 'admin'
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: callerProfile, error: profileCheckError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileCheckError || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Akses ditolak: Hanya Administrator yang diizinkan membuat akun UPT' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Baca dan validasi ketat body request
    const { email, password, nama_lengkap, upt_key } = await req.json()

    if (!email || !password || !nama_lengkap || !upt_key) {
      return new Response(JSON.stringify({ error: 'Parameter email, password, nama_lengkap, dan upt_key wajib diisi' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validasi format email
    if (!EMAIL_REGEX.test(String(email).trim())) {
      return new Response(JSON.stringify({ error: 'Format email tidak valid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validasi panjang password minimal 8 karakter
    if (String(password).length < 8) {
      return new Response(JSON.stringify({ error: 'Password minimal 8 karakter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validasi upt_key harus terdaftar dan aktif di tabel upt_list
    const { data: uptValid, error: uptCheckError } = await adminClient
      .from('upt_list')
      .select('key')
      .eq('key', upt_key)
      .eq('aktif', true)
      .single()

    if (uptCheckError || !uptValid) {
      return new Response(JSON.stringify({ error: `UPT dengan key '${upt_key}' tidak ditemukan atau tidak aktif` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Buat user via auth.admin
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: String(email).trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { nama_lengkap: String(nama_lengkap).trim(), upt_key, role: 'upt' },
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Masukkan profil ke tabel profiles
    const { error: insertProfileError } = await adminClient.from('profiles').insert({
      id: newUser.user.id,
      role: 'upt',
      upt_key,
      nama_lengkap: String(nama_lengkap).trim(),
    })

    // Rollback: Jika pembuatan profil gagal, hapus user dari auth.users agar tidak ada orphaned user
    if (insertProfileError) {
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return new Response(JSON.stringify({ error: 'Gagal membuat profil (transaksi dibatalkan): ' + insertProfileError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, user: newUser.user }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
