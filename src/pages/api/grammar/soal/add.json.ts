// src/pages/api/soal/add.ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../../lib/supabaseServer'; // Pastikan path ini benar

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    // Sesuaikan dengan nama kolom tabel 'soal_latihan' Anda
    const { topic_id, text_pertanyaan, tipe_pertanyaan, opsi, jawaban_benar, penjelasan, level, is_ai_generated } = body;

    // Validasi dasar: Pastikan kolom wajib ada
    if (!topic_id || !text_pertanyaan || !jawaban_benar) {
      return new Response(
        JSON.stringify({ error: 'Topic ID, pertanyaan, dan jawaban benar diperlukan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validasi tambahan untuk tipe_pertanyaan dan opsi
    if (tipe_pertanyaan === 'pilihan_ganda' && (!opsi || Object.keys(opsi).length === 0)) {
        return new Response(
            JSON.stringify({ error: 'Opsi diperlukan untuk tipe pertanyaan pilihan ganda.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
    // Jika tipe_pertanyaan bukan pilihan_ganda, set opsi menjadi null atau objek kosong sesuai kebutuhan DB
    const finalOpsi = tipe_pertanyaan === 'pilihan_ganda' ? opsi : {}; // Mengirim objek kosong jika bukan pilihan ganda

    const { data, error } = await supabaseAdmin
      .from('soal_latihan') // Menggunakan nama tabel 'soal_latihan'
      .insert({
        topic_id,
        text_pertanyaan,
        tipe_pertanyaan,
        opsi: finalOpsi, // Mengirim objek JSON ke kolom jsonb
        jawaban_benar,
        penjelasan,
        level,
        is_ai_generated,
        // created_at akan diatur otomatis oleh database jika disetel sebagai timestamptz dengan default NOW()
      })
      .select() // Penting: untuk mengembalikan data soal yang baru ditambahkan
      .single(); // Digunakan karena kita hanya menginsert satu baris

    if (error) {
      console.error('Error adding soal:', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Soal berhasil ditambahkan.', soal: data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('API Error in soal/add:', err.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};