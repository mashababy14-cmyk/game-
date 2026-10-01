import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Late Night",
  description: "A choice-driven visual novel. Plays fully offline.",
  appleWebApp: { capable: true, title: "Late Night" },
};

export const viewport: Viewport = {
  themeColor: "#12141d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
