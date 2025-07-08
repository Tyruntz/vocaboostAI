// src/pages/api/conversations/create.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabaseClient'


export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { user_id, topik, waktu_mulai, pesan } = body;

  const { data, error } = await supabase
    .from("percakapan_chatbot")
    .insert([{ user_id, topik, waktu_mulai, pesan }])
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
};
