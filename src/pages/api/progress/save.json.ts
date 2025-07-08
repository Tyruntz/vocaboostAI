// src/pages/api/progress/save.ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabaseServer'; // Gunakan supabaseAdmin untuk bypass RLS

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { user_id, id_soal, jawaban_pengguna, is_correct, score_diperoleh, session_id } = body; // Termasuk session_id jika Anda mengelolanya

    // Validasi dasar
    if (!user_id || !id_soal || typeof is_correct !== 'boolean' || typeof score_diperoleh !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Data progres tidak lengkap atau tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('progress_pengguna') // Nama tabel Anda
      .insert({
        user_id,
        id_soal,
        jawaban_pengguna,
        is_correct,
        score_diperoleh,
        waktu_terjawab: new Date().toISOString(), // Atur waktu di server untuk akurasi
        session_id: session_id || null, // Opsional: jika tidak ada, set null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user progress:', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Progres berhasil disimpan.', progress: data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('API Error in progress/save:', err.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};