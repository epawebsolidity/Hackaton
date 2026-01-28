"use client";

import { useLight } from "@/context/LightContext";
import Image from "next/image";
export default function HomePages() {
  const { isDark } = useLight();

  const POSTS = [
    {
      id: 1,
      avatar: "https://i.pravatar.cc/40?img=1",
      user: "John Doe",
      content: "nice weather",
      image:
        "https://ik.imagekit.io/tvlk/blog/2023/11/Musim-Dingin-Jepang-Musim-Salju-Winter-Traveloka-Xperience.jpg",
    },
    {
      id: 2,
      avatar: "https://i.pravatar.cc/40?img=2",
      user: "Jane Smith",
      content: "Quality time with family on the weekend is always priceless 💖",
      image:
        "https://sangbuahhati.com/wp-content/uploads/2021/01/Imlek-keluarga.jpg",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 py-4">
        {POSTS.map((post) => (
          <div
            key={post.id}
            className={`w-full mx-auto ${
              isDark ? "bg-gray-900" : "bg-white"
            } md:rounded-2xl md:w-3/5 border-b-2 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center px-4 py-3">
              <Image
                src={post.avatar}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div className="ml-3 flex-1">
                <h3 className="font-mono font-bold text-sm">{post.user}</h3>
              </div>
              <button className="text-gray-500 font-bold text-xl">⋯</button>
            </div>
            <div className="font-mono py-4 px-4">{post.content}</div>

            <div className="relative w-full h-72">
              <Image
                src={post.image}
                alt="Post"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 500px"
              />
            </div>

            <div className="flex items-center justify-between px-4 py-8">
              <div className="flex gap-8">
                <button className="text-gray-700 hover:text-red-500 transition">
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
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </button>
                <button className="flex items-center text-gray-700 hover:text-blue-500 transition">
                  <svg
                    className="size-6"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 15v4m6-6v6m6-4v4m6-6v6M3 11l6-5 6 5 5.5-5.5"
                    />
                  </svg>

                  <span className="ml-1">$70</span>
                </button>
                <button className="text-gray-700 hover:text-green-500 transition">
                  <svg className="size-6" viewBox="0 0 24 24" fill="none">
                    <g transform="rotate(45 12 12)">
                      <path
                        d="M8.4223 9.15539C9.9834 6.0332 10.7639 4.47211 12 4.47211C13.2361 4.47211 14.0166 6.0332 15.5777 9.15539L18.0292 14.0584C19.7382 17.4763 20.5927 19.1853 19.776 20.1872C18.9594 21.1891 17.1132 20.6968 13.4209 19.7122L13.0307 19.6081C12.5183 19.4715 12.2621 19.4032 12 19.4032C11.7379 19.4032 11.4817 19.4715 10.9694 19.6081L10.5792 19.7122C6.88682 20.6968 5.04065 21.1891 4.224 20.1872C3.40735 19.1853 4.26183 17.4763 5.9708 14.0584L8.4223 9.15539Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M12 14.0975L12 19.3975"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </svg>
                </button>
              </div>
              <button className="text-gray-700 hover:text-gray-900 transition">
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
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
