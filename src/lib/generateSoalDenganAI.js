import { v4 as uuidv4 } from "uuid";
import { fetchSoal } from "./fetchSoal";

export async function generateSoalDenganAI(topicId, namaTopik) {
   // Bangun prompt untuk AI
   const randomizer = Math.floor(Math.random() * 100000);

   const prompt = `
Buat 1 soal grammar bahasa Inggris dengan topik: "${namaTopik}".
Pilih secara acak salah satu dari tiga tipe: pilihan ganda, benar salah, atau isian kosong.
Pastikan soal ini unik dan tidak sama dengan soal sebelumnya. Gunakan variasi struktur kalimat dan contoh kalimat yang berbeda.
Gunakan seed acak: ${randomizer}

Format JSON yang dihasilkan harus seperti ini:
{
  "text_pertanyaan": "...",
  "tipe_pertanyaan": "pilihan_ganda|benar_salah|isian_kosong",
  "opsi": {
    "a": "...",
    "b": "...",
    "c": "...",
    "d": "..."
  },
  "jawaban_benar": "b",
  "penjelasan": "...",
  "level": 1
}
Catatan:
- Jika tipe soal adalah 'isian_kosong', maka field 'opsi' bisa null.
- Jangan gunakan penomoran soal.
- Formatkan dalam 1 objek JSON saja.
`;

   try {
      const aiResponse = await fetchSoal(prompt);
      const cleaned = aiResponse
         .replace(/```json|```/g, "") // buang pembuka/penutup blok
         .trim(); // hapus spasi tak berguna

      const parsed = JSON.parse(cleaned);

      return {
         id: uuidv4(),
         topic_id: topicId,
         text_pertanyaan: parsed.text_pertanyaan,
         tipe_pertanyaan: parsed.tipe_pertanyaan,
         opsi: parsed.opsi || null,
         jawaban_benar: parsed.jawaban_benar,
         penjelasan: parsed.penjelasan,
         level: parsed.level || 1,
         is_ai_generated: true,
         created_at: new Date().toISOString(),
      };
   } catch (err) {
      console.error("Gagal parsing AI response:", err);
      throw new Error("Soal dari AI tidak valid JSON atau struktur salah");
   }
}
