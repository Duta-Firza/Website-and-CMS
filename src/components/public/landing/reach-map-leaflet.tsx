"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { ReachPointData } from "@/lib/cms/home";

// Indonesia bounds — roughly Aceh to Papua
const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const INDONESIA_ZOOM = 4.5;

const markerIcon = L.divIcon({
  className: "duta-pin",
  html: `<span class="block h-3 w-3 rounded-full bg-[#9f1211] ring-4 ring-[#9f1211]/30"></span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface Props {
  reachPoints: ReachPointData[];
}

export function LeafletMap({ reachPoints }: Props) {
  return (
    <MapContainer
      center={INDONESIA_CENTER}
      zoom={INDONESIA_ZOOM}
      scrollWheelZoom={false}
      minZoom={4}
      maxZoom={9}
      style={{ height: 500, width: "100%" }}
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {reachPoints.map((pt) => (
        <Marker key={pt.id} position={[pt.latitude, pt.longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{pt.city}</p>
              <p className="text-muted-foreground">{pt.province}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
