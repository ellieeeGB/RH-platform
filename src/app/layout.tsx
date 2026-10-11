import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RH Platform | People Intelligence",
  description: "People analytics, benchmarking e inteligencia para decisiones de RH.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
