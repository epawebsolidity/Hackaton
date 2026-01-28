"use client";

import { useRef, useState } from "react";
import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import Toast from "@/components/Toast/Toast";
import { useSubscribe } from "@/context/SubscribeContext";
interface ModalProps {
  onCloseSub: () => void;
}

export default function ModalCreateSubscribe({ onCloseSub }: ModalProps) {
  const { isDark } = useLight();
  const { userId } = useWallet();
  const { updateProfileUsers } = useUsers();
  const { createSubscribe } = useSubscribe();
  const [isLoading, setIsLoading] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const bronzePrice = useRef<HTMLInputElement>(null);
  const silverPrice = useRef<HTMLInputElement>(null);
  const goldPrice = useRef<HTMLInputElement>(null);

  const handleSubmitSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const bronze = Number(bronzePrice.current?.value || 0);
    const silver = Number(silverPrice.current?.value || 0);
    const gold = Number(goldPrice.current?.value || 0);

    console.log(bronze, silver, gold);

    if (!bronze && !silver && !gold) {
      setToast({
        show: true,
        type: "error",
        message: "At least one tier price must be filled",
      });
      return;
    }

    let res;
    try {
      setIsLoading(true);

      // Simpan hasil createSubscribe
      res = await createSubscribe({
        bronze,
        silver,
        gold,
      });

      setToast({
        show: true,
        type: "success",
        message: "Subscription created successfully!",
      });

      setTimeout(onCloseSub, 1200);

      return res; // return di sini kalau sukses
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message: "Failed to create subscription",
      });
      console.log(err);
      return null; // return null kalau gagal
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onCloseSub}
      >
        <div
          className={`relative w-80 p-6 rounded-xl shadow-lg ${
            isDark ? "bg-gray-800 text-white" : "bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onCloseSub}
            className="absolute top-2 right-2 text-gray-800 hover:text-gray-600"
          >
            ✕
          </button>

          <h1 className="text-base font-sans text-center font-semibold mb-4">
            Set Subscribe
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitSubscribe(e);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-sans font-medium">Bronzee</label>
              <input
                ref={bronzePrice}
                type="number"
                min="0.001" // Set minimum value to 0.01
                step="any" // Allow any decimal number
                className="px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Silver</label>
              <input
                ref={silverPrice}
                type="number"
                min="0.001" // Set minimum value to 0.01
                step="any" // Allow any decimal number
                className="px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium">Gold</label>
              <input
                ref={goldPrice}
                type="number"
                min="0.001" // Set minimum value to 0.01
                step="any" // Allow any decimal number
                className="px-3 py-2 rounded-lg text-base bg-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
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
                {isLoading ? "Processing" : "Set Subscribe"}
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
