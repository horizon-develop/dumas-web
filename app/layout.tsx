import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import "./globals.css";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dumas Distribuciones",
  description: "B2B — Dumas Distribuciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={lato.className}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
