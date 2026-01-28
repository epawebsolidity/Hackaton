"use client";

import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useUsers } from "@/context/UsersContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import Image from "next/image";
import { useState } from "react";
export default function ProfileUsers() {
  const { isDark } = useLight();
  const { user } = useUsers();
  const { subUsersId } = useSubscribe();
  console.log(subUsersId);
  const [activeTab, setActiveTab] = useState("Post");
  const tabs = ["Post", "Assert", "Cast", "Replies", "Badge"];
  const DEFAULT_AVATAR = "/11789135.png";

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
        {subUsersId?.map((badge: any) => (
          <div key={badge.id_subscribe}>
            <p>{badge.id_token}</p>
          </div>
        ))
        }
      </div >
    )
  };

  return (
    <ProtectedRoute allowedRoles={["Users", "Creators"]}>
      <div className="w-full md:px-8 py-4 px-2">
        {/* HEADER */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-4">
            <Image
              src={user?.foto?.trim() || DEFAULT_AVATAR}
              alt="User Avatar"
              width={60}
              height={60}
              unoptimized
              className="rounded-full object-cover"
            />
          </div>

          <button className="px-6 py-3 text-sm font-semibold text-white bg-blue-900 rounded-xl shadow-lg hover:scale-105 transition">
            Edit Profile
          </button>
        </div>

        {/* USER INFO */}
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">
            {user
              ? user.first_name?.trim() || user.last_name?.trim()
                ? `${user.first_name} ${user.last_name}`.trim()
                : user.username
              : "Loading..."}
          </h1>
          {/* <p className="text-sm text-gray-500">{user.username}</p> */}

          <div className="flex gap-4">
            <p className="text-sm">
              <b>100</b> Following
            </p>
            <p className="text-sm">
              <b>100</b> Followers
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="py-4">
          <div className="flex gap-4 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 font-semibold ${
                  activeTab === tab
                    ? `border-b-2 ${
                        isDark ? "border-white text-white" : "border-black"
                      }`
                    : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div>{tabContent[activeTab]}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
