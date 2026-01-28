"use client";
import { useChatPersonal } from "@/context/ChatPersonalContext";
import { useChatGroup } from "@/context/GroupChatContext";
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ModalMakeGroup from "../Modal/ModalCreateGroup";
export default function NavbarChating() {
  const searchParams = useSearchParams(); // <-- hook client
  const chatId = searchParams.get("chatId"); // <-- dapat query param
  const { isDark, toggle } = useLight();
  const { userId } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const isCreatorChat = pathname === "/pages/chating/creator";
  const isCreatorGroup = pathname === "/pages/chating/group";
  const [otherUser, setOtherUser] = useState<any>(null);
  const { getHeaderPersonalChat } = useChatPersonal();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false); // Menyimpan status menu (terbuka/tutup)
  const [openModalMakeGroup, setOpenModalMakeGroup] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen); // Toggle status menu
  };
  const { headerchatGroups } = useChatGroup();

  console.log(headerchatGroups);

  const handleModalGroup = () => setOpenModalMakeGroup(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!chatId) return;

    (async () => {
      const data = await getHeaderPersonalChat(chatId);
      setOtherUser(data);
    })();
  }, [chatId]);
  return (
    <nav
      className={`w-full h-16 transition-colors duration-300
      ${isDark ? "bg-black text-white" : "bg-transparent text-black"}
      md:bg-transparent`}
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <ul className="flex gap-4 text-sm font-medium">
            {isCreatorChat ? (
              <div className="flex items-center gap-3">
                <Image
                  src={
                    (userId === otherUser?.chatRoom.id_users1
                      ? otherUser?.chatRoom.user2?.foto
                      : otherUser?.chatRoom.user1?.foto) ||
                    "https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                  }
                  alt="Creator Avatar"
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <h1
                    className={`font-semibold text-sm md:text-base ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {userId === otherUser?.chatRoom.id_users1
                      ? otherUser?.chatRoom.user2?.username
                      : otherUser?.chatRoom.user1?.username}
                  </h1>
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
            ) : isCreatorGroup ? (
              <div className="flex items-center gap-3">
                {/* Display group image */}
                <Image
                  src={
                    headerchatGroups?.group?.foto_group ||
                    "/images/default-group.png"
                  } // Fallback to a default image if `foto_group` is not provided
                  alt={headerchatGroups?.group?.name_group || "Untitled Group"}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex flex-col">
                  {/* Display group name */}
                  <h1
                    className={`font-semibold text-sm md:text-base ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {headerchatGroups?.group?.name_group || "Untitled Group"}
                  </h1>

                  {/* Display member count and status */}
                  <span className="text-xs text-blue-500">
                      {headerchatGroups?.members?.length ?? 0} member
                      {headerchatGroups?.members?.length !== 1 ? "s" : ""}

                  </span>
                </div>
              </div>
            ) : (
              <button
                className="
      font-mono
      font-bold
      text-lg
      hover:text-blue-500
      transition
      focus:outline-none
    "
              >
                Chat
              </button>
            )}
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={toggleMenu} className="rounded-lg p-2 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
              />
            </svg>
          </button>
        </div>
        {/* Menu Dropdown */}
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 sm:w-56 lg:w-64 bg-white shadow-lg border-gray-200 border-2 rounded-lg"
          >
            <ul>
              <button
                onClick={handleModalGroup}
                className="py-2 px-4 text-sm sm:text-base font-bold hover:bg-gray-200 cursor-pointer"
              >
                Make Group
              </button>
            </ul>
          </div>
        )}

        {openModalMakeGroup && (
          <ModalMakeGroup
            onCloseMakeGroup={() => setOpenModalMakeGroup(false)}
          />
        )}
      </div>
    </nav>
  );
}
