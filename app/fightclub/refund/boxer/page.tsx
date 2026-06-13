import type { Metadata } from "next";
import { RefundForm } from "@/components/fightclub/RefundForm";

// Standalone, unlinked page. Share this URL directly with boxers requesting
// a refund: /fightclub/refund/boxer
export const metadata: Metadata = {
  title: "Boxer Refund Request | Fight Club",
  robots: { index: false, follow: false },
};

export default function BoxerRefundPage() {
  return <RefundForm type="boxer" />;
}
