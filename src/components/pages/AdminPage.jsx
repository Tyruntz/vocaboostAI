import React, { useState, useEffect } from "react";
import KelolaSoal from "./Content/KelolaSoal";
import { supabase } from "../../lib/supabaseClient";
import ManajemenPengguna from "./Content/ManajemenPengguna";

const AdminPage = () => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
   const [sesiChatbot, setSesiChatbot] = useState(0);
   const [latihanSelesai, setLatihanSelesai] = useState(0);

   const [totalUsers, setTotalUsers] = useState(0);
   const [totalUsersLoading, setTotalUsersLoading] = useState(true);
   const [totalUsersError, setTotalUsersError] = useState(null);

   const fetchUserProfile = async (authUser) => {
      const { data: profile, error: profileError } = await supabase
         .from("profiles")
         .select("id, username, email, role")
         .eq("id", authUser.id)
         .single();
      if (profileError) {
         console.error("Error fetching user profile:", profileError.message);
         return { ...authUser, profile: null };
      }

      return { ...authUser, profile };
   };

   useEffect(() => {
      setLoading(true);

      let isMounted = true;

      let hasFetched = false;

      const initialize = async () => {
         setLoading(true);

         const {
            data: { session },

            error: sessionError,
         } = await supabase.auth.getSession();

         if (sessionError) {
            console.error("Gagal mendapatkan session:", sessionError.message);

            setError("Gagal mendapatkan session.");

            return;
         }

         if (session?.user && !hasFetched) {
            try {
               const userWithProfile = await fetchUserProfile(session.user);

               hasFetched = true;

               if (userWithProfile?.profile?.role === "admin") {
                  if (isMounted) setUser(userWithProfile);
               } else {
                  if (isMounted) {
                     setError("Akses ditolak. Anda bukan admin.");

                     setUser(null);

                     setTimeout(
                        () => (window.location.href = "/homepage"),
                        1000
                     );
                  }
               }
            } catch (err) {
               console.error("Error fetch profile:", err.message);

               setError("Gagal mengambil profil pengguna.");
            }
         } else if (!session?.user) {
            setError("Tidak ada sesi aktif. Silakan login.");

            setTimeout(() => (window.location.href = "/auth/login"), 1000);
         }

         if (isMounted) setLoading(false);
      };

      initialize();

      const { data: authListener } = supabase.auth.onAuthStateChange(
         (event, session) => {
            if (event === "SIGNED_OUT") {
               setUser(null);

               window.location.href = "/auth/login";
            }
         }
      );

      return () => {
         // isMounted = false;
         // authListener.subscription.unsubscribe();
      };
   }, []);

   useEffect(() => {
      const fetchTotalUsers = async () => {
         if (user?.profile?.role === "admin") {
            setTotalUsersLoading(true);
            setTotalUsersError(null);
            try {
               console.log("Fetching total users from /get-user...");
               const response = await fetch("api/user/get-user.json");

               if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
               }
               const data = await response.json();
               console.log("Received total users raw data:", data);

               let usersArray = data;
               if (data && typeof data === "object" && "materi" in data) {
                  usersArray = data.materi;
                  console.log(
                     "Extracted 'materi' from total users data:",
                     usersArray
                  );
               }

               if (Array.isArray(usersArray)) {
                  setTotalUsers(usersArray.length);
               } else {
                  console.error(
                     "Total users API returned unexpected format (not an array):",
                     usersArray
                  );
                  setTotalUsersError(
                     "Format data total pengguna tidak sesuai."
                  );
                  setTotalUsers(0);
               }
            } catch (err) {
               console.error("Error fetching total users:", err.message);
               setTotalUsersError("Gagal memuat total pengguna.");
               setTotalUsers(0);
            } finally {
               setTotalUsersLoading(false);
            }
         }
      };

      if (user) {
         fetchTotalUsers();
      }
   }, [user]);

   useEffect(() => {
      const fetchData = async () => {
         // Ambil total sesi dari percakapan_chatbot
         const { count: sesiCount, error: sesiError } = await supabase
            .from("percakapan_chatbot")
            .select("*", { count: "exact", head: true });

         if (sesiError) {
            console.error("Gagal mengambil data sesi:", sesiError);
         } else {
            setSesiChatbot(sesiCount);
         }

         // Ambil total latihan selesai dari progress_pengguna
         const { count: latihanCount, error: latihanError } = await supabase
            .from("progress_pengguna")
            .select("*", { count: "exact", head: true });
            // asumsi ada kolom 'status'

         if (latihanError) {
            console.error("Gagal mengambil data latihan:", latihanError);
         } else {
            setLatihanSelesai(latihanCount);
         }
      };

      fetchData();
   }, []);

   const handleLogout = async () => {
      setLoading(true);
      setError(null);
      setUser(null);
      localStorage.clear();
      try {
         const { data: sessionData } = await supabase.auth.getSession();

         if (!sessionData.session) {
            console.warn("Session sudah tidak ada, mungkin sudah logout.");
            alert("Kamu sudah logout.");
            setUserLogin(null);
            navigate("/auth/login", { replace: true });
            return;
         }

         const { error: logoutError } = await supabase.auth.signOut();
         if (logoutError) {
            console.error("Logout failed:", logoutError.message);
            setError("Gagal logout. Silakan coba lagi.");
         } else {
            setUserLogin(null);
            navigate("/auth/login", { replace: true });
         }
      } catch (err) {
         console.error("Terjadi kesalahan saat logout:", err.message);
         setError("Logout gagal.");
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-[#E1F7F5] p-4 font-sans">
            <p className="text-lg text-[#1E0342]">Memuat Dashboard Admin...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E46A3] ml-4"></div>
         </div>
      );
   }

   if (!user || user?.profile?.role !== "admin") {
      return (
         <div className="min-h-screen flex items-center justify-center bg-[#E1F7F5] p-4 font-sans">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center text-[#1E0342]">
               <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
               <p className="mb-6">
                  Anda tidak memiliki izin akses ke halaman ini.
               </p>
               <a
                  href="#"
                  className="bg-[#0E46A3] text-[#E1F7F5] py-2 px-4 rounded-md hover:bg-[#1E0342] focus:outline-none focus:ring-2 focus:ring-[#0E46A3] focus:ring-offset-2"
                  onClick={() => console.log("Simulated redirect to login.")}
               >
                  Pergi ke Halaman Login
               </a>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex flex-col bg-[#E1F7F5] font-sans text-[#1E0342]">
         {/* Navbar Admin */}
         <nav className="bg-[#1E0342] text-[#E1F7F5] p-4 shadow-md flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold mb-2 md:mb-0">Dashboard Admin</h1>
            <div className="flex items-center space-x-4">
               <span className="text-lg">
                  Selamat Datang, {user?.profile?.username || user?.email}!
               </span>
               <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md font-semibold transition duration-200"
               >
                  Logout
               </button>
            </div>
         </nav>

         {/* Main Admin Dashboard Content */}
         <main className="flex-grow p-6">
            {/* Admin Tab Navigation */}
            <div className="flex justify-center md:justify-start mb-6 space-x-4">
               <button
                  onClick={() => setActiveAdminTab("dashboard")}
                  className={`py-2 px-4 rounded-md font-semibold transition duration-200
              ${
                 activeAdminTab === "dashboard"
                    ? "bg-[#0E46A3] text-[#E1F7F5]"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
               >
                  Ringkasan Dashboard
               </button>
               <button
                  onClick={() => setActiveAdminTab("manajemen-pengguna")}
                  className={`py-2 px-4 rounded-md font-semibold transition duration-200
              ${
                 activeAdminTab === "manajemen-pengguna"
                    ? "bg-[#0E46A3] text-[#E1F7F5]"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
               >
                  Manajemen Pengguna
               </button>
               <button
                  onClick={() => setActiveAdminTab("kelola-soal")}
                  className={`py-2 px-4 rounded-md font-semibold transition duration-200
              ${
                 activeAdminTab === "kelola-soal"
                    ? "bg-[#0E46A3] text-[#E1F7F5]"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
               >
                  Kelola Soal
               </button>
            </div>

            {/* Dynamic Content Area Based on Active Tab */}
            {activeAdminTab === "dashboard" && (
               <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                     {/* Card for Total Pengguna */}
                     <div className="bg-white p-6 rounded-lg shadow-md border border-[#9AC8CD]">
                        <h3 className="text-xl font-semibold mb-2">
                           Total Pengguna
                        </h3>
                        {totalUsersLoading ? (
                           <p className="text-xl font-bold text-gray-500">
                              Memuat...
                           </p>
                        ) : totalUsersError ? (
                           <p className="text-xl font-bold text-red-500">
                              Error
                           </p>
                        ) : (
                           <p className="text-4xl font-bold text-[#0E46A3]">
                              {totalUsers}
                           </p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                           Pengguna terdaftar
                        </p>
                     </div>

                     {/* Other statistics cards */}
                     <div className="bg-white p-6 rounded-lg shadow-md border border-[#9AC8CD]">
                        <h3 className="text-xl font-semibold mb-2">
                           Latihan Selesai
                        </h3>
                        <p className="text-4xl font-bold text-[#0E46A3]">
                           {latihanSelesai}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                           Total latihan yang diselesaikan
                        </p>
                     </div>
                     <div className="bg-white p-6 rounded-lg shadow-md border border-[#9AC8CD]">
                        <h3 className="text-xl font-semibold mb-2">
                           Sesi Chatbot
                        </h3>
                        <p className="text-4xl font-bold text-[#0E46A3]">
                           {sesiChatbot}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                           Total sesi percakapan
                        </p>
                     </div>
                  </div>
               </>
            )}

            {activeAdminTab === "manajemen-pengguna" && <ManajemenPengguna />}

            {activeAdminTab === "kelola-soal" && <KelolaSoal />}
         </main>
      </div>
   );
};

export default AdminPage;
