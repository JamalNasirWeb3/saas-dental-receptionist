import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bright Smile Dental",
  description: "Virtual Receptionist – Bright Smile Dental",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
