import { enquiriesForNursery, nurseryStats } from "@/lib/catalog";
import { currentNursery, CURRENT_NURSERY_ID } from "@/lib/session";
import { PageHead, StatCard } from "@/components/dash/Shell";
import { EnquiryInbox, type InboxItem } from "@/components/dash/EnquiryInbox";

export default function EnquiriesPage() {
  const nursery = currentNursery();
  const stats = nurseryStats(CURRENT_NURSERY_ID);

  const items: InboxItem[] = enquiriesForNursery(CURRENT_NURSERY_ID).map((e) => ({
    id: e.id,
    customerName: e.customerName,
    customerCity: e.customerCity,
    quantity: e.quantity,
    message: e.message,
    channel: e.channel,
    status: e.status,
    receivedAt: e.receivedAt,
    plantName: e.plant.commonName,
    plantSlug: e.plant.slug,
    plantPhoto: e.plant.photo,
  }));

  const conversion =
    stats.enquiries > 0 ? Math.round((stats.converted / stats.enquiries) * 100) : 0;

  return (
    <div className="p-5 sm:p-8">
      <PageHead
        title="Enquiries"
        blurb="Buyers who found your listing and want to talk. This is what your subscription actually buys — we route the lead, you close the sale and keep all of it."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting reply"
          value={String(stats.newEnquiries)}
          sub="Reply within 4 hours where you can"
          tone={stats.newEnquiries > 0 ? "warn" : "good"}
        />
        <StatCard label="Total received" value={String(stats.enquiries)} />
        <StatCard label="Converted" value={String(stats.converted)} tone="good" />
        <StatCard
          label="Conversion rate"
          value={`${conversion}%`}
          sub={`Across ${stats.enquiries} enquiries at ${nursery.name}`}
        />
      </div>

      <div className="mt-8">
        <EnquiryInbox items={items} whatsapp={nursery.whatsapp} />
      </div>
    </div>
  );
}
