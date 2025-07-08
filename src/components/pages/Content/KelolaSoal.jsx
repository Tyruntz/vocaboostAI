import React, { useState, useEffect } from "react";
// import { supabase } from "../../../lib/supabaseClient"; // Dihapus/dikomentari agar komponen dapat dijalankan sendiri

const KelolaSoal = () => {
  const [materiList, setMateriList] = useState([]);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [formMode, setFormMode] = useState("list"); // 'list', 'add', 'edit'
  const [currentSoal, setCurrentSoal] = useState({
    topic_id: null,
    text_pertanyaan: '',
    tipe_pertanyaan: 'pilihan_ganda', // Default tipe pertanyaan
    opsi: { a: '', b: '', c: '', d: '' }, // Inisialisasi objek opsi
    jawaban_benar: '',
    penjelasan: '',
    level: 1, // Default level
    is_ai_generated: false, // Default false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Pesan sukses/error operasi

  // New states for delete confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [soalToDeleteId, setSoalToDeleteId] = useState(null);


  // Fungsi untuk mengambil daftar materi
  useEffect(() => {
    const fetchMateri = async () => {
      setLoading(true);
      setError(null);
      try {
        // Panggil API Astro untuk mengambil daftar materi
        console.log("Fetching materi list from /api/grammar/materi/get-all.json");
        const response = await fetch("/api/grammar/materi/get-all.json"); // Asumsi API ini ada
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received materi data:", data); // Log data materi yang diterima

        // Perbaikan: Asumsi API mengembalikan objek dengan properti 'materi' yang berisi array
        setMateriList(data.materi || []);
      } catch (err) {
        console.error("Error fetching materi:", err);
        setError("Gagal memuat daftar materi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMateri();
  }, []);

  // Fungsi untuk mengambil soal berdasarkan materi yang dipilih
  useEffect(() => {
    const fetchSoalByMateri = async () => {
      if (!selectedMateri) {
        setSoalList([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching soal for materi ID: ${selectedMateri.id} from /api/grammar/soal/get-by-materi/${selectedMateri.id}.json`);
        const response = await fetch(
          `/api/grammar/soal/get-by-materi/${selectedMateri.id}.json`
        ); // Asumsi API ini ada
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received soal data:", data); // Log data soal yang diterima

        // --- PERBAIKAN KRITIS DI SINI ---
        // API Anda mengembalikan data soal di properti 'soal', bukan 'teks_pertanyaan'
        if (data && Array.isArray(data.soal)) {
          setSoalList(data.soal);
        } else {
          console.warn("API for soal returned unexpected format or empty array:", data);
          setSoalList([]); // Set ke array kosong jika format tidak sesuai
        }
      } catch (err) {
        console.error("Error fetching soal:", err);
        setError(
          `Gagal memuat soal untuk materi ${selectedMateri.nama_topik || selectedMateri.nama}.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSoalByMateri();
  }, [selectedMateri]); // Bergantung pada selectedMateri

  // Function to handle the actual delete operation after confirmation
  const confirmDelete = async () => {
    setShowConfirmModal(false); // Close the modal
    if (!soalToDeleteId) return; // Should not happen if modal is properly triggered

    setLoading(true);
    try {
      const response = await fetch('/api/grammar/soal/delete.json', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: soalToDeleteId })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      setMessage("Soal berhasil dihapus.");
      setSoalList(soalList.filter(soal => soal.id !== soalToDeleteId));
      setSoalToDeleteId(null); // Clear the ID after successful deletion
    } catch (err) {
      console.error("Error deleting soal:", err);
      setError("Gagal menghapus soal.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menangani aksi (Tambah, Edit, Hapus)
  const handleAction = async (action, soalId = null) => {
    setMessage(null);
    setError(null); // Clear error on new action
    switch (action) {
      case 'add':
        setCurrentSoal({
          topic_id: selectedMateri ? selectedMateri.id : null,
          text_pertanyaan: '',
          tipe_pertanyaan: 'pilihan_ganda', // Pastikan defaultnya
          // Inisialisasi 'opsi' secara eksplisit dengan struktur lengkap
          opsi: { a: '', b: '', c: '', d: '' },
          jawaban_benar: '',
          penjelasan: '',
          level: 1,
          is_ai_generated: false,
        });
        setFormMode('add');
        break;
      case 'edit':
        const soalToEdit = soalList.find(soal => soal.id === soalId);
        if (soalToEdit) {
          // Pastikan opsi di-parse jika dari DB masih string JSON (jsonb)
          // Dan pastikan semua kunci opsi (a, b, c, d) ada, default ke string kosong jika tidak
          const parsedOpsi = typeof soalToEdit.opsi === 'string' ? JSON.parse(soalToEdit.opsi) : soalToEdit.opsi;
          setCurrentSoal({
            ...soalToEdit,
            opsi: { a: '', b: '', c: '', d: '', ...parsedOpsi }, // Pastikan semua kunci opsi ada
          });
          setFormMode('edit');
        } else {
          setError("Soal tidak ditemukan untuk diedit.");
        }
        break;
      case 'delete':
        // Show confirmation modal instead of direct delete
        setSoalToDeleteId(soalId);
        setShowConfirmModal(true);
        break;
      case 'cancel':
        setFormMode('list');
        setCurrentSoal({
          topic_id: null, text_pertanyaan: '', tipe_pertanyaan: 'pilihan_ganda', // Reset ke default
          opsi: { a: '', b: '', c: '', d: '' }, jawaban_benar: '',
          penjelasan: '', level: 1, is_ai_generated: false
        });
        break;
      default:
        setFormMode('list');
        setCurrentSoal(null); // atau inisialisasi default
    }
  };

  // Fungsi untuk menangani submit form (Tambah/Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validasi input (minimal)
    // Gunakan nama kolom sesuai tabel: text_pertanyaan, jawaban_benar, topic_id
    if (!currentSoal.text_pertanyaan || !currentSoal.jawaban_benar || !currentSoal.topic_id) {
      setError("Materi, pertanyaan, dan jawaban benar harus diisi.");
      setLoading(false);
      return;
    }

    try {
      let response;
      const payload = {
        ...currentSoal,
        // Pastikan opsi dikirim sebagai objek, API akan stringify ke JSONB
        opsi: currentSoal.opsi // harusnya sudah objek
      };

      console.log(`Submitting ${formMode} soal with payload:`, payload);

      if (formMode === 'add') {
        response = await fetch('/api/grammar/soal/add.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else if (formMode === 'edit') {
        response = await fetch('/api/grammar/soal/edit.json', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setMessage(`Soal berhasil ${formMode === 'add' ? 'ditambahkan' : 'diperbarui'}.`);

      // Perbarui daftar soal setelah operasi
      // Panggil ulang fetchSoalByMateri untuk memastikan daftar terbaru
      // Alternatif: langsung tambahkan/perbarui dari responseData jika API mengembalikan objek soal lengkap
      const responseData = await response.json(); // Ambil respons dari API setelah operasi sukses
      if (formMode === 'add' && responseData.soal) { // Asumsi API add mengembalikan objek soal baru di `soal`
        setSoalList(prevList => [...prevList, responseData.soal]);
      } else if (formMode === 'edit' && responseData.soal) { // Asumsi API edit mengembalikan objek soal yang diperbarui di `soal`
        setSoalList(prevList => prevList.map(soal => soal.id === responseData.soal.id ? responseData.soal : soal));
      } else {
        // Jika API tidak mengembalikan objek soal yang diperbarui/ditambahkan,
        // panggil ulang fetchSoalByMateri untuk menyinkronkan data
        if (selectedMateri) { // Pastikan materi masih terpilih
          fetchSoalByMateri(); // Panggil ulang untuk mendapatkan data terbaru
        }
      }


      setFormMode('list'); // Kembali ke tampilan daftar
      setCurrentSoal({
        topic_id: null, text_pertanyaan: '', tipe_pertanyaan: 'pilihan_ganda', // Reset ke default
        opsi: { a: '', b: '', c: '', d: '' }, jawaban_benar: '',
        penjelasan: '', level: 1, is_ai_generated: false
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(`Gagal ${formMode === 'add' ? 'menambah' : 'memperbarui'} soal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // UI Rendering
  return (
    <div className="p-6 bg-white bg-opacity-30 backdrop-blur-md rounded-3xl shadow-xl w-full max-w-6xl mx-auto text-[#1E0342] min-h-[calc(100vh-100px)]">
      <h2 className="text-3xl font-bold mb-6 text-center">Kelola Soal Latihan</h2>

      {loading && (
        <p className="text-center text-lg text-[#0E46A3] mb-4">Memuat data...</p>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-[#9AC8CD] text-[#1E0342] p-3 rounded-md mb-4">
          <p>{message}</p>
        </div>
      )}

      {formMode === 'list' && (
        <>
          {/* Pilih Materi */}
          <div className="mb-6">
            <label htmlFor="materi-select" className="block text-lg font-medium mb-2">Pilih Materi:</label>
            <select
              id="materi-select"
              className="w-full p-3 border border-[#9AC8CD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E46A3]"
              value={selectedMateri ? selectedMateri.id : ''}
              onChange={(e) => {
                const materiId = e.target.value;
                // Pastikan perbandingan ID materi benar (string vs number)
                const newSelectedMateri = materiList.find(m => String(m.id) === String(materiId));
                console.log("Materi dipilih di onChange:", newSelectedMateri); // Debugging
                setSelectedMateri(newSelectedMateri);
              }}
              disabled={loading}
            >
              <option value="">-- Pilih Materi --</option>
              {materiList.map(materi => (
                <option key={materi.id} value={materi.id}>
                  {materi.nama_topik || materi.nama} {/* Sesuaikan dengan kolom materi Anda */}
                </option>
              ))}
            </select>
          </div>

          {selectedMateri && (
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-4">Daftar Soal untuk "{selectedMateri.nama_topik || selectedMateri.nama}"</h3>
              <button
                onClick={() => handleAction('add')}
                className="bg-[#0E46A3] text-[#E1F7F5] py-2 px-4 rounded-md hover:bg-[#1E0342] transition duration-200 mb-4"
              >
                + Tambah Soal Baru
              </button>

              {soalList.length === 0 && !loading && (
                <p className="text-gray-600">Belum ada soal untuk materi ini.</p>
              )}

              {soalList.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                      <tr className="bg-[#9AC8CD] text-[#1E0342]">
                        <th className="py-2 px-4 text-left">No.</th>
                        <th className="py-2 px-4 text-left">Pertanyaan</th>
                        <th className="py-2 px-4 text-left">Tipe</th>
                        <th className="py-2 px-4 text-left">Jawaban Benar</th>
                        <th className="py-2 px-4 text-left">Level</th>
                        <th className="py-2 px-4 text-left">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {soalList.map((soal, index) => (
                        <tr key={soal.id} className="border-b border-[#E1F7F5] last:border-b-0">
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">{soal.text_pertanyaan.substring(0, 50)}...</td>
                          <td className="py-2 px-4">{soal.tipe_pertanyaan}</td>
                          <td className="py-2 px-4">{soal.jawaban_benar}</td>
                          <td className="py-2 px-4">{soal.level}</td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleAction('edit', soal.id)}
                              className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 mr-2 transition duration-200 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleAction('delete', soal.id)}
                              className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-200 text-sm"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {(formMode === 'add' || formMode === 'edit') && (
        <div className="p-6 bg-white rounded-lg shadow-md border border-[#9AC8CD]">
          <h3 className="text-2xl font-semibold mb-4">{formMode === 'add' ? 'Tambah Soal Baru' : `Edit Soal (ID: ${currentSoal.id})`}</h3>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label htmlFor="materi-display" className="block text-sm font-medium mb-1">Materi:</label>
              <input
                type="text"
                id="materi-display"
                value={selectedMateri?.nama_topik || selectedMateri?.nama || ''} // Sesuaikan dengan kolom materi Anda
                className="w-full px-3 py-2 border border-[#9AC8CD] rounded-md bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label htmlFor="text_pertanyaan" className="block text-sm font-medium mb-1">Pertanyaan:</label>
              <textarea
                id="text_pertanyaan"
                rows="3"
                className="w-full px-3 py-2 border border-[#9AC8CD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E46A3]"
                value={currentSoal.text_pertanyaan}
                onChange={(e) => setCurrentSoal({ ...currentSoal, text_pertanyaan: e.target.value })}
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="tipe_pertanyaan" className="block text-sm font-medium mb-1">Tipe Pertanyaan:</label>
              <select
                id="tipe_pertanyaan"
                className="w-full px-3 py-2 border border-[#9AC8CD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E46A3]"
                value={currentSoal.tipe_pertanyaan}
                onChange={(e) => setCurrentSoal({
                  ...currentSoal,
                  tipe_pertanyaan: e.target.value,
                  // Reset opsi jika tipe pertanyaan bukan pilihan_ganda
                  opsi: e.target.value === 'pilihan_ganda' ? currentSoal.opsi : { a: '', b: '', c: '', d: '' }
                })}
              >
                <option value="pilihan_ganda">Pilihan Ganda</option>
                <option value="isian">Isian Singkat</option>
                <option value="benar_salah">Benar/Salah</option>
                {/* Tambahkan tipe lain jika ada */}
              </select>
            </div>

            {/* --- MODIFIKASI: Kondisional Render Opsi --- */}
            {currentSoal.tipe_pertanyaan === 'pilihan_ganda' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map(optionKey => (
                  <div key={optionKey}>
                    <label htmlFor={`opsi_${optionKey}`} className="block text-sm font-medium mb-1">Opsi {optionKey.toUpperCase()}:</label>
                    <input
                      type="text"
                      id={`opsi_${optionKey}`}
                      className="w-full px-3 py-2 border border-[#9AC8CD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E46A3]"
                      value={currentSoal.opsi[optionKey] || ''}
                      onChange={(e) =>
                        setCurrentSoal({
                          ...currentSoal,
                          opsi: { ...currentSoal.opsi, [optionKey]: e.target.value }
                        })
                      }
                      required={currentSoal.tipe_pertanyaan === 'pilihan_ganda'} // Wajib jika pilihan ganda
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <label htmlFor="jawaban_benar" className="block text-sm font-medium mb-1">Jawaban Benar (e.g., A, B, C, D atau teks isian):</label>
              <input
                type="text"
                id="jawaban_benar"
                className="w-full px-3 py-2 border border-[#9AC8CD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E46A3]"
                value={currentSoal.jawaban_benar}
                onChange={(e) => setCurrentSoal({ ...currentSoal, jawaban_benar: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="penjelasan" className="block text-sm font-medium mb-1">Penjelasan Jawaban (Opsional):</label>
              <textarea
                id="penjelasan"
                rows="2"
                className="w-full px-3 py-2 border border-[#9AC8CD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E46A3]"
                value={currentSoal.penjelasan}
                onChange={(e) => setCurrentSoal({ ...currentSoal, penjelasan: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium mb-1">Level (1-5):</label>
              <input
                type="number"
                id="level"
                className="w-full px-3 py-2 border border-[#9AC8CD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0E46A3]"
                value={currentSoal.level}
                onChange={(e) => setCurrentSoal({ ...currentSoal, level: parseInt(e.target.value, 10) || 1 })} // Pastikan di-parse sebagai number
                min="1"
                max="5"
              />
            </div>
            <div>
              <input
                type="checkbox"
                id="is_ai_generated"
                className="mr-2"
                checked={currentSoal.is_ai_generated}
                onChange={(e) => setCurrentSoal({ ...currentSoal, is_ai_generated: e.target.checked })}
              />
              <label htmlFor="is_ai_generated" className="text-sm font-medium">Dibuat oleh AI?</label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => handleAction('cancel')}
                className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition duration-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0E46A3] text-[#E1F7F5] py-2 px-4 rounded-md hover:bg-[#1E0342] transition duration-200"
              >
                {loading ? 'Memproses...' : (formMode === 'add' ? 'Simpan Soal' : 'Perbarui Soal')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-center text-red-600">Konfirmasi Hapus Soal</h3>
            <p className="text-gray-700 mb-6 text-center">Apakah Anda yakin ingin menghapus soal ini? Aksi ini tidak dapat dibatalkan.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaSoal;
