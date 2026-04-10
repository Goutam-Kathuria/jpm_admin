import { TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TableSkeleton } from "../components/ui-custom/LoadingSkeleton";
import { Modal } from "../components/ui-custom/Modal";
import { PageHeader } from "../components/ui-custom/PageHeader";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { type Inquiry, mockInquiries, mockStats } from "../data/mockData";

const chartData = [
  { month: "Jan", inquiries: 32 },
  { month: "Feb", inquiries: 45 },
  { month: "Mar", inquiries: 38 },
  { month: "Apr", inquiries: 67 },
  { month: "May", inquiries: 54 },
  { month: "Jun", inquiries: 71 },
];

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const recent = mockInquiries.slice(0, 5);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card
          className="border-border shadow-subtle hover:shadow-elevated transition-shadow duration-300"
          data-ocid="stat-card-visits"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Visits
              </CardTitle>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-semibold text-foreground">
              {mockStats.totalVisits.toLocaleString()}
            </p>
            <p className="mt-2 text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="font-semibold text-primary">+12.5%</span>
              <span className="text-muted-foreground">this month</span>
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle hover:shadow-elevated transition-shadow duration-300"
          data-ocid="stat-card-inquiries"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Inquiries
              </CardTitle>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-semibold text-foreground">
              {mockStats.totalInquiries.toLocaleString()}
            </p>
            <p className="mt-2 text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="font-semibold text-primary">+8.3%</span>
              <span className="text-muted-foreground">this month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Bar Chart */}
      <Card className="border-border shadow-subtle" data-ocid="inquiries-chart">
        <CardHeader>
          <CardTitle className="font-display text-base font-semibold text-foreground">
            Monthly Inquiries Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-elevated)",
                  color: "var(--foreground)",
                  fontSize: "13px",
                }}
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              />
              <Bar
                dataKey="inquiries"
                radius={[4, 4, 0, 0]}
                style={{ fill: "var(--primary)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Inquiries Table */}
      <Card
        className="border-border shadow-subtle"
        data-ocid="recent-inquiries"
      >
        <CardHeader>
          <CardTitle className="font-display text-base font-semibold text-foreground">
            Recent Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((inq) => (
                  <TableRow
                    key={inq.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      {inq.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {inq.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {inq.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px]">
                      <span className="truncate block">
                        {inq.message.length > 50
                          ? `${inq.message.slice(0, 50)}…`
                          : inq.message}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {inq.date}
                    </TableCell>
                    <TableCell className="text-right">
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

      {/* Inquiry Detail Modal */}
      <Modal
        open={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title="Inquiry Details"
        size="lg"
      >
        {selectedInquiry && (
          <div className="space-y-4 text-sm" data-ocid="inquiry-modal">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Name
                </p>
                <p className="text-foreground font-medium">
                  {selectedInquiry.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Date
                </p>
                <p className="text-foreground">{selectedInquiry.date}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-foreground">{selectedInquiry.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Phone
                </p>
                <p className="text-foreground">{selectedInquiry.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Message
              </p>
              <p className="text-foreground leading-relaxed bg-muted/40 rounded-lg p-3">
                {selectedInquiry.message}
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                asChild
                data-ocid="reply-email-btn"
              >
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: Your Inquiry&body=Dear ${selectedInquiry.name},%0D%0A%0D%0AThank you for reaching out.`}
                >
                  Reply via Email
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                data-ocid="reply-whatsapp-btn"
              >
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedInquiry.name)}%2C%20thank%20you%20for%20your%20inquiry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reply via WhatsApp
                </a>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
