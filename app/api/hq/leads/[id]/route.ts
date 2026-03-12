import { NextResponse } from "next/server";
import { requireHQ } from "@/lib/auth";
import { type PricingLeadStatus, updatePricingLeadStatus } from "@/lib/pricingLeads";

const validStatuses: PricingLeadStatus[] = ["new", "contacted", "paid"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireHQ();

  try {
    const { id } = await params;
    const body = await req.json();
    const status = body?.status as PricingLeadStatus;

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    const updated = await updatePricingLeadStatus(id, status);
    if (!updated) {
      return NextResponse.json({ message: "Lead not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to update lead." }, { status: 500 });
  }
}
