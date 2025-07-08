// src/pages/api/conversations/add-message.ts
import type { APIRoute } from 'astro';
import {supabase} from '../../../../lib/supabaseClient'

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Dapatkan ID Pengguna yang Login (Verifikasi Token)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token missing' }), { status: 401 });
    }

    const { data: userAuth, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userAuth.user) {
      console.error('API /conversations/add-message: Auth Error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token or user not found' }), { status: 401 });
    }

    const userId = userAuth.user.id;

    // 2. Baca body permintaan JSON
    const body = await request.json();
    const { conversation_id, tipe_pengirim, teks_pesan } = body;

    // Validasi input
    if (!conversation_id || !tipe_pengirim || !teks_pesan) {
      return new Response(
        JSON.stringify({
          message: 'conversation_id, tipe_pengirim, dan teks_pesan diperlukan.',
          error: 'Missing required parameters.'
        }),
        { status: 400 }
      );
    }

    // Buat objek pesan baru
    const newMessage = {
      id: Date.now(), // Gunakan timestamp sebagai ID pesan unik dalam array
      tipe_pengirim: tipe_pengirim,
      teks_pesan: teks_pesan,
      waktu_kirim: new Date().toISOString(), // Waktu saat ini dalam format ISO
    };

    // 3. Panggil fungsi SQL kustom menggunakan supabase.rpc()
    const { data, error: rpcError } = await supabase.rpc('add_message_to_conversation', {
      _conversation_id: conversation_id,
      _user_id: userId,
      _new_message: newMessage, // Kirim objek pesan sebagai jsonb
    });

    if (rpcError) {
      console.error('API /conversations/add-message: RPC Error:', rpcError);
      return new Response(
        JSON.stringify({
          message: 'Gagal menambahkan pesan ke percakapan.',
          error: rpcError.message,
        }),
        { status: 500 }
      );
    }

    // RPC akan mengembalikan array dari baris yang dikembalikan oleh fungsi SQL
    // Dalam kasus ini, kita berharap satu baris percakapan yang diupdate
    const updatedConversation = data && data.length > 0 ? data[0] : null;

    if (!updatedConversation) {
        return new Response(JSON.stringify({ error: 'Failed to retrieve updated conversation data.' }), { status: 500 });
    }

    // 4. Mengembalikan percakapan yang diupdate (dengan pesan baru di dalamnya)
    return new Response(
      JSON.stringify({
        message: 'Pesan berhasil ditambahkan.',
        conversation: updatedConversation,
        newMessage: newMessage // Juga kembalikan pesan yang baru ditambahkan secara terpisah
      }),
      {
        status: 200, // OK
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('API /conversations/add-message: Unexpected Server Error:', err.message);
    return new Response(
      JSON.stringify({
        message: 'Terjadi kesalahan tak terduga saat menambahkan pesan.',
        error: err.message,
      }),
      { status: 500 }
    );
  }
};