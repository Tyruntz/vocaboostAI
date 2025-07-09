// ChatbotContent.jsx
import React from "react";
import { useEffect, useRef } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi"; // Pastikan ini diimpor
import { HiMenuAlt3 } from "react-icons/hi"; // Contoh ikon menu, pastikan diimpor jika digunakan

const formatWaktu = (iso) => {
   if (!iso) return "";
   const date = new Date(iso);
   if (isNaN(date)) return "Invalid";
   return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
   });
};

// Komponen untuk pesan dari user (bubble di kanan)
const UserMessage = ({ message, waktu }) => (
   <div className="flex justify-end mb-4">
      <div className="bg-[#FFC300] text-[#000814] p-3 rounded-lg max-w-[85%] md:max-w-md shadow-md">
         <p>{message}</p>
         <p className="text-xs text-[#000814] text-right mt-1">
            {formatWaktu(waktu)}
         </p>
      </div>
   </div>
);

const formatMessageWithBold = (text) => {
   const parts = text.split(/(\*[^*]+\*)/g);
   return parts.map((part, i) => {
      if (part.startsWith("*") && part.endsWith("*")) {
         return <strong key={i}>{part.slice(1, -1)}</strong>;
      }
      return <span key={i}>{part}</span>;
   });
};

const BotMessage = ({ message, waktu }) => {
   const exampleMatch = message.match(
      /Contoh kalimat bahasa Inggris:\s*(.*?)\nTerjemahan bebas:\s*(.*)/i
   );
   const exampleEnglish = exampleMatch?.[1] ?? "";
   const exampleIndo = exampleMatch?.[2] ?? "";
   const mainContent = exampleMatch
      ? message.split("Contoh kalimat bahasa Inggris:")[0].trim()
      : message;

   return (
      <div className="flex justify-start mb-4">
         <div className="bg-[#001D3D] text-white p-3 rounded-lg max-w-[85%] md:max-w-md space-y-2">
            <p className="whitespace-pre-line">
               {formatMessageWithBold(mainContent)}
            </p>

            {exampleMatch && (
               <div className="bg-[#003566] border border-[#001D3D] rounded-md p-2 text-sm">
                  <p className="font-semibold text-[#FFD60A]">
                     📘 Contoh Kalimat:
                  </p>
                  <p className="italic text-white">"{exampleEnglish}"</p>
                  <p className="text-white mt-1">
                     🗨️ Terjemahan: {exampleIndo}
                  </p>
               </div>
            )}

            <p className="text-xs text-gray-200 text-left">
               {formatWaktu(waktu)}
            </p>
         </div>
      </div>
   );
};

const ChatbotContent = ({
   loading,
   messages,
   currentInput,
   onInputChange,
   onSendMessage,
   onNewChat,
   isBotTyping,
}) => {
   const handleKeyPress = (event) => {
      if (event.key === "Enter" && currentInput.trim() !== "") {
         onSendMessage();
      }
   };
   const messagesEndRef = useRef(null);
   useEffect(() => {
      if (messagesEndRef.current) {
         messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
   }, [messages, isBotTyping]);

   return (
      // Outer container - Hapus rounded-lg dan shadow-lg untuk full width
      // Tambahkan w-full dan h-full untuk mengisi layar
      <div className="flex flex-col w-full h-full bg-[#000814]">
         {/* Header - Hapus rounded-t-lg untuk full width */}
         <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#001D3D] flex items-center justify-between shadow-md">
            {loading ? (
               <div className="animate-pulse flex-1 space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                     <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                     <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                     </div>
                  </div>
               </div>
            ) : (
               <>
                  <div className="flex items-center gap-3">
                     {/* Gunakan ikon menu jika diperlukan */}
                     {/* <HiMenuAlt3 className="w-6 h-6 text-white cursor-pointer" /> Tambahkan ikon menu di sini */}
                     <h2 className="text-lg sm:text-xl ml-11 sm:ml-0 font-semibold text-white">
                        Chat dengan Bot
                     </h2>
                  </div>
                  <button
                     onClick={onNewChat}
                     className="bg-[#FFC300] hover:bg-[#FFD60A] text-[#000814] font-bold py-2 px-3 rounded-lg transition duration-200 ease-in-out text-sm flex items-center gap-2"
                  >
                     <HiOutlinePencilAlt className="text-lg" />

                     {/* Hanya tampil di layar sm ke atas */}
                     <span className="hidden sm:inline">Mulai Percakapan Baru</span>
                  </button>
               </>
            )}
         </div>

         {/* Area tampilan chat */}
         {/* Pertahankan padding horizontal untuk konten chat */}
         <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
            {loading ? (
               <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="flex flex-col">
                  {messages.map((msg, index) =>
                     msg.tipe_pengirim === "user" ? (
                        <UserMessage
                           key={index}
                           message={msg.teks_pesan}
                           waktu={msg.waktu_kirim}
                        />
                     ) : (
                        <BotMessage
                           key={index}
                           message={msg.teks_pesan}
                           waktu={msg.waktu_kirim}
                        />
                     )
                  )}
                  <div ref={messagesEndRef} className="h-1" />
               </div>
            )}
         </div>

         {/* Input area - Hapus rounded-b-lg untuk full width */}
         {/* max-w-screen-sm dan mx-auto harus di luar jika Anda ingin komponen ini full width */}
         <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#001D3D] shadow-inner">
            <div className="flex items-center gap-2 sm:gap-4">
               <input
                  type="text"
                  placeholder="Masukan pertanyaan"
                  className="flex-1 border border-[#003566] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFC300] bg-[#000814] text-white placeholder-gray-400"
                  value={currentInput}
                  onChange={onInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
               />
               <button
                  className="bg-[#003566] hover:bg-[#001D3D] text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out shrink-0"
                  onClick={onSendMessage}
                  disabled={loading || currentInput.trim() === ""}
               >
                  Kirim
               </button>
            </div>
         </div>
      </div>
   );
};

export default ChatbotContent;
