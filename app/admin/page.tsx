import { requireAdmin } from "@/lib/auth";
import { getClientsWithStats } from "@/lib/admin";
import { TrainerDashboard } from "@/components/admin/TrainerDashboard";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const clients = await getClientsWithStats(admin.id);

  return (
    <section className="section-space py-16">
      <TrainerDashboard trainerName={admin.username} initialClients={clients} />
    </section>
  );
}
