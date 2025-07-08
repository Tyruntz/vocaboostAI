import React, { useState, useEffect } from "react";

const LearnContent = ({ onShowResults, onStartExercise }) => {
   const [topics, setTopics] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchTopics = async () => {
         setLoading(true);
         setError(null);
         try {
            // Panggil API endpoint Astro.js untuk mengambil semua materi
            const response = await fetch("/api/grammar/materi/get-all.json"); // URL API Anda

            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(
                  errorData.error || `HTTP error! status: ${response.status}`
               );
            }

            const data = await response.json();
            // Asumsikan respons dari API adalah { materi: [...] }
            // Dan materi memiliki id, nama, dan deskripsi (jika ada)
            setTopics(data.materi || []);
         } catch (err) {
            console.error("Error fetching topics:", err);
            setError("Gagal memuat materi latihan. Silakan coba lagi.");
         } finally {
            setLoading(false);
         }
      };

      fetchTopics();
   }, []); // Array dependensi kosong berarti efek ini hanya berjalan sekali saat komponen di-mount

   if (loading) {
      return (
         <div className="flex flex-col h-full items-center justify-center p-4 bg-[#000814] border rounded-lg shadow-lg">
            <p className="text-lg text-[#FFD60A] mb-4">
               Memuat materi latihan...
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
         </div>
      );
   }

   return (
      <div className="flex flex-col h-full p-4 bg-[#000814] border rounded-lg shadow-lg">
         {/* Tombol di bagian atas kanan sesuai wireframe */}
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#FFD60A]">
               Materi Latihan
            </h2>
            <button
               onClick={onShowResults}
               className="px-6 py-3 bg-[#FFC300] border border-[#FFC300] text-[#000814] rounded-lg font-semibold hover:text-white hover:bg-[#001D3D] transition duration-200 shadow-md"
            >
               Lihat hasil latihan
            </button>
         </div>

         {/* Kontainer grid untuk card-card topik */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
            {topics.length === 0 && !loading && (
               <p className="text-lg text-gray-400 col-span-full text-center">
                  Belum ada materi latihan yang tersedia.
               </p>
            )}
            {topics.map((topic) => (
               <div
                  key={topic.id}
                  className="bg-[#001D3D] p-6 rounded-lg shadow-md flex flex-col justify-between
                           hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
               >
                  {/* Menggunakan data dari database: topic.nama dan topic.deskripsi (jika ada) */}
                  <h3 className="text-xl font-semibold text-[#FFD60A] mb-4">
                     {topic.nama_topik || "Nama Materi"}
                  </h3>

                  {/* Anda mungkin ingin menambahkan kolom 'deskripsi' di tabel materi Anda */}
                  <div className="space-y-2 mb-6">
                     <p className="text-gray-200 text-sm">
                        {topic.deskripsi ||
                           "Deskripsi materi ini belum tersedia."}
                     </p>
                  </div>

                  {/* Tombol aksi di bagian bawah card */}
                  <button
                     onClick={() => onStartExercise(topic.id)} // Meneruskan ID materi ke onStartExercise
                     className="w-full py-3 px-4 bg-[#FFC300] text-[#000814] rounded-lg font-semibold
                               hover:bg-[#FFD60A] focus:outline-none focus:ring-2 focus:ring-[#FFC300]
                               focus:ring-offset-2 focus:ring-offset-[#000814] transition duration-200 shadow-md"
                  >
                     Mulai Latihan
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
};

export default LearnContent;
