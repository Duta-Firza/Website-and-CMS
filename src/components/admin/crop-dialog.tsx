"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  src: string;
  mime: string;
  filename: string;
  aspectRatio: number;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
  /** Confirm without cropping — caller uploads the raw original. */
  onConfirmRaw?: () => void;
}

/**
 * Modal cropping UI built on react-easy-crop. The chosen rect is rendered to
 * a canvas and returned as a File matching the original mime + filename so
 * the upload pipeline downstream stays identical to the no-crop path.
 *
 * `minZoom` is set to 0.4 so users can zoom out below 1× and frame the entire
 * image inside the crop box — useful when source aspect differs strongly from
 * the target. The canvas output later clamps to image bounds, so transparent
 * letterbox is filled with a solid color matching the original mime.
 */
export function CropDialog({
  open,
  src,
  mime,
  filename,
  aspectRatio,
  onCancel,
  onConfirm,
  onConfirmRaw,
}: Props) {
  const t = useTranslations("Admin");
  const [cropEnabled, setCropEnabled] = useState(true);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_a: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  const apply = async () => {
    if (!cropEnabled) {
      if (onConfirmRaw) onConfirmRaw();
      return;
    }
    if (!areaPixels) return;
    setBusy(true);
    try {
      const file = await renderCrop(src, areaPixels, mime, filename);
      onConfirm(file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[95vw] sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>
            {cropEnabled ? t("cropDialog.titleCrop") : t("cropDialog.titlePreview")}
          </DialogTitle>
        </DialogHeader>
        <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-black/80">
          {cropEnabled ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              minZoom={0.4}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
              restrictPosition={false}
              showGrid={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {/* biome-ignore lint/performance/noImgElement: data URL preview, next/image not applicable */}
              <img src={src} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 rounded-md border bg-muted/30 px-3 py-2">
          <div className="flex shrink-0 items-center gap-2">
            <Switch
              id="crop-toggle"
              checked={cropEnabled}
              onCheckedChange={setCropEnabled}
              disabled={busy}
            />
            <Label htmlFor="crop-toggle" className="cursor-pointer text-xs font-medium">
              {t("cropDialog.toggleLabel")}
            </Label>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <Label
              htmlFor="crop-zoom"
              className={cn(
                "shrink-0 text-xs",
                cropEnabled ? "text-muted-foreground" : "text-muted-foreground/40",
              )}
            >
              {t("cropDialog.zoomLabel")}
            </Label>
            <input
              id="crop-zoom"
              type="range"
              min={0.4}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={!cropEnabled || busy}
              className="w-full accent-brand-accent disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="brand"
            onClick={apply}
            disabled={busy || (cropEnabled && !areaPixels)}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cropEnabled ? t("cropDialog.applyCrop") : t("cropDialog.uploadOriginal")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function renderCrop(src: string, area: Area, mime: string, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(area.width);
      canvas.height = Math.round(area.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      // Keep PNG for transparency, otherwise re-encode as JPEG for size.
      const outMime = mime === "image/png" ? "image/png" : "image/jpeg";
      // JPEG has no alpha — pre-fill with white so any letterbox area shows
      // clean instead of black.
      if (outMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // Place the full image on the canvas at an offset so the crop window
      // (in original-image pixel space) lines up with (0, 0). Anything
      // outside the image stays whatever colour the canvas was initialised
      // with — matching the on-screen white crop rectangle exactly.
      ctx.drawImage(img, -area.x, -area.y);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Blob conversion failed"));
            return;
          }
          resolve(new File([blob], filename, { type: outMime }));
        },
        outMime,
        0.92,
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}
