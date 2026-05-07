import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/lib/dashboardApi";
import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MousePointerClick, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDelta(delta: number | null) {
  if (delta === null || Number.isNaN(delta)) return { text: "—", up: true };
  const up = delta >= 0;
  return {
    text: `${up ? "+" : ""}${delta}%`,
    up,
  };
}

function formatRecentDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const dashboardQueryKey = ["admin", "dashboard", "summary"] as const;

export function DashboardPage() {
  const [selectedInquiry, setSelectedInquiry] = useState<
    DashboardSummary["recentInquiries"][0] | null
  >(null);

  const dashboardQuery = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardSummary,
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const summary = dashboardQuery.data;

  const visitDelta = formatDelta(summary?.visitsLastMonthDeltaPercent ?? null);
  const enquiryDelta = formatDelta(summary?.enquiriesLastMonthDeltaPercent ?? null);

  const chartRows =
    summary?.monthlyTrend?.map((row) => ({
      name: row.label,
      visits: row.visits,
      enquiries: row.enquiries,
    })) ?? [];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Dashboard"
        subtitle="Live metrics from website analytics and enquiries (refreshes every minute)."
      />

      {dashboardQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading dashboard…
        </div>
      ) : dashboardQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center text-sm text-destructive">
          {dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "Could not load dashboard."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card
              className="border-border shadow-subtle transition-shadow duration-300 hover:shadow-md"
              data-ocid="stat-card-visits"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total visits
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs leading-snug">
                      Session-based page pings from the marketing site (one per browser session).
                    </CardDescription>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <MousePointerClick className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-display text-4xl font-semibold tracking-tight text-foreground">
                  {(summary?.totalVisits ?? 0).toLocaleString()}
                </p>
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    This month
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-2xl font-semibold text-foreground">
                      {(summary?.visitsThisMonth ?? 0).toLocaleString()}
                    </span>
                    <span
                      className={
                        visitDelta.up
                          ? "inline-flex items-center gap-1 text-xs font-semibold text-primary"
                          : "inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-500"
                      }
                    >
                      {visitDelta.up ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {visitDelta.text} vs last month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-border shadow-subtle transition-shadow duration-300 hover:shadow-md"
              data-ocid="stat-card-inquiries"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total enquiries
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs leading-snug">
                      Contact form and custom-design submissions stored in the database.
                    </CardDescription>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-display text-4xl font-semibold tracking-tight text-foreground">
                  {(summary?.totalEnquiries ?? 0).toLocaleString()}
                </p>
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    This month
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-2xl font-semibold text-foreground">
                      {(summary?.enquiriesThisMonth ?? 0).toLocaleString()}
                    </span>
                    <span
                      className={
                        enquiryDelta.up
                          ? "inline-flex items-center gap-1 text-xs font-semibold text-primary"
                          : "inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-500"
                      }
                    >
                      {enquiryDelta.up ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {enquiryDelta.text} vs last month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-subtle overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-muted/20">
              <CardTitle className="font-display text-lg font-semibold text-foreground">
                Traffic & enquiries (rolling 6 months)
              </CardTitle>
              <CardDescription>
                Page-view sessions (gold) and submitted enquiries (foreground tone) by calendar
                month (UTC).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {chartRows.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No trend data yet — visits and enquiries will populate as traffic arrives.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={chartRows}
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        fontSize: "13px",
                      }}
                      cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 16 }}
                      formatter={(value) =>
                        value === "visits" ? "Visits (sessions)" : "Enquiries"
                      }
                    />
                    <Bar
                      dataKey="visits"
                      name="visits"
                      fill="oklch(0.65 0.12 75)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="enquiries"
                      name="enquiries"
                      fill="oklch(0.22 0.02 60)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-subtle" data-ocid="recent-inquiries">
            <CardHeader className="border-b border-border/60 bg-muted/15">
              <CardTitle className="font-display text-lg font-semibold text-foreground">
                Recent enquiries
              </CardTitle>
              <CardDescription>Latest submissions — click view for full message.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {!summary?.recentInquiries?.length ? (
                <p className="py-14 text-center text-sm text-muted-foreground">
                  No enquiries recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6">Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden xl:table-cell">Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.recentInquiries.map((inq) => (
                      <TableRow key={inq.id} className="hover:bg-muted/30">
                        <TableCell className="pl-6 font-medium text-foreground">
                          {inq.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {inq.email || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {inq.phone || "—"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell max-w-[220px] truncate text-muted-foreground">
                          {inq.message}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                          {formatRecentDate(inq.createdAt)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedInquiry(inq)}
                            data-ocid="view-inquiry-btn"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Modal
        open={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title="Inquiry details"
        size="lg"
      >
        {selectedInquiry && (
          <div className="space-y-4 text-sm" data-ocid="inquiry-modal">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Name
                </p>
                <p className="text-foreground font-medium">{selectedInquiry.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Date
                </p>
                <p className="text-foreground">{formatRecentDate(selectedInquiry.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Source
                </p>
                <p className="text-foreground capitalize">
                  {selectedInquiry.source?.replace(/_/g, " ") ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-foreground">{selectedInquiry.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Phone
                </p>
                <p className="text-foreground">{selectedInquiry.phone || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Message
              </p>
              <p className="text-foreground leading-relaxed bg-muted/40 rounded-lg p-3 whitespace-pre-wrap">
                {selectedInquiry.message}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedInquiry.email ? (
                <Button size="sm" variant="outline" asChild data-ocid="reply-email-btn">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: Your Inquiry&body=Dear ${selectedInquiry.name},%0D%0A%0D%0AThank you for reaching out.`}
                  >
                    Reply via email
                  </a>
                </Button>
              ) : null}
              {selectedInquiry.phone ? (
                <Button size="sm" variant="outline" asChild data-ocid="reply-whatsapp-btn">
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedInquiry.name)}%2C%20thank%20you%20for%20your%20enquiry.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reply via WhatsApp
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
