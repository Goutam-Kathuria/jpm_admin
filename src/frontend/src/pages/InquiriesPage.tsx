import { Modal } from "@/components/ui-custom/Modal";
import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteInquiry, fetchInquiries, type InquiryRecord } from "@/lib/inquiriesApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatInquiryDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

const inquiriesQueryKey = ["admin", "inquiries"] as const;

export function InquiriesPage() {
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<InquiryRecord | null>(null);

  const inquiriesQuery = useQuery({
    queryKey: inquiriesQueryKey,
    queryFn: () => fetchInquiries(300),
    staleTime: 30 * 1000,
    refetchInterval: 45 * 1000,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteInquiry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inquiriesQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "summary"] });
      toast.success("Inquiry deleted.");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    },
  });

  const inquiries = inquiriesQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Inquiries"
        subtitle="Customer enquiries from the website contact form and custom-design flow."
      />

      <div
        className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden"
        data-ocid="inquiries-table"
      >
        {inquiriesQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading enquiries…
          </div>
        ) : inquiriesQuery.isError ? (
          <div className="py-16 px-6 text-center text-sm text-destructive">
            {inquiriesQuery.error instanceof Error
              ? inquiriesQuery.error.message
              : "Could not load enquiries."}
          </div>
        ) : inquiries.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center px-6"
            data-ocid="inquiries-empty"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display text-lg text-foreground mb-1">No inquiries yet</p>
            <p className="text-sm text-muted-foreground">
              New customer enquiries will appear here in near real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[140px]">Name</TableHead>
                  <TableHead className="hidden md:table-cell w-[100px]">Source</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell w-[130px]">Phone</TableHead>
                  <TableHead className="hidden xl:table-cell">Message</TableHead>
                  <TableHead className="hidden sm:table-cell w-[110px]">Date</TableHead>
                  <TableHead className="text-right w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq) => (
                  <TableRow key={inq.id} data-ocid="inquiry-row">
                    <TableCell className="font-medium text-foreground">{inq.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground capitalize">
                      {inq.source?.replace(/_/g, " ") || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {inq.email || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {inq.phone || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell max-w-[280px]">
                      <span title={inq.message}>{truncate(inq.message, 60)}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {formatInquiryDate(inq.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setViewing(inq)}
                          aria-label="View inquiry"
                          data-ocid="view-inquiry"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {inq.email ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                            asChild
                            data-ocid="email-reply"
                          >
                            <a
                              href={`mailto:${inq.email}?subject=Re: Your Inquiry`}
                              aria-label="Reply via email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : null}
                        {inq.phone ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                            asChild
                            data-ocid="whatsapp-reply"
                          >
                            <a
                              href={`https://wa.me/${inq.phone.replace(/\D/g, "")}?text=Hello+${encodeURIComponent(inq.name)},+thank+you+for+your+inquiry.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Reply via WhatsApp"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-destructive transition-colors"
                          disabled={removeMutation.isPending}
                          onClick={() => {
                            if (!window.confirm("Delete this enquiry permanently?")) return;
                            removeMutation.mutate(inq.id);
                          }}
                          aria-label="Delete inquiry"
                          data-ocid="delete-inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Inquiry from ${viewing.name}` : "Inquiry Details"}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-2">
            {viewing?.email ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${viewing.email}?subject=Re: Your Inquiry`}>
                  <Mail className="w-4 h-4 mr-1.5" />
                  Email
                </a>
              </Button>
            ) : null}
            {viewing?.phone ? (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://wa.me/${viewing.phone.replace(/\D/g, "")}?text=Hello+${encodeURIComponent(viewing.name ?? "")},+thank+you+for+your+inquiry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  WhatsApp
                </a>
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => setViewing(null)} data-ocid="modal-close">
              Close
            </Button>
          </div>
        }
      >
        {viewing && (
          <dl className="space-y-4">
            {(
              [
                { label: "Name", value: viewing.name },
                { label: "Source", value: viewing.source?.replace(/_/g, " ") ?? "—" },
                { label: "Email", value: viewing.email || "—" },
                { label: "Phone", value: viewing.phone || "—" },
                { label: "Date", value: formatInquiryDate(viewing.createdAt) },
              ] as const
            ).map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Message
              </dt>
              <dd className="mt-1 text-sm text-foreground leading-relaxed bg-muted/40 rounded-lg p-3 whitespace-pre-wrap">
                {viewing.message}
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
