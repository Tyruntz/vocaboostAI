// ChatbotContent.jsx
import React from "react";
import { useEffect, useRef } from "react";

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
    <div className="bg-[#FFC300] text-[#000814] p-3 rounded-lg max-w-xs md:max-w-md shadow-md">
      <p>{message}</p>
      <p className="text-xs text-[#000814] text-right mt-1">
        {formatWaktu(waktu)}
      </p>
    </div>
  </div>
);
const formatMessageWithBold = (text) => {
  // Ganti *text* jadi <strong>text</strong>
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
      <div className="bg-[#001D3D] text-white p-3 rounded-lg max-w-xs md:max-w-md space-y-2">
        <p className="whitespace-pre-line">
          {formatMessageWithBold(mainContent)}
        </p>

        {exampleMatch && (
          <div className="bg-[#003566] border border-[#001D3D] rounded-md p-2 text-sm">
            <p className="font-semibold text-[#FFD60A]">📘 Contoh Kalimat:</p>
            <p className="italic text-white">"{exampleEnglish}"</p>
            <p className="text-white mt-1">🗨️ Terjemahan: {exampleIndo}</p>
          </div>
        )}

        <p className="text-xs text-gray-200 text-left">
          {formatWaktu(waktu)}
        </p>
      </div>
    </div>
  );
};

// Tambahkan onNewChat sebagai prop
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
    if (event.key === "Enter") {
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
    <div className="flex flex-col h-full bg-[#000814] rounded-lg shadow-lg p-6">
      {/* Bagian atas (header) */}
      <div className="mb-6 flex justify-between items-center">
        {" "}
        {/* Gunakan flex untuk menempatkan tombol */}
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
            <div className="text-left">
              {" "}
              {/* Sesuaikan alignment judul */}
              <h2 className="text-xl font-semibold text-white">
                Chat dengan Bot
              </h2>
              <p className="text-gray-300 text-sm">Bot sedang online</p>
            </div>
            {/* Tombol Mulai Percakapan Baru */}
            <button
              onClick={onNewChat}
              className="bg-[#FFC300] hover:bg-[#FFD60A] text-[#000814] font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
            >
              Mulai Percakapan Baru
            </button>
          </>
        )}
      </div>

      {/* Area tampilan chat */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          // Skeleton loading untuk area chat
          <div className="animate-pulse space-y-4 px-4">
            {[...Array(5)].map(
              (
                _,
                i // 5 baris skeleton chat
              ) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              )
            )}
          </div>
        ) : (
          // Konten chat sebenarnya
          <div className="flex flex-col px-4">
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

      {/* Input area */}
      <div className="mt-6 flex items-center space-x-4">
        {loading ? (
          <>
            {/* Skeleton untuk input text */}
            <div className="flex-1 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
            {/* Skeleton untuk tombol */}
            <div className="w-24 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="INPUT TEXT"
              className="flex-1 border border-[#001D3D] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFC300] bg-[#001D3D] text-white placeholder-gray-400"
              value={currentInput}
              onChange={onInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading} // Nonaktifkan input saat loading
            />
            <button
              className="bg-[#003566] hover:bg-[#001D3D] text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out"
              onClick={onSendMessage}
              disabled={loading || currentInput.trim() === ""} // Nonaktifkan tombol saat loading atau input kosong
            >
              Kirim
            </button>
          </>
        )}
      </div>

      {/* Custom scrollbar style - Ini diasumsikan sudah dipindahkan ke CSS global */}
      {/* <style jsx>{`...`}</style> */}
    </div>
  );
};

export default ChatbotContent;