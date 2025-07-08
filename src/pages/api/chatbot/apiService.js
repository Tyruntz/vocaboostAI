// import { translate } from '@vitalets/google-translate-api';
const API_URL = "https://vkp2i6z18hpzcd-8000.proxy.runpod.net/generate"; // Pastikan URL ini benar
import { generateFromModel } from "./chatApi";

export async function generateLlamaText(
   userInput,
   max_new_tokens = 250, 
   temperature = 0.7,
   history = [] 
) {
   try {
      const systemPrompt = `
        Anda adalah Vocaboost, tutor bahasa Inggris interaktif yang ramah dan membantu.
       Tugas utama Anda adalah menjelaskan konsep grammar bahasa Inggris dan memberikan contoh.

       **Aturan Utama:**
       1.  **Bahasa**: Selalu jelaskan dalam **Bahasa Indonesia**. Contoh kalimat WAJIB dalam **Bahasa Inggris**.
       2.  **Keringkasan**: Jelaskan topik secara singkat, jelas, dan langsung ke intinya (maksimal 4-7 kalimat).
       3.  **Contoh**: Sertakan SATU contoh kalimat yang relevan untuk setiap penjelasan.
       4.  **Persona**: Selalu gunakan nama "Vocaboost" saat memperkenalkan diri atau merujuk pada diri sendiri.
       5.  **Pengulangan**: Jangan mengulang pertanyaan siswa. Langsung berikan jawabannya.

       **Penanganan Topik:**
       * **Topik Grammar (yang relevan)**: Berikan penjelasan dan contoh sesuai permintaan.
       * **Topik di Luar Grammar/Bahasa Inggris**: Jika pengguna menanyakan hal di luar topik grammar atau bahasa Inggris (misalnya teknologi, sejarah, matematika, kesehatan mental, atau topik umum lainnya), balas dengan sopan menggunakan kalimat seperti:
           "Maaf, topik itu di luar spesialisasi saya sebagai tutor bahasa Inggris bernama Vocaboost. Saya hanya bisa membantu Anda terkait materi bahasa Inggris. Apa ada pertanyaan lain seputar grammar atau kosa kata?"
           Jangan memberi informasi teknis atau pengetahuan umum selain bahasa Inggris.

       **Gaya Bahasa**: Gunakan bahasa yang edukatif, memotivasi, dan mudah dipahami.
        `;

      // PENTING: Struktur fullPrompt yang memaksa model untuk langsung menjawab.
      // Kita tidak akan lagi menggunakan "Siswa:" di dalam prompt yang dikirimkan.
      // Model sudah diinstruksikan untuk tidak mengulang pola dialog.
      const fullPrompt = `<s>[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\n${userInput} [/INST] `; // Tambahkan spasi di akhir [/INST]

      const response = await fetch(API_URL, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            prompt: fullPrompt,
            max_new_tokens,
            temperature,
         }),
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.detail || "Gagal mendapatkan respons dari API");
      }

      let generatedText = data.generated_text;

      // --- Pemrosesan Output yang Lebih Robust ---
      // 1. Cari akhir dari tag instruksi [/INST]
      const endOfInstructionTag = "[/INST]";
      let cleanText = generatedText;
      const startIndex = generatedText.indexOf(endOfInstructionTag);

      if (startIndex !== -1) {
         cleanText = generatedText
            .substring(startIndex + endOfInstructionTag.length)
            .trim();
      }
      const unwantedPatterns =
         /(^\s*Siswa:\s*.*|^\s*Kamu:\s*|^\s*Tutor:\s*|\s*Siswa:\s*.*$|\s*Kamu:\s*.*$|\s*Tutor:\s*.*$)/gim;
      cleanText = cleanText.replace(unwantedPatterns, "").trim();

      const nextQuestionPattern =
         /(Siswa:|Tutor:|What is|Can you tell me|Jelaskan tentang)/i;
      const match = cleanText.match(nextQuestionPattern);
      if (match && match.index > 0) {
         // Potong teks sebelum pola dialog baru dimulai
         cleanText = cleanText.substring(0, match.index).trim();
      }

      cleanText = cleanText.replace(/<\/?s>/g, "").trim();
      if (cleanText.length === 0) {
         cleanText =
            "Maaf, saya kesulitan memahami instruksi atau menghasilkan jawaban yang relevan. Bisakah Anda coba lagi dengan pertanyaan yang berbeda?";
      }
      console.log(cleanText)

      const output = await generateFromModel(cleanText);
      

    

      return {
        //  id: `msg-${Date.now()}`,
         teks_pesan: output,
         waktu_kirim: new Date().toISOString(),
         tipe_pengirim: "bot",
      };
   } catch (error) {
      console.error("❌ Error in generateLlamaText:", error);
      return {
         id: `msg-${Date.now()}`,
         teks_pesan:
            "Maaf, terjadi kesalahan saat menjawab. Silakan coba lagi.",
         waktu_kirim: new Date().toISOString(),
         tipe_pengirim: "bot",
      };
   }
}
