import React from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient"; // Pastikan path ini sesuai

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      setMessage("Login berhasil! Mengarahkan ke halaman utama...");
      setMessageType("success");

      setTimeout(() => {
        window.location.href = "/vocaboostAI-home"; // Arahkan ke halaman utama setelah login
      }, 1500);
    } catch (error) {
      if (error.message === "Invalid login credentials") {
        setMessage("Email atau kata sandi salah. Silakan coba lagi.");
      } else {
        setMessage(`Gagal login: ${error.message}`);
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000814] p-4 font-sans antialiased relative overflow-hidden">
      {/* Optional: Add subtle background elements for visual interest */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-[#003566] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-[#FFC300] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-[#FFD60A] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative bg-[#001D3D] p-8 rounded-xl text-white shadow-2xl w-full max-w-md border border-[#003566] transform transition-all duration-300 hover:scale-105 hover:shadow-3xl z-10">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-[#FFD60A]">
          Selamat Datang Kembali!
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Silakan masuk untuk melanjutkan pembelajaran Anda.
        </p>

        {message && (
          <div
            className={`p-3 mb-4 rounded-md text-sm font-medium ${
              messageType === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-2 text-[#FFC300]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-[#003566] rounded-lg bg-[#000814] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFC300] transition duration-200"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2 text-[#FFC300]"
            >
              Kata Sandi
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-[#003566] rounded-lg bg-[#000814] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFC300] transition duration-200"
              placeholder="Kata sandi Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#FFC300] text-[#000814] py-3 px-4 rounded-lg font-extrabold text-lg uppercase shadow-lg hover:bg-[#FFD60A] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 focus:ring-offset-[#001D3D] disabled:opacity-60 disabled:cursor-not-allowed transition duration-300 transform hover:-translate-y-1"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-8 text-gray-400">
          Belum punya akun?{" "}
          <a
            href="./register"
            className="text-[#FFC300] hover:underline font-semibold hover:text-[#FFD60A] transition duration-200"
          >
            Daftar di sini
          </a>
        </p>
      </div>

      {/* Tailwind CSS keyframes for blob animation - add this to your global CSS or a style tag if not using PostCSS plugins */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;