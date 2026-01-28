"use client";

import { useLight } from "@/context/LightContext";

// Dummy data
const TRADE_DATA = [
  {
    id: 1,
    type: "buy",
    message: "352 people bought $BASEEGG in the past day",
    time: "23h",
    tokenName: "BaseEgg",
    symbol: "$BASEEGG",
    marketCap: "$45.6K",
    price: "$0.04460",
    pnl: "-0.03%",
    holders: "349",
    images: [
      "https://imgsrv2.voi.id/WAHp0IZPGKyVPMQcAZzocVQFGfCIJPV2bj5u2oUcOzE/auto/1200/675/sm/1/bG9jYWw6Ly8vcHVibGlzaGVycy8zMTY1MzYvMjAyMzEwMDQxNTA4LW1haW4uY3JvcHBlZF8xNjk2NDA2OTE5LmpwZWc.jpg",
      "https://img.astroawani.com/2024-06/51719375940_TBRoketChina.jpg",
      "https://bertuahpos.com/wp-content/uploads/2024/09/roket-Starship-Elon-Musk.jpeg",
    ],
  },
  {
    id: 2,
    type: "sell",
    message: "Someone sold US$190.54K of $VVV",
    time: "2h",
    tokenName: "Venice Token",
    symbol: "VVV",
    marketCap: "$121M",
    hasChart: true,
  },
];

export default function TradePages() {
  const { isDark } = useLight();

  return (
    <div
      className={`w-full min-h-screen p-4 pb-8 ${isDark ? "bg-gray-900 text-white" : "bg-gray-white text-gray-900"}`}
    >
      <div className="max-w-md mx-auto space-y-6">
        {TRADE_DATA.map((item) => (
          <div key={item.id} className="space-y-3">
            {/* Header Notification */}
            <div className="flex justify-between items-center text-sm px-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.type === "buy" ? "bg-green-400" : "bg-red-400"
                  } text-white font-bold`}
                >
                  {item.type === "buy" ? "↑" : "↓"}
                </div>
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  {item.message}
                </span>
              </div>
              <span className="text-gray-400">{item.time}</span>
            </div>

            {/* Card */}
            <div
              className={`rounded-3xl p-5 border transition-all duration-200 ${
                isDark
                  ? "bg-[#1a1a1a] border-gray-700 hover:border-gray-500"
                  : "bg-white border-gray-200 shadow hover:shadow-lg"
              }`}
            >
              {/* Token Info */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-300">
                    <span className="text-yellow-600 font-bold">O</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.tokenName}</h3>
                    <span className="text-xs text-gray-500">{item.symbol}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{item.marketCap}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Market Cap
                  </div>
                </div>
              </div>

              {/* Images */}
              {item.images && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {item.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700"
                    >
                      <img
                        src={img}
                        alt="token"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Chart */}
              {item.hasChart && (
                <div className="h-24 w-full mb-4">
                  <svg
                    viewBox="0 0 100 40"
                    className="w-full h-full stroke-blue-500 fill-none"
                  >
                    <path
                      d="M0,20 Q25,10 40,25 T70,30 T100,35"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {/* Stats */}
              {!item.hasChart && (
                <div className="grid grid-cols-3 border-t border-gray-300 dark:border-gray-700 pt-4 mt-2">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">
                      Price
                    </div>
                    <div className="font-semibold text-sm">{item.price}</div>
                  </div>
                  <div className="text-center border-x border-gray-300 dark:border-gray-700">
                    <div className="text-[10px] text-gray-400 uppercase">
                      PnL
                    </div>
                    <div
                      className={`font-semibold text-sm ${
                        item.pnl?.startsWith("-")
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {item.pnl}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase">
                      Holders
                    </div>
                    <div className="font-semibold text-sm flex items-center justify-end gap-1">
                      <span className="w-3 h-3 rounded-full bg-orange-400"></span>{" "}
                      {item.holders}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-5 px-2 text-gray-500">
              {/* Like */}
              <button className="hover:text-red-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {/* Trade Volume */}
              <button className="hover:text-green-500 transition-colors flex items-center gap-1 font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 13h4l3 8 4-16 3 8h4"
                  />
                </svg>
                {item.marketCap}
              </button>

              {/* Share */}
              <button className="hover:text-blue-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12v.01M12 12v.01M20 12v.01M4 6h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
