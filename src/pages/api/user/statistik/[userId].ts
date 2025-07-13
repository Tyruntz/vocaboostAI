import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const userId = params.userId;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
    });
  }

  // 1. Ambil semua id_soal yang pernah dijawab user
  const { data: soal_dijawab_raw, error: soalErr } = await supabaseAdmin
    .from('progress_pengguna')
    .select('id_soal')
    .eq('user_id', userId);

  if (soalErr) {
    return new Response(
      JSON.stringify({ error: 'Gagal ambil progress pengguna', detail: soalErr.message }),
      { status: 500 }
    );
  }

  // Hitung jumlah soal yang unik
  const soalSet = new Set(soal_dijawab_raw?.map((item) => item.id_soal));
  const total_dijawab = soalSet.size;

  // 2. Total soal tersedia
  const { count: total_soal } = await supabaseAdmin
    .from('soal_latihan')
    .select('*', { count: 'exact', head: true });

  // 3. Total jawaban benar oleh user
  const { count: total_benar } = await supabaseAdmin
    .from('progress_pengguna')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_correct', true);

  // 4. Topik paling sering diakses
  const { data: topik_teratas, error: topikErr } = await supabaseAdmin
    .rpc('get_topik_paling_banyak_diakses', { input_user_id: userId });

  if (topikErr) {
    return new Response(
      JSON.stringify({ error: 'Gagal ambil topik teratas', detail: topikErr.message }),
      { status: 500 }
    );
  }

  // Hitung persentase
  const penyelesaian = Math.round((total_dijawab ?? 0) / (total_soal ?? 1) * 100);
  const akurasi = Math.round((total_benar ?? 0) / (soal_dijawab_raw?.length || 1) * 100);

  return new Response(
    JSON.stringify({
      penyelesaian,
      total_dijawab,
      total_soal,
      akurasi,
      total_benar,
      topik_teratas,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
