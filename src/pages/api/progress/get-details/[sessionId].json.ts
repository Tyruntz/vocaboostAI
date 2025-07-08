// src/pages/api/progress/get-details/[sessionId].ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export const prerender = false;

// Definisi Tipe yang Lebih Ringkas dan Akurat
// Menggunakan Partial<T> untuk kolom yang mungkin null, dan string untuk tanggal/waktu
type TopikGrammarResult = {
  id: number;
  nama_topik: string | null;
  deskripsi: string | null;
  level: string | null;
};

type SoalLatihanResult = {
  id: number;
  topic_id: number;
  text_pertanyaan: string;
  tipe_pertanyaan: string;
  opsi: Record<string, string> | null;
  jawaban_benar: string;
  penjelasan: string | null;
  level: number;
  is_ai_generated: boolean;
  topik_grammar: TopikGrammarResult | null;
};

type ProgressDetailRow = {
  id: number;
  user_id: string;
  id_soal: number;
  jawaban_pengguna: string | null;
  is_correct: boolean;
  score_diperoleh: number;
  waktu_terjawab: string;
  session_id: string | null;
  soal_latihan: SoalLatihanResult | null;
};




export const GET: APIRoute = async ({ params }) => {
  const { sessionId } = params; // Destructuring langsung

  if (!sessionId) {
    return new Response(
      JSON.stringify({ message: 'Session ID diperlukan.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Menggunakan sintaks select yang ringkas dan aliasing eksplisit
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
  .eq('session_id', sessionId)
  .order('waktu_terjawab', { ascending: false })
  .returns<ProgressDetailRow[]>();

 // Urutkan berdasarkan waktu terjawab

    if (error) {
      console.error(`Supabase error fetching progress details for session ID ${sessionId}:`, error.message);
      return new Response(
        JSON.stringify({ message: 'Gagal mengambil detail progres.', error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Tidak ada detail progres ditemukan untuk sesi ini.', details: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Menggunakan map untuk memformat data yang lebih ringkas
   const formattedDetails = (data as ProgressDetailRow[]).map((item) => ({
  progress_id: item.id,
  user_id: item.user_id,
  question_id: item.id_soal,
  user_answer: item.jawaban_pengguna,
  is_correct: item.is_correct,
  score_earned: item.score_diperoleh,
  answered_at: new Date(item.waktu_terjawab).toLocaleString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }),
  session_id: item.session_id,
  question_text: item.soal_latihan?.text_pertanyaan,
  question_type: item.soal_latihan?.tipe_pertanyaan,
  question_options: item.soal_latihan?.opsi,
  correct_answer: item.soal_latihan?.jawaban_benar,
  explanation: item.soal_latihan?.penjelasan,
  question_level: item.soal_latihan?.level,
  topic_id: item.soal_latihan?.topik_grammar?.id,
  topic_name: item.soal_latihan?.topik_grammar?.nama_topik || 'N/A',
}));

    return new Response(
      JSON.stringify({ message: 'Berhasil mengambil detail progres.', details: formattedDetails }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('API Error in progress/get-details:', err.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};