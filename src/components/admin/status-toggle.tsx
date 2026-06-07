"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  /**
   * Async callback to persist the new value. Throw inside to trigger a
   * revert + error toast. Resolve normally to mark success.
   */
  onToggle: (next: boolean) => Promise<void>;
  ariaLabel: string;
  className?: string;
}

/**
 * Optimistic boolean toggle for admin tables — flips immediately, fires the
 * server action, and reverts on error. Disabled during the in-flight request
 * so rapid clicks don't race.
 */
export function StatusToggle({ checked, onToggle, ariaLabel, className }: Props) {
  const t = useTranslations("Admin.status");
  const [internal, setInternal] = useState(checked);
  const [loading, setLoading] = useState(false);

  // Re-sync with prop when parent refreshes (e.g. after router.refresh()).
  useEffect(() => {
    setInternal(checked);
  }, [checked]);

  const handle = async (next: boolean) => {
    const prev = internal;
    setInternal(next);
    setLoading(true);
    try {
      await onToggle(next);
      toast.success(t("toggleSaved"));
    } catch (err) {
      setInternal(prev);
      toast.error(err instanceof Error ? err.message : t("toggleFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Switch
        checked={internal}
        onCheckedChange={handle}
        disabled={loading}
        aria-label={ariaLabel}
      />
      {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
    </span>
  );
}
