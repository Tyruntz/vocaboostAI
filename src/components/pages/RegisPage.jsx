import React, { useState } from "react";

const RegisPage = () => {
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
   const [messageType, setMessageType] = useState(""); // 'success' or 'error'

   const handleSignUp = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      setMessageType("");

      try {
         const response = await fetch("/api/auth/register.json", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email: email,
               password: password,
               username: name,
            }),
         });

         const data = await response.json();

         if (response.ok) {
            setMessage(
               "Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi."
            );
            setMessageType("success");
            setName("");
            setEmail("");
            setPassword("");
         } else {
            setMessage(
               `Gagal mendaftar: ${
                  data.error || "Terjadi kesalahan tidak dikenal."
               }`
            );
            setMessageType("error");
         }
      } catch (error) {
         console.error("Error saat memanggil API register:", error);
         setMessage(
            "Terjadi kesalahan jaringan atau server. Silakan coba lagi."
         );
         setMessageType("error");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-[#000814] p-4 font-sans antialiased relative overflow-hidden">
         {/* Decorative Blob Shapes - similar to login page for consistency */}
         <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#003566] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob-rev animation-delay-2000"></div>
         <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#FFD60A] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
         <div className="absolute top-1/2 right-0 w-56 h-56 bg-[#FFC300] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob-rev animation-delay-6000"></div>

         <div className="relative bg-[#001D3D] p-8 rounded-xl text-white shadow-2xl w-full max-w-md border border-[#003566] transform transition-all duration-300 hover:scale-105 hover:shadow-3xl z-10">
            <h2 className="text-4xl font-extrabold text-center mb-8 text-[#FFD60A]">
               Daftar Akun Baru
            </h2>
            <p className="text-center text-gray-300 mb-6">
               Bergabunglah sekarang dan mulai belajar bahasa Inggris!
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

            <form onSubmit={handleSignUp} className="space-y-6">
               <div>
                  <label
                     htmlFor="name"
                     className="block text-sm font-semibold mb-2 text-[#FFC300]"
                  >
                     Nama Lengkap
                  </label>
                  <input
                     type="text"
                     id="name"
                     className="w-full px-4 py-2 border border-[#003566] rounded-lg bg-[#000814] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFC300] transition duration-200"
                     placeholder="Nama Lengkap Anda"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                  />
               </div>
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
                     placeholder="Minimal 6 karakter"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     minLength="6"
                  />
               </div>
               <button
                  type="submit"
                  className="w-full bg-[#FFC300] text-[#000814] py-3 px-4 rounded-lg font-extrabold text-lg uppercase shadow-lg hover:bg-[#FFD60A] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 focus:ring-offset-[#001D3D] disabled:opacity-60 disabled:cursor-not-allowed transition duration-300 transform hover:-translate-y-1"
                  disabled={loading}
               >
                  {loading ? "Mendaftar..." : "Daftar"}
               </button>
            </form>

            <p className="text-center text-sm mt-8 text-gray-400">
               Sudah punya akun?{" "}
               <a
                  href="./login"
                  className="text-[#FFC300] hover:underline font-semibold hover:text-[#FFD60A] transition duration-200"
               >
                  Masuk di sini
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
            @keyframes blob-rev {
               0% {
                  transform: translate(0px, 0px) scale(1);
               }
               33% {
                  transform: translate(-30px, 50px) scale(0.9);
               }
               66% {
                  transform: translate(20px, -20px) scale(1.1);
               }
               100% {
                  transform: translate(0px, 0px) scale(1);
               }
            }
            .animate-blob {
               animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1);
            }
            .animate-blob-rev {
               animation: blob-rev 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1);
            }
            .animation-delay-2000 {
               animation-delay: 2s;
            }
            .animation-delay-4000 {
               animation-delay: 4s;
            }
            .animation-delay-6000 {
               animation-delay: 6s;
            }
         `}</style>
      </div>
   );
};

export default RegisPage;
