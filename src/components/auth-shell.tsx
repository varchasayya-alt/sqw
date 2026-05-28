import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-hero">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ScorePilot</span>
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-md p-7 shadow-elegant animate-fade-in">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </Card>
      </div>
    </div>
  );
}
