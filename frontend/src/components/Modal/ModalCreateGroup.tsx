"use client";

import Toast from "@/components/Toast/Toast";
import { useChatGroup } from "@/context/GroupChatContext"; // Importing context hook for creating group chat
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import { useRef, useState } from "react";

interface ModalProps {
  onCloseMakeGroup: () => void;
}

export default function ModalMakeGroup({ onCloseMakeGroup }: ModalProps) {
  const { isDark } = useLight();
  const { userId } = useWallet();
  const { createChatGroup } = useChatGroup(); // Use the context function to create the group

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

  const nameGroupRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!userId) return; // Ensure userId exists

    const name_group = nameGroupRef.current?.value.trim();

    // Validate group name
    if (!name_group) {
      setToast({
        show: true,
        message: "Group name is required",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name_group", name_group);
      formData.append("id_users", userId);
      if (selectedFile) formData.append("foto", selectedFile);

      const result = await createChatGroup(formData); // Use only formData here

      if (result) {
        setToast({
          show: true,
          message: "Group created successfully!",
          type: "success",
        });
        setTimeout(() => onCloseMakeGroup(), 1200); // Close the modal after success
      }
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: "Group creation failed!",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onCloseMakeGroup}
      >
        <div
          className={`relative w-80 p-6 rounded-xl shadow-lg ${
            isDark ? "bg-gray-800 text-white" : "bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onCloseMakeGroup}
            className="absolute top-2 right-2 text-gray-800 hover:text-gray-600"
          >
            ✕
          </button>

          <h1 className="text-base font-sans text-center font-semibold mb-4">
            Make Group Chat
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="grid grid-cols-1 py-2"
          >
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-sans font-medium"
                htmlFor="name_group"
              >
                Name Group
              </label>
              <input
                id="name_group"
                ref={nameGroupRef}
                className="w-full px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                aria-label="Group name"
              />
            </div>

            <div className="md:col-span-2 flex items-end gap-2 py-4 justify-end">
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
                className="px-3 py-2 bg-gray-300 text-gray-700 font-semibold shadow-2xl rounded text-xs hover:bg-gray-200 transition"
              >
                Upload Images
              </button>
              {selectedFile && (
                <span className="text-xs text-gray-500 truncate">
                  {selectedFile.name}
                </span>
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
                {isLoading ? "Proses ..." : "Make Group"}
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
