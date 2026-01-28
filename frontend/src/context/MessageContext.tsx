"use client";

import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
} from "react";

type UUID = string;

// Chat object
export interface MessageChat {
  id_message: UUID;
  id_personal_chat: string; // harus sesuai backend
  id_users: string;
  message: string;
  date: string;
}

// Context type
type MessageChatContextType = {
  loading: boolean;
  success: boolean;
  createMessageChat: (
    payload: Omit<MessageChat, "id_message" | "date">,
  ) => Promise<MessageChat>;
  getMessagesByChatId: (
    id_personal_chat: string,
  ) => Promise<MessageChat[] | null>;
};

// Context
const MessageChatContext = createContext<MessageChatContextType | undefined>(
  undefined,
);

// Provider
export const MessageChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken } = useWallet();

  const createMessageChat = useCallback(
    async (
      payload: Omit<MessageChat, "id_message" | "date">,
    ): Promise<MessageChat> => {
      setLoading(true);
      setSuccess(false);

      try {
        if (!payload.id_personal_chat || !payload.message) {
          throw new Error("id_personal_chat and message are required");
        }

        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/message/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            body: JSON.stringify(payload),
          },
          accessToken,
          sendRefreshToken,
        );

        console.log("Message created:", response);
        setSuccess(true);

        return response as MessageChat;
      } catch (err) {
        console.error("Error creating message:", err);
        setSuccess(false);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accessToken, sendRefreshToken],
  );

  // Get chat + other user info
  const getMessagesByChatId = useCallback(
    async (id_personal_chat: string): Promise<MessageChat[] | null> => {
      console.log("Berhasil");
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/message/get`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            body: JSON.stringify({ id_personal_chat }),
          },
          accessToken,
          sendRefreshToken,
        );
        console.log(id_personal_chat);
        console.log("Fetched messages:", response);
        return response?.messages || null;
      } catch (err) {
        console.error("Error fetching messages:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  const value = useMemo(
    () => ({
      loading,
      success,
      createMessageChat,
      getMessagesByChatId,
    }),
    [loading, success, createMessageChat, getMessagesByChatId],
  );

  return (
    <MessageChatContext.Provider value={value}>
      {children}
    </MessageChatContext.Provider>
  );
};

// Hook
export const useMessageChat = () => {
  const context = useContext(MessageChatContext);
  if (!context)
    throw new Error("useMessageChat must be used within MessageChatProvider");
  return context;
};
