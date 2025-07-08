import { supabase } from "../lib/supabaseClient"; // pastikan path ini sesuai dengan struktur proyek Anda
import React from "react";
import { FiTrash2 } from "react-icons/fi";

const ListPercakapan = ({
  dataPercakapan = [],
  onPilihPercakapan,
  activeChatSessionId,
  onHapusSukses,
}) => {
  const handleHapus = async (id) => {
    const konfirmasi = window.confirm(
      "Yakin ingin menghapus percakapan ini? Tindakan ini tidak bisa dibatalkan!"
    );
    if (!konfirmasi) return;

    const { error } = await supabase
      .from("percakapan_chatbot")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Gagal menghapus percakapan.");
      console.error(error);
    } else {
      onHapusSukses?.();
      alert("Percakapan berhasil dihapus.");
    }
  };

  return (
    <ul>
      {dataPercakapan.map((item) => (
        <li
          key={item.id}
          className={`flex justify-between items-center p-3 rounded-md cursor-pointer text-white transition ${
            activeChatSessionId === item.id
              ? "bg-[#FFC300] text-[#000814]"
              : "hover:bg-[#003566] text-white"
          }`}
        >
          <span
            className="font-medium truncate flex-grow"
            onClick={() => onPilihPercakapan(item.id)}
          >
            {item.topik || `Percakapan ${item.id}`}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // biar nggak kepilih pas hapus
              handleHapus(item.id);
            }}
            className="ml-2 p-1 hover:text-red-500"
            title="Hapus percakapan"
          >
            <FiTrash2 />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ListPercakapan;
