"use client";

import ModalSubscribe from "@/components/Modal/ModalSubscribe";
import Toast from "@/components/Toast/Toast";
import { useChatPersonal } from "@/context/ChatPersonalContext";
import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  id_users: string;
}

export default function ProfileClientPages({ id_users }: Props) {
  const { isDark } = useLight();
  const router = useRouter();
  const { profileUser, setProfileUser, getProfileUserById } = useUsers();
  const { tiers, subscribedata, getSubscribeIdTier, setTiers } = useSubscribe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createChatPersonal } = useChatPersonal();
  const { userId } = useWallet();
  const [activeTab, setActiveTab] = useState("Post");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const tabs = ["Post", "Assert", "Cast", "Replies", "Badge"];
  console.log(tiers, "good");
  // Check if user can access chat
  const canAccessChat =
    Array.isArray(subscribedata) &&
    subscribedata.some(
      (sub) =>
        sub.id_users === userId &&
        sub.id_creator === profileUser?.id_users &&
        sub.status_subscribe === "active" &&
        sub.type_subscribe === "Gold",
    );

  console.log(subscribedata);

  // Fetch profile user
  useEffect(() => {
    if (!id_users) return;

    const getIdUsers = async () => {
      const userData = await getProfileUserById(id_users);
      setProfileUser(userData);
    };
    getIdUsers();
  }, [id_users]);

  useEffect(() => {
    if (!profileUser?.address?.address) return;
    console.log(profileUser, "address");
    const fetchTiers = async () => {
      const res = await getSubscribeIdTier(profileUser.address?.address);
      console.log(res.tiers, "res");
      setTiers(res.tiers);
    };

    fetchTiers();
  }, [profileUser?.address?.id_address]);

  const handleSubscribeClick = () => {
    if (
      !tiers ||
      tiers.length === 0 ||
      tiers.every((t) => t.isActive === false)
    ) {
      setToast({
        show: true,
        message: "Creator Not Set Subscribe!",
        type: "error", // <-- tambahkan ini
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleSetChatPersonal = async () => {
    if (!id_users || !userId) return;
    try {
      const chat = await createChatPersonal({
        id_users1: userId,
        id_users2: id_users,
      });
      router.push(`/pages/chating/creator?chatId=${chat.id_personal_chat}`);
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  };

  const tabContent: Record<string, React.ReactNode> = {
    Post: (
      <div className="flex flex-row space-x-2">
        <div className="h-20 w-20 bg-gray-400 rounded-md overflow-hidden">
          <img
            className="h-full w-full object-cover"
            src="https://delifru.co.id/wp-content/uploads/2024/06/apa-itu-cafe.jpg"
            alt="Cafe"
          />
        </div>

        <div className="h-20 w-20 bg-gray-400 rounded-md overflow-hidden">
          <img
            className="h-full w-full object-cover"
            src="https://mawatu.co.id/wp-content/uploads/2024/11/6.-Desain-Cafe-Sederhana-di-Ruko-Kecil-dengan-Konsep-Klasik.jpg"
            alt="Cafe"
          />
        </div>
      </div>
    ),
    Assert: <></>,
    Cast: <></>,
    Replies: <></>,
    Badge: (
      <div>
        <h1>This is badge</h1>
      </div>
    ),
  };

  return (
    <ProtectedRoute allowedRoles={["Users", "Creators"]}>
      <div className="w-full md:px-8 py-4 px-2">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-4">
            <Image
              src={profileUser?.foto || "/avatar.png"}
              alt="User Avatar"
              width={60}
              height={60}
              unoptimized
              className="rounded-full object-cover w-14 h-14"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={canAccessChat ? handleSetChatPersonal : undefined}
                disabled={!canAccessChat}
                className={`p-2 rounded-lg transition ${
                  canAccessChat
                    ? "bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed opacity-50"
                }`}
                title={
                  canAccessChat
                    ? "Chat"
                    : "Chat hanya tersedia untuk subscriber GOLD"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
              </button>

              <button className="flex-1 px-6 py-3 text-sm text-white font-semibold bg-blue-900 rounded-xl shadow-lg hover:scale-105 transition">
                Following
              </button>
            </div>

            <button
              onClick={handleSubscribeClick}
              className="w-full px-6 py-3 text-sm text-white font-semibold bg-blue-900 rounded-xl shadow-lg hover:scale-105 transition"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Name + Username */}
        <div className="space-y-2">
          <h1 className="text-lg font-sarif font-semibold">
            {profileUser?.first_name} {profileUser?.last_name}
          </h1>
          <h2 className="font-sarif text-sm text-gray-600">
            {profileUser?.username}
          </h2>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex flex-row items-start">
              <p className="font-sarif text-sm font-semibold px-1">100</p>
              <p className="font-sarif text-sm text-gray-500">Following</p>
            </div>
            <div className="flex flex-row">
              <p className="font-sarif text-sm font-semibold px-1">100</p>
              <p className="font-sarif text-sm text-gray-500">Followers</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-container py-4">
          <div className="flex flex-col">
            <div className="flex gap-4 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`py-2 font-sans text-base font-semibold ${
                    activeTab === tab
                      ? `border-b-3 border-black-500 ${isDark ? "text-white" : "text-black"}`
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="rounded-lg">{tabContent[activeTab]}</div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && profileUser && (
          <ModalSubscribe
            onClose={() => setIsModalOpen(false)}
            profileUser={profileUser} // Pass profileUser here
          />
        )}

        {/* Toast */}
        {toast.show && (
          <Toast
            message={toast.message}
            show={toast.show}
            type={toast.type}
            onClose={() =>
              setToast({ show: false, message: "", type: "success" })
            }
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
