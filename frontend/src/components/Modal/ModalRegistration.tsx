"use client";

import Toast from "@/components/Toast/Toast";
import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import { useRef, useState } from "react";

interface ModalProps {
  onClose: () => void;
}

export default function ModalRegistration({ onClose }: ModalProps) {
  const { isDark } = useLight();
  const { userId } = useWallet();
  const { updateProfileUsers } = useUsers();

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

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!userId) return;

    const firstName = firstNameRef.current?.value.trim();
    const lastName = lastNameRef.current?.value.trim();
    const username = usernameRef.current?.value.trim();

    if (!firstName || !lastName || !username) {
      setToast({ show: true, message: "Form is required", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("username", username);
      if (selectedFile) formData.append("foto", selectedFile);

      const result = await updateProfileUsers(userId, formData);

      if (!result) {
        setToast({
          show: true,
          message: "failed for regist creator!",
          type: "error",
        });
        return;
      }

      setToast({
        show: true,
        message: "succes regist creator!",
        type: "success",
      });
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Registration failed!", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className={`relative w-80 p-6 rounded-xl shadow-lg ${
            isDark ? "bg-gray-800 text-white" : "bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-800 hover:text-gray-600"
          >
            ✕
          </button>

          <h1 className="text-base font-sans text-center font-semibold mb-4">
            Registration Creator
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-sans font-medium">
                First Name
              </label>
              <input
                ref={firstNameRef}
                className="px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Last Name</label>
              <input
                ref={lastNameRef}
                className="px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium">Username</label>
              <input
                ref={usernameRef}
                className="px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="md:col-span-2 flex items-end gap-2 justify-end">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1 border rounded text-xs hover:bg-gray-100 transition"
              >
                Upload Image
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
                className="w-full inline-flex justify-center items-center font-sans font-semibold px-3 py-4 text-sm bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
                {isLoading ? "Processing" : "Register"}
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
