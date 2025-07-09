// ChatbotContent.jsx
import React, { useEffect, useRef } from "react";

const formatWaktu = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date)) return "Invalid";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

// ChatbotContent sekarang hanya menerima `messages` dan `isBotTyping`
// Karena input, header, dan footer ditangani di Homepage
const ChatbotContent = ({ loading, messages, isBotTyping }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isBotTyping]);

  return (
    // Kontainer ini akan mengisi ruang antara header dan footer yang fixed
    // bg-[#000814] akan diatur oleh parentnya di Homepage
    <div className="flex flex-col h-full bg-[#000814] rounded-lg shadow-lg"> {/* Pertahankan ini untuk efek rounded/shadow di desktop */}
      {/* Hapus Header dari sini */}

      {/* Area tampilan chat */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar"> {/* Padding sudah ditangani oleh Homepage */}
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

      {/* Hapus Input area dari sini */}
    </div>
  );
};

export default ChatbotContent;