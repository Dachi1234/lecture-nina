import type { Metadata } from "next";
import type { ReactNode } from "react";
import { caveat, firago, montserrat } from "../fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nina – Tu Profe de Español",
  description: "ინდივიდუალური ონლაინ გაკვეთილები ნულიდან",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ka" className={`${firago.variable} ${montserrat.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
