"use client";

import ButtonNavigator from "@/components/ButtonNavigation/ButtonNavigation";
import Loading from "@/components/Loading/Loading";
import Navbar from "@/components/Navbar/Navbar";
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import { usePathname } from "next/navigation";
import React, { ReactNode, useState } from "react";

// Gunakan dynamic import untuk SidebarPages supaya SSR mati
import dynamic from "next/dynamic";
const SidebarPages = dynamic(() => import("@/components/Sidebar/Sidebar"), {
  ssr: false,
});

export default function ClientShell({ children }: { children: ReactNode }) {
  const { isLoading } = useWallet();
  const { isDark } = useLight();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  const hideNavbar = pathname.startsWith("/pages/chating");
  const hideNavigator = pathname.startsWith("/pages/chating");

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex flex-col w-full md:w-1/2 min-w-0">
        {/* Navbar tanpa activeTab */}
        {!hideNavbar && (
          <Navbar onOpenSidebar={() => setOpen(true)} currentPath={pathname} />
        )}

        {/* Sidebar menggunakan dynamic import */}
        <SidebarPages open={open} onClose={() => setOpen(false)} />

        <main className="">
          <div className="w-full">{children}</div>
        </main>
      </div>

      {!hideNavigator && <ButtonNavigator />}
    </div>
  );
}
