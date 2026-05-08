import { PageHeader } from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  addSetting,
  editSetting,
  getSettings,
  type SaveSettingInput,
  type Setting,
} from "@/lib/settingsApi";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Twitter,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminSettings {
  displayName: string;
  inquiryEmail: string;
  contactNumbers: string;
  address: string;
  adminEmail: string;
  adminPassword: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
}

interface FormErrors {
  inquiryEmail?: string;
  adminEmail?: string;
  adminPassword?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
}

const settingsQueryKey = ["admin", "settings"];

function getDefaultSettings(): AdminSettings {
  return {
    displayName: "",
    inquiryEmail: "",
    contactNumbers: "",
    address: "",
    adminEmail: "",
    adminPassword: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
  };
}

function mapSettingToForm(setting: Setting | null): AdminSettings {
  if (!setting) {
    return getDefaultSettings();
  }

  return {
    displayName: setting.displayName ?? "Admin",
    inquiryEmail: setting.enquiryEmail ?? "",
    contactNumbers: setting.enquiryPhone ?? "",
    address: setting.address ?? "",
    adminEmail: setting.email ?? "",
    adminPassword: "",
    facebookUrl: setting.facebookUrl ?? "",
    instagramUrl: setting.instagramUrl ?? "",
    twitterUrl: setting.twitterUrl ?? "",
    linkedinUrl: setting.linkedinUrl ?? "",
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const syncSessionProfile = useAdminAuthStore(
    (state) => state.syncSessionProfile,
  );
  const [settings, setSettings] = useState<AdminSettings>(getDefaultSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const settingsQuery = useQuery({
    queryKey: settingsQueryKey,
    queryFn: getSettings,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: string;
      input: SaveSettingInput;
    }) => {
      if (id) {
        return editSetting(id, input);
      }

      return addSetting(input);
    },
    onSuccess: async (savedSetting, variables) => {
      if (savedSetting) {
        syncSessionProfile({
          email: savedSetting.email,
          displayName: savedSetting.displayName || savedSetting.email,
        });
        setSettings(mapSettingToForm(savedSetting));
      } else {
        setSettings((currentSettings) => ({
          ...currentSettings,
          adminPassword: "",
        }));
      }

      setErrors({});
      setShowPassword(false);
      await queryClient.invalidateQueries({ queryKey: settingsQueryKey });
      toast.success(
        variables.id
          ? "Settings updated successfully"
          : "Settings saved successfully",
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const currentSetting = settingsQuery.data ?? null;
  const requiresPassword = !currentSetting || !currentSetting.hasPassword;
  const isSaving = saveSettingsMutation.isPending;

  useEffect(() => {
    if (settingsQuery.data !== undefined) {
      setSettings(mapSettingToForm(settingsQuery.data));
      setErrors({});
      setShowPassword(false);
    }
  }, [settingsQuery.data]);

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

    if (!settings.adminEmail.trim()) {
      newErrors.adminEmail = "Admin email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email address.";
    }

    if (requiresPassword && !settings.adminPassword.trim()) {
      newErrors.adminPassword = "Admin password is required.";
    }

    if (settings.facebookUrl.trim() && !isValidUrl(settings.facebookUrl.trim())) {
      newErrors.facebookUrl = "Please enter a valid Facebook URL.";
    }

    if (
      settings.instagramUrl.trim() &&
      !isValidUrl(settings.instagramUrl.trim())
    ) {
      newErrors.instagramUrl = "Please enter a valid Instagram URL.";
    }

    if (settings.twitterUrl.trim() && !isValidUrl(settings.twitterUrl.trim())) {
      newErrors.twitterUrl = "Please enter a valid Twitter/X URL.";
    }

    if (settings.linkedinUrl.trim() && !isValidUrl(settings.linkedinUrl.trim())) {
      newErrors.linkedinUrl = "Please enter a valid LinkedIn URL.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function saveAdminSettings() {
    if (!validate()) return;

    const input: SaveSettingInput = {
      email: settings.adminEmail.trim(),
      displayName: settings.displayName.trim() || "Admin",
      enquiryEmail: settings.inquiryEmail.trim(),
      enquiryPhone: settings.contactNumbers.trim(),
      address: settings.address.trim(),
      facebookUrl: settings.facebookUrl.trim(),
      instagramUrl: settings.instagramUrl.trim(),
      twitterUrl: settings.twitterUrl.trim(),
      linkedinUrl: settings.linkedinUrl.trim(),
    };

    const password = settings.adminPassword.trim();
    if (password) {
      input.password = password;
    }

    saveSettingsMutation.mutate({
      id: currentSetting?._id,
      input,
    });
  }

  if (settingsQuery.isLoading) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Settings" subtitle="Configure your admin panel" />
        <div className="rounded-xl border border-border bg-card p-6 shadow-subtle">
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Settings" subtitle="Configure your admin panel" />
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-subtle">
          <p className="text-sm text-destructive">
            {getErrorMessage(settingsQuery.error)}
          </p>
          <Button
            variant="outline"
            onClick={() => settingsQuery.refetch()}
            data-ocid="retry-settings"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Configure your admin panel" />

      <div className="space-y-8">
        {/* Contact Information */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-subtle space-y-5">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Contact Information
          </h3>
          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
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
          </div>

          <div>
            <Label
              htmlFor="address"
              className="flex items-center gap-1.5"
            >
              <MapPin className="w-3 h-3" />
              Address
            </Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setField("address", e.target.value)}
              className="mt-1 min-h-24"
              placeholder="Enter business or office address"
              data-ocid="settings-address-input"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This can be used across the website contact and footer sections.
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

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={settings.displayName}
                onChange={(e) => setField("displayName", e.target.value)}
                className="mt-1"
                placeholder="Admin"
                data-ocid="settings-display-name-input"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Used in the admin navbar and session profile.
              </p>
            </div>

            <div>
              <Label htmlFor="admin-email">
                Admin Email
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setField("adminEmail", e.target.value)}
                className={`mt-1 ${errors.adminEmail ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                placeholder="admin@example.com"
                data-ocid="settings-admin-email-input"
              />
              {errors.adminEmail && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.adminEmail}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="admin-password"
              className="flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              Admin Password
              {requiresPassword && (
                <span className="text-destructive ml-0.5">*</span>
              )}
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
              {requiresPassword
                ? "Set the password used for admin login."
                : "Leave blank to keep the current password unchanged."}
            </p>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-6 shadow-subtle space-y-5">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Social Media Links
          </h3>
          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label
                htmlFor="facebook-url"
                className="flex items-center gap-1.5"
              >
                <Facebook className="w-3 h-3" />
                Facebook URL
              </Label>
              <Input
                id="facebook-url"
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => setField("facebookUrl", e.target.value)}
                className={`mt-1 ${errors.facebookUrl ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                placeholder="https://facebook.com/your-page"
                data-ocid="settings-facebook-url-input"
              />
              {errors.facebookUrl && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.facebookUrl}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="instagram-url"
                className="flex items-center gap-1.5"
              >
                <Instagram className="w-3 h-3" />
                Instagram URL
              </Label>
              <Input
                id="instagram-url"
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => setField("instagramUrl", e.target.value)}
                className={`mt-1 ${errors.instagramUrl ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                placeholder="https://instagram.com/your-profile"
                data-ocid="settings-instagram-url-input"
              />
              {errors.instagramUrl && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.instagramUrl}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="twitter-url"
                className="flex items-center gap-1.5"
              >
                <Twitter className="w-3 h-3" />
                Twitter / X URL
              </Label>
              <Input
                id="twitter-url"
                type="url"
                value={settings.twitterUrl}
                onChange={(e) => setField("twitterUrl", e.target.value)}
                className={`mt-1 ${errors.twitterUrl ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                placeholder="https://x.com/your-profile"
                data-ocid="settings-twitter-url-input"
              />
              {errors.twitterUrl && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.twitterUrl}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="linkedin-url"
                className="flex items-center gap-1.5"
              >
                <Linkedin className="w-3 h-3" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin-url"
                type="url"
                value={settings.linkedinUrl}
                onChange={(e) => setField("linkedinUrl", e.target.value)}
                className={`mt-1 ${errors.linkedinUrl ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                placeholder="https://linkedin.com/company/your-brand"
                data-ocid="settings-linkedin-url-input"
              />
              {errors.linkedinUrl && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.linkedinUrl}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end pb-8">
          <Button
            onClick={saveAdminSettings}
            size="lg"
            className="gap-2"
            disabled={isSaving}
            data-ocid="save-settings"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
