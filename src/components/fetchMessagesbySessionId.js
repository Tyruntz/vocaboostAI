// lib/supabaseService.js
import { supabase } from "../lib/supabaseClient"; // sesuaikan path client kamu

export const fetchMessagesBySessionId = async (sessionId) => {
  const { data, error } = await supabase
    .from("percakapan_chatbot")
    .select("pesan")
    .eq("id", sessionId)
    .single(); // karena id unik (primary key), langsung ambil satu baris

  if (error) {
    console.error("Gagal ambil pesan:", error.message);
    return null;
  }

  // data.pesan seharusnya berupa array JSON
  return Array.isArray(data.pesan) ? data.pesan : [];
};

