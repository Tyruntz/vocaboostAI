import React from "react";
import Navbar from "../Navbar.jsx"; // Assuming Navbar will also be styled with the palette
import AdminPage from "./AdminPage.jsx"; // This component is not used in the return, keeping for context if needed

const LandingPage = () => {
  return (
    <div>
      {/* Navbar - Assuming this component will be updated separately to match the palette */}
      {/* You'll need to update your Navbar.jsx file with these colors as well */}
      <Navbar />

      {/* Hero Section */}
      <section
        id="beranda"
        className="min-h-screen bg-gradient-to-br from-[#000814] via-[#001D3D] to-[#003566] text-white py-16 md:py-24 relative overflow-hidden"
      >
        {/* Decorative elements for visual appeal */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute w-40 h-40 bg-[#FFC300] rounded-full mix-blend-multiply filter blur-xl opacity-20 -top-10 -left-10 animate-pulse-slow"></div>
          <div className="absolute w-60 h-60 bg-[#FFD60A] rounded-full mix-blend-multiply filter blur-xl opacity-20 -bottom-20 -right-20 animate-pulse-slow-reverse"></div>
          <div className="absolute w-52 h-52 bg-[#003566] rounded-full mix-blend-multiply filter blur-xl opacity-20 top-1/4 left-[15%] animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute w-48 h-48 bg-[#FFC300] rounded-full mix-blend-multiply filter blur-xl opacity-20 bottom-1/3 right-[10%] animate-pulse-slow-reverse animation-delay-1500"></div>
        </div>

        <div className="container mx-auto mt-10 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 space-y-8 md:space-y-0 relative z-10">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-[#FFD60A]">
              VocaBoost AI
            </h1>
            <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300">
              Tingkatkan kemampuan bahasa Inggris Anda dengan
              <br />
              <span className="text-[#FFC300] font-semibold">VocaBoost AI</span>, chatbot cerdas yang siap membantu Anda
              belajar kapan saja, di mana saja.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="/auth/register"
                className="px-8 py-4 bg-[#FFC300] text-[#000814] font-bold rounded-full shadow-lg hover:bg-[#FFD60A] transition duration-300 transform hover:scale-105"
              >
                Daftar Gratis
              </a>

              <a
                href="/auth/login"
                className="px-8 py-4 bg-[#003566] text-white font-bold rounded-full shadow-lg hover:bg-[#001D3D] transition duration-300 transform hover:scale-105"
              >
                Mulai Belajar
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src="https://leqrmwbhwwwfgnulpvuq.supabase.co/storage/v1/object/public/images//Desain%20tanpa%20judul%20(2).png"
              className="max-w-full h-auto drop-shadow-2xl" // Added drop-shadow for better visual
              alt="VocaBoost AI Illustration"
            />
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="py-16 md:py-24 bg-[#000814] text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-[#FFD60A] text-center">
            Fitur Unggulan VocaBoost AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💬",
                title: "Chatbot Interaktif",
                desc: "Berinteraksi dua arah dengan chatbot cerdas untuk simulasi percakapan dan pembelajaran yang dinamis.",
                bgColor: "bg-[#001D3D]", // Dark blue
                iconColor: "text-[#FFC300]", // Yellow
              },
              {
                icon: "✍️",
                title: "Koreksi & Umpan Balik Instan",
                desc: "Dapatkan koreksi tata bahasa dan ejaan secara real-time untuk setiap kalimat yang Anda ketik.",
                bgColor: "bg-[#001D3D]",
                iconColor: "text-[#FFD60A]", // Lighter yellow
              },
              {
                icon: "📚",
                title: "Penjelasan Kosakata Mendalam",
                desc: "Pahami makna kata baru dengan definisi jelas dan contoh kalimat yang relevan.",
                bgColor: "bg-[#001D3D]",
                iconColor: "text-[#FFC300]",
              },
              {
                icon: "🎯",
                title: "Latihan Grammar & Menulis",
                desc: "Dapatkan prompt latihan interaktif untuk mengasah kemampuan menulis dan berbicara Anda.",
                bgColor: "bg-[#001D3D]",
                iconColor: "text-[#FFD60A]",
              },
              {
                icon: "🌐",
                title: "Akses Fleksibel 24/7",
                desc: "Belajar kapan saja dan di mana saja, tanpa batasan waktu dan lokasi.",
                bgColor: "bg-[#001D3D]",
                iconColor: "text-[#FFC300]",
              },
               { // Added one more for a balanced grid appearance
                icon: "📈",
                title: "Pelacakan Kemajuan",
                desc: "Pantau progres belajar Anda dengan mudah dan lihat peningkatan dari waktu ke waktu.",
                bgColor: "bg-[#001D3D]",
                iconColor: "text-[#FFD60A]",
              },
            ].map(({ icon, title, desc, bgColor, iconColor }, i) => (
              <div
                key={i}
                className={`${bgColor} p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300 border border-[#003566]`}
              >
                <div className={`text-5xl mb-4 ${iconColor} text-center`}>
                  {icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center text-[#FFD60A]">
                  {title}
                </h3>
                <p className="text-gray-300 text-center">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section
        id="cara-kerja"
        className="py-16 md:py-24 bg-[#001D3D] text-white min-h-screen"
      >
        <div className="container mx-auto pt-20 px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-[#FFD60A] text-center">
            Bagaimana Cara Kerja VocaBoost AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            {[
              "Daftar & Masuk",
              "Mulai Berinteraksi",
              "Dapatkan Bantuan AI",
            ].map((title, index) => (
              <div
                key={index}
                className="bg-[#000814] p-6 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300 border border-[#003566]"
              >
                <div className="w-16 h-16 bg-[#FFC300] rounded-full mx-auto mb-4 flex items-center justify-center text-[#000814] font-bold text-3xl">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center text-[#FFD60A]">
                  {title}
                </h3>
                <p className="text-gray-300 text-center">
                  {index === 0
                    ? "Buat akun gratis dan masuk ke platform dengan mudah dan cepat."
                    : index === 1
                    ? "Mulai berinteraksi dengan chatbot untuk latihan percakapan dan grammar."
                    : "Dapatkan koreksi instan, penjelasan kosakata, dan prompt latihan dari AI kami."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manfaat Section */}
      <section id="manfaat" className="py-16 md:py-24 bg-[#000814] text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-[#FFD60A] text-center">
            Mengapa Memilih VocaBoost AI?
          </h2>
          <div className="w-full max-w-2xl mx-auto space-y-6">
            {[
              {
                title: "Pembelajaran Personal",
                desc: "Dapatkan pengalaman belajar yang disesuaikan dengan kecepatan dan gaya belajar Anda.",
              },
              {
                title: "Efisiensi Tinggi",
                desc: "Belajar lebih efektif dengan umpan balik instan dan materi yang relevan.",
              },
              {
                title: "Aksesibilitas",
                desc: "Solusi pembelajaran terjangkau bagi siapa saja, di mana saja, tanpa perlu kursus konvensional.",
              },
              {
                title: "Teknologi Terkini",
                desc: "Didukung oleh model AI canggih LLaMA 2-7B yang sudah di optimalkan untuk akurasi respons yang superior.",
              },
            ].map(({ title, desc }, i) => (
              <div className="bg-[#001D3D] p-5 rounded-2xl shadow-lg flex items-start space-x-4 border border-[#003566]" key={i}>
                <span className="text-[#FFC300] text-3xl mr-3">✔</span> {/* Adjusted size */}
                <p className="text-gray-200">
                  <strong className="text-[#FFD60A]">{title}:</strong> {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#000814] via-[#001D3D] to-[#003566] text-white text-center">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#FFD60A]">
            Bergabunglah dengan VocaBoost AI Sekarang!
          </h2>
          <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-300 bg-opacity-10 rounded-md p-2 mx-auto max-w-xl">
            Tingkatkan kemampuan bahasa Inggris Anda dengan cara yang menyenangkan dan interaktif. Daftar sekarang dan rasakan manfaatnya!
          </p>
          <a href="/auth/register" className="px-8 py-4 bg-[#FFC300] text-[#000814] font-bold rounded-full shadow-lg text-lg hover:bg-[#FFD60A] transition duration-300 transform hover:scale-105">
            Mulai Belajar Gratis
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000814] text-white p-8 md:p-12 border-t border-[#003566]">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo in Footer */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FFC300] rounded-full flex items-center justify-center text-[#000814] font-bold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-2a1 1 0 11-2 0 1 1 0 012 0zm-7 4a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#FFD60A]">
              VocaBoost AI
            </span>
          </div>

          {/* Footer Links */}
          <nav className="flex space-x-6 text-gray-300">
            <a href="#" className="hover:text-[#FFC300] transition duration-200">Instagram</a>
            <a href="#" className="hover:text-[#FFC300] transition duration-200">Whatsapp</a>
            <a href="#" className="hover:text-[#FFC300] transition duration-200">Facebook</a>
          </nav>
        </div>
        <div className="text-center text-gray-500 text-sm mt-8">
            © {new Date().getFullYear()} VocaBoost AI. All rights reserved.
        </div>
      </footer>

      {/* Custom Tailwind CSS keyframes for animations (add to your global CSS or a <style> tag) */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes pulse-slow-reverse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-pulse-slow-reverse {
          animation: pulse-slow-reverse 8s infinite ease-in-out;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;