"use client";

import { useLight } from "@/context/LightContext";

// Data dummy berdasarkan gambar
const POSTS = [
  {
    id: 1,
    author: "toadyhawk",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=frog", // Placeholder avatar pixel
    time: "19h",
    content: "moon dat",
    stats: { comments: 5, reposts: 9, likes: 88 },
  },
  {
    id: 2,
    author: "Oxen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=oxen",
    time: "18h",
    content:
      "Deployer really said fuck it, and put the entire base ecosystem on his back.",
    image:
      "https://jersey-printing.com/images/upload/195.%20Tips%20Mencari%20Anggota%20Tim%20Basket.jpg", // Ganti dengan path gambar football Anda
    stats: { comments: 23, reposts: 15, likes: 531 },
  },
  {
    id: 3,
    author: "christopher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chris",
    time: "21h",
    content: "Please check this base project for me...",
    stats: { comments: 2, reposts: 1, likes: 10 },
  },
  {
    id: 3,
    author: "christopher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chris",
    time: "21h",
    content: "Please check this base project for me...",
    stats: { comments: 2, reposts: 1, likes: 10 },
  },
];

export default function TalkPages() {
  const { isDark } = useLight();

  return (
    <div
      className={`w-full min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {/* Feed List */}
      <div className="max-w-2xl mx-auto">
        {POSTS.map((post) => (
          <div
            key={post.id}
            className={`flex p-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"} hover:bg-opacity-10 hover:bg-gray-100 transition-colors cursor-pointer`}
          >
            {/* Kiri: Avatar */}
            <div className="mr-3 flex flex-col items-center">
              <div className="relative">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-12 h-12 rounded-full bg-gray-200"
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-900 rounded-full border border-white p-0.5">
                  <span className="text-[10px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-4 text-white"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Kanan: Konten */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold hover:underline">
                    {post.author}
                  </span>
                  <span className="text-gray-500 text-sm">· {post.time}</span>
                </div>
                <button className="text-gray-500 hover:text-blue-100">
                  •••
                </button>
              </div>

              <p
                className={`text-[15px] leading-normal mb-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                {post.content}
              </p>

              {/* Gambar Postingan (Jika Ada) */}
              {post.image && (
                <div className="mb-3 rounded-2xl border border-gray-700 overflow-hidden">
                  <img
                    src={post.image}
                    alt="content"
                    className="w-full object-cover max-h-96"
                  />
                </div>
              )}

              {/* Action Bar (Icons) */}
              <div
                className={`flex justify-between max-w-sm text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-500">
                  <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                      />
                    </svg>
                  </div>
                  <span>{post.stats.comments}</span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer hover:text-green-500">
                  <div className="p-2 group-hover:bg-green-500/10 rounded-full transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                      />
                    </svg>
                  </div>
                  <span>{post.stats.reposts}</span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer hover:text-pink-500">
                  <div className="p-2 group-hover:bg-pink-500/10 rounded-full transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  </div>
                  <span>{post.stats.likes}</span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-500">
                  <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spacer bawah untuk mobile navbar jika ada */}
      <div className="h-20" />
    </div>
  );
}
