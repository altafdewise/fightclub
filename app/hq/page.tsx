import { requireHQ } from "@/lib/auth";
import { getClientsWithStats, getTrainerCount, getTrainersWithStats } from "@/lib/admin";
import { HQDashboard } from "@/components/admin/HQDashboard";

export default async function HQPage() {
  await requireHQ();
  const clients = await getClientsWithStats();
  const trainersCount = await getTrainerCount();
  const trainers = await getTrainersWithStats();

  return (
    <>
      <section className="section-space py-16">
        <HQDashboard
          initialClients={clients}
          initialTrainerCount={trainersCount}
          initialTrainers={trainers}
        />
      </section>
    </>
  );
}
