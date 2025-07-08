// // src/pages/api/auth/login.ts
// import type { APIRoute } from 'astro';
// import { supabase } from '../../../lib/supabaseClient'; // Pastikan path ini benar dan ini adalah klien PUBLIK

// export const prerender = false;

// export const POST: APIRoute = async ({ request, cookies }) => {
//   try {
//     const { email, password } = await request.json();

//     const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//       email: email,
//       password: password,
//     });

//     if (authError) {
//       console.error('Supabase Auth Login Error:', authError.message);
//       return new Response(
//         JSON.stringify({
//           message: 'Login failed',
//           error: authError.message,
//         }),
//         {
//           status: 401,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     const user = authData.user;
//     const session = authData.session;

//     if (!user || !session) {
//       return new Response(
//         JSON.stringify({
//           message: 'Login successful, but no user or session data returned.',
//           error: 'Missing user or session data.',
//         }),
//         {
//           status: 401,
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );
//     }

//     // --- Perbaikan `session.expires_at` di sini ---
//     let expiresInSeconds = 3600; // Default 1 jam jika expires_at tidak ada atau undefined
//     if (session.expires_at !== undefined && session.expires_at !== null) {
//         expiresInSeconds = session.expires_at - Math.floor(Date.now() / 1000);
//         // Pastikan expiresInSeconds tidak negatif jika token sudah kadaluarsa (walau jarang terjadi setelah login sukses)
//         if (expiresInSeconds < 0) {
//             expiresInSeconds = 0;
//         }
//     }
//     // --- Akhir Perbaikan ---

    
//     cookies.set('sb-access-token', session.access_token, {
//       path: '/',
//       sameSite: 'lax', // <--- UBAH 'Lax' menjadi 'lax'
//       httpOnly: true,
//       secure: import.meta.env.PROD,
//       maxAge: expiresInSeconds,
//     });

//     cookies.set('sb-refresh-token', session.refresh_token, {
//       path: '/',
//       sameSite: 'lax', // <--- UBAH 'Lax' menjadi 'lax'
//       httpOnly: true,
//       secure: import.meta.env.PROD,
//       maxAge: expiresInSeconds,
//     });

//     return new Response(
//       JSON.stringify({
//         message: 'Login successful',
//         user: {
//           id: user.id,
//           email: user.email,
//         },
//       }),
//       {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   } catch (error: any) {
//     console.error('API Login Error:', error.message);
//     return new Response(
//       JSON.stringify({
//         message: 'An unexpected error occurred during login',
//         error: error.message,
//       }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   }
// };