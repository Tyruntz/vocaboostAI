import React from "react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
// import { supabase } from '../../lib/supabaseClient'; // Tidak digunakan langsung untuk fetch API ini

// Asumsi Anda sudah punya ModalHasilLatihan.jsx
const ModalHasilLatihan = ({
   score,
   totalQuestions,
   topicId,
   onClose,
   onViewDetailedResults,
}) => {
   return (
      <div className="fixed inset-0 bg-[#000814] bg-opacity-70 flex items-center justify-center z-50 p-4">
         <div className="bg-[#001D3D] p-8 rounded-lg shadow-2xl relative w-11/12 max-w-md text-center text-white">
            {/* Tombol Tutup */}
            <button
               onClick={onClose}
               className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
            >
               &times;
            </button>

            {/* Header (Score & Correct Count) */}
            <div className="flex justify-center space-x-4 mb-6">
               {/* Asumsi topicId adalah nama materi, bukan ID dari DB */}
               {/* Jika topicId adalah ID dari DB, Anda perlu fetch nama materi di sini */}
               <p className="text-lg text-white font-semibold">
                  Judul Materi :
               </p>
               <p className="text-lg text-white font-semibold">
                  {topicId
                     ? topicId.charAt(0).toUpperCase() +
                       topicId.slice(1).replace(/_/g, " ")
                     : "N/A"}
               </p>
            </div>

            {/* Ringkasan Hasil Utama */}
            <h3 className="text-xl font-bold text-white mb-4">
               Latihan Selesai!
            </h3>
            <p className="text-2xl font-extrabold text-[#FFC300] mb-2">
               Score Anda: <br />
               <span className="text-4xl">{score * 10}</span> /{" "}
               {totalQuestions * 10}
            </p>
            <p className="text-lg text-white mb-4">
               Benar {score} dari {totalQuestions} soal
            </p>

            {/* Garis Pemisah */}
            <div className="h-1 bg-[#FFC300] w-24 mx-auto mb-6 rounded-full"></div>
            {/* Pesan Motivasi */}
            <p className="text-lg text-white mb-6">
               {score / totalQuestions >= 0.7
                  ? "Bagus sekali! Terus tingkatkan kemampuan Anda!"
                  : "Jangan khawatir, latihan membuat sempurna! Coba lagi."}
            </p>

            {/* Tombol Aksi */}
            {/* <button
            onClick={() => onViewDetailedResults(topicId, score)} // Meneruskan topicId dan score
            className="px-8 py-3 bg-[#0E46A3] text-[#E1F7F5] rounded-full font-semibold shadow-lg
                                hover:bg-[#1E0342] focus:outline-none focus:ring-2 focus:ring-[#0E46A3]
                                focus:ring-offset-2 focus:ring-offset-white transition duration-200 w-full mb-4"
            >
            Lihat Hasil Detail
            </button> */}
            <button
               onClick={onClose} // Menggunakan onClose untuk kembali (seperti LINK1)
               className="text-[#FFC300] hover:underline text-sm font-semibold transition duration-200"
            >
               Kembali ke Materi Latihan
            </button>
         </div>
      </div>
   );
};

