import type { Metadata } from "next";
import { FilterProvider } from "@/components/filter-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catch Consulting Intelligence",
  description: "Consultoría RH, benchmarking y decisiones de talento con datos bimestrales.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><FilterProvider>{children}</FilterProvider></body>
    </html>
  );
}
