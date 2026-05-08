import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fight Club Hyderabad — Season One | BRUTAL",
  description:
    "No rules. Just fists. Fight Club Hyderabad Season One — underground amateur boxing at B3 Underground Parking, Chaitanyapuri, Hyderabad. Sunday 6PM.",
};

export default function FightClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fightclub-bg" aria-hidden="true" />
      {children}
    </>
  );
}
