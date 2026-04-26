import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureBoard",
  description: "Frontend Next.js do SecureBoard com autenticação JWT, dashboard e boards com drag-and-drop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
