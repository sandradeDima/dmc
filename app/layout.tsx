import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteFooter from "@/components/footer/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DMC",
  applicationName: "DMC",
  description: "DMC",
  icons: {
    icon: [
      { url: "/assets/logo-dmc.png", type: "image/png" },
    ],
    shortcut: ["/assets/logo-dmc.png"],
    apple: ["/assets/logo-dmc.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
