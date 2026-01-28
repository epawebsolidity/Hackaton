import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type UUID = string;

// Chat Group object
export interface ChatGroup {
  id_group_chat: UUID;
  id_users: string; // User ID of the creator or other relevant users
  name_group: string;
  foto: string; // Group's photo URL
}

export type CreateMessageChatGroupPayload = {
  id_chat_group: string;
  id_users: string;
  message: string;
};

export type MessageChat = {
  id_message: string;
  id_chat_group: string;
  id_users: string;
  message: string;
  created_at: string;
  updated_at?: string;

  user?: {
    id_users: string;
    first_name: string;
    last_name: string;
    foto?: string | null;
  };
};

// Context type
type ChatGroupContextType = {
  createChatGroup: (payload: FormData) => Promise<ChatGroup | null>; // Fungsi untuk membuat grup baru
  getChatGroup: (id_users: string) => Promise<any[]>; // Fungsi untuk mengambil semua grup berdasarkan user ID
  getChatGroupId: (id_group_chat: string) => Promise<ChatGroup | null>; // Fungsi untuk mendapatkan detail grup berdasarkan group ID
  chatGroups: ChatGroup[]; // Daftar grup chat yang telah diambil
  loading: boolean; // Status loading
  success: boolean; // Status sukses dari operasi terakhir
  createMessageChatGroup: (
    payload: CreateMessageChatGroupPayload,
  ) => Promise<MessageChat | null>;
};

// Context
const ChatGroupContext = createContext<ChatGroupContextType | undefined>(
  undefined,
);

// Provider
export const ChatGroupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken, userId } = useWallet();
  const [chatGroups, setChatGroups] = useState<any[]>([]);
  const [headerchatGroups, setheaderchatGroups] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const chatGroupId = searchParams.get("chatGroupId");
  // Create Chat Group function wrapped in useCallback
  const createChatGroup = useCallback(
    async (formData: FormData): Promise<ChatGroup | null> => {
      if (!accessToken || !sendRefreshToken) return null;
      setLoading(true);
      setSuccess(false);

      try {
        const data = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/group/`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          },
          accessToken,
          sendRefreshToken,
        );

        console.log("Response data:", data); // Check response structure

        if (data) {
          // Destructure data for readability
          const { groupChat, admin, members } = data;

          // Update members array by adding user info if not present
          const updatedMembers = members?.map((member) => ({
            ...member,
            user: member.user || { username: "Unknown Creator" }, // Ensure user data exists
          }));

          // Create the updated group object with all relevant data
          const updatedGroup = {
            ...groupChat,
            admin, // Add the admin data
            members: updatedMembers, // Update the members list with user info
          };

          console.log(updatedGroup);

          // Update the state with the new group chat
          setChatGroups((prev) => {
            const updatedGroups = [updatedGroup, ...prev];
            return updatedGroups; // Add new group at the start of the array
          });

          setSuccess(true);
          return updatedGroup; // Return the newly created group
        }
      } catch (error) {
        console.error("Error creating group chat:", error);
        setSuccess(false);
      } finally {
        setLoading(false);
      }

      return null; // Return null in case of failure
    },
    [accessToken, sendRefreshToken],
  );

  const getChatGroup = useCallback(
    async (id_users: string) => {
      try {
        const groups = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/group/getHeaderGroup`,
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

        setChatGroups((prev) => {
          const map = new Map(prev.map((g) => [g.id_group_chat, g]));
          groups.forEach((g) => map.set(g.id_group_chat, g));
          return Array.from(map.values());
        });

        setChatGroups(groups); // 🔥 TARO DI SINI
        return groups;
      } catch (err) {
        console.error("Error fetching chat group:", err);
        setChatGroups([]);
        return [];
      }
    },
    [accessToken, sendRefreshToken],
  );

  const getChatGroupId = useCallback(
    async (id_group_chat: string) => {
      try {
        // Pastikan URL dibangun dengan benar
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/group/${id_group_chat}`,
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
        //const data = await response.json(); // Parse the response
        console.log(response, "Group data fetched successfully");

        return response; // Return the fetched data
      } catch (e) {
        console.error("Error fetching group: ", e);
      }
    },
    [accessToken, sendRefreshToken], // Menambahkan dependency untuk callback
  );

  const createMessageChatGroup = useCallback(
    async (
      payload: CreateMessageChatGroupPayload,
    ): Promise<MessageChat | null> => {
      if (!accessToken || !sendRefreshToken) return null;

      setLoading(true);
      setSuccess(false);

      console.log(payload);

      try {
        const data: MessageChat = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/messageGroup/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include",
          },
          accessToken,
          sendRefreshToken,
        );

        console.log("Response data:", data);

        setSuccess(true);
        return data;
      } catch (error) {
        console.error("createMessageChatGroup error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [accessToken, sendRefreshToken],
  );

  const getChatGroupUsersId = useCallback(
    async (id_group_chat: string) => {
      if (!accessToken || !sendRefreshToken) return null;

      try {
        const data = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_LINK}/api/messageGroup/getChatGroup/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_group_chat, // ✅ HARUS SAMA
            }),
            credentials: "include",
          },
          accessToken,
          sendRefreshToken,
        );

        return data.messages;
      } catch (error) {
        console.error("getChatGroupUsersId error:", error);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  useEffect(() => {
    if (userId && chatGroupId) {
      const fetchGroupData = async () => {
        try {
          const headerGroup = await getChatGroupId(chatGroupId);
          setheaderchatGroups(headerGroup);
        } catch (error) {
          console.error("Error fetching group data:", error);
        }
      };
      fetchGroupData();
    }
  }, [userId, chatGroupId, getChatGroupId]);

  useEffect(() => {
    if (userId && chatGroups.length === 0) {
      const fetchGroups = async () => {
        await getChatGroup(userId);
      };

      fetchGroups();
    }
  }, [userId, chatGroups.length, getChatGroup]);

  const value = useMemo(
    () => ({
      getChatGroupUsersId,
      createMessageChatGroup,
      createChatGroup,
      getChatGroup,
      headerchatGroups,
      chatGroups,
      loading,
      success,
    }),
    [
      getChatGroupUsersId,
      createMessageChatGroup,
      createChatGroup,
      getChatGroup,
      headerchatGroups,
      chatGroups,
      loading,
      success,
    ], // Only memoize value when createChatGroup, loading, or success change
  );

  return (
    <ChatGroupContext.Provider value={value}>
      {children}
    </ChatGroupContext.Provider>
  );
};

// Hook
export const useChatGroup = () => {
  const context = useContext(ChatGroupContext);
  if (!context)
    throw new Error("useChatGroup must be used within ChatGroupProvider");
  return context;
};
