import type { Metadata } from "next";
import { Monoton, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const marquee = Monoton({
  variable: "--font-marquee",
  weight: "400",
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-hud",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Jugá online, sumá puntos, subí al ranking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${marquee.variable} ${grotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
