// src/pages/api/soal/edit.ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../../lib/supabaseServer'; // Pastikan path ini benar

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    // Sesuaikan dengan nama kolom tabel 'soal_latihan' Anda
    const { id, topic_id, text_pertanyaan, tipe_pertanyaan, opsi, jawaban_benar, penjelasan, level, is_ai_generated } = body;

    // Validasi dasar: Pastikan ID dan kolom wajib ada
    if (!id || !topic_id || !text_pertanyaan || !jawaban_benar) {
      return new Response(
        JSON.stringify({ error: 'ID, Topic ID, pertanyaan, dan jawaban benar diperlukan.' }),
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
    const finalOpsi = tipe_pertanyaan === 'pilihan_ganda' ? opsi : {};

    const { data, error } = await supabaseAdmin
      .from('soal_latihan') // Menggunakan nama tabel 'soal_latihan'
      .update({
        topic_id,
        text_pertanyaan,
        tipe_pertanyaan,
        opsi: finalOpsi, // Mengirim objek JSON ke kolom jsonb
        jawaban_benar,
        penjelasan,
        level,
        is_ai_generated,
      })
      .eq('id', id) // Filter berdasarkan ID soal yang akan diupdate
      .select() // Untuk mengembalikan data yang diperbarui
      .single(); // Digunakan karena kita hanya mengupdate satu baris

    if (error) {
      console.error('Error updating soal:', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Soal berhasil diperbarui.', soal: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('API Error in soal/edit:', err.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};