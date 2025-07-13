import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const UserProfileContent = ({ user, onLogout }) => {
  const [latihanSelesai, setLatihanSelesai] = useState(0);
  const [akurasi, setAkurasi] = useState(null);
  const [loading, setLoading] = useState(true);

  const displayName =
    user?.profile?.username || user?.username || user?.email?.split("@")[0] || "Pengguna";
  const displayEmail =
    user?.profile?.email || user?.email || "email@example.com";
  const displayUserId = user?.id || "id_default";
  const displayLevel = user?.profile?.level_belajar || user?.level_belajar || "Belum ditentukan";
  const createdAt = user?.created_at;

  const userBio =
    "Selamat datang di profil Anda! Terus belajar bahasa Inggris bersama VocaBoost AI.";

  useEffect(() => {
    const fetchStats = async () => {
      if (!displayUserId) return;

      setLoading(true);

      // 1. Hitung soal selesai
      const { count: totalSelesai, error: err1 } = await supabase
        .from("progress_pengguna")
        .select("*", { count: "exact", head: true })
        .eq("user_id", displayUserId);

      // 2. Hitung soal benar
      const { count: totalBenar, error: err2 } = await supabase
        .from("progress_pengguna")
        .select("*", { count: "exact", head: true })
        .eq("user_id", displayUserId)
        .eq("is_correct", true);

      if (!err1 && !err2) {
        setLatihanSelesai(totalSelesai || 0);
        const akurasiHitung =
          totalSelesai > 0
            ? Math.round((totalBenar ?? 0) / totalSelesai * 100)
            : 0;
        setAkurasi(akurasiHitung);
      } else {
        console.error("Gagal ambil statistik:", err1 || err2);
      }

      setLoading(false);
    };

    fetchStats();
  }, [displayUserId]);

  return (
    <div className="p-6 px-4 sm:px-6 lg:px-8 bg-[#001D3D] bg-opacity-30 backdrop-blur-md border border-[#003566] rounded-3xl shadow-xl w-full max-w-4xl mx-auto flex flex-col text-white relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 w-full">
        {/* Avatar */}
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=ffc300,ffd60a,001d3d&backgroundType=solid,gradientLinear&radius=50`}
          alt="User Avatar"
          className="w-28 h-28 rounded-full border-4 border-[#FFC300] object-cover shadow-md flex-shrink-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/112x112/FFC300/001D3D?text=User";
          }}
        />

        {/* Info Pengguna */}
        <div className="flex-grow text-center md:text-left">
          <p className="text-3xl font-bold text-[#FFD60A] mb-1 leading-tight">
            {displayName}
          </p>
          <p className="text-base text-[#FFC300] opacity-80 mb-1">
            {displayEmail}
          </p>
          <p className="text-sm text-white opacity-70 mb-1">
            Level: {displayLevel}
          </p>
          {createdAt && (
            <p className="text-sm text-white opacity-60 mb-2">
              Bergabung sejak:{" "}
              {new Date(createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <p className="text-sm text-white opacity-70 leading-relaxed">
            {userBio}
          </p>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 w-full text-center">
        <div className="flex flex-col items-center">
          <p className="text-3xl font-extrabold text-[#FFC300]">
            {loading ? "..." : latihanSelesai}
          </p>
          <p className="text-sm text-white opacity-70">Latihan Selesai</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-3xl font-extrabold text-[#FFD60A]">
            {loading ? "..." : `${akurasi}%`}
          </p>
          <p className="text-sm text-white opacity-70">Akurasi Jawaban</p>
        </div>
      </div>

      {/* Logout */}
      <div className="flex flex-col sm:flex-row justify-center md:justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-8 w-full">
        <button
          onClick={onLogout}
          className="bg-[#003566] text-white py-3 px-8 rounded-full font-semibold border-2 border-[#FFC300] shadow-lg hover:bg-[#FFC300] hover:text-[#000814] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 focus:ring-offset-[#001D3D] transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfileContent;
