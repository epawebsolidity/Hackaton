"use client";

import { useChatPersonal } from "@/context/ChatPersonalContext";
import { useChatGroup } from "@/context/GroupChatContext";
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChatingClient() {
  const { isDark } = useLight();
  const { userId } = useWallet();
  const { chatGroups } = useChatGroup();
  const { getAllChatPersonal } = useChatPersonal();
  const [chattAll, setAllPersonal] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"groups" | "messages">("groups");
  const DEFAULT_AVATAR = "/11789135.png";
  console.log(chatGroups, "members");

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const data = await getAllChatPersonal(userId);
        if (data) {
          setAllPersonal(data);
        } else {
          console.warn("No data received from getAllChatPersonal.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="w-screen py-2 h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="px-6 md:px-8">
        <div className="flex space-x-4 mb-4">
          <button
            className={`font-semibold text-base ${
              activeTab === "groups"
              ? "text-black bg-gray-300 px-2 rounded-full border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Group
          </button>
          <button
            className={`font-semibold text-base ${
              activeTab === "messages"
              ? "text-black bg-gray-300 px-2 rounded-full border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            Creator
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto flex-1 md:w-1/2 min-w-0">
        {activeTab === "groups" && (
          <div className="mt-2 h-[300px] md:h-[400px] lg:h-[500px]">
            {chatGroups.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {chatGroups.map((group) => (
                  <Link
                    key={group.id_group_chat}
                    href={`/pages/chating/group?chatGroupId=${group.id_group_chat}`}
                    className="
            flex w-full items-center justify-between md:px-8 px-6 p-2
            hover:bg-gray-100 dark:hover:bg-gray-200
            transition cursor-pointer
          "
                  >
                    {/* Left section: Image + Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <Image
                        src={group.foto_group || DEFAULT_AVATAR}
                        alt={group.name_group}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col px-2 min-w-0">
                        <h3
                          className={`font-semibold text-base truncate ${isDark ? "text-white" : "text-gray-900"
                            }`}
                        >
                          {group.name_group}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 truncate">
                          @{group.members?.[0]?.username || "Unknown Creator"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                  <p className="text-gray-400 text-sm font-bold text-center">
                    No Group found.
                  </p>
                </div>
            )}
          </div>

        )}

        {activeTab === "messages" && (
          <div className="mt-6 h-[300px] md:h-[400px] lg:h-[500px]"> {/* Tentukan tinggi atau gunakan min-h-screen */}
            {chattAll.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {chattAll.map((chat: any) => {
                  const otherUser = chat.otherUser;
                  return (
                    <Link
                      key={chat.id_chat_personal}
                      href={`/pages/chating/creator?chatId=${chat.id_personal_chat}`}
                      className="
            flex w-full items-center justify-between md:px-8 px-6 p-2
            hover:bg-gray-100 dark:hover:bg-gray-200
            transition cursor-pointer
          "
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <Image
                          src={
                            otherUser?.foto ||
                            "https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                          }
                          alt={otherUser?.first_name || "User"}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex flex-col px-2 min-w-0">
                          <h3
                            className={`font-semibold text-base truncate ${isDark ? "text-white" : "text-gray-900"
                              }`}
                          >
                            {otherUser?.first_name || "User"} {otherUser?.last_name || ""}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            @{otherUser?.username}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  <p className="text-gray-400 text-sm font-bold text-center">
                    No messages found.
                  </p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
