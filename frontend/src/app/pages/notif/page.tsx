"use client";
import { useLight } from "@/context/LightContext";
import Image from "next/image";

export default function NotificationPages() {
    const { isDark } = useLight();

    return (
        <div
            className={`min-h-screen px-4 py-6 ${isDark ? "bg-black text-white" : "bg-transparation text-gray-900"
                }`}
        >
            {/* Notification 2 */}
            <div
                className={`flex items-start gap-3 p-4 rounded-xl mt-3 ${isDark ? "bg-gray-800/50" : "bg-white"
                    }`}
            >
                <Image
                    src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm">New Vote</p>
                        <span className="text-xs text-gray-400">10 min ago</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        A new poll has been created in Group Creator 1.
                    </p>
                </div>
            </div>
        </div>
    );
}
