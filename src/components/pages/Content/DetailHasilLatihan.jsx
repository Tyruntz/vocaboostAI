import React, { useState, useEffect } from "react";

const DetailHasilLatihan = ({ sessionId, onBackToList }) => {
   const [details, setDetails] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [sessionSummary, setSessionSummary] = useState(null); // Untuk ringkasan skor sesi ini

   useEffect(() => {
      const fetchDetails = async () => {
         setLoading(true);
         setError(null);
         if (!sessionId) {
            setError("Session ID tidak tersedia. Tidak dapat memuat detail.");
            setLoading(false);
            return;
         }

         try {
            const response = await fetch(
               `/api/progress/get-details/${sessionId}.json`
            ); // Ganti dengan URL API yang sesuai
            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(
                  errorData.error || `HTTP error! status: ${response.status}`
               );
            }
            const data = await response.json();
            setDetails(data.details || []);

            // Hitung ringkasan sesi dari detail
            if (data.details && data.details.length > 0) {
               const totalQuestions = data.details.length;
               const totalCorrect = data.details.filter(
                  (d) => d.is_correct
               ).length;
               const firstQuestion = data.details[0];
               setSessionSummary({
                  topicName: firstQuestion.topic_name,
                  totalCorrect,
                  totalQuestions,
                  percentage: ((totalCorrect / totalQuestions) * 100).toFixed(
                     0
                  ),
                  // Anda bisa menambahkan tanggal/waktu mulai sesi jika perlu
               });
            } else {
               setSessionSummary(null);
            }
         } catch (err) {
            console.error("Error fetching detail progress:", err);
            setError(`Gagal memuat detail latihan: ${err.message}`);
         } finally {
            setLoading(false);
         }
      };

      fetchDetails();
   }, [sessionId]); // Fetch detail setiap kali sessionId berubah

   if (loading) {
      return (
         <div className="flex flex-col h-full items-center justify-center bg-[#000814] rounded-lg shadow-lg">
            <p className="text-lg text-[#FFD60A] mb-4">
               Memuat detail latihan...
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
               onClick={onBackToList}
               className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
               Kembali ke Riwayat
            </button>
         </div>
      );
   }

   if (details.length === 0 && !loading) {
      return (
         <div className="flex flex-col h-full items-center justify-center bg-[#000814] rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#FFD60A] mb-4">
               Tidak Ada Detail
            </h2>
            <p className="text-lg text-[#FFC300]">
               Tidak ada detail soal ditemukan untuk sesi ini.
            </p>
            <button
               onClick={onBackToList}
               className="mt-4 px-6 py-3 bg-[#FFC300] border border-[#FFC300] text-[#000814] rounded-lg font-semibold hover:text-white hover:bg-[#001D3D] transition duration-200 shadow-md"
            >
               Kembali ke Riwayat
            </button>
         </div>
      );
   }

   const getOptionLabel = (optionKey) => {
      // Fungsi untuk mendapatkan label opsi (A, B, C, D)
      return optionKey.toUpperCase();
   };

   return (
      <div className="flex flex-col h-full p-4 bg-[#000814] rounded-lg shadow-lg overflow-y-auto">
         {/* Header Halaman Detail */}
         <div className="mb-6 flex justify-between items-center sticky top-0 bg-[#000814] pb-4 z-10">
            <span>
               <h3 className="text-2xl font-bold text-[#FFD60A]">
                  Detail Latihan
               </h3>
               <p className="text-lg text-[#FFC300] font-semibold">
                  Materi: {sessionSummary?.topicName || "N/A"}
               </p>
               <p className="text-md text-[#FFD60A]">
                  Skor: {sessionSummary?.totalCorrect} /{" "}
                  {sessionSummary?.totalQuestions} ({sessionSummary?.percentage}
                  %)
               </p>
               <div className="h-2 bg-[#FFC300] w-24 rounded-full mt-2"></div>
            </span>
            {onBackToList && (
               <button
                  onClick={onBackToList}
                  className="px-4 py-2 bg-[#FFC300] text-[#000814] rounded-full text-sm font-semibold hover:bg-[#FFD60A] transition duration-200 shadow-md"
               >
                  &larr; Kembali
               </button>
            )}
         </div>

         {/* Daftar Detail Soal */}
         <div className="space-y-6">
            {details.map((detail, index) => (
               <div
                  key={detail.progress_id}
                  className="bg-[#001D3D] p-5 rounded-lg shadow-md border border-[#003566]"
               >
                  <p className="text-lg font-semibold mb-2 text-[#FFD60A]">
                     Soal {index + 1}: {detail.question_text}
                  </p>
                  <p className="text-sm text-gray-200 mb-1">
                     Tipe: {detail.question_type}
                  </p>

                  {detail.question_type === "pilihan_ganda" &&
                     detail.question_options && (
                        <div className="mb-2">
                           {Object.keys(detail.question_options).map(
                              (optionKey) => (
                                 <p
                                    key={optionKey}
                                    className="text-sm text-gray-100"
                                 >
                                    {getOptionLabel(optionKey)}.{" "}
                                    {detail.question_options[optionKey]}
                                 </p>
                              )
                           )}
                        </div>
                     )}

                  <p className="text-sm text-gray-100 mb-1">
                     Jawaban Anda:{" "}
                     <span
                        className={
                           detail.is_correct
                              ? "text-green-400 font-bold"
                              : "text-red-400 font-bold"
                        }
                     >
                        {detail.user_answer}
                     </span>
                  </p>
                  {!detail.is_correct && (
                     <p className="text-sm text-red-400 mb-1">
                        Jawaban Benar:{" "}
                        <span className="font-bold">
                           {detail.correct_answer}
                        </span>
                     </p>
                  )}
                  {detail.explanation && (
                     <p className="text-sm text-gray-300 italic mt-2">
                        Penjelasan: {detail.explanation}
                     </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                     Dijawab pada: {detail.answered_at}
                  </p>
               </div>
            ))}
         </div>
      </div>
   );
};

export default DetailHasilLatihan;
