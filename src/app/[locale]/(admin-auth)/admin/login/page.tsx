"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  );
}

function LoginCard() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      toast.error(t("loginError"));
      return;
    }
    router.replace(fromPath ?? `/${locale}/admin`);
    router.refresh();
  };

  return (
    <div
      className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #1d1a57 0%, #0e0a2f 55%, #3c526d 100%)",
      }}
    >
      {/* Dot-grid overlay */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-white/5.5"
      >
        <defs>
          <pattern id="login-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-dot-grid)" />
      </svg>

      {/* Diagonal hatching — top-right */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -top-8 right-0 -z-10 h-72 w-72 text-white/[0.07]"
      >
        <g stroke="currentColor" strokeWidth="1.5">
          <line x1="0" y1="40" x2="200" y2="-160" />
          <line x1="0" y1="80" x2="200" y2="-120" />
          <line x1="0" y1="120" x2="200" y2="-80" />
          <line x1="0" y1="160" x2="200" y2="-40" />
          <line x1="0" y1="200" x2="200" y2="0" />
          <line x1="40" y1="200" x2="200" y2="40" />
          <line x1="80" y1="200" x2="200" y2="80" />
        </g>
      </svg>

      {/* Diagonal hatching — bottom-left */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -bottom-8 -left-8 -z-10 h-64 w-64 rotate-180 text-white/5"
      >
        <g stroke="currentColor" strokeWidth="1.5">
          <line x1="0" y1="40" x2="200" y2="-160" />
          <line x1="0" y1="80" x2="200" y2="-120" />
          <line x1="0" y1="120" x2="200" y2="-80" />
          <line x1="0" y1="160" x2="200" y2="-40" />
          <line x1="0" y1="200" x2="200" y2="0" />
        </g>
      </svg>

      {/* Brand-accent vertical bar — left edge */}
      <span className="absolute bottom-16 left-0 h-32 w-1 bg-[#9f1211]" />
      {/* Brand-accent vertical bar — right edge, offset */}
      <span className="absolute top-20 right-0 h-20 w-1 bg-[#9f1211]/50" />

      {/* ── Content ── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">

        {/* Logo + eyebrow */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo variant="on-dark" className="h-11" />
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#9f1211]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Admin Portal
            </span>
            <span className="h-px w-8 bg-[#9f1211]" />
          </div>
        </div>

        {/* Glass card */}
        <div className="w-full rounded-xl border border-white/10 bg-white/7 p-7 shadow-2xl backdrop-blur-sm sm:p-8">
          {/* Card heading */}
          <div className="mb-6 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              {t("signInTitle")}
            </h1>
            <p className="text-sm text-white/50">{t("signInSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70">
                {t("email")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  className="border-white/10 bg-white/8 pl-9 text-white placeholder:text-white/25 focus-visible:border-white/30 focus-visible:ring-white/10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70">
                {t("password")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="border-white/10 bg-white/8 pl-9 text-white placeholder:text-white/25 focus-visible:border-white/30 focus-visible:ring-white/10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-[#9f1211] text-white hover:bg-[#b91c1b] focus-visible:ring-[#9f1211]/50"
              size="lg"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("login")}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/30">
          PT Duta Firza &mdash; Internal Management System
        </p>
      </div>
    </div>
  );
}
