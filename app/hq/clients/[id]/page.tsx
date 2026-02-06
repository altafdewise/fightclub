import { notFound } from "next/navigation";
import { requireHQ } from "@/lib/auth";
import { getClientDetail } from "@/lib/admin";
import { ClientDetail } from "@/components/admin/ClientDetail";

export default async function HQClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireHQ();
  const { id } = await params;
  const client = await getClientDetail(id);

  if (!client) {
    notFound();
  }

  return (
    <section className="section-space py-16">
      <ClientDetail client={client} isHQ={true} />
    </section>
  );
}
