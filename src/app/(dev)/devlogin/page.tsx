import { Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DevLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function DevLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const expired = sp.reason === "expired";

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/10">
            <Terminal className="h-5 w-5" />
          </div>
          <CardTitle>Dev Console</CardTitle>
          <CardDescription>
            Area internal (dokumentasi &amp; monitoring). Masukkan password untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DevLoginForm from={from} expired={expired} />
        </CardContent>
      </Card>
    </div>
  );
}
