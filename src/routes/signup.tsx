import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — ScorePilot" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }

    toast.success("Account created", { description: "You can start logging mistakes." });
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking mistakes in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" placeholder="Alex Chen" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@school.edu" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full shadow-soft" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