const SoalLatihanContent = ({
   topicId,
   onExerciseComplete,
   onBackToLearn,
   userId,
}) => {
   const [questions, setQuestions] = useState([]);
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
   const [userAnswer, setUserAnswer] = useState("");
   const [feedback, setFeedback] = useState(null);
   const [score, setScore] = useState(0);
   const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
   const [showResultModal, setShowResultModal] = useState(false);
   const [loadingQuestions, setLoadingQuestions] = useState(true);
   const [error, setError] = useState(null);
   const [topicName, setTopicName] = useState("");
   const [currentSessionId, setCurrentSessionId] = useState(null);

   // Effect untuk memuat dan mengacak soal berdasarkan topicId
   useEffect(() => {
      const fetchAndShuffleQuestions = async () => {
         setLoadingQuestions(true);
         setError(null);
         setQuestions([]); // Kosongkan soal sebelumnya
         setCurrentQuestionIndex(0);
         setScore(0);
         setFeedback(null);
         setUserAnswer("");
         setIsAnswerSubmitted(false);
         setShowResultModal(false);
         if (topicId) {
            setCurrentSessionId(uuidv4());
         }

         if (!topicId) {
            setError("ID topik tidak ditemukan.");
            setLoadingQuestions(false);
            return;
         }

         try {
            // Fetch nama topik dari API materi (jika diperlukan untuk display)
            const materiResponse = await fetch(
               `/api/grammar/materi/get-all.json`
            );
            if (!materiResponse.ok) {
               throw new Error(
                  `Failed to fetch materi name: ${materiResponse.status}`
               );
            }
            const materiData = await materiResponse.json();
            const selectedMateri = materiData.materi.find(
               (m) => m.id == topicId
            ); // Gunakan == untuk perbandingan
            if (selectedMateri) {
               setTopicName(
                  selectedMateri.nama ||
                     selectedMateri.nama_topik ||
                     "Topik Tidak Dikenal"
               );
            } else {
               setTopicName("Topik Tidak Ditemukan");
            }

            // Panggil API endpoint untuk mengambil soal berdasarkan ID materi
            const response = await fetch(
               `/api/grammar/soal/get-by-materi/${topicId}.json`
            );
            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(
                  errorData.error || `HTTP error! status: ${response.status}`
               );
            }

            const data = await response.json();

            // Pastikan data.soal adalah array
            if (!Array.isArray(data.soal)) {
               throw new Error("Format data soal tidak valid dari API.");
            }

            // Acak urutan soal
            const shuffledQuestions = data.soal.sort(() => Math.random() - 0.5);
            setQuestions(shuffledQuestions);
         } catch (err) {
            console.error("Error fetching questions:", err);
            setError(`Gagal memuat soal: ${err.message}`);
         } finally {
            setLoadingQuestions(false);
         }
      };

      fetchAndShuffleQuestions();
   }, [topicId]); // Bergantung pada topicId

   // Fungsi untuk menangani perubahan input jawaban (isian singkat)
   const handleAnswerChange = (e) => {
      setUserAnswer(e.target.value);
   };

   // Fungsi untuk menangani pemilihan opsi (pilihan ganda/benar-salah)
   const handleOptionSelect = (optionValue) => {
      setUserAnswer(optionValue);
   };
   const saveUserProgress = async (
      question,
      userAnswer,
      isCorrect,
      scoreEarned
   ) => {
      if (!userId) {
         console.warn("User ID tidak tersedia. Progres tidak dapat disimpan.");
         return;
      }

      try {
         const response = await fetch("/api/progress/save.json", {
            // <--- API endpoint baru untuk menyimpan progres
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               user_id: userId,
               id_soal: question.id, // ID soal dari database
               jawaban_pengguna: userAnswer,
               is_correct: isCorrect,
               score_diperoleh: scoreEarned,

               // waktu_terjawab: new Date().toISOString(), // Bisa diatur di frontend atau di API/DB
               session_id: currentSessionId,
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            console.error("Gagal menyimpan progres:", errorData.error);
         } else {
            console.log("Progres berhasil disimpan!");
         }
      } catch (err) {
         console.error("Error saat menyimpan progres:", err);
      }
   };

   // Fungsi untuk memvalidasi jawaban
   const validateAnswer = () => {
      const currentQuestion = questions[currentQuestionIndex];
      let correct = false;
      let feedbackMessage = "";
      let scoreEarned = 0;

      // Normalisasi jawaban pengguna dan jawaban benar dari DB
      const normalizedUserAnswer =
         typeof userAnswer === "string" ? userAnswer.toLowerCase().trim() : "";
      const normalizedCorrectAnswer =
         typeof currentQuestion.jawaban_benar === "string"
            ? currentQuestion.jawaban_benar.toLowerCase().trim()
            : "";

      if (currentQuestion.tipe_pertanyaan === "isian_kosong") {
         correct = normalizedUserAnswer === normalizedCorrectAnswer;
         feedbackMessage = correct
            ? "Jawaban Benar!"
            : `Jawaban Salah. Yang benar adalah: "${currentQuestion.jawaban_benar}"`;
      } else if (currentQuestion.tipe_pertanyaan === "pilihan_ganda") {
         correct = normalizedUserAnswer === normalizedCorrectAnswer;
         feedbackMessage = correct
            ? "Jawaban Benar!"
            : `Jawaban Salah. Yang benar adalah: "${currentQuestion.jawaban_benar.toUpperCase()}"`;
      } else if (currentQuestion.tipe_pertanyaan === "benar_salah") {
         // Asumsi jawaban benar/salah disimpan sebagai "true" atau "false" (string) atau "BENAR"/"SALAH"
         correct =
            normalizedUserAnswer === normalizedCorrectAnswer.toLowerCase(); // Pastikan perbandingan case-insensitive
         feedbackMessage = correct
            ? "Pilihan Benar!"
            : `Pilihan Salah. Pilihan jawaban yang benar adalah: "${currentQuestion.jawaban_benar.toUpperCase()}"`;
      } else {
         // Tipe pertanyaan tidak dikenal
         feedbackMessage = "Tipe pertanyaan tidak didukung.";
      }

      if (correct) {
         setScore((prevScore) => prevScore + 1);
         scoreEarned = 1;
      }
      setFeedback({
         isCorrect: correct,
         message: feedbackMessage,
         explanation: currentQuestion.penjelasan,
      });
      setIsAnswerSubmitted(true);
      saveUserProgress(currentQuestion, userAnswer, correct, scoreEarned);
   };

   // Fungsi untuk melanjutkan ke soal berikutnya atau menyelesaikan latihan
   const handleNextQuestion = () => {
      if (currentQuestionIndex < questions.length - 1) {
         setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
         setUserAnswer("");
         setFeedback(null);
         setIsAnswerSubmitted(false);
      } else {
         // Latihan Selesai: Tampilkan modal hasil
         setShowResultModal(true);
      }
   };

   // Fungsi untuk menutup modal hasil dan kembali ke LearnContent
   const handleCloseResultModal = () => {
      setShowResultModal(false);
      if (onBackToLearn) {
         onBackToLearn(); // Panggil fungsi kembali ke LearnContent dari HomePage
      }
   };

   // Fungsi yang akan dipanggil ketika tombol "Lihat Hasil Detail" di modal ditekan
   // (Jika Anda mengaktifkan kembali tombol ini)
   const handleViewDetailedResultsFromModal = () => {
      setShowResultModal(false); // Tutup modal
      // Di sini Anda bisa menambahkan logika untuk menampilkan hasil detail
      // Misalnya, pindah ke halaman lain atau menampilkan komponen HasilLatihanContent yang lebih detail
      // dengan membawa data score dan questions yang sudah dijawab.
      if (onExerciseComplete) {
         // onExerciseComplete(score, questions.length, topicId); // Jika Anda ingin passing data ini
         // Contoh: onExerciseComplete({ score, totalQuestions: questions.length, userAnswers: ... });
      }
   };

   // Kondisi tampilan saat loading soal atau ada error
   if (loadingQuestions) {
      return (
         <div className="flex flex-col h-full items-center justify-center bg-[#000814] rounded-lg shadow-lg">
            <button
               onClick={onBackToLearn}
               className="px-6 py-3 bg-[#FFC300] border border-[#FFC300] text-[#000814] rounded-lg font-semibold hover:text-white hover:bg-[#001D3D] transition duration-200 shadow-md mb-4"
            >
               Kembali
            </button>
            <h2 className="text-2xl font-bold text-[#FFD60A] mb-4">
               Memuat Soal...
            </h2>
            <p className="text-lg text-[#FFC300]">Silakan tunggu sebentar...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mt-4"></div>
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
               Kembali ke Materi
            </button>
         </div>
      );
   }

   // Jika tidak ada soal setelah loading selesai (misalnya materi tidak punya soal)
   if (questions.length === 0) {
      return (
         <div className="flex flex-col h-full items-center justify-center bg-[#000814] rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#FFD60A] mb-4">
               Tidak Ada Soal
            </h2>
            <p className="text-lg text-[#FFC300]">
               Tidak ada soal ditemukan untuk materi ini.
            </p>
            <button
               onClick={onBackToLearn}
               className="mt-4 px-6 py-3 bg-[#FFC300] border border-[#FFC300] text-[#000814] rounded-lg font-semibold hover:text-white hover:bg-[#001D3D] transition duration-200 shadow-md"
            >
               Kembali
            </button>
         </div>
      );
   }

   const currentQuestion = questions[currentQuestionIndex];

   return (
      <div className="flex flex-col h-full border p-4 bg-[#000814] rounded-lg shadow-lg">
         {/* Header Soal - Judul Materi dan Nomor Soal */}
         <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#FFD60A]">{`Materi: ${topicName}`}</h3>
            <p className="text-lg text-[#FFC300] font-semibold">
               Soal {currentQuestionIndex + 1} dari {questions.length}
            </p>
            {onBackToLearn && (
               <button
                  onClick={onBackToLearn}
                  className="px-6 py-3 bg-[#FFC300] border border-[#FFC300] text-[#000814] rounded-lg font-semibold hover:text-white hover:bg-[#001D3D] transition duration-200 shadow-md"
               >
                  Kembali
               </button>
            )}
         </div>

         {/* Area Soal */}
         <div className="flex-grow bg-[#001D3D] p-6 rounded-lg shadow-inner flex flex-col justify-between">
            {/* Teks Pertanyaan */}
            <p className="text-xl text-white mb-6 leading-relaxed">
               {currentQuestion.text_pertanyaan}{" "}
               {/* Menggunakan text_pertanyaan */}
            </p>

            {/* Area Input Jawaban (Dinamis) */}
            <div className="mb-8 flex flex-col space-y-4">
               {/* Tipe: Isian Singkat */}
               {currentQuestion.tipe_pertanyaan === "isian_kosong" && (
                  <input
                     type="text"
                     className="w-full px-4 py-3 border-2 bg-[#003566] border-[#003566] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-white disabled:bg-gray-700 placeholder-gray-400"
                     placeholder="Ketik jawaban Anda di sini..."
                     value={userAnswer}
                     onChange={handleAnswerChange}
                     disabled={isAnswerSubmitted}
                  />
               )}

               {/* Tipe: Pilihan Ganda */}
               {currentQuestion.tipe_pertanyaan === "pilihan_ganda" &&
                  currentQuestion.opsi && (
                     <div className="flex flex-col space-y-3">
                        {Object.keys(currentQuestion.opsi).map(
                           (optionKey, index) => (
                              <label
                                 key={index}
                                 className="flex items-center text-white cursor-pointer"
                              >
                                 <input
                                    type="radio"
                                    name="pilihanGanda"
                                    value={optionKey} // Menggunakan 'a', 'b', 'c', 'd' sebagai nilai radio
                                    checked={userAnswer === optionKey}
                                    onChange={() =>
                                       handleOptionSelect(optionKey)
                                    }
                                    disabled={isAnswerSubmitted}
                                    className="form-radio h-5 w-5 text-[#FFC300] border-[#003566] focus:ring-[#FFC300]"
                                 />
                                 <span className="ml-3 text-lg">{`${optionKey.toUpperCase()}. ${
                                    currentQuestion.opsi[optionKey]
                                 }`}</span>
                              </label>
                           )
                        )}
                     </div>
                  )}

               {/* Tipe: Benar/Salah */}
               {currentQuestion.tipe_pertanyaan === "benar_salah" && (
                  <div className="flex space-x-6 justify-center">
                     <label className="flex items-center text-white cursor-pointer">
                        <input
                           type="radio"
                           name="benarSalah"
                           value="benar" // Sesuaikan dengan nilai jawaban benar/salah di DB
                           checked={userAnswer === "benar"}
                           onChange={() => handleOptionSelect("benar")}
                           disabled={isAnswerSubmitted}
                           className="form-radio h-5 w-5 text-[#FFC300] border-[#003566] focus:ring-[#FFC300]"
                        />
                        <span className="ml-2 text-lg">BENAR</span>
                     </label>
                     <label className="flex items-center text-white cursor-pointer">
                        <input
                           type="radio"
                           name="benarSalah"
                           value="salah" // Sesuaikan dengan nilai jawaban benar/salah di DB
                           checked={userAnswer === "salah"}
                           onChange={() => handleOptionSelect("salah")}
                           disabled={isAnswerSubmitted}
                           className="form-radio h-5 w-5 text-[#FFC300] border-[#003566] focus:ring-[#FFC300]"
                        />
                        <span className="ml-2 text-lg">SALAH</span>
                     </label>
                  </div>
               )}
            </div>

            {/* Area Umpan Balik */}
            {feedback && (
               <div
                  className={`p-4 rounded-lg text-white font-semibold mb-6 shadow-sm
                        ${feedback.isCorrect ? "bg-green-600" : "bg-red-600"}`}
               >
                  {feedback.message}
                  {feedback.explanation && (
                     <p className="mt-2 text-sm italic">
                        Penjelasan: {feedback.explanation}
                     </p>
                  )}
               </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex justify-center mt-auto">
               {!isAnswerSubmitted ? (
                  <button
                     onClick={validateAnswer}
                     className="px-8 py-3 bg-[#FFC300] text-[#000814] rounded-full font-semibold hover:bg-[#FFD60A] transition duration-200 shadow-md"
                     disabled={userAnswer === ""}
                  >
                     Kirim Jawaban
                  </button>
               ) : (
                  <button
                     onClick={handleNextQuestion}
                     className="px-8 py-3 bg-[#FFC300] text-[#000814] rounded-full font-semibold hover:bg-[#FFD60A] transition duration-200 shadow-md"
                  >
                     {currentQuestionIndex < questions.length - 1
                        ? "Soal Berikutnya"
                        : "Selesai Latihan"}
                  </button>
               )}
            </div>
         </div>

         {/* Modal Hasil Latihan (Pop-up) */}
         {showResultModal && (
            <ModalHasilLatihan
               score={score}
               totalQuestions={questions.length}
               topicId={topicName} // Kirim nama topik ke modal
               onClose={handleCloseResultModal}
               onViewDetailedResults={handleViewDetailedResultsFromModal}
            />
         )}
      </div>
   );
};

export default SoalLatihanContent;
