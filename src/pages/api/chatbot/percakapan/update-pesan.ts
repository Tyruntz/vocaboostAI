import type { APIRoute } from 'astro';
import {supabase} from '../../../../lib/supabaseClient'

export const prerender = false;


export const PUT: APIRoute = async ({ request }) => {
  const { id, pesan } = await request.json();

  const { error } = await supabase
    .from("percakapan_chatbot")
    .update({ pesan })
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Pesan diperbarui" }), { status: 200 });
};
