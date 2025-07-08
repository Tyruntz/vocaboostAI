// src/pages/api/materi/get-all.ts
import type { APIRoute } from 'astro';
// Impor supabaseAdmin karena Anda mungkin ingin mengabaikan RLS di sisi server
// untuk mengambil semua materi, terutama untuk admin.
import { supabaseAdmin } from '../../../../lib/supabaseServer'; // Pastikan path ini benar

export const prerender = false; // Penting: Pastikan ini disetel agar endpoint dieksekusi saat runtime, bukan di-prerender

export const GET: APIRoute = async () => {
  try {
    // Mengambil semua data dari tabel 'materi'
    // Gunakan supabaseAdmin untuk memastikan akses penuh tanpa terpengaruh RLS
    // (karena ini adalah fungsi admin).
    const { data, error } = await supabaseAdmin
      .from('topik_grammar') // Sesuaikan dengan nama tabel materi Anda di Supabase
      .select('id, nama_topik,deskripsi'); // Pilih kolom yang Anda butuhkan, minimal ID dan nama materi

    if (error) {
      console.error('Error fetching materi:', error.message);
      return new Response(
        JSON.stringify({
          message: 'Failed to fetch materi',
          error: error.message,
        }),
        {
          status: 500, // Internal Server Error
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Mengembalikan daftar materi sebagai JSON
    return new Response(
      JSON.stringify({
        message: 'Materi fetched successfully',
        materi: data, // Array objek materi
      }),
      {
        status: 200, // OK
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    console.error('API Error in get-all-materi:', err.message);
    return new Response(
      JSON.stringify({
        message: 'An unexpected error occurred while fetching materi',
        error: err.message,
      }),
      {
        status: 500, // Internal Server Error
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};