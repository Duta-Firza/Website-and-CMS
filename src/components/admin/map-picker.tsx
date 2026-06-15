"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const MapPickerLeaflet = dynamic(
  () => import("./map-picker-leaflet").then((m) => m.MapPickerLeaflet),
  { ssr: false, loading: () => <MapSkeleton /> },
);

interface Props {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, label?: { city?: string; province?: string }) => void;
  height?: string;
}

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

export function MapPicker({ latitude, longitude, onChange, height = "h-72" }: Props) {
  const t = useTranslations("Admin.mapPicker");

  return (
    <div className="space-y-2">
      <div className={`relative ${height} overflow-hidden rounded-md border`}>
        <MapPickerLeaflet
          latitude={latitude}
          longitude={longitude}
          onPick={(lat, lng) => onChange(lat, lng)}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
