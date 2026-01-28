"use client";

import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

type UUID = string;

// Chat object
export interface ChatPersonal {
  id_chat_personal: UUID;
  id_users1: string;
  id_users2: string;
}

// Context type
type ChatPersonalContextType = {
  createChatPersonal: (
    payload: Omit<ChatPersonal, "id_chat_personal">,
  ) => Promise<ChatPersonal>;
  getHeaderPersonalChat: (chatId: string) => Promise<{
    chat: ChatPersonal;
    otherUser: any;
  } | null>;
  getAllChatPersonal: () => Promise<ChatPersonal[] | null>;
  loading: boolean;
  success: boolean;
};

// Context
const ChatPersonalContext = createContext<ChatPersonalContextType | undefined>(
  undefined,
);

// Provider
export const ChatPersonalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken } = useWallet();

  // Create personal chat
  const createChatPersonal = async (
    payload: Omit<ChatPersonal, "id_chat_personal">,
  ): Promise<ChatPersonal> => {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_LINK}/api/chatpersonal/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify(payload),
        },
        accessToken,
        sendRefreshToken,
      );

      setSuccess(true);
      return response.data; // MUST return { id_chat_personal, id_users1, id_users2 }
    } catch (err) {
      console.error("Error creating chat:", err);
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get chat + other user info
  const getHeaderPersonalChat = useCallback(
    async (id_chat_personal: string) => {
      try {
        const chat = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/chatpersonal/${id_chat_personal}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          },
          accessToken,
          sendRefreshToken,
        );

        return chat; // ✅ INI YANG KURANG
      } catch (err) {
        console.error("Error fetching chat header:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  const getAllChatPersonal = useCallback(
    async (id_users: string): Promise<ChatPersonal[] | null> => {
      try {
        const chat = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/chatpersonal/get/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            body: JSON.stringify({ id_users }),
          },
          accessToken,
          sendRefreshToken,
        );

        console.log(chat);

        // Periksa apakah response memiliki properti data
        if (chat) {
          console.log("Chat Rooms:", chat);
          return chat; // Kembalikan data chat jika ada
        } else {
          console.warn("No chat data found");
          return null;
        }
      } catch (err) {
        console.error("Error fetching chat header:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  const value = useMemo(
    () => ({
      createChatPersonal,
      getHeaderPersonalChat,
      getAllChatPersonal,
      loading,
      success,
    }),
    [loading, success, getHeaderPersonalChat, getAllChatPersonal],
  );

  return (
    <ChatPersonalContext.Provider value={value}>
      {children}
    </ChatPersonalContext.Provider>
  );
};

// Hook
export const useChatPersonal = () => {
  const context = useContext(ChatPersonalContext);
  if (!context)
    throw new Error("useChatPersonal must be used within ChatPersonalProvider");
  return context;
};
