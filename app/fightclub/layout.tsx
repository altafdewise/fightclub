import type { Metadata } from "next";
import { FIGHTCLUB } from "@/lib/fightclub/config";

export const metadata: Metadata = {
  title: "Fight Club, Season One, Series Two | BRUTAL",
  description: `Fight Club ${FIGHTCLUB.season}. Amateur boxing at ${FIGHTCLUB.venue}. ${FIGHTCLUB.date}, ${FIGHTCLUB.time}. Scored by judges under BFI rules.`,
};

// Series Two styling is scoped to this route group via the `.fc2` class —
// the darker tokens in globals.css only apply inside this wrapper, so the
// main brutal.fit site is untouched.
export default function FightClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fc2">
      <div className="fc-bg" aria-hidden="true" />
      {children}
    </div>
  );
}
