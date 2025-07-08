export const getPercakapanByUserId = async (userId) => {
   try {
      const res = await fetch(`/api/chatbot/percakapan/get-by-id/${userId}.json`);
      const json = await res.json();

      if (!Array.isArray(json.data)) {
         console.error("Data percakapan bukan array:", json);
         return [];
      }

      const percakapanDenganPesan = json.data.map((p) => ({
         ...p,
         pesan: Array.isArray(p.pesan) ? p.pesan : [], // fallback kalau pesan null
      }));

      return percakapanDenganPesan;
   } catch (err) {
      console.error("Gagal fetch percakapan:", err);
      return [];
   }
};
