"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import type { ReachPointData } from "@/lib/cms/home";
import { CARTO_SUBDOMAINS, CARTO_TILE_URL } from "@/lib/map-tiles";

// Indonesia bounds — roughly Aceh to Papua
const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const INDONESIA_ZOOM = 4.5;

// Marker is a divIcon whose inner HTML composes three layers:
//   .duta-pin-pulse-a — first expanding ripple ring
//   .duta-pin-pulse-b — second ring offset by 1s (continuous ripple effect)
//   .duta-pin-dot     — solid brand-accent dot at the center
// All classes + the @keyframes live in globals.css so they survive the
// dynamic-import boundary that this client component crosses.
const markerIcon = L.divIcon({
  className: "duta-pin",
  html: `<span class="duta-pin-wrap"><span class="duta-pin-pulse duta-pin-pulse-a"></span><span class="duta-pin-pulse duta-pin-pulse-b"></span><span class="duta-pin-dot"></span></span>`,
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
      style={{ height: 400, width: "100%" }}
      attributionControl={false}
      zoomControl={false}
    >
      <TileLayer
        url={CARTO_TILE_URL}
        subdomains={CARTO_SUBDOMAINS}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {reachPoints.map((pt) => (
        <Marker key={pt.id} position={[pt.latitude, pt.longitude]} icon={markerIcon}>
          <Tooltip direction="top" offset={[0, -8]} opacity={1} className="duta-tooltip">
            <p className="font-semibold leading-tight">{pt.city}</p>
            <p className="text-[11px] leading-tight opacity-80">{pt.province}</p>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
