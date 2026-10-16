import type { Metadata } from "next";
import localFont from "next/font/local";
import { FilterProvider } from "@/components/filters/filter-context";
import "./globals.css";

const editorial = localFont({ src: "../../public/fonts/newsreader-latin.woff2", variable: "--font-editorial", display: "swap", weight: "400 600" });
const interfaceFont = localFont({ src: "../../public/fonts/dm-sans-latin.woff2", variable: "--font-interface", display: "swap", weight: "400 700" });

export const metadata: Metadata = {
  title: "Catch Consulting · HR Toolkit",
  description: "Consultoría RH, benchmarking y decisiones de talento con datos bimestrales.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${editorial.variable} ${interfaceFont.variable}`}>
      <body><FilterProvider>{children}</FilterProvider></body>
    </html>
  );
}
