import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "Bluetooth Center",
  description: "Bluetooth Center com design novo, terminal publico, logs e UUIDs massivos.",
  applicationName: "Bluetooth Center",
  icons: {
    icon: "/bluetooth-logo.png",
    apple: "/bluetooth-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden">
      <body className={`${spaceGrotesk.variable} overflow-x-hidden font-sans antialiased`}>{children}</body>
    </html>
  );
}
