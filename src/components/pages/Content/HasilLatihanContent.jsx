import React, { useState, useEffect } from "react"; // Tambahkan useState, useEffect

// Komponen HasilLatihanContent
const HasilLatihanContent = ({
   onBackToLearn,
   userId,
   onViewDetailedResults,
}) => {
   // Menerima userId sebagai prop
   const [userProgress, setUserProgress] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchUserProgress = async () => {
         setLoading(true);
         setError(null);
         if (!userId) {
            setError("User ID tidak ditemukan. Tidak dapat memuat riwayat.");
            setLoading(false);
            return;
         }

         try {
            // Panggil API endpoint untuk mengambil riwayat progres pengguna
            const response = await fetch(
               `/api/progress/get-by-user/${userId}.json`
            ); // URL API Anda

            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(
                  errorData.error || `HTTP error! status: ${response.status}`
               );
            }

            const data = await response.json();
            setUserProgress(data.results || []); // Asumsikan respons memiliki properti 'results'
         } catch (err) {
            console.error("Error fetching user progress:", err);
            setError(`Gagal memuat riwayat latihan: ${err.message}`);
         } finally {
            setLoading(false);
         }
      };

      fetchUserProgress();
   }, [userId]); // Bergantung pada userId, fetch ulang jika userId berubah

   const handleViewDetail = (realSessionId) => {
      // <--- MODIFIKASI PARAMETER
      // Memanggil prop yang diteruskan dari HomePage
      if (onViewDetailedResults) {
         onViewDetailedResults(realSessionId); // <--- Meneruskan realSessionId
      }
   };

   // Fungsi untuk kembali dari tampilan detail ke daftar riwayat
   const handleBackToResultsList = () => {
      // setShowDetailModal(false); // Komponen ini tidak memiliki state ini
      // setSelectedSessionId(null); // Komponen ini tidak memiliki state ini
   };

   if (loading) {
      return (
         <div className="flex flex-col h-full items-center justify-center bg-[#000814] rounded-lg shadow-lg">
            <p className="text-lg text-[#FFD60A] mb-4">
               Memuat riwayat latihan...
            </p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300]"></div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex flex-col h-full items-center justify-center p-4 bg-red-900 border border-red-700 text-red-300 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-2">Terjadi Kesalahan:</p>
            <p>{error}</p>
            <button
               onClick={() => window.location.reload()}
               className="mt-4 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
            >
               Coba Muat Ulang
            </button>
            <button
               onClick={onBackToLearn}
               className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
               Kembali
            </button>
         </div>
      );
   }

   return (
      <div className="flex flex-col h-full p-4 bg-[#000814] rounded-lg shadow-lg">
         {/* Header untuk Judul Halaman Hasil Latihan */}
         <div className="mb-6 flex justify-between items-center">
            <span>
               <h3 className="text-2xl font-bold text-[#FFD60A]">
                  Riwayat Latihan
               </h3>
               <div className="h-2 bg-[#FFC300] w-24 rounded-full mt-2"></div>{" "}
               {/* Garis bawah dekoratif */}
            </span>
            {onBackToLearn && (
               <button
                  onClick={onBackToLearn}
                  className="px-4 py-2 bg-[#FFC300] text-[#000814] rounded-full text-sm font-semibold hover:bg-[#FFD60A] transition duration-200 shadow-md"
               >
                  &larr; Kembali
               </button>
            )}
         </div>

         {/* Kontainer untuk daftar hasil latihan - ini yang akan di-scroll */}
         <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {userProgress.length === 0 && !loading && (
               <p className="text-lg text-gray-400 text-center col-span-full">
                  Belum ada riwayat latihan yang tersedia.
               </p>
            )}
            {userProgress.map((result) => (
               <div
                  key={result.id} // Gunakan ID unik dari hasil ringkasan
                  className="bg-[#001D3D] p-4 rounded-lg shadow-md flex items-center justify-between
                                hover:shadow-xl transform hover:translate-x-1 transition duration-300 ease-in-out cursor-pointer"
                  onClick={() => handleViewDetail(result.real_session_id)}
               >
                  {/* Bagian Kiri: Judul dan Deskripsi */}
                  <div className="flex-grow">
                     <h4 className="text-lg font-semibold text-[#FFD60A] mb-1">
                        {result.materi} {/* Nama materi dari hasil ringkasan */}
                     </h4>
                     <p className="text-sm text-[#FFC300] mb-1">
                        Tanggal: {result.tanggal}{" "}
                        {/* Tanggal dari hasil ringkasan */}
                     </p>
                     <p
                        className={`text-sm ${
                           result.status === "Sangat Baik" ||
                           result.status === "Baik"
                              ? "text-green-400"
                              : "text-red-400"
                        }`}
                     >
                        Status: {result.status}{" "}
                        {/* Status kelulusan dari hasil ringkasan */}
                     </p>
                  </div>

                  {/* Bagian Kanan: Score dan Ikon Panah */}
                  <div className="flex items-center space-x-4">
                     <p className="text-2xl font-extrabold text-[#FFC300] whitespace-nowrap">
                        {result.skor} {/* Skor seperti "8/10" */}
                     </p>
                     {/* Ikon panah ke kanan */}
                     <svg
                        className="w-6 h-6 text-[#FFD60A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M9 5l7 7-7 7"
                        ></path>
                     </svg>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default HasilLatihanContent;
