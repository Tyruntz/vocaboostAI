// src/pages/api/soal/get-by-materi/[materiId].ts
import type { APIRoute } from 'astro';
// Impor supabaseAdmin karena Anda mungkin ingin mengabaikan RLS di sisi server
// untuk mengambil semua soal, terutama untuk admin.
import { supabaseAdmin } from '../../../../../lib/supabaseServer'; // Pastikan path ini benar (sesuaikan kedalamannya)

export const prerender = false; // Penting: Pastikan ini disetel agar endpoint dieksekusi saat runtime

export const GET: APIRoute = async ({ params }) => { // Menerima `params` untuk mendapatkan [materiId]
  const materiId = params.materiId; // Mengambil nilai materiId dari URL

  // Validasi: Pastikan materiId ada
  if (!materiId) {
    return new Response(
      JSON.stringify({
        message: 'Materi ID diperlukan.',
        error: 'Missing materiId parameter.',
      }),
      {
        status: 400, // Bad Request
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    // Mengambil semua data dari tabel 'soal' yang memiliki materi_id sesuai
    // Gunakan supabaseAdmin untuk memastikan akses penuh tanpa terpengaruh RLS
    // (karena ini adalah fungsi admin untuk mengelola soal).
    const { data, error } = await supabaseAdmin
      .from('soal_latihan') // Sesuaikan dengan nama tabel soal Anda di Supabase
      .select('*') // Pilih semua kolom soal
      .eq('topic_id', materiId); // Filter berdasarkan materi_id yang diterima

    if (error) {
      console.error(`Error fetching soal for materi ID ${materiId}:`, error.message);
      return new Response(
        JSON.stringify({
          message: `Failed to fetch soal for materi ID ${materiId}`,
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

    // Mengembalikan daftar soal sebagai JSON
    return new Response(
      JSON.stringify({
        message: `Soal for materi ID ${materiId} fetched successfully`,
        soal: data, // Array objek soal
      }),
      {
        status: 200, // OK
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    console.error('API Error in get-soal-by-materi:', err.message);
    return new Response(
      JSON.stringify({
        message: 'An unexpected error occurred while fetching soal',
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