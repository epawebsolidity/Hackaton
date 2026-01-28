"use client";

import Toast from "@/components/Toast/Toast";
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import { useRef, useState } from "react";

interface ModalProps {
  onCloseContentExlusive: () => void;
}

export default function ModalContentExlusive({ onCloseContentExlusive }: ModalProps) {
  const { isDark } = useLight();
  const { userId } = useWallet();

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const titleContent = useRef<HTMLInputElement>(null);
    const contentContent = useRef<HTMLTextAreaElement>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={onCloseContentExlusive}
      >
        <div
          className={`relative w-80 p-6 rounded-xl shadow-lg ${
            isDark ? "bg-gray-800 text-white" : "bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
                      onClick={onCloseContentExlusive}
            className="absolute top-2 right-2 text-gray-800 hover:text-gray-600"
          >
            ✕
          </button>

          <h1 className="text-base font-sans text-center font-semibold mb-4">
            Post Context
          </h1>
                  <form className="grid grid-cols-1 gap-4 py-2 w-full" onSubmit={(e) => e.preventDefault()}>

                      {/* Title */}
                      <div className="flex flex-col gap-1 w-full">
                          <label className="text-xs font-sans font-medium" htmlFor="title">
                              Title
                          </label>
                          <input
                              id="title"
                              ref={titleContent}
                              className="w-full px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                          />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-1 w-full">
                          <label className="text-xs font-sans font-medium" htmlFor="content">
                              Content
                          </label>
                          <textarea
                              id="content"
                              rows={5}
                              ref={contentContent}
                              className="w-full px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                              required
                              placeholder="Write something..."
                              onInput={(e) => {
                                  const target = e.target as HTMLTextAreaElement;
                                  target.style.height = "auto";
                                  target.style.height = target.scrollHeight + "px";
                              }}
                          />
                      </div>

                      {/* Upload Image */}
                      <div className="flex flex-col gap-2 w-full">
                          <input
                              ref={fileRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                              aria-label="Upload group image"
                          />
                          <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              className="px-3 py-2 bg-gray-300 text-gray-700 font-semibold rounded text-xs hover:bg-gray-200 transition"
                          >
                              Upload Images
                          </button>
                          {selectedFile && (
                              <span className="text-xs text-gray-500 truncate">{selectedFile.name}</span>
                          )}
                      </div>

                      <div className="md:col-span-2 w-full mt-3">
                          <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full inline-flex justify-center items-center font-sans font-semibold px-3 py-3 text-sm bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                              {isLoading && (
                                  <svg
                                      className="mr-2 h-4 w-4 animate-spin text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                  >
                                      <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                      />
                                      <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                                      />
                                  </svg>
                              )}
                              {isLoading ? "Proses ..." : "Post Contenxt"}
                          </button>
                      </div>
                  </form>

        </div>
      </div>

      {toast.show && (
        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
}
