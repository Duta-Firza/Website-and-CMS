"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface Props {
  fileUrl: string;
  title: string;
  viewLabel: string;
  downloadLabel: string;
}

export function ReportActions({ fileUrl, title, viewLabel, downloadLabel }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          {viewLabel}
        </Button>
        <a
          href={fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          {downloadLabel}
        </a>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[90vh] max-w-5xl p-0">
          <iframe
            src={`${fileUrl}#toolbar=0`}
            className="h-full w-full rounded-lg"
            title={title}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
