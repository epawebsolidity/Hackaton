"use client";

import { MessageChat, useMessageChat } from "@/context/MessageContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";

export default function CreatorChating() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { getMessagesByChatId } = useMessageChat();
  const { userId } = useWallet();

  const [messages, setMessages] = useState<MessageChat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!chatId) return;

    (async () => {
      const data = await getMessagesByChatId(chatId);
      if (data) setMessages(data);
    })();
  }, [chatId, getMessagesByChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 ambil data user dari message yang sudah ada
  const currentUserFromMessages = messages.find(
    (m) => m.id_users === userId,
  )?.user;

  const DEFAULT_AVATAR = "/11789135.png";

  return (
    <div className="flex flex-col h-screen bg-gray-white">
      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-20 flex flex-col gap-3">
        {messages.length ? (
          messages.map((msg) => {
            const isCurrentUser = msg.id_users === userId;

            return (
              <div
                key={msg.id_message}
                className={`flex items-start gap-2 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isCurrentUser && (
                  <Image
                    src={
                      msg.user?.foto ||
                      DEFAULT_AVATAR
                    }
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    unoptimized
                  />
                )}

                <div className={`flex flex-col items-start max-w-[70%]`}>
                  <div
                    className={`p-2 rounded-lg shadow-md ${isCurrentUser
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                    style={{
                      wordWrap: "break-word",
                      wordBreak: "break-word",
                    }}
                  >
                    <p className="text-base px-2">{msg.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {isCurrentUser && (
                  <Image
                    src={
                      msg.user?.foto ||
                      "https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                    }
                    alt="You"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    unoptimized
                  />
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-400 mt-4">Loading messages...</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT */}
      <div className="sticky bottom-0 w-full bg-white px-4 py-3 shadow">
        <ChatInput
          currentUser={{
            id_users: userId,
            first_name: currentUserFromMessages?.first_name || "You",
            last_name: currentUserFromMessages?.last_name || "",
            foto: currentUserFromMessages?.foto || null,
          }}
          onSend={(newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
          }}
        />
      </div>
    </div>
  );
}
