import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — ScorePilot" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }

    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue improving."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@school.edu" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full shadow-soft" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
