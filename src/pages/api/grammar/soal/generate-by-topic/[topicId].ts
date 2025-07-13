import type { APIRoute } from 'astro';
import { generateSoalDenganAI } from '../../../../../lib/generateSoalDenganAI';
import { supabaseAdmin } from '../../../../../lib/supabaseServer';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const rawTopicId = params.topicId;

  if (!rawTopicId) {
    return new Response(JSON.stringify({ error: 'Invalid topicId' }), { status: 400 });
  }

  const cleanTopicId = rawTopicId.replace('.json', '');
  const topicIdNumber = parseInt(cleanTopicId); // Sesuaikan jika ID-mu UUID => skip parseInt

  if (isNaN(topicIdNumber)) {
    return new Response(JSON.stringify({ error: 'Topic ID harus berupa angka.' }), {
      status: 400,
    });
  }

  // 🔥 Ambil nama_topik dari database Supabase
  const { data, error } = await supabaseAdmin
    .from('topik_grammar')
    .select('nama_topik')
    .eq('id', topicIdNumber)
    .single();

  if (error || !data) {
    console.error('Gagal ambil nama_topik dari Supabase:', error?.message);
    return new Response(JSON.stringify({ error: 'Gagal mengambil nama_topik' }), {
      status: 500,
    });
  }

  const namaTopik = data.nama_topik;

  try {
    // 🧠 Lempar nama topik ke fungsi AI
    const soal = await generateSoalDenganAI(cleanTopicId, namaTopik);
    return new Response(JSON.stringify({ soal }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gagal generate soal AI:', error);
    return new Response(
      JSON.stringify({ error: 'Gagal generate soal dari AI.' }),
      { status: 500 }
    );
  }
};
