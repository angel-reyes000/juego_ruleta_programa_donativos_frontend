import type { Metadata } from "next";
import { Cinzel, Poppins, Bungee } from "next/font/google";
import "./globals.css";
import "./styles.css";
import CasinoBackground from "@/components/casinoBackground";

// Títulos elegantes tipo casino clásico.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

// Texto general legible en pantallas pequeñas.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Letrero de marquesina para botones, números y etiquetas.
const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "5 y Gana | Programa de donativos",
  description: "Dona, participa en la ruleta de 5 rondas y gana grandes premios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className={`${cinzel.variable} ${poppins.variable} ${bungee.variable} casino_body min-h-full flex flex-col`}>
        <CasinoBackground />
        {children}
      </body>
    </html>
  );
}
