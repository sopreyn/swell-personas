import type { Metadata } from "next";
import { Archivo, Newsreader } from "next/font/google";
import "./globals.css";

// Archivo is the UI face; Newsreader is the serif the persona speaks in.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Swell — Practice Room",
  description: "Practice hard conversations with an AI that plays a personality archetype.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
