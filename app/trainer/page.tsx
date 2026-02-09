import TrainerCheckinsPage from "./checkins/page";
import { FloatingChatButton } from "@/components/FloatingChatButton";

export default async function TrainerHomePage() {
  return (
    <>
      {/* Trainer home reuses checkins dashboard */}
      <TrainerCheckinsPage />
      <FloatingChatButton role="trainer" />
    </>
  );
}
