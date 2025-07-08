// src/pages/api/progress/get-by-user/[userId].ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../../lib/supabaseServer'; // Pastikan path ini benar untuk klien sisi server

export const prerender = false;

// Definisi Tipe untuk Hasil Query dari Supabase
// Ini membantu TypeScript memahami struktur data setelah join
type TopikGrammarResult = {
  id: number;
  nama_topik: string | null;
  deskripsi: string | null;
  level: string | null; // Sesuai dengan tipe varchar
};

type SoalLatihanResult = {
  id: number; // ID dari tabel soal_latihan itu sendiri
  topic_id: number;
  text_pertanyaan: string;
  tipe_pertanyaan: string;
  opsi: Record<string, string> | null; // jsonb dipetakan ke objek JavaScript
  jawaban_benar: string;
  penjelasan: string | null;
  level: number;
  is_ai_generated: boolean;
  // Nama properti relasi nested: Supabase akan mengembalikan 'topik_grammar'
  topik_grammar: TopikGrammarResult | null;
};

type ProgressRowResult = {
  id: number;
  user_id: string;
  id_soal: number;
  jawaban_pengguna: string | null;
  is_correct: boolean;
  score_diperoleh: number;
  waktu_terjawab: string; // timestamptz dipetakan ke string ISO
  session_id: string | null;
  // Nama properti relasi: Supabase akan mengembalikan 'soal_latihan'
  soal_latihan: SoalLatihanResult | null;
};

// Tipe untuk data yang digrupkan (ringkasan yang dikirim ke frontend)
type GroupedProgressData = {
  id: string; // ID unik untuk setiap ringkasan materi/sesi
  materi_id: number;
  materi_nama: string;
  total_soal_dijawab: number;
  total_benar: number;
  total_skor: number;
  tanggal_latihan: string; // Tanggal dari soal terbaru di sesi tersebut
  details: ProgressRowResult[]; // Detail soal mentah (opsional untuk frontend)
};

export const GET: APIRoute = async ({ params }) => {
  const userId = params.userId;

  if (!userId) {
    return new Response(
      JSON.stringify({ message: 'User ID diperlukan.', error: 'Missing userId parameter.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Melakukan query ke progress_pengguna dengan nested join
    // Menggunakan aliasing eksplisit untuk relasi agar sesuai dengan nama tabel
    const { data, error } = await supabaseAdmin
      .from('progress_pengguna')
      .select(`
        id,
        user_id,
        id_soal,
        jawaban_pengguna,
        is_correct,
        score_diperoleh,
        waktu_terjawab,
        session_id,
        soal_latihan:id_soal ( 
          id,
          topic_id,
          text_pertanyaan,
          tipe_pertanyaan,
          opsi,
          jawaban_benar,
          penjelasan,
          level,
          is_ai_generated,
          topik_grammar:topic_id ( 
            id,
            nama_topik,
            deskripsi,
            level
          )
        )
      `)
      .eq('user_id', userId)
      .order('waktu_terjawab', { ascending: false }) // Urutkan dari yang terbaru
      .returns<ProgressRowResult[]>(); // Memberikan tipe ke hasil query

    if (error) {
      console.error(`Supabase error fetching progress for user ID ${userId}:`, error.message);
      return new Response(
        JSON.stringify({ message: 'Gagal mengambil data progres.', error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Tidak ada data progres ditemukan.', results: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Mengelompokkan hasil berdasarkan materi dan ID sesi
    const groupedProgress = data.reduce((acc: Record<string, GroupedProgressData>, current) => {
      // Akses properti relasi dengan aman
      const soalLatihan = current.soal_latihan;
      const topikGrammar = soalLatihan?.topik_grammar;

      // Lewati entri jika data relasi tidak lengkap (misalnya soal_latihan atau topik_grammar null)
      if (!soalLatihan || !topikGrammar || !topikGrammar.id) {
          console.warn(`Progress entry ${current.id} has incomplete related data (soal_latihan or topik_grammar missing). Skipping.`);
          return acc;
      }

      const topicId = topikGrammar.id;
      const topicName = topikGrammar.nama_topik || 'Materi Tidak Dikenal'; // Menggunakan nama_topik dari topik_grammar
      const sessionId = current.session_id || 'no_session'; // Menggunakan 'no_session' sebagai fallback string

      const key = `${topicId}-${sessionId}`; // Kunci unik untuk setiap sesi latihan per materi

      if (!acc[key]) {
        acc[key] = {
          id: `${topicId}-${sessionId}-${Math.random().toString(36).substring(7)}`, // ID unik untuk ringkasan di frontend
          materi_id: topicId,
          materi_nama: topicName,
          total_soal_dijawab: 0,
          total_benar: 0,
          total_skor: 0,
          tanggal_latihan: current.waktu_terjawab, // Inisialisasi dengan waktu_terjawab pertama untuk grup ini
          details: [],
        };
      }

      acc[key].total_soal_dijawab++;
      acc[key].total_skor += current.score_diperoleh;
      if (current.is_correct) {
        acc[key].total_benar++;
      }

      // Update tanggal_latihan jika `waktu_terjawab` dari soal saat ini lebih baru
      if (current.waktu_terjawab && new Date(current.waktu_terjawab) > new Date(acc[key].tanggal_latihan)) {
        acc[key].tanggal_latihan = current.waktu_terjawab;
      }

      acc[key].details.push(current); // Simpan detail soal mentah untuk analisis lebih lanjut jika diperlukan

      return acc;
    }, {}); // Inisialisasi Record untuk accumulator

    // Mengubah objek yang digrupkan menjadi array hasil ringkasan untuk frontend
     const summaryResults = Object.values(groupedProgress).map(group => {
      const percentage = (group.total_soal_dijawab > 0) ? (group.total_benar / group.total_soal_dijawab) * 100 : 0;
      let status = 'Mengulang';
      if (percentage >= 80) {
          status = 'Sangat Baik';
      } else if (percentage >= 60) {
          status = 'Baik';
      }

      return {
        id: group.id, // Ini adalah ID ringkasan gabungan (misal: "2-09de3072-...")
        real_session_id: group.details[0]?.session_id, // <--- TAMBAH INI: Ambil session_id asli dari detail pertama di grup
        materi: group.materi_nama,
        tanggal: new Date(group.tanggal_latihan).toLocaleDateString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        skor: `${group.total_benar} / ${group.total_soal_dijawab}`,
        status: status,
        raw_score: group.total_skor,
        total_questions: group.total_soal_dijawab,
      };
    });

    return new Response(
      JSON.stringify({ message: 'Berhasil mengambil progres pengguna.', results: summaryResults }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('API Error in get-progress-by-user:', err.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
