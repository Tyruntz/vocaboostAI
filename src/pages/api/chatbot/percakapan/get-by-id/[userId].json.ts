// src/pages/api/conversations.ts
// Ini akan menangani GET untuk mengambil semua percakapan pengguna yang login
// dan bisa juga menangani POST untuk membuat percakapan baru di file yang sama.

import type { APIRoute } from "astro";

import { supabase } from "../../../../../lib/supabaseClient"; // Pastikan path ini sesuai dengan struktur proyek Anda

export const prerender = false; // Penting: Pastikan ini disetel agar endpoint dieksekusi saat runtime

// --- GET Method: Ambil semua percakapan untuk user yang login ---
export const GET: APIRoute = async ({ params }) => {
   // Menerima `params` untuk mendapatkan [materiId]
   const userID = params.userId; // Mengambil nilai materiId dari URL

   if (!userID) {
      return new Response(
         JSON.stringify({
            message: " ID diperlukan.",
            error: "id parameter.",
         }),
         {
            status: 400, // Bad Request
            headers: {
               "Content-Type": "application/json",
            },
         }
      );
   }

   try {
      const { data, error } = await supabase
         .from("percakapan_chatbot")
         .select("*") // ini akan include array pesan dari relasi
         .eq("user_id", userID)
         .order("waktu_mulai", { ascending: false });

      if (error) {
         console.error(`Error fetching for ID ${userID}:`, error.message);
         return new Response(
            JSON.stringify({
               message: `Failed to fetch for ID ${userID}`,
               error: error.message,
            }),
            {
               status: 500,
               headers: {
                  "Content-Type": "application/json",
               },
            }
         );
      }

      return new Response(
         JSON.stringify({
            message: `Percakapan for ID ${userID} fetched successfully`,
            data: data, // <- data di sini sudah termasuk array pesan
         }),
         {
            status: 200,
            headers: {
               "Content-Type": "application/json",
            },
         }
      );
   } catch (err: any) {
      console.error("API Error:", err.message);
      return new Response(
         JSON.stringify({
            message: "An unexpected error occurred while fetching",
            error: err.message,
         }),
         {
            status: 500, // Internal Server Error
            headers: {
               "Content-Type": "application/json",
            },
         }
      );
   }
};
