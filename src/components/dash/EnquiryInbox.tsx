"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, Globe, ArrowUpRight, Inbox } from "lucide-react";
import type { Enquiry } from "@/lib/types";
import { photoUrl } from "@/lib/data/media";
import { cn, formatDate, relativeDays } from "@/lib/utils";
import { Badge, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export interface InboxItem {
  id: string;
  customerName: string;
  customerCity: string;
  quantity: number;
  message: string;
  channel: Enquiry["channel"];
  status: Enquiry["status"];
  receivedAt: string;
  plantName: string;
  plantSlug: string;
  plantPhoto: number;
}

const TABS: { value: Enquiry["status"] | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "responded", label: "Responded" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

const CHANNEL_ICON = { web: Globe, whatsapp: MessageCircle, phone: Phone } as const;

/**
 * Two-pane inbox: list on the left, thread on the right. Status changes
 * are local state — a real build would PATCH and revalidate.
 */
export function EnquiryInbox({
  items,
  whatsapp,
}: {
  items: InboxItem[];
  whatsapp: string;
}) {
  const [tab, setTab] = useState<Enquiry["status"] | "all">("all");
  const [statuses, setStatuses] = useState<Record<string, Enquiry["status"]>>({});
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [reply, setReply] = useState("");

  const statusOf = (item: InboxItem) => statuses[item.id] ?? item.status;

  const visible = useMemo(
    () => items.filter((i) => tab === "all" || statusOf(i) === tab),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, tab, statuses],
  );

  const active = items.find((i) => i.id === activeId) ?? null;

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: items.length };
    items.forEach((i) => {
      const s = statusOf(i);
      acc[s] = (acc[s] ?? 0) + 1;
    });
    return acc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, statuses]);

  const setStatus = (id: string, status: Enquiry["status"]) =>
    setStatuses((prev) => ({ ...prev, [id]: status }));

  return (
    <div>
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            aria-pressed={tab === t.value}
            className={cn(
              "relative px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors",
              tab === t.value ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
            {counts[t.value] !== undefined && (
              <span className="tabular ml-1.5 text-ink-faint">{counts[t.value]}</span>
            )}
            {tab === t.value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" aria-hidden />
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 pt-6 lg:grid-cols-[22rem_1fr]">
        {/* ------------------------------------------------------ list */}
        <ul className="divide-y divide-line border border-line bg-surface">
          {visible.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-14 text-center">
              <Inbox className="size-6 text-ink-faint" strokeWidth={1.25} aria-hidden />
              <p className="text-sm text-ink-muted">Nothing in {tab}.</p>
            </li>
          )}
          {visible.map((item) => {
            const status = statusOf(item);
            const Icon = CHANNEL_ICON[item.channel];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(item.id);
                    setReply("");
                  }}
                  aria-current={activeId === item.id ? "true" : undefined}
                  className={cn(
                    "flex w-full gap-3 p-4 text-left transition-colors",
                    activeId === item.id ? "bg-sunken" : "hover:bg-sunken/55",
                  )}
                >
                  <div className="photo-well relative size-11 shrink-0 overflow-hidden">
                    <Image
                      src={photoUrl(item.plantPhoto, 110)}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{item.customerName}</p>
                      <span className="shrink-0 text-[10px] whitespace-nowrap text-ink-faint">
                        {relativeDays(item.receivedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {item.plantName} × {item.quantity}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        tone={
                          status === "new"
                            ? "gold"
                            : status === "converted"
                              ? "leaf"
                              : "neutral"
                        }
                      >
                        {status}
                      </Badge>
                      <Icon
                        className="size-3 shrink-0 text-ink-faint"
                        strokeWidth={1.5}
                        aria-label={item.channel}
                      />
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ---------------------------------------------------- thread */}
        {active ? (
          <div className="border border-line bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <h2 className="font-display text-xl">{active.customerName}</h2>
                <p className="mt-1 text-xs text-ink-muted">
                  {active.customerCity} · via {active.channel} ·{" "}
                  {formatDate(active.receivedAt)}
                </p>
              </div>
              <Badge
                tone={
                  statusOf(active) === "new"
                    ? "gold"
                    : statusOf(active) === "converted"
                      ? "leaf"
                      : "neutral"
                }
              >
                {statusOf(active)}
              </Badge>
            </div>

            <div className="border-b border-line p-5">
              <p className="eyebrow mb-3 text-ink-faint">Asking about</p>
              <div className="flex items-center gap-3">
                <div className="photo-well relative size-14 shrink-0 overflow-hidden">
                  <Image
                    src={photoUrl(active.plantPhoto, 140)}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/plants/${active.plantSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                  >
                    {active.plantName}
                    <ArrowUpRight className="size-3 shrink-0" strokeWidth={1.5} />
                  </Link>
                  <p className="tabular mt-0.5 text-sm text-ink-muted">
                    Quantity: {active.quantity}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-line p-5">
              <p className="eyebrow mb-3 text-ink-faint">Their message</p>
              <blockquote className="border-l-2 border-line-strong pl-4 text-sm leading-relaxed text-ink-muted">
                {active.message}
              </blockquote>
            </div>

            <div className="p-5">
              <p className="eyebrow mb-3 text-ink-faint">Reply</p>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                placeholder={`Hi ${active.customerName.split(" ")[0]}, yes we have it — `}
                aria-label="Reply message"
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => setStatus(active.id, "responded")}
                  disabled={!reply.trim()}
                >
                  Send reply
                </Button>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-11 items-center gap-2 border border-line px-5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted transition-all duration-150 hover:-translate-y-px hover:border-leaf hover:text-leaf"
                >
                  <MessageCircle className="size-3.5" strokeWidth={1.5} />
                  WhatsApp
                </a>

                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(active.id, "converted")}
                    className="h-11 border border-leaf/40 px-4 text-[11px] font-medium uppercase tracking-[0.1em] text-leaf transition-colors hover:bg-leaf-soft"
                  >
                    Mark sold
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(active.id, "closed")}
                    className="h-11 border border-line px-4 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    Close
                  </button>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                Marking an enquiry sold helps us show you which listings actually earn
                their place. It has no effect on billing — there is no commission.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border border-dashed border-line-strong bg-surface p-14">
            <p className="text-sm text-ink-muted">Select an enquiry to read it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
