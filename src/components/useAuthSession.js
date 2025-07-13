import { useEffect, useState } from "react";
import { navigate } from "astro:transitions/client";
import { supabase } from "../lib/supabaseClient"; // sesuaikan path

export const useAuthSession = () => {
   const [userLogin, setUserLogin] = useState(null);
   const [userId, setUserId] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const { data: listener } = supabase.auth.onAuthStateChange(
         (event, session) => {
            if (!session) {
               setUserLogin(null);
               setUserId(null);
               if (event === "SIGNED_OUT") {
                  navigate("/auth/login", { replace: true });
               }
            }
         }
      );

      return () => {
         listener.subscription.unsubscribe();
      };
   }, []);

   useEffect(() => {
      const getSession = async () => {
         try {
            const { data, error } = await supabase.auth.getSession();

            if (data?.session) {
               const user = data.session.user;

               // Fetch full profile
               const { data: profile, error: profileError } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", user.id)
                  .single();

               if (profileError) {
                  console.error("Gagal ambil profil:", profileError.message);
               }

               // Gabungkan auth user dan profil
               const userWithProfile = {
                  ...user,
                  profile, // simpan semua info profil di dalam properti `profile`
               };

               setUserLogin(userWithProfile);
               setUserId(user.id);

               // Redirect jika admin
               if (profile?.role === "admin") {
                  navigate("/admin-dashboard");
               } else {
                  console.log("Login sebagai user biasa");
               }
            } // Di dalam useEffect
            else if (!data?.session) {
               setUserLogin(null);
               alert("Sesi login telah berakhir. Silakan login kembali.");
               navigate("/auth/login", { replace: true }); // cegah tombol back
            } else {
               // Tidak ada session login
               setUserLogin(null);
               alert(
                  "Sesi login tidak ditemukan. Silakan login terlebih dahulu."
               );
               navigate("/auth/login");
            }
         } catch (err) {
            console.error("Gagal mendapatkan session:", err.message);
            setError("Gagal mendapatkan session");
            alert("Terjadi kesalahan saat mengecek sesi login.");
            navigate("/auth/login");
         } finally {
            setLoading(false);
         }
      };

      getSession();
   }, []);

   return {
      userLogin,
      userId,
      loading,
      error,
      setLoading,
      setUserLogin,
      setError,
      setUserId,
   };
};
