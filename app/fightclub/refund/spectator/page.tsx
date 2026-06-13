import type { Metadata } from "next";
import { RefundForm } from "@/components/fightclub/RefundForm";

// Standalone, unlinked page. Share this URL directly with spectators
// requesting a refund: /fightclub/refund/spectator
export const metadata: Metadata = {
  title: "Spectator Refund Request | Fight Club",
  robots: { index: false, follow: false },
};

export default function SpectatorRefundPage() {
  return <RefundForm type="viewer" />;
}
