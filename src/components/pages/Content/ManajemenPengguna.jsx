import React, { useState, useEffect } from "react";

// Komponen Modal Statistik Pengguna
const UserStatisticsModal = ({ user, onClose }) => {
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const res = await fetch(`/api/user/statistik/${user.id}`);
            if (!res.ok) throw new Error("Gagal mengambil statistik.");
            const data = await res.json();
            setStats(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      if (user?.id) fetchStats();
   }, [user]);

   if (!user) return null;

   return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 font-sans">
         <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 w-full max-w-2xl transform transition-all scale-100 opacity-100 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">
                  Statistik Pengguna: {user.username || user.email}
               </h2>
               <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-semibold leading-none focus:outline-none"
                  aria-label="Tutup"
               >
                  &times;
               </button>
            </div>

            {loading ? (
               <p className="text-center">Memuat statistik...</p>
            ) : error ? (
               <p className="text-center text-red-500">{error}</p>
            ) : stats ? (
               <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-lg shadow-md">
                     <h3 className="text-xl font-bold mb-2">
                        Penyelesaian Soal Latihan
                     </h3>
                     <p className="text-3xl font-extrabold mb-1">
                        {stats.penyelesaian}%
                     </p>
                     <p className="text-sm opacity-90">
                        {stats.total_dijawab} dari {stats.total_soal} soal
                        diselesaikan
                     </p>
                     <div className="w-full bg-blue-400 rounded-full h-2 mt-3">
                        <div
                           className="bg-white rounded-full h-2"
                           style={{ width: `${stats.penyelesaian}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-lg shadow-md">
                     <h3 className="text-xl font-bold mb-2">
                        Tingkat Akurasi Jawaban
                     </h3>
                     <p className="text-3xl font-extrabold mb-1">
                        {stats.akurasi}%
                     </p>
                     <p className="text-sm opacity-90">
                        Rata-rata akurasi semua soal latihan
                     </p>
                     <div className="w-full bg-green-400 rounded-full h-2 mt-3">
                        <div
                           className="bg-white rounded-full h-2"
                           style={{ width: `${stats.akurasi}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-lg shadow-md">
                     <h3 className="text-xl font-bold mb-2">
                        Materi Paling Sering Diakses
                     </h3>
                     <ul className="list-disc pl-5 space-y-1 text-sm">
                        {stats.topik_teratas?.map((material, index) => (
                           <li
                              key={index}
                              className="flex justify-between items-center"
                           >
                              <span>{material.nama_topik}</span>
                              <span className="font-semibold text-base">
                                 {material.total_akses} kali
                              </span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            ) : null}
         </div>
      </div>
   );
};

// Main ManajemenPengguna Component
const ManajemenPengguna = () => {
   const [userList, setUserList] = useState([]);
   const [userListLoading, setUserListLoading] = useState(true);
   const [userListError, setUserListError] = useState(null);

   // States for the statistics modal
   const [showStatsModal, setShowStatsModal] = useState(false);
   const [selectedUserForStats, setSelectedUserForStats] = useState(null);

   useEffect(() => {
      const fetchUsers = async () => {
         setUserListLoading(true);
         setUserListError(null);
         try {
            const response = await fetch("api/user/get-user.json");

            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Received raw data from /get-user API:", responseData);

            let usersData = responseData;
            if (
               responseData &&
               typeof responseData === "object" &&
               "materi" in responseData
            ) {
               usersData = responseData.materi;
               console.log("Extracted 'materi' data:", usersData);
            }

            if (Array.isArray(usersData) && usersData.length > 0) {
               setUserList(usersData);
            } else if (Array.isArray(usersData) && usersData.length === 0) {
               console.warn("API '/get-user' returned an empty array.");
               setUserList([]);
            } else {
               console.error(
                  "API '/get-user' returned data in unexpected format:",
                  usersData
               );
               setUserListError(
                  "Data pengguna tidak dalam format yang diharapkan (bukan array atau properti 'materi' bukan array)."
               );
               setUserList([]);
            }
         } catch (err) {
            console.error("Error fetching user list:", err.message);
            setUserListError(
               "Gagal memuat daftar pengguna. Pastikan API '/get-user' berjalan dan dapat diakses."
            );
         } finally {
            setUserListLoading(false);
         }
      };

      fetchUsers();
   }, []); // Empty dependency array means this runs once on component mount

   const handleDelete = async (userId) => {
      const konfirmasi = confirm("Yakin ingin menghapus pengguna ini?");
      if (!konfirmasi) return;

      try {
         const response = await fetch(`/api/user/delete/${userId}`, {
            method: "DELETE",
         });

         const result = await response.json();

         if (response.ok) {
            alert("Pengguna berhasil dihapus.");
            // refresh list user setelah dihapus
            setUserList((prev) => prev.filter((u) => u.id !== userId));
         } else {
            alert("Gagal menghapus pengguna: " + result.error);
         }
      } catch (err) {
         console.error("Error saat hapus user:", err);
         alert("Terjadi kesalahan saat menghapus.");
      }
   };

   // Function to handle clicking on a user row
   const handleUserClick = (userItem) => {
      setSelectedUserForStats(userItem);
      setShowStatsModal(true);
   };

   return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-[#9AC8CD]">
         <h3 className="text-2xl font-bold mb-4">Manajemen Pengguna</h3>
         <p className="text-gray-700 mb-4">
            Tabel di bawah menampilkan daftar semua pengguna terdaftar. Klik
            baris pengguna untuk melihat statistik.
         </p>

         {userListLoading ? (
            <div className="flex items-center justify-center p-4">
               <p className="text-lg text-[#1E0342]">
                  Memuat daftar pengguna...
               </p>
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E46A3] ml-4"></div>
            </div>
         ) : userListError ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
               <p>{userListError}</p>
            </div>
         ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th
                           scope="col"
                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                           ID
                        </th>
                        <th
                           scope="col"
                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                           Username
                        </th>
                        <th
                           scope="col"
                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                           Email
                        </th>
                        <th
                           scope="col"
                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                           Created At
                        </th>
                        <th
                           scope="col"
                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                           Opsi
                        </th>
                        {/* Added Opsi column header */}
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {userList.length > 0 ? (
                        userList.map((userItem) => (
                           <tr
                              key={userItem.id}
                              onClick={() => handleUserClick(userItem)} // Add onClick handler
                              className="hover:bg-gray-100 cursor-pointer transition-colors duration-150" // Add hover style
                           >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                 {userItem.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                 {userItem.username || "N/A"}{" "}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                 {userItem.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                 {userItem.created_at
                                    ? new Date(
                                         userItem.created_at
                                      ).toLocaleDateString("id-ID", {
                                         day: "2-digit",
                                         month: "2-digit",
                                         year: "numeric",
                                      })
                                    : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                 {/* Added Hapus button */}
                                 <button
                                    className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleDelete(userItem.id);
                                    }}
                                 >
                                    Hapus
                                 </button>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td
                              colSpan="5" // Changed colspan to 5 to account for the new column
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                           >
                              Tidak ada data pengguna.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         )}

         {/* Render User Statistics Modal */}
         {showStatsModal && (
            <UserStatisticsModal
               user={selectedUserForStats}
               onClose={() => setShowStatsModal(false)}
            />
         )}
      </div>
   );
};

export default ManajemenPengguna;
