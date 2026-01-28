"use client";

import ChatInputGroup from "@/app/pages/chating/group/GroupInput";
import { useChatGroup } from "@/context/GroupChatContext";
import { useLight } from "@/context/LightContext";
import { MessageChat } from "@/context/MessageContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function GroupChating() {
  const searchParams = useSearchParams();
  const chatGroupId = searchParams.get("chatGroupId");
  const { isDark } = useLight();
  const { getChatGroupUsersId, createMessageChatGroup } = useChatGroup();
  const { userId, currentUser: currentUserFromWallet } = useWallet(); // ambil user asli
  const [messagesGroup, setMessagesGroup] = useState<MessageChat[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const DEFAULT_AVATAR = "/11789135.png";

  // Scroll ke bawah setiap messages berubah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messagesGroup]);

  // Ambil messages saat page load atau chatGroupId berubah
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatGroupId) return;
      setLoading(true);
      try {
        const data = await getChatGroupUsersId(chatGroupId);
        if (data) setMessagesGroup(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [chatGroupId, getChatGroupUsersId]);

  // Handle send message
  const handleSend = async (newMessage: MessageChat) => {
    // Optimistik update UI
    setMessagesGroup((prev) => [...prev, newMessage]);

    // Kirim ke backend
    try {
      if (!chatGroupId) return;
      await createMessageChatGroup({
        id_chat_group: chatGroupId,
        id_users: newMessage.id_users,
        message: newMessage.message,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Gunakan data user dari wallet/context
  const currentUser = {
    id_users: userId,
    first_name: currentUserFromWallet?.first_name || "You",
    last_name: currentUserFromWallet?.last_name || "",
    foto: currentUserFromWallet?.foto || null,
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-20 flex flex-col gap-3">
        {messagesGroup.map((msg) => {
          const isCurrentUser = msg.id_users === currentUser.id_users;
          return (
            <div
              key={msg.id_message_group}
              className={`flex items-start gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              {/* Foto user lain di kiri */}
              {!isCurrentUser && (
                <Image
                  src={msg.user?.foto || DEFAULT_AVATAR}
                  alt={msg.user?.username || "Avatar"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  unoptimized
                />
              )}

              {/* Bubble pesan */}
              <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                <span className="text-sm font-bold text-blue-900">
                  {msg.user?.first_name || msg.user?.username} {msg.user?.last_name}
                </span>
                <div
                  className={`p-2 rounded-lg shadow-md mt-1 ${isCurrentUser
                    ? "bg-gray-100 text-gray-800 rounded-bl-none"
                    : "bg-blue-600 text-white rounded-br-none"
                    }`}
                  style={{ wordWrap: "break-word", wordBreak: "break-word" }}
                >
                  {msg.message}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Foto current user di kanan */}
              {isCurrentUser && (
                <Image
                  src={currentUser.foto || DEFAULT_AVATAR}
                  alt="You"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  unoptimized
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input chat */}
      <ChatInputGroup
        currentUser={currentUser}
        onSend={handleSend}
        onCloseContentExlusive={() => { }}
      />
    </div>
  );
}
