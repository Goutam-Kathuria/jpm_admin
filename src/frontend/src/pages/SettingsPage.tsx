import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Mail, Phone, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminSettings {
  inquiryEmail: string;
  contactNumbers: string;
  adminUsername: string;
  adminPassword: string;
}

interface FormErrors {
  inquiryEmail?: string;
  adminUsername?: string;
  adminPassword?: string;
}

const SETTINGS_KEY = "adminSettings";

function getDefaultSettings(): AdminSettings {
  return {
    inquiryEmail: "",
    contactNumbers: "",
    adminUsername: "",
    adminPassword: "",
  };
}

function loadAdminSettings(): AdminSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...getDefaultSettings(), ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return getDefaultSettings();
}

export function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(getDefaultSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setSettings(loadAdminSettings());
  }, []);

  function setField<K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K],
  ) {
    setSettings((s) => ({ ...s, [key]: value }));
    // Clear error when user types
    if (key in errors) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!settings.inquiryEmail.trim()) {
      newErrors.inquiryEmail = "Inquiry email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.inquiryEmail)) {
      newErrors.inquiryEmail = "Please enter a valid email address.";
    }
    if (!settings.adminUsername.trim()) {
      newErrors.adminUsername = "Admin username is required.";
    }
    if (!settings.adminPassword.trim()) {
      newErrors.adminPassword = "Admin password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function saveAdminSettings() {
    if (!validate()) return;
    // TODO: connect API here
    const toStore: AdminSettings = { ...settings, adminPassword: "" };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toStore));
    toast.success("Settings saved successfully");
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Configure your admin panel" />

      <div className="space-y-8">
        {/* Contact Information */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-subtle space-y-5">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Contact Information
          </h3>
          <Separator />

          {/* Inquiry Email */}
          <div>
            <Label htmlFor="inquiry-email">
              Inquiry Email
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="inquiry-email"
              type="email"
              value={settings.inquiryEmail}
              onChange={(e) => setField("inquiryEmail", e.target.value)}
              className={`mt-1 ${errors.inquiryEmail ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
              placeholder="inquiries@yoursite.com"
              data-ocid="settings-email-input"
            />
            {errors.inquiryEmail && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.inquiryEmail}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              All contact form submissions will be forwarded to this address.
            </p>
          </div>

          {/* Contact Numbers */}
          <div>
            <Label
              htmlFor="contact-numbers"
              className="flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3" />
              Contact Numbers
            </Label>
            <Input
              id="contact-numbers"
              type="text"
              value={settings.contactNumbers}
              onChange={(e) => setField("contactNumbers", e.target.value)}
              className="mt-1"
              placeholder="+1 234 567 8900"
              data-ocid="settings-phone-input"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Separate multiple numbers with a comma.
            </p>
          </div>
        </section>

        {/* Admin Credentials */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-subtle space-y-5">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Admin Credentials
          </h3>
          <Separator />

          {/* Admin Username */}
          <div>
            <Label htmlFor="admin-username">
              Admin Username
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="admin-username"
              value={settings.adminUsername}
              onChange={(e) => setField("adminUsername", e.target.value)}
              className={`mt-1 ${errors.adminUsername ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
              placeholder="admin"
              data-ocid="settings-username-input"
            />
            {errors.adminUsername && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.adminUsername}
              </p>
            )}
          </div>

          {/* Admin Password */}
          <div>
            <Label
              htmlFor="admin-password"
              className="flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              Admin Password
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={settings.adminPassword}
                onChange={(e) => setField("adminPassword", e.target.value)}
                className={`pr-10 ${errors.adminPassword ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                placeholder="Enter password"
                data-ocid="settings-password-input"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                data-ocid="toggle-password-visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.adminPassword && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.adminPassword}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              For UI demonstration only — password is not stored.
            </p>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end pb-8">
          <Button
            onClick={saveAdminSettings}
            size="lg"
            className="gap-2"
            data-ocid="save-settings"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
