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
import { type Inquiry, mockInquiries } from "@/data/mockData";
import { Eye, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [viewing, setViewing] = useState<Inquiry | null>(null);

  function handleDelete(id: string) {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    toast.success("Inquiry deleted");
  }

  return (
    <div>
      <PageHeader title="Inquiries" subtitle="Manage customer inquiries" />

      <div
        className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden"
        data-ocid="inquiries-table"
      >
        {inquiries.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center px-6"
            data-ocid="inquiries-empty"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display text-lg text-foreground mb-1">
              No inquiries yet
            </p>
            <p className="text-sm text-muted-foreground">
              New customer inquiries will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[160px]">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell w-[140px]">
                    Phone
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Message
                  </TableHead>
                  <TableHead className="hidden sm:table-cell w-[110px]">
                    Date
                  </TableHead>
                  <TableHead className="text-right w-[130px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq) => (
                  <TableRow key={inq.id} data-ocid="inquiry-row">
                    <TableCell className="font-medium text-foreground">
                      {inq.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {inq.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {inq.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell max-w-[280px]">
                      <span title={inq.message}>
                        {truncate(inq.message, 60)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {inq.date}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
                          asChild
                          data-ocid="whatsapp-reply"
                        >
                          <a
                            href={`https://wa.me/${inq.phone.replace(/\D/g, "")}?text=Hello+${encodeURIComponent(inq.name)},+thank+you+for+your+inquiry.+We+would+like+to+assist+you+further.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Reply via WhatsApp"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDelete(inq.id)}
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

      {/* View Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Inquiry from ${viewing.name}` : "Inquiry Details"}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${viewing?.email}?subject=Re: Your Inquiry`}>
                <Mail className="w-4 h-4 mr-1.5" />
                Email
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://wa.me/${viewing?.phone.replace(/\D/g, "")}?text=Hello+${encodeURIComponent(viewing?.name ?? "")},+thank+you+for+your+inquiry.+We+would+like+to+assist+you+further.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="w-4 h-4 mr-1.5" />
                WhatsApp
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewing(null)}
              data-ocid="modal-close"
            >
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
                { label: "Email", value: viewing.email },
                { label: "Phone", value: viewing.phone },
                { label: "Date", value: viewing.date },
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
