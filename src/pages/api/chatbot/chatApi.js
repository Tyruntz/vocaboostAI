// Ganti dengan URL Space kamu
const API_URL = "https://ogaa12-api-inference-endpoint.hf.space/generate";

/**
 * Kirim prompt ke endpoint model (FastAPI) di Hugging Face Space
 * @param {string} prompt - Pertanyaan dari user
 * @param {string[]} history - Riwayat percakapan (optional)
 * @param {number} maxTokens - Jumlah token maksimal
 * @param {number} temperature - Kreativitas model (0.0–1.0)
 * @returns {Promise<string>} - Respons dari model
 */


export async function generateFromModel(
  prompt,
  history = [],
  maxTokens = 300,
  temperature = 0.7
) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        history, // 🧠 Sertakan history di sini
        max_new_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Gagal mendapatkan respons");
    }

    const data = await res.json();
    return data.generated_text || "🤖 Tidak ada respons dari model.";
  } catch (error) {
    console.error("❌ Error fetch model:", error);
    return "❌ Error: gagal menghubungi model. Coba lagi nanti.";
  }
}
