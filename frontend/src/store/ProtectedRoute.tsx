"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import Loading from "@/components/Loading/Loading";

interface Props {
  children: ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { role, isLoading } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !allowedRoles.includes(role || "")) {
      router.replace("/");
    }
  }, [role, isLoading, allowedRoles, router]);

  if (isLoading || !allowedRoles.includes(role || ""))
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );

  return <>{children}</>;
}
