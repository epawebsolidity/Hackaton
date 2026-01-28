"use client";

import ModalContentExlusive from "@/components/Modal/ModalContentExlusive";
import { useChatGroup } from "@/context/GroupChatContext";
import { MessageChat } from "@/context/MessageContext";
import { useWallet } from "@/context/WalletContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  onSend: (message: MessageChat) => void;
  currentUser: {
    id_users: string;
    first_name: string;
    last_name: string;
    foto: string | null;
  };
};

type ExtraProps = {
  onCloseContentExlusive: () => void;
};

export default function ChatInputGroup({
  onCloseContentExlusive,
  onSend,
  currentUser,
}: Props & ExtraProps) {
  const [messageGroup, setMessageGroup] = useState("");
  const { createMessageChatGroup, loading } = useChatGroup();
  const searchParams = useSearchParams();
  const chatGroupId = searchParams.get("chatGroupId"); // ID group chat
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openModalContent, setOpenModalContent] = useState(false);
  const { userId } = useWallet();

  // Auto resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [messageGroup]);

  // Function untuk mengirim pesan
  const handleSendMessageGroup = async (messageText = messageGroup) => {
    if (!messageText.trim()) return;

    const newMessage: MessageChat = {
      id_message_group: crypto.randomUUID(), // sementara untuk UI
      id_users: currentUser.id_users,
      message: messageText,
      type_message: "message",
      date: new Date().toISOString(),
      user: currentUser,
    };

    // Optimistik update ke UI
    onSend(newMessage);
    setMessageGroup("");

    // Kirim ke backend
    try {
      if (!chatGroupId) return;
      await createMessageChatGroup({
        id_chat_group: chatGroupId,
        id_users: currentUser.id_users,
        message: messageText,
        type_message: "message",
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      // Opsional: bisa kasih notifikasi error atau hapus pesan dari UI
    }
  };

  const handleModalCloseExlusive = () => setOpenModalContent(false);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow px-4 py-2">
      <div className="w-full md:w-1/2 mx-auto">
        <div className="flex items-center gap-2 bg-gray-200 rounded-xl px-3">
          {/* Tombol modal */}
          <button
            onClick={() => setOpenModalContent(true)}
            type="button"
            className="flex items-center justify-center text-gray-600 hover:text-black transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>

          {/* Input */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={messageGroup}
              onChange={(e) => setMessageGroup(e.target.value)}
              placeholder="Message ..."
              rows={1}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessageGroup();
                }
              }}
              className="
                w-full
                px-4
                py-3
                pr-12
                rounded-xl
                bg-gray-200
                resize-none
                overflow-hidden
                focus:outline-none
              "
            />

            {/* Tombol send */}
            {messageGroup.trim() && (
              <button
                onClick={() => handleSendMessageGroup()}
                disabled={loading}
                className="
                  absolute
                  right-2
                  bottom-2
                  flex
                  items-center
                  justify-center
                  bg-black
                  text-white
                  rounded
                  p-1.5
                  hover:bg-gray-800
                  transition
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12
                       59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Modal */}
          {openModalContent && (
            <ModalContentExlusive onCloseContentExlusive={handleModalCloseExlusive} />
          )}
        </div>
      </div>
    </div>
  );
}
