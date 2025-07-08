// useChatbot.js
import { useState, useEffect, useCallback } from 'react';

// Assume `supabaseClient` and `generateLlamaTextFunction` are passed or imported
// In your real project:
import { supabase } from '../../lib/supabaseClient';
import { generateLlamaText } from '../../pages/api/chatbot/apiService';

const useChatbot = (currentUser, currentSession) => {
  
  const [chatHistory, setChatHistory] = useState([]);
  const [messagesInCurrentSession, setMessagesInCurrentSession] = useState([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState(null);
  const [isCreatingNewConversation, setIsCreatingNewConversation] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Fetches all conversations for the logged-in user
  const fetchAllConversations = useCallback(async () => {
    if (!currentUser || !currentSession) {
      console.warn("fetchAllConversations: No user or session to fetch conversations.");
      setChatHistory([]);
      return [];
    }

    try {
      setChatLoading(true); // Indicate loading for history
      const token = currentSession.access_token;
      const userId = currentUser.id;

      // Mocking the fetch call for conversations
      // In a real app, this would hit your actual /api/chatbot/percakapan.json endpoint
      // and filter by userId
      const mockConversations = [
        { id: 'conv-1', user_id: 'mock-user-id-123', topik: 'Greeting & Intro', pesan: [{ tipe_pengirim: 'user', teks_pesan: 'Hi!', waktu_kirim: new Date().toISOString() }, { tipe_pengirim: 'chatbot', teks_pesan: 'Hello! How can I help you?', waktu_kirim: new Date().toISOString() }] },
        { id: 'conv-2', user_id: 'mock-user-id-123', topik: 'Grammar Question', pesan: [{ tipe_pengirim: 'user', teks_pesan: 'Tell me about present perfect.', waktu_kirim: new Date().toISOString() }] },
        { id: 'conv-3', user_id: 'mock-user-id-123', topik: 'About Vocabulary', pesan: [{ tipe_pengirim: 'user', teks_pesan: 'Suggest some words.', waktu_kirim: new Date().toISOString() }] },
      ].filter(conv => conv.user_id === userId); // Filter by mock user ID

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      if (Array.isArray(mockConversations)) {
        setChatHistory(mockConversations);
        return mockConversations;
      } else {
        console.warn("fetchAllConversations: Conversation data is not an array:", mockConversations);
        setChatHistory([]);
        return [];
      }
    } catch (err) {
      console.error("fetchAllConversations: Failed to fetch:", err);
      setChatError(err.message);
      setChatHistory([]);
      return [];
    } finally {
        setChatLoading(false);
    }
  }, [currentUser, currentSession]);


  // Handles starting a new conversation from the UI button
  const handleNewConversation = useCallback(() => {
    setIsCreatingNewConversation(true);
    setActiveChatSessionId(null);
    setMessagesInCurrentSession([]);
    setChatError(null);
    // No need to fetchAllConversations here, it will be refreshed after first message
  }, []);

  // Handles clicking on a chat history item in the sidebar
  const handleChatHistoryItemClick = useCallback(async (conversationId) => {
    setIsCreatingNewConversation(false);
    setActiveChatSessionId(conversationId);
    setChatError(null);
    // messagesInCurrentSession will be updated by the dedicated useEffect
  }, []);

  // Main function to send a message (handles first message of new convo & subsequent messages)
  const handleSendMessage = useCallback(async (userMessageText) => {
    if (!userMessageText.trim() || !currentUser || !currentSession) {
      setChatError("User not authenticated or message is empty.");
      return;
    }

    setChatLoading(true);
    setChatError(null);

    try {
      const token = currentSession.access_token;
      const userId = currentUser.id;

      let currentConvId = activeChatSessionId;
      const initialTopic = userMessageText.substring(0, 50) + "...";

      // Step 1: If it's a new conversation, create it in the database
      if (currentConvId === null) {
        // Mocking API call for creating conversation
        // In a real app, you would fetch('/api/chatbot/percakapan/create.json', { method: 'POST', body: JSON.stringify({ topik: initialTopic }) })
        const newConvData = { conversation: { id: `new-conv-${Date.now()}`, topik: initialTopic, user_id: userId, pesan: [] } };
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

        currentConvId = newConvData.conversation.id;
        setActiveChatSessionId(currentConvId);
        setIsCreatingNewConversation(false);
        await fetchAllConversations(); // Refresh sidebar after creating
      }

      // Prepare user message data
      const userMessageForClient = {
        tipe_pengirim: "user",
        teks_pesan: userMessageText,
        waktu_kirim: new Date().toISOString(),
      };
      // Optimistically add user message to current session messages
      setMessagesInCurrentSession((prev) => [...prev, userMessageForClient]);

      // Prepare conversation history for Llama API (optimistically include current user message)
      const historyForLlama = [
        ...messagesInCurrentSession.map((msg) => ({
          sender: msg.tipe_pengirim,
          content: msg.teks_pesan,
        })),
        {
          sender: userMessageForClient.tipe_pengirim,
          content: userMessageForClient.teks_pesan,
        },
      ];

      // Step 2: Add the user's message to the conversation in the database (mocking)
      // In a real app: fetch("api/chatbot/percakapan/add-message.json", { method: "POST", body: JSON.stringify({ conversation_id: currentConvId, ...userMessageForClient }) })
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate DB save

      // Step 3: Call Llama API for bot's response
      const botResponseContent = await generateLlamaTextFunction(
        userMessageText,
        250,
        0.7,
        historyForLlama
      );

      // Prepare bot message data
      const botMessageForClient = {
        tipe_pengirim: "chatbot",
        teks_pesan: botResponseContent,
        waktu_kirim: new Date().toISOString(),
      };

      // Optimistically add bot message to current session messages
      setMessagesInCurrentSession((prev) => [...prev, botMessageForClient]);

      // Step 4: Add the bot's message to the conversation in the database (mocking)
      // In a real app: fetch("api/chatbot/percakapan/add-message.json", { method: "POST", body: JSON.stringify({ conversation_id: currentConvId, ...botMessageForClient }) })
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate DB save

      // Step 5: Update conversation topic if still default/empty and refresh sidebar
      // In a real app, you might get updated conversation data from the add-message API response
      // For this mock, update chatHistory state directly
      setChatHistory(prev => prev.map(conv => {
          if (conv.id === currentConvId) {
              return {
                  ...conv,
                  pesan: [...conv.pesan, userMessageForClient, botMessageForClient],
                  topik: conv.topik === 'Percakapan Baru' || !conv.topik ? initialTopic : conv.topik
              };
          }
          return conv;
      }));


    } catch (err) {
      console.error("An error occurred during message sending:", err);
      setChatError(err.message || "An unknown error occurred.");
      setMessagesInCurrentSession((prev) => [
        ...prev,
        {
          id: Date.now(), // Dummy ID for error message
          tipe_pengirim: "chatbot",
          teks_pesan: `Sorry, something went wrong: ${err.message || "Unknown error"}`,
          waktu_kirim: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [
    activeChatSessionId,
    messagesInCurrentSession, // This dependency is tricky with optimistic updates, consider carefully
    fetchAllConversations,
    currentUser,
    currentSession,
    generateLlamaTextFunction,
  ]);

  // Dedicated useEffect for synchronizing messagesInCurrentSession with activeChatSessionId
  useEffect(() => {
    if (activeChatSessionId && chatHistory.length > 0 && !isCreatingNewConversation) {
      const selectedConv = chatHistory.find((conv) => conv.id === activeChatSessionId);
      if (selectedConv) {
        setMessagesInCurrentSession(selectedConv.pesan || []);
      } else {
        setMessagesInCurrentSession([]);
        console.warn("Selected conversation not found in chatHistory for activeChatSessionId:", activeChatSessionId);
      }
    } else if (activeChatSessionId === null && isCreatingNewConversation) {
      setMessagesInCurrentSession([]);
    } else if (activeChatSessionId === null && !isCreatingNewConversation && chatHistory.length === 0 && !chatLoading) {
      setMessagesInCurrentSession([]);
    }
  }, [activeChatSessionId, chatHistory, isCreatingNewConversation, chatLoading]);

  // Initial fetch of conversations when user/session becomes available
  useEffect(() => {
    if (currentUser && currentSession) {
      fetchAllConversations();
    }
  }, [currentUser, currentSession, fetchAllConversations]);

  return {
    chatHistory,
    messagesInCurrentSession,
    activeChatSessionId,
    isCreatingNewConversation,
    chatLoading,
    chatError,
    handleNewConversation,
    handleChatHistoryItemClick,
    handleSendMessage,
    fetchAllConversations // Export this if you need to manually refresh history from HomePage
  };
};

export default useChatbot;
