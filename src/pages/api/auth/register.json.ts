// src/pages/api/register.ts
import type { APIRoute } from 'astro';
// Pastikan Anda mengimpor kedua klien: 'supabase' (untuk signUp) dan 'supabaseAdmin' (untuk insert profil)
import { supabase } from '../../../lib/supabaseClient'; // Pastikan path ini benar
import { supabaseAdmin } from '../../../lib/supabaseServer'; // Pastikan path ini benar untuk klien sisi server
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, username } = await request.json();

    // 1. Registrasi user menggunakan Supabase Auth (auth.users)
    // Gunakan klien 'supabase' (dengan anon key) untuk operasi signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError.message);
      return new Response(
        JSON.stringify({
          message: 'Registration failed',
          error: authError.message,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const user = authData.user;
    if (!user) {
      return new Response(
        JSON.stringify({
          message: 'Registration successful, but user data not returned. Please try logging in.',
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({ // <--- GANTI 'supabase' MENJADI 'supabaseAdmin' DI SINI
      id: user.id,
      email: user.email,
      username: username,
      role: 'user',
    });

    if (profileError) {
      console.error('Supabase Profile Error:', profileError.message);
      try {
        // Gunakan 'supabaseAdmin' untuk rollback deleteUser
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log(`User ${user.id} rolled back due to profile creation failure.`);
      } catch (deleteError: any) {
        console.error('Failed to rollback user deletion:', deleteError.message);
      }
      return new Response(
        JSON.stringify({
          message: 'Profile creation failed. User registration rolled back.',
          error: profileError.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Respon sukses
    return new Response(
      JSON.stringify({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          username: username,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('API Error:', error.message);
    return new Response(
      JSON.stringify({
        message: 'An unexpected error occurred',
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};