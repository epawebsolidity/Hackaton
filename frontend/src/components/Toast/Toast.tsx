"use client";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: "success" | "error"; // default: success
}

export default function Toast({
  message,
  show,
  onClose,
  type = "success",
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // auto hide after 3s
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 max-w-xs rounded-xl shadow-lg z-50 border ${
        isSuccess ? "bg-white border-green-200" : "bg-white border-gray-200"
      }`}
      role="alert"
      tabIndex={-1}
      aria-labelledby="toast-label"
    >
      <div className="flex p-2">
        <div className="shrink-0">
          {isSuccess ? (
            <svg
              className="w-4 h-4 text-green-500 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 11.03a.75.75 0 0 0 1.08 0l3.992-3.993a.75.75 0 1 0-1.06-1.06L7.5 9.439 5.998 7.937a.75.75 0 1 0-1.06 1.06l2.032 2.033z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-red-500 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
            </svg>
          )}
        </div>

        <div className="ml-3">
          <p id="toast-label" className="text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
