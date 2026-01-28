"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function SearchPages() {
  const { isDark } = useLight();
  const { usersAll } = useUsers();
  const router = useRouter();
  console.log(usersAll);
  const [query, setQuery] = useState("");

  // Filter hanya saat query diisi
  const filteredCreators = useMemo(() => {
    if (!Array.isArray(usersAll)) return [];

    const q = query.toLowerCase().trim();

    return usersAll.filter((user) => {
      if (user.role?.role?.toLowerCase() !== "creators") return false;

      if (!q) return true; // ← tampilkan semua creators

      const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`
        .toLowerCase()
        .trim();

      const username = (user.username ?? "").toLowerCase();

      return fullName.includes(q) || username.includes(q);
    });
  }, [query, usersAll]);

  const handleProfileClick = (id_users: string) => {
    console.log(id_users);
    router.push(`/pages/search/${id_users}`);
  };
  const DEFAULT_AVATAR = "./11789135.png";

  return (
    <div
      className={`min-h-screen mb-14 ${
        isDark ? "bg-black text-white" : "bg-transparent text-gray-900"
      }`}
    >
      {/* SEARCH HEADER */}
      <div
        className={`sticky top-0 z-20 border-b ${
          isDark ? "border-gray-800 bg-black" : "border-gray-200 bg-white"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 py-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Creator ..."
              className={`w-full rounded-full px-12 py-3 text-sm border focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-gray-900 text-white placeholder-gray-400 focus:ring-blue-500 border-gray-700"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-500 border-gray-200"
              }`}
            />

            {/* SEARCH ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-w-3xl mx-auto px-4 py-2 space-y-2">
        {query.trim() !== "" &&
          (filteredCreators.length > 0 ? (
            filteredCreators.map((user) => (
              <div
                key={user.id_users}
                onClick={() => handleProfileClick(user.id_users)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <Image
                  src={user.foto || DEFAULT_AVATAR}
                  alt={user.username}
                  width={48}
                  height={48}
                  unoptimized
                  className="rounded-full object-cover border border-gray-300"
                />

                <div>
                  <p className="font-semibold leading-tight">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.username} || {user.role?.role}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No creators found.</p>
          ))}
      </div>

      <div className="px-4 md:px-8 rounded-md  p-2">
        <h1 className="font-bold text-lg mb-4">Pinned</h1>
        <div className="flex flex-wrap">
          <div className="flex flex-col items-center w-20">
            <div className="h-17 w-17 rounded-md overflow-hidden bg-gray-100 border border-gray-400 shadow-2xl flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-12 w-12 text-blue-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
                />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-center mt-2">Apps</h1>
          </div>


          <div className="flex flex-col items-center w-20">
            <div className="h-17 w-17 rounded-md overflow-hidden bg-gray-100 border border-gray-400 shadow-2xl flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-12 w-12 text-blue-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-center mt-2">Browser</h1>
          </div>


          <div className="flex flex-col items-center w-20">
            <div className="h-17 w-17 rounded-md overflow-hidden bg-gray-100 border border-gray-400 shadow-2xl flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-12 w-12 text-blue-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-center mt-2">Verify</h1>
          </div>


          <div className="flex flex-col items-center w-20">
            <div className="h-17 w-17 rounded-md overflow-hidden bg-gray-100 border border-gray-400 shadow-2xl flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-12 w-12 text-blue-900"
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
            <h1 className="text-sm font-bold text-center mt-2">Creator</h1>
          </div>

          <div className="flex flex-col items-center w-20">
            <div className="h-17 w-17 rounded-md overflow-hidden bg-gray-100 border border-gray-400 shadow-2xl flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-12 w-12 text-blue-900"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-center mt-2">Other</h1>
          </div>

        </div>
      </div>

      <div className="px-4 md:px-8 py-4 rounded-md">
        <h1 className="font-bold text-lg mb-4">This Week's Picks</h1>

        {/* List item */}
        <div className="flex flex-col gap-4">
          {/* Contoh item */}
          <div className="flex items-center justify-between p-2 rounded-full hover:bg-gray-50">
            {/* Gambar */}
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src="https://delifru.co.id/wp-content/uploads/2024/06/apa-itu-cafe.jpg"
                alt="Cafe"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            {/* Nama */}
            <div className="flex-1 px-4">
              <h2 className="font-semibold text-gray-400">Cafe Delight</h2>
              <p className="text-sm text-gray-400">Cozy and quiet place</p>
            </div>

            {/* Button */}
            <button className="bg-gray-200 text-black font-bold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Get
            </button>
          </div>

          {/* Tambahkan item lain sesuai kebutuhan */}
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src="https://mawatu.co.id/wp-content/uploads/2024/11/6.-Desain-Cafe-Sederhana-di-Ruko-Kecil-dengan-Konsep-Klasik.jpg"
                alt="Cafe"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 px-4">
              <h2 className="font-semibold text-gray-400">Classic Cafe</h2>
              <p className="text-sm text-gray-400">Perfect for working</p>
            </div>
            <button className="bg-gray-200 text-black font-bold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Get
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 rounded-md">
        <h1 className="font-bold text-lg mb-4">Trending coins</h1>

        {/* List item */}
        <div className="flex flex-col gap-4">
          {/* Contoh item */}
          <div className="flex items-center justify-between p-2 rounded-full hover:bg-gray-50">
            {/* Gambar */}
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src="https://delifru.co.id/wp-content/uploads/2024/06/apa-itu-cafe.jpg"
                alt="Cafe"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            {/* Nama */}
            <div className="flex-1 px-4">
              <h2 className="font-semibold text-gray-400">Bankr</h2>
              <p className="text-sm text-gray-400">9m</p>
            </div>

            {/* Button */}
            <button className="bg-gray-200 text-black font-bold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Trade
            </button>
          </div>

          {/* Tambahkan item lain sesuai kebutuhan */}
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src="https://mawatu.co.id/wp-content/uploads/2024/11/6.-Desain-Cafe-Sederhana-di-Ruko-Kecil-dengan-Konsep-Klasik.jpg"
                alt="Cafe"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 px-4">
              <h2 className="font-semibold text-gray-400">Zora</h2>
              <p className="text-sm text-gray-400">9m</p>
            </div>
            <button className="bg-gray-200 text-black font-bold px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
