import type { Metadata } from "next";
import "./globals.css";
import { BackgroundLightLines } from "@/components/Decor/BackgroundLightLines";
import { WebsiteAssistant } from "@/components/WebsiteAssistant";

export const metadata: Metadata = {
  title: "BRUTAL | Online coaching for all timezones",
  description: "BRUTAL offers structured online coaching with certified professionals, anywhere and anytime.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="relative min-h-screen">
          <BackgroundLightLines />
          <div className="relative z-10">{children}</div>
          <WebsiteAssistant />
        </div>
      </body>
    </html>
  );
}
