import type { Metadata } from "next";
import { FIGHTCLUB } from "@/lib/fightclub/config";

export const metadata: Metadata = {
  title: "Fight Club — Season One, Series Two | BRUTAL",
  description: `No rules. Just fists. Fight Club ${FIGHTCLUB.season} — underground boxing at ${FIGHTCLUB.venue}. ${FIGHTCLUB.date}, ${FIGHTCLUB.time}. The crowd decides.`,
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
