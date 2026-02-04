import { requireAdmin } from "@/lib/auth";
import { getClientsWithStats } from "@/lib/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const clients = await getClientsWithStats();

  return (
    <section className="section-space py-16">
      <AdminDashboard adminName={admin.username} initialClients={clients} />
    </section>
  );
}
