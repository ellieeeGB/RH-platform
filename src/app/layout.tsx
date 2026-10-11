import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catch Consulting Intelligence",
  description: "Consulting Intelligence OS para people analytics, benchmarking y decisiones de RH.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
