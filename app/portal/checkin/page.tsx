import { requireClient } from "@/lib/auth";
import { getLastCheckin } from "@/lib/checkins";
import { WeeklyCheckinForm } from "@/components/portal/WeeklyCheckinForm";

export default async function CheckinPage() {
  const client = await requireClient();
  const last = await getLastCheckin(client.id);

  return (
    <div className="mx-auto max-w-[720px] space-y-8 px-4 pb-12 pt-6">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold">Weekly Reflection</h1>
        <p className="text-base text-white/70">Tell your coach how this week actually went.</p>
        <div className="mx-auto mt-2 h-px w-14 rounded-full bg-white/10" />
      </div>

      <WeeklyCheckinForm lastDate={last?.created_at} />
    </div>
  );
}
