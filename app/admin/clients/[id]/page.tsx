import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getClientDetail } from "@/lib/admin";
import { ClientDetail } from "@/components/admin/ClientDetail";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const client = await getClientDetail(id);

  if (!client) {
    notFound();
  }

  return (
    <section className="section-space py-16">
      <ClientDetail client={client} />
    </section>
  );
}
