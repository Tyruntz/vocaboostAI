import type { APIRoute } from 'astro';

import { supabaseAdmin } from '../../../lib/supabaseServer';

export const prerender = false; 
export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles') 
      .select('id, username, email ,created_at'); 

    if (error) {
      console.error('Error fetching user:', error.message);
      return new Response(
        JSON.stringify({
          message: 'Failed to fetch user',
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Ubah bagian ini: langsung kembalikan data (yang sudah berupa array)
    return new Response(
      JSON.stringify(data), // <-- LANGSUNG MENGIRIMKAN ARRAY 'data'
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    console.error('API Error in get-user:', err.message);
    return new Response(
      JSON.stringify({
        message: 'An unexpected error occurred while fetching user',
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};