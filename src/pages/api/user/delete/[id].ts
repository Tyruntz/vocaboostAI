import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
   const userId = params.id;

   if (!userId) {
      return new Response(
         JSON.stringify({ error: "User ID tidak ditemukan" }),
         { status: 400 }
      );
   }

   const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
   const serviceKey = (await supabaseAdmin.auth.getSession())
      ? (await supabaseAdmin.auth.getSession()).data.session?.access_token
      : import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

   try {
      // 1. Hapus dari auth.users
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
         userId
      );

      if (authError) {
         return new Response(
            JSON.stringify({
               error: "Gagal hapus dari auth.users",
               detail: authError.message,
            }),
            { status: 500 }
         );
      }

      // 2. Hapus dari tabel profiles
      const { error: profileError } = await supabaseAdmin
         .from("profiles")
         .delete()
         .eq("id", userId);

      if (profileError) {
         return new Response(
            JSON.stringify({
               error: "Gagal hapus dari tabel profiles",
               detail: profileError.message,
            }),
            { status: 500 }
         );
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
   } catch (err) {
      return new Response(
         JSON.stringify({ error: "Gagal menghapus pengguna", detail: err }),
         { status: 500 }
      );
   }
};
