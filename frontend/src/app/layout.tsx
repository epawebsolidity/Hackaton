import ClientShell from "./ClientShilt"; // import ClientShell
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "True Ownership for Creators and their communities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white">
        <Providers>
          <ClientShell>
            {children} {/* Ensure children are passed down correctly */}
          </ClientShell>
        </Providers>
      </body>
    </html>
  );
}
