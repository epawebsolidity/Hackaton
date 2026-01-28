"use client";
import { useActiveTab } from "@/context/ActiveTabContext"; // Import useActiveTab
import HomePages from "./pages/page";
import { useLight } from "@/context/LightContext";
import TradePages from "./pages/Trade/page";
import TalkPages from "./pages/Talk/page";

export default function Home() {
  const { isDark } = useLight();
  const { activeTab } = useActiveTab();

  return (
    <div className="w-full">
      {activeTab === "Followed" && (
        <div className="flex flex-col py-2 pb-10">
          <HomePages />
        </div>
      )}
      {activeTab === "Trade" && (
        <div className="flex flex-col py-4 pb-16">
          <TradePages />
        </div>
      )}
      {activeTab === "Talk" && (
        <div className="flex flex-col py-4">
          <TalkPages />
        </div>
      )}
    </div>
  );
}
