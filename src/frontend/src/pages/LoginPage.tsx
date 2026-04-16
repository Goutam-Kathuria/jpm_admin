import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getDefaultAdminApiBaseUrl } from "@/lib/adminApi";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to sign in.";
}

export function LoginPage() {
  const login = useAdminAuthStore((state) => state.login);
  const authStatus = useAdminAuthStore((state) => state.status);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const isSubmitting = authStatus === "signing-in";
  const helperBaseUrl = useMemo(() => getDefaultAdminApiBaseUrl(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await login(form);
      toast.success("Signed in successfully");
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(196,156,84,0.18),_transparent_40%),linear-gradient(180deg,_rgba(250,246,239,0.98),_rgba(245,238,228,0.92))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden rounded-[2rem] border border-border/60 bg-card/70 p-10 shadow-subtle backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/80">
                  JPM Admin
                </p>
                <h1 className="max-w-lg font-display text-4xl font-semibold leading-tight text-foreground">
                  Manage your dashboard with admin credentials.
                </h1>
              </div>
            </div>
          </section>

          <Card className="border-border/70 bg-card/90 py-0 shadow-elevated backdrop-blur">
            <CardHeader className="space-y-3 border-b border-border/70 py-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="font-display text-2xl text-foreground">
                  Admin Login
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="py-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {errorMessage && (
                  <Alert variant="destructive">
                    <KeyRound />
                    <AlertTitle>Sign-in failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        email: event.target.value,
                      }))
                    }
                    placeholder="admin@example.com"
                    data-ocid="login-email-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Enter your password"
                      className="pr-10"
                      data-ocid="login-password-input"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() =>
                        setShowPassword((currentValue) => !currentValue)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      data-ocid="toggle-login-password-visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                  data-ocid="login-submit"
                >
                  <LogIn className="h-4 w-4" />
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
