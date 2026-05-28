import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — ScorePilot" }] }),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a link to set a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm">
          <div className="mb-1 flex items-center gap-2 font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> Check your inbox
          </div>
          <p className="text-muted-foreground">If that email exists, a reset link is on its way.</p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@school.edu" required />
          </div>
          <Button type="submit" className="w-full shadow-soft">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
