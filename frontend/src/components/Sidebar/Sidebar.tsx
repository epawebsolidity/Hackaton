"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ModalCreateSubscribe from "../Modal/ModalCreateSubscribe";

// Dynamic import modal client-only
const ModalRegistration = dynamic(() => import("../Modal/ModalRegistration"), {
  ssr: false,
});

export default function SidebarPages({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { isDark } = useLight();
  const { role } = useWallet();
  const { user } = useUsers();
  const [openModal, setOpenModal] = useState(false);
  const [openModalSub, setOpenModalSub] = useState(false);

  const handleCloseModal = () => setOpenModal(false);
  const handleCloseModalSub = () => setOpenModalSub(false);
  // useEffect(() => {
  //   console.log("Sidebar role:", role);
  // }, [role]);

  if (!open) return null;
  const DEFAULT_AVATAR = "/11789135.png";


  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/30"
      onClick={onClose} // klik overlay close
    >
      <div
        className={`w-72 ${isDark ? "bg-black" : "bg-white"} h-full shadow-lg`}
        onClick={(e) => e.stopPropagation()} // klik di sidebar jangan close
      >
        {/* Header */}
        <div
          className={`w-full h-52 ${
            isDark ? "bg-gray-800" : "bg-blue-900"
          } flex`}
        >
          <div className="px-4 py-4 w-full flex flex-col">
            <Image
              src={user?.foto?.trim() || DEFAULT_AVATAR}
              alt="User Avatar"
              width={90}
              height={90}
              unoptimized
              className="rounded-full" // Ensures the image is always circular
              style={{ width: "80px", height: "80px" }} // Make sure both width and height are fixed for circular shape
            />

            <h1 className="font-mono text-lg font-semibold mb-2 mt-4">
              {user?.username}
            </h1>
            <h3 className="font-mono text-4xl md:text-5xl font-bold tracking-tight">
              US$0
            </h3>
          </div>
        </div>

        {/* Menu */}
        <ul className="mt-4 space-y-1">
          {/* USER */}
          {role === "Users" && (
            <>
              <li>
                <button
                  onClick={() => setOpenModal(true)}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full p-2 bg-gray-200 group-hover:bg-gray-300 transition">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Regist Creators</span>
                </button>
              </li>
              <li>
                <Link
                  href="/pages/profile"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">View Profile</span>
                </Link>
              </li>
            </>
          )}

          {/* CREATOR */}
          {role === "Creators" && (
            <>
              <li>
                <button
                  onClick={() => setOpenModalSub(true)}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full p-2 bg-gray-200 group-hover:bg-gray-300 transition">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.0 0 0 1-1.736 1.039l-.821 1.316Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Make Subscribe</span>
                </button>
              </li>
              <li>
                <Link
                  href="/pages/profile"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">View Profile</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {openModal && <ModalRegistration onClose={handleCloseModal} />}

        {openModalSub && (
          <ModalCreateSubscribe onCloseSub={handleCloseModalSub} />
        )}
      </div>
    </div>
  );
}
