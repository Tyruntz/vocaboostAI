import { useState } from "react";
import { generateLlamaText } from "../pages/api/chatbot/apiService";
import { sendMessageToChatbot } from "../lib/model";
import { generateFromModel } from "../pages/api/chatbot/chatApi";

export const useChatbot = ({ userId, refreshList }) => {
   const [activeChatSessionId, setActiveChatSessionId] = useState(null);
   const [isNewConversation, setIsNewConversation] = useState(false);
   const [chatMessages, setChatMessages] = useState([]);
   const [isBotTyping, setIsBotTyping] = useState(false);
   const [currentMessage, setCurrentMessage] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   const startNewConversation = () => {
      setIsLoading(true); // Aktifkan loading biar tampil skeleton-nya

      // Tunggu 1 frame agar React render ulang UI loading
      requestAnimationFrame(() => {
         setTimeout(() => {
            setActiveChatSessionId(`local-${Date.now()}`);
            setIsNewConversation(true);
            setChatMessages([
               {
                  tipe_pengirim: "bot",
                  teks_pesan:
                     "Halo! Anda telah memulai percakapan baru. Ada yang bisa saya bantu?",
                  waktu_kirim: new Date().toISOString(),
               },
            ]);
            setCurrentMessage("");
            setIsBotTyping(false);
            setIsLoading(false);
         }, 1000); // Bisa disesuaikan durasinya
      });
   };

   const selectConversation = (id) => {
      setActiveChatSessionId(id);
      setIsNewConversation(false);
   };

   const handleInputChange = (e) => {
      setCurrentMessage(e.target.value);
   };
   const getBotReply = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes("halo")) return "Halo juga! Ada yang bisa saya bantu?";
      if (lower.includes("pesanan"))
         return "Silakan berikan nomor pesanan Anda.";
      if (lower.includes("terima kasih"))
         return "Sama-sama! Senang bisa membantu.";
      return "Saya sedang memproses permintaan Anda...";
   };

   const handleSendMessage = async () => {
      console.log("userId sebelum kirim:", userId);

      const text = currentMessage.trim();
      if (!text) return;

      const userMessage = {
         tipe_pengirim: "user",
         teks_pesan: text,
         waktu_kirim: new Date().toISOString(),
      };

      setCurrentMessage("");
      setIsBotTyping(true);
      setChatMessages((prev) => [...prev, userMessage]);

      const historyBeforeBot = [...chatMessages, userMessage];
      let responseText = "";
      const slicedHistory = historyBeforeBot
         .slice(-10)
         .map((msg) =>
            msg.tipe_pengirim === "user"
               ? `User: ${msg.teks_pesan}`
               : `Bot: ${msg.teks_pesan}`
         );
      //    const systemInstruction = `
      //  Anda adalah Vocaboost, tutor bahasa Inggris interaktif yang ramah dan membantu.
      //  Tugas utama Anda adalah menjelaskan konsep grammar bahasa Inggris dan memberikan contoh.

      //  **Aturan Utama:**
      //  1.  **Bahasa**: Selalu jelaskan dalam **Bahasa Indonesia**. Contoh kalimat WAJIB dalam **Bahasa Inggris**.
      //  2.  **Keringkasan**: Jelaskan topik secara singkat, jelas, dan langsung ke intinya (maksimal 4-7 kalimat).
      //  3.  **Contoh**: Sertakan SATU contoh kalimat yang relevan untuk setiap penjelasan.
      //  4.  **Persona**: Selalu gunakan nama "Vocaboost" saat memperkenalkan diri atau merujuk pada diri sendiri.
      //  5.  **Pengulangan**: Jangan mengulang pertanyaan siswa. Langsung berikan jawabannya.

      //  **Penanganan Topik:**
      //  * **Topik Grammar (yang relevan)**: Berikan penjelasan dan contoh sesuai permintaan.
      //  * **Topik di Luar Grammar/Bahasa Inggris**: Jika pengguna menanyakan hal di luar topik grammar atau bahasa Inggris (misalnya teknologi, sejarah, matematika, kesehatan mental, atau topik umum lainnya), balas dengan sopan menggunakan kalimat seperti:
      //      "Maaf, topik itu di luar spesialisasi saya sebagai tutor bahasa Inggris bernama Vocaboost. Saya hanya bisa membantu Anda terkait materi bahasa Inggris. Apa ada pertanyaan lain seputar grammar atau kosa kata?"
      //      Jangan memberi informasi teknis atau pengetahuan umum selain bahasa Inggris.

      //  **Gaya Bahasa**: Gunakan bahasa yang edukatif, memotivasi, dan mudah dipahami.
      //  `.trim();

      try {
         // Kirim ke model Gemini (via chat.ts)
         // responseText = await sendMessageToChatbot(text,[],systemInstruction); // kamu bisa tambahkan systemInstruction & history jika perlu
         responseText = await generateLlamaText(text);
         console.log("✅ Bot reply:", responseText);
      } catch (error) {
         console.error("❌ Gagal mendapatkan respons dari model:", error);
         responseText =
            "Maaf ya, sepertinya ada gangguan teknis. Coba lagi sebentar lagi 😊";
      }

      const botMessage = {
         tipe_pengirim: "bot",
         teks_pesan: responseText.teks_pesan,
         waktu_kirim: new Date().toISOString(),
      };

      const updatedMessages = [...historyBeforeBot, botMessage];
      setChatMessages((prev) => [...prev, botMessage]);

      // Simulasi delay agar UX lebih natural
      await new Promise((res) => setTimeout(res, 1000));
      setIsBotTyping(false);

      try {
         if (isNewConversation) {
            const response = await fetch("/api/chatbot/percakapan/create", {
               method: "POST",
               body: JSON.stringify({
                  user_id: userId,
                  topik: text.substring(0, 30),
                  waktu_mulai: new Date().toISOString(),
                  pesan: updatedMessages,
               }),
            });

            const result = await response.json();

            if (response.ok && result.data) {
               await refreshList(); // update daftar percakapan
               setActiveChatSessionId(result.data.id);
               setIsNewConversation(false);
            } else {
               console.error("Gagal menyimpan percakapan:", result.error);
            }
         } else {
            // Update percakapan lama
            await fetch("/api/chatbot/percakapan/update-pesan", {
               method: "PUT",
               body: JSON.stringify({
                  id: activeChatSessionId,
                  pesan: updatedMessages,
               }),
            });
         }
      } catch (err) {
         console.error("Gagal menyimpan/update percakapan:", err);
      }
   };

   return {
      activeChatSessionId,
      isNewConversation,
      chatMessages,
      currentMessage,
      isBotTyping,
      isLoading,
      startNewConversation,
      selectConversation,
      handleInputChange,
      handleSendMessage,
      setChatMessages,
      setIsLoading,
      setActiveChatSessionId,
   };
};
