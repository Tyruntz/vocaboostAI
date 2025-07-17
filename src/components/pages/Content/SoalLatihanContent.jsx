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
   const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
   const [usedQuestionIds, setUsedQuestionIds] = useState([]);
   const [aiQuestionCount, setAiQuestionCount] = useState(0);
   const [usedQuestionTexts, setUsedQuestionTexts] = useState([]);

   const [questionFetchCount, setQuestionFetchCount] = useState(0);
   const MAX_AI_QUESTIONS = 2;

   // Effect untuk memuat dan mengacak soal berdasarkan topicId
   useEffect(() => {
  let isMounted = true;

  const fetchAndShuffleQuestions = async () => {
    setLoadingQuestions(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setUserAnswer("");
    setIsAnswerSubmitted(false);
    setShowResultModal(false);
    setUsedQuestionIds([]);
    setUsedQuestionTexts([]);

    if (topicId) {
      setCurrentSessionId(uuidv4());
    } else {
      setError("ID topik tidak ditemukan.");
      setLoadingQuestions(false);
      return;
    }

    try {
      const materiResponse = await fetch(`/api/grammar/materi/get-all.json`);
      if (!materiResponse.ok) throw new Error("Gagal fetch nama materi");

      const materiData = await materiResponse.json();
      const selectedMateri = materiData.materi.find((m) => m.id == topicId);
      setTopicName(
        selectedMateri?.nama || selectedMateri?.nama_topik || "Topik Tidak Dikenal"
      );

      // Inisialisasi array soal dengan null
      setQuestions(Array(10).fill(null));

      const firstSoal = await fetchSingleQuestion();
      if (!firstSoal) throw new Error("Soal pertama tidak valid");

      if (!isMounted) return;

      setQuestions((prev) => {
        const updated = [...prev];
        updated[0] = firstSoal;
        return updated;
      });
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(`Gagal memuat soal: ${err.message}`);
    } finally {
      if (isMounted) setLoadingQuestions(false);
    }
  };

  fetchAndShuffleQuestions();

  return () => {
    isMounted = false;
  };
}, [topicId]);


   const simpanSoalAIKeDatabase = async (soal, topicId) => {
      try {
         const response = await fetch("/api/grammar/soal/add.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               topic_id: topicId,
               text_pertanyaan: soal.text_pertanyaan,
               tipe_pertanyaan: soal.tipe_pertanyaan,
               opsi: soal.opsi || {}, // untuk tipe selain pilihan ganda akan jadi {}
               jawaban_benar: soal.jawaban_benar,
               penjelasan: soal.penjelasan || "",

               level: soal.level || "mudah", // default jika tidak ada
               is_ai_generated: true, // menandai ini soal dari AI
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            console.error("Gagal menyimpan soal AI ke database:", errorData);
            return null;
         }

         const result = await response.json();
         return result.soal?.id ? result.soal : null;
         // berisi ID dari DB
      } catch (err) {
         console.error("Terjadi error saat simpan soal AI:", err);
         return null;
      }
   };

   const fetchSingleQuestion = async () => {
      const ambilDariDatabase = async () => {
         const response = await fetch(
            `/api/grammar/soal/get-by-materi/${topicId}.json`
         );
         const data = await response.json();
         if (Array.isArray(data.soal) && data.soal.length > 0) {
            const filtered = data.soal.filter(
               (soal) =>
                  !usedQuestionIds.includes(soal.id) &&
                  !usedQuestionTexts.includes(
                     soal.text_pertanyaan.trim().toLowerCase()
                  )
            );

            if (filtered.length === 0)
               throw new Error("Semua soal dari DB sudah digunakan.");
            const randomSoal =
               filtered[Math.floor(Math.random() * filtered.length)];
            return randomSoal;
         } else {
            throw new Error("Soal dari database kosong.");
         }
      };

      const isFirstQuestion = questionFetchCount === 0;
      const bolehPakaiAI =
         !isFirstQuestion && aiQuestionCount < MAX_AI_QUESTIONS;

      let soal;

      if (bolehPakaiAI && Math.random() < 0.5) {
         try {
            const response = await fetch(
               `/api/grammar/soal/generate-by-topic/${topicId}.json`
            );

            if (response.status === 429) {
               console.warn("Quota AI habis, fallback ke database...");
               soal = await ambilDariDatabase();
            } else {
               const data = await response.json();
               if (!data.soal) throw new Error("Gagal ambil soal dari AI.");
               const soalAI = data.soal;

               const isDuplicate = usedQuestionTexts.includes(
                  soalAI.text_pertanyaan.trim().toLowerCase()
               );

               // Tetap simpan ke database meskipun duplikat teks, untuk dapat ID dari Supabase
               const soalDisimpan = await simpanSoalAIKeDatabase(
                  soalAI,
                  topicId
               );

               if (soalDisimpan && soalDisimpan.id) {
                  soal = soalDisimpan;
                  if (isDuplicate) {
                     console.warn(
                        "Soal AI duplikat. Tapi tetap disimpan untuk ambil ID valid."
                     );
                  }
               } else {
                  console.warn("Gagal simpan soal AI. Menggunakan langsung.");
                  soal = soalAI;
               }

               setAiQuestionCount((prev) => prev + 1);
            }
         } catch (err) {
            console.warn("Gagal ambil soal AI, fallback ke DB:", err.message);
            soal = await ambilDariDatabase();
         }
      } else {
         soal = await ambilDariDatabase();
      }

      // Increment counter total soal yang pernah di-fetch
      setQuestionFetchCount((prev) => prev + 1);

      return soal;
   };

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
               id_soal: question.id, // Asumsi question.id adalah ID soal dari database
               // ID soal dari database
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

      if (!currentQuestion) {
         return (
            <div className="text-center text-white mt-10">
               <p>Memuat soal berikutnya...</p>
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mt-4"></div>
            </div>
         );
      }

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
   const handleNextQuestion = async () => {
      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex < 10) {
         setLoadingNextQuestion(true); // Mulai loading

         if (!questions[nextIndex]) {
            try {
               const newSoal = await fetchSingleQuestion();

               setQuestions((prev) => {
                  const updated = [...prev];
                  updated[nextIndex] = newSoal;
                  return updated;
               });

               setUsedQuestionIds((prevIds) => [...prevIds, newSoal.id]);
               setUsedQuestionTexts((prevTexts) => [
                  ...prevTexts,
                  newSoal.text_pertanyaan.trim().toLowerCase(),
               ]);
            } catch (err) {
               console.error("Gagal memuat soal baru:", err);
            }
         }

         setCurrentQuestionIndex(nextIndex);
         setUserAnswer("");
         setFeedback(null);
         setIsAnswerSubmitted(false);
         setLoadingNextQuestion(false); // Selesai loading
      } else {
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
   if (!currentQuestion) {
      return (
         <div className="text-red-500 font-semibold flex flex-col items-center justify-center h-full">
            Soal tidak tersedia. Silakan coba lagi nanti.
            <button
               onClick={onBackToLearn}
               className="mt-4 px-6 py-3 bg-[#FFC300] border border-[#FFC300] text-[#000814] rounded-lg font-semibold hover:text-white hover:bg-[#001D3D] transition duration-200 shadow-md"
            >
               Kembali
            </button>
         </div>
      );
   }

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
            {loadingNextQuestion ? (
               // 🌀 Loading Soal Selanjutnya
               <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-xl text-[#FFC300] font-semibold mb-4">
                     Memuat Soal Berikutnya...
                  </h2>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300]"></div>
               </div>
            ) : (
               <>
                  {/* Teks Pertanyaan */}
                  <p className="text-xl text-white mb-6 leading-relaxed">
                     {currentQuestion.text_pertanyaan}
                  </p>

                  {/* Area Input Jawaban (Dinamis) */}
                  <div className="mb-8 flex flex-col space-y-4">
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
                                          value={optionKey}
                                          checked={userAnswer === optionKey}
                                          onChange={() =>
                                             handleOptionSelect(optionKey)
                                          }
                                          disabled={isAnswerSubmitted}
                                          className="form-radio h-5 w-5 text-[#FFC300] border-[#003566] focus:ring-[#FFC300]"
                                       />
                                       <span className="ml-3 text-lg">
                                          {`${optionKey.toUpperCase()}. ${
                                             currentQuestion.opsi[optionKey]
                                          }`}
                                       </span>
                                    </label>
                                 )
                              )}
                           </div>
                        )}

                     {currentQuestion.tipe_pertanyaan === "benar_salah" && (
                        <div className="flex space-x-6 justify-center">
                           <label className="flex items-center text-white cursor-pointer">
                              <input
                                 type="radio"
                                 name="benarSalah"
                                 value="benar"
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
                                 value="salah"
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
                        className={`p-4 rounded-lg text-white font-semibold mb-6 shadow-sm ${
                           feedback.isCorrect ? "bg-green-600" : "bg-red-600"
                        }`}
                     >
                        {feedback.message}
                        {feedback.explanation && (
                           <p className="mt-2 text-sm italic">
                              Penjelasan: {feedback.explanation}
                           </p>
                        )}
                     </div>
                  )}
               </>
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
