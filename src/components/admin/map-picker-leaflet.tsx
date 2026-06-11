"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const PICK_ICON = L.divIcon({
  className: "duta-pin",
  html: `<span class="duta-pin-wrap"><span class="duta-pin-pulse duta-pin-pulse-a"></span><span class="duta-pin-pulse duta-pin-pulse-b"></span><span class="duta-pin-dot"></span></span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface InnerProps {
  latitude: number;
  longitude: number;
  onPick: (lat: number, lng: number) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function MapPickerLeaflet({ latitude, longitude, onPick }: InnerProps) {
  const center: [number, number] = [latitude || -2.5, longitude || 118];
  const hasPin =
    Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0);

  return (
    <MapContainer
      center={center}
      zoom={hasPin ? 11 : 5}
      scrollWheelZoom
      minZoom={4}
      maxZoom={18}
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />
      {hasPin && (
        <Marker
          position={[latitude, longitude]}
          icon={PICK_ICON}
          draggable
          eventHandlers={{
            dragend(e) {
              const m = e.target as L.Marker;
              const pos = m.getLatLng();
              onPick(pos.lat, pos.lng);
            },
          }}
        />
      )}
      <ClickHandler onPick={onPick} />
      <Recenter lat={center[0]} lng={center[1]} />
    </MapContainer>
  );
}
