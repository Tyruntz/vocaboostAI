import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { navigate } from "astro:transitions/client";
import { useLatihanHandler } from "../useLatihanHandler";
import { useChatbot } from "../useChatbotHandler";
import { useAuthSession } from "../useAuthSession";
import { getPercakapanByUserId } from "../getPercakapanByUserId";
import { fetchMessagesBySessionId } from "../fetchMessagesbySessionId";

import ChatbotContent from "./Content/ChatbotContent";
import LearnContent from "./Content/LearnContent";
import HasilLatihanContent from "./Content/HasilLatihanContent";
import UserProfileContent from "./Content/UserProfileContent";
import SoalLatihanContent from "./Content/SoalLatihanContent";
import DetailHasilLatihan from "./Content/DetailHasilLatihan";
import ListPercakapan from "../ListPercakapan";

const HomePage = () => {
   // 🔐 Auth Session
   const {
      userLogin,
      userId,
      loading,
      error,
      setLoading,
      setUserLogin,
      setError,
      setUserId,
   } = useAuthSession();

   // 📜 List Percakapan
   const [listPercakapan, setListPercakapan] = useState([]); // jangan null

   // 📍 Navigasi & UI Responsif
   const [activeTab, setActiveTab] = useState("home");
   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

   const toggleMobileSidebar = () => {
      setIsMobileSidebarOpen((prev) => !prev);
   };

   // 🧠 --- Handler Navigasi Latihan Grammar ---
   const {
      showHasilLatihan,
      showSoalLatihan,
      showDetailLatihan,
      selectedSessionIdForDetail,
      selectedExerciseTopicId,
      handleShowHasilLatihan,
      handleBackToLearn,
      handleViewDetailedResults,
      handleBackToResultsList,
      handleStartExercise,
   } = useLatihanHandler();

   // 🗨️ --- Handler Percakapan Chatbot --

   const {
      activeChatSessionId,
      isNewConversation,
      chatMessages,
      currentMessage,
      isBotTyping,
      isLoading,
      startNewConversation,
      selectConversation,
      handleInputChange,
      handleSendMessage,
      setChatMessages,
      setIsLoading,
      setActiveChatSessionId,
   } = useChatbot({
      userId,
      refreshList: async () => {
         const updated = await getPercakapanByUserId(userId);
         setListPercakapan(updated);
      },
   });

   useEffect(() => {
      // Simulasi loading data riwayat percakapan awal
      setTimeout(() => {
         setChatMessages([
            {
               id: `msg-${Date.now()}`,
               teks_pesan:
                  "Halo! Selamat datang di layanan pelanggan kami. Ada yang bisa saya bantu hari ini?",
               waktu_kirim: new Date().toISOString(),
               tipe_pengirim: "bot",
            },
         ]);
         setIsLoading(false);
      }, 2000); // Simulasi loading 2 detik
   }, []);

   const handleLogout = async () => {
      setUserLogin(null);
      setUserId(null);
      localStorage.clear(); // kalau simpan data

      setLoading(true);
      try {
         const { data: sessionData } = await supabase.auth.getSession();

         if (!sessionData.session) {
            console.warn("Session sudah tidak ada, mungkin sudah logout.");
            alert("Kamu sudah logout.");
            setUserLogin(null);
            navigate("/auth/login", { replace: true });
            return;
         }

         const { error: logoutError } = await supabase.auth.signOut();
         if (logoutError) {
            console.error("Logout failed:", logoutError.message);
            setError("Gagal logout. Silakan coba lagi.");
         } else {
            setUserLogin(null);
            navigate("/auth/login", { replace: true });
         }
      } catch (err) {
         console.error("Terjadi kesalahan saat logout:", err.message);
         setError("Logout gagal.");
      } finally {
         setLoading(false);
      }
   };
   const fetchPercakapan = async () => {
      if (!userId) return;
      const hasil = await getPercakapanByUserId(userId);
      setListPercakapan(hasil);
   };
   useEffect(() => {
      fetchPercakapan();
   }, [userId]);

   const handlePilihPercakapan = async (percakapanId) => {
      setActiveTab("chatbot");
      setActiveChatSessionId(percakapanId);
      selectConversation(percakapanId); // <- update UI
      setIsLoading(true);

      const pesan = await fetchMessagesBySessionId(percakapanId);
      if (pesan) {
         setChatMessages(pesan);
      }
      console.log("Pesan untuk percakapan ID:", percakapanId, pesan);

      setIsLoading(false);
   };

   if (loading) {
      return (
         <div className="animate-pulse space-y-4 bg-[#000814] p-6 rounded-lg shadow-xl h-screen">
            <div className="h-6 bg-[#003566] rounded w-1/3"></div>
            <div className="h-4 bg-[#003566] rounded w-full"></div>
            <div className="h-4 bg-[#003566] rounded w-5/6"></div>
            <div className="h-4 bg-[#003566] rounded w-2/3"></div>
            <div className="h-4 bg-[#003566] rounded w-3/4"></div>
         </div>
      );
      // bisa diganti dengan skeleton screen
   }

   // --- Render Section ---
   return (
      <div className="flex h-screen bg-[#000814] font-sans">
         {/* Mobile Hamburger Button */}
         <button
            onClick={toggleMobileSidebar}
            className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-[#FFC300] text-[#000814] hover:bg-[#FFD60A] focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
         >
            {isMobileSidebarOpen ? (
               <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M6 18L18 6M6 6l12 12"
                  ></path>
               </svg>
            ) : (
               <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M4 6h16M4 12h16M4 18h16"
                  ></path>
               </svg>
            )}
         </button>

         {/* Sidebar - Left Section */}
         <div
            className={`
    fixed h-screen bg-[#001D3D] text-white py-4 shadow-lg z-20
    transition-all duration-300 ease-in-out px-4
    ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64
    md:w-64 md:translate-x-0 md:relative md:flex-shrink-0 flex flex-col
  `}
         >
            {/* Logo/Nama */}
            <div className="flex items-center space-x-2 px-2 py-4 mb-4">
               <div className="w-10 h-10 bg-[#FFC300] rounded-full flex items-center justify-center text-[#001D3D] font-bold text-lg">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     className="h-6 w-6"
                     viewBox="0 0 20 20"
                     fill="currentColor"
                  >
                     <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-2a1 1 0 11-2 0 1 1 0 012 0zm-7 4a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                     />
                  </svg>
               </div>
               <span className="text-2xl flex flex-col font-bold whitespace-nowrap">
                  VocaBoost AI
               </span>
            </div>

            {/* Menu Fitur */}
            <div className="flex flex-col border border-[#003566] p-2 gap-2 rounded-lg mb-4 shadow-sm">
               <a
                  onClick={() => setActiveTab("chatbot")}
                  href="#"
                  className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${
                     activeTab === "chatbot"
                        ? "bg-[#003566]"
                        : "hover:bg-[#003566]/50"
                  }`}
               >
                  <svg
                     className="w-6 h-6"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                     />
                  </svg>
                  <span className="ml-4 text-lg">Chatbot</span>
               </a>

               <a
                  onClick={() => setActiveTab("learn")}
                  href="#"
                  className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${
                     activeTab === "learn"
                        ? "bg-[#003566]"
                        : "hover:bg-[#003566]/50"
                  }`}
               >
                  <svg
                     className="w-6 h-6"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                     />
                  </svg>
                  <span className="ml-4 text-lg">Latihan Grammar</span>
               </a>
            </div>

            {/* Riwayat Chat */}
            <div className="flex border border-[#003566] rounded-md flex-col space-y-2 flex-grow relative overflow-y-auto">
               <ListPercakapan
                  dataPercakapan={listPercakapan}
                  onPilihPercakapan={handlePilihPercakapan}
                  activeChatSessionId={activeChatSessionId}
                  onHapusSukses={fetchPercakapan}
               />
            </div>

            {/* Profil dan Logout */}
            <div className="mt-4 border border-[#003566] rounded-md flex flex-col">
               <a
                  onClick={() => setActiveTab("profile")}
                  href="#"
                  className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                     activeTab === "profile"
                        ? "bg-[#003566]"
                        : "hover:bg-[#003566]/50"
                  }`}
               >
                  <div className="w-8 h-8 bg-[#FFD60A] rounded-full flex items-center justify-center text-[#001D3D] font-bold text-sm">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                     >
                        <path
                           fillRule="evenodd"
                           d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </div>
                  <span className="ml-3 text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                     {userLogin?.user_metadata?.username ||
                        userLogin?.email ||
                        "User"}
                  </span>
               </a>

               <button
                  onClick={handleLogout}
                  className="flex items-center w-full py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-red-700 mt-2 text-red-300"
               >
                  <svg
                     className="w-6 h-6"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                     ></path>
                  </svg>
                  <span className="ml-3 text-lg">Logout</span>
               </button>
            </div>
         </div>

         {/* Mobile Sidebar Overlay */}
         {isMobileSidebarOpen && (
            <div
               className="fixed inset-0 bg-[#000814] bg-opacity-40 z-10 md:hidden"
               onClick={toggleMobileSidebar}
            ></div>
         )}

         {/* Main Content Area - Right Section */}
         <div className="flex-grow bg-[#000814] lg:p-5 rounded-lg shadow-xl flex flex-col overflow-hidden text-white">
            {activeTab === "home" && (
               <div className="flex flex-col justify-center items-center h-full text-center animate-fade-in">
                  <h1 className="text-4xl font-bold text-[#FFD60A] mb-4">
                     Selamat Datang di{" "}
                     <span className="text-[#FFC300]">VocaBoost AI</span>! 🎉
                  </h1>
                  <p className="text-lg text-gray-300 max-w-xl">
                     Platform pembelajaran grammar interaktif berbasis chatbot.
                     Pilih fitur Chatbot untuk memulai percakapan atau Latihan
                     Grammar untuk menguji kemampuanmu! 🚀
                  </p>
               </div>
            )}

            {activeTab === "chatbot" && (
               <ChatbotContent
                  loading={isLoading}
                  messages={chatMessages}
                  currentInput={currentMessage}
                  onInputChange={handleInputChange}
                  onSendMessage={handleSendMessage}
                  onNewChat={startNewConversation}
                  isBotTyping={isBotTyping}
               />
            )}

            {activeTab === "learn" && (
               <>
                  {showDetailLatihan ? (
                     <DetailHasilLatihan
                        sessionId={selectedSessionIdForDetail}
                        onBackToList={handleBackToResultsList}
                     />
                  ) : showHasilLatihan ? (
                     <HasilLatihanContent
                        onBackToLearn={handleBackToLearn}
                        userId={userLogin?.id}
                        onViewDetailedResults={handleViewDetailedResults}
                     />
                  ) : showSoalLatihan ? (
                     <SoalLatihanContent
                        topicId={selectedExerciseTopicId}
                        onBackToLearn={handleBackToLearn}
                        userId={userLogin?.id}
                     />
                  ) : (
                     <LearnContent
                        onShowResults={handleShowHasilLatihan}
                        onStartExercise={handleStartExercise}
                     />
                  )}
               </>
            )}

            {activeTab === "profile" && (
               <div className="min-h-screen flex items-center justify-center bg-[#000814]">
               <UserProfileContent user={userLogin} onLogout={handleLogout} />
            </div>
            )}
         </div>
      </div>
   );
};

export default HomePage;
