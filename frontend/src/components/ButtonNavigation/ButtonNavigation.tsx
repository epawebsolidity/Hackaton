import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";
import Toast from "../Toast/Toast";
import { usePathname } from "next/navigation";

export default function ButtonNavigator() {
  const { isDark } = useLight();
  const { role } = useWallet();
  const pathname = usePathname();

  const [showToast, setShowToast] = useState(false);
  const handleClickNotif = () => {
    if (!role) {
      setShowToast(true);
      return;
    }

    onOpenSidebar();
  };
  return (
    <div
      className={`
    fixed bottom-0 left-1/2 -translate-x-1/2
    z-50 w-full ${isDark ? "bg-gray-900" : "bg-white"}
    border-t border-gray-300 border-default 
  `}
    >
      <div className="justify-center items-center">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          message="not access"
          type="error" // bisa "error" juga
        />
      </div>
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        <Link
          href="/"
          className="inline-flex flex-col items-center justify-center p-4 hover:bg-neutral-secondary-medium group"
        >
          <svg
            className={`
      w-6 h-6 mb-1
      ${pathname === "/" ? "text-blue-500" : "text-gray-500"}
      group-hover:text-blue-500 group-active:text-blue-600
      transition-colors
    `}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
            />
          </svg>
        </Link>
        <Link
          href="/pages/search"
          className="inline-flex flex-col items-center justify-center p-4 hover:bg-neutral-secondary-medium group"
        >
          <svg
            className={`
      w-6 h-6 mb-1
      ${pathname === "/pages/search" ? "text-blue-500" : "text-gray-500"}
      group-hover:text-blue-500 group-active:text-blue-600
      transition-colors
    `}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
          </svg>
        </Link>
        <button className="inline-flex flex-col items-center justify-center p-4 hover:bg-neutral-secondary-medium group">
          <svg
            className="w-6 h-6 mb-1 text-body group-hover:text-fg-brand"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-7 7V5"
            />
          </svg>
        </button>
        <button
          onClick={handleClickNotif}
          //href={`/${pages}/notif`}
          className="inline-flex flex-col items-center justify-center p-4 hover:bg-neutral-secondary-medium group"
        >
          <svg
            className="w-6 h-6 mb-1 text-body group-hover:text-fg-brand"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </button>
        <ConnectButton.Custom>
          {({ account, mounted, openConnectModal, openAccountModal }) => {
            if (!mounted) return null;

            const connected = mounted && account;

            return (
              <button
                onClick={() => {
                  if (!connected) {
                    openConnectModal(); // CONNECT
                  } else {
                    openAccountModal(); // DISCONNECT / Account modal
                  }
                }}
                className="inline-flex flex-col items-center justify-center p-4 hover:bg-neutral-secondary-medium group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    d="M3 6V17C3 18.8856 3 19.8284 3.58579 20.4142C4.17157 21 5.11438 21 7 21H17C18.8856 21 19.8284 21 20.4142 20.4142C21 19.8284 21 18.8856 21 17V12C21 10.1144 21 9.17157 20.4142 8.58579C19.8284 8 18.8856 8 17 8H7.82843C6.67474 8 6.0979 8 5.56035 7.84678C5.26506 7.7626 4.98044 7.64471 4.71212 7.49543C4.22367 7.22367 3.81578 6.81578 3 6ZM3 6C3 5.06812 3 4.60218 3.15224 4.23463C3.35523 3.74458 3.74458 3.35523 4.23463 3.15224C4.60218 3 5.06812 3 6 3H16"
                    stroke="currentColor"
                    strokeWidth="null"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M18 14.5C18 15.3284 17.3284 16 16.5 16C15.6716 16 15 15.3284 15 14.5C15 13.6716 15.6716 13 16.5 13C17.3284 13 18 13.6716 18 14.5Z"
                    stroke="currentColor"
                    strokeWidth="null"
                  ></path>
                </svg>
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}
