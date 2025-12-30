import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { MetricsProvider } from "@/contexts/MetricsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Marketing Na Moral | Dashboard",
  description: "Painel de controle para gestão de campanhas de marketing digital",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
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
        <AuthProvider>
          <MetricsProvider>
            <ProtectedLayout>
              {children}
            </ProtectedLayout>
          </MetricsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
