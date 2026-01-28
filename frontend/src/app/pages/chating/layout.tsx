import NavbarChating from "@/components/Navbar/NavbarChating";
import { ReactNode } from "react";

export default function ChatingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <NavbarChating />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
