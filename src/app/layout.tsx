import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Sidebar, Header } from "@/components/layout";
import { MetricsProvider } from "@/contexts/MetricsContext";
import AIAssistant from "@/components/AIAssistant";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Marketing Na Moral | Dashboard",
  description: "Painel de controle para gestão de campanhas de marketing digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${rubik.variable} font-sans antialiased`}>
        <MetricsProvider>
          <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar - Fixed */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
              <Header />
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F4F4F4]">
                {children}
              </div>
            </main>
          </div>

          {/* AI Assistant Floating Button */}
          <AIAssistant />
        </MetricsProvider>
      </body>
    </html>
  );
}
