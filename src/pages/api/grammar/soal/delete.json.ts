// src/pages/api/soal/delete.ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../../lib/supabaseServer'; // Pastikan path ini benar

export const prerender = false;

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body; // Asumsi body berisi ID soal yang akan dihapus

    // Validasi: Pastikan ID soal ada
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID soal diperlukan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabaseAdmin
      .from('soal_latihan') // Menggunakan nama tabel 'soal_latihan'
      .delete()
      .eq('id', id); // Filter berdasarkan ID soal yang akan dihapus

    if (error) {
      console.error('Error deleting soal:', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Soal berhasil dihapus.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('API Error in soal/delete:', err.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};