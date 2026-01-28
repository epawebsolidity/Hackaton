"use client";
import Toast from "@/components/Toast/Toast";
import ThemeToggleButton from "@/components/ToggleButton/ThemeToggleButton";
import { useActiveTab } from "@/context/ActiveTabContext";
import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function NavbarClient({
  onOpenSidebar,
  currentPath,
}: {
  onOpenSidebar: () => void;
  currentPath: string;
}) {
  const { role } = useWallet();
  const pathname = usePathname();
  const { isDark } = useLight();
  const { activeTab, setActiveTab } = useActiveTab();
  const path = currentPath;
  const tabs = ["Followed", "Trade", "Talk"];
  const isNotif = path === "/pages/notif";
  const isSearch = pathname === "/pages/search";

  const isSearchId =
    pathname.startsWith("/pages/search/") && pathname !== "/pages/search";

  const isCreator = pathname === "/pages/creator";
  const isRegist = pathname === "/pages/regist";
  const isSubscribe = pathname === "/pages/subscribe";
  const isPaySubscribe = pathname === "/pages/subscribe/[id_address]";
  const isProfile = pathname === "/pages/profile";
  const router = useRouter();
  const { user } = useUsers();
  const [showToast, setShowToast] = useState(false);
  if (!open) return null;

  const handleClick = () => {
    if (!role) {
      setShowToast(true);
      return;
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const avatarClick = () => {
    if (!role) {
      setShowToast(true);
      return;
    }

    onOpenSidebar();
  };
  const DEFAULT_AVATAR = "/11789135.png";
  return (
    <div
      className={`w-full h-16 transition-colors duration-300 
    ${
      isDark ? "bg-black text-white" : "bg-white text-black"
    } md:bg-transparent`}
    >
      <div className="justify-center items-center">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          message="not access"
          type="error"
        />
      </div>
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {isProfile || isSearchId ? (
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
          ) : (
            <button
              onClick={avatarClick}
              className="flex items-center gap-3 py-4"
            >
              <Image
                src={user?.foto?.trim() || DEFAULT_AVATAR}
                alt="User Avatar"
                width={50}
                height={50}
                unoptimized
                className="rounded-full object-cover w-13 h-10 md:w-15 md:h-13" // Ensuring both width and height are equal
              />
            </button>
          )}
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <ul className="flex gap-3 text-sm font-medium">
            {isNotif ? (
              <button className="font-bold text-base hover:text-blue-500 transition focus:outline-none">
                Notification
              </button>
            ) : isSearch ? (
              <button className="font-bold text-base transition focus:outline-none">
                Search
              </button>
            ) : isCreator ? (
              <button className="font-bold text-base hover:text-blue-500 transition focus:outline-none">
                Option Creator
              </button>
            ) : isRegist ? (
              <button className="font-bold text-base hover:text-blue-500 transition focus:outline-none">
                Registrasi Creator
              </button>
            ) : isSubscribe ? (
              <button className="font-bold text-base hover:text-blue-500 transition focus:outline-none">
                Make Subscribe
              </button>
            ) : isProfile ? (
              <button className="font-bold text-base hover:text-blue-500 transition focus:outline-none">
                Profile
              </button>
            ) : isPaySubscribe ? (
              <button className="font-bold text-base hover:text-blue-500 transition focus:outline-none">
                Subscribe
              </button>
            ) : isSearchId ? (
              <button className="font-bold text-base hover:text-blue-500 transition focus:outline-none">
                Profile
              </button>
            ) : (
              <div className="w-full">
                <div className="flex gap-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`relative pb-2 font-bold transition-colors focus:outline-none
    ${activeTab === tab ? "text-black" : "text-gray-500 hover:text-black"}
    after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:bg-black after:rounded-full after:transition-all
    ${activeTab === tab ? "after:w-10 after:-translate-x-1/2" : "after:w-0 after:-translate-x-1/2"}
  `}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/pages/chating" className="rounded-lg p-2 transition">
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
                d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
          </Link>
        </div>

        <ThemeToggleButton />
      </div>
    </div>
  );
}
