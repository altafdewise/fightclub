import type { Metadata } from "next";
import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { BackgroundLightLines } from "@/components/Decor/BackgroundLightLines";

const inter = Inter({ subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "BRUTAL | Online coaching for all timezones",
  description: "BRUTAL offers structured online coaching with certified professionals—anywhere, anytime.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body className={inter.className} suppressHydrationWarning>
        <div className="relative min-h-screen">
          <BackgroundLightLines />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}

