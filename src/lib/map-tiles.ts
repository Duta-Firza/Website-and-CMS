/**
 * CARTO Positron raster basemap shared by the public reach map and the admin
 * map picker.
 *
 * CARTO requires an API key (https://carto.com/basemaps/apikey) passed as a
 * `?key=` query param on every tile URL. Keyless requests still succeed but the
 * tiles come back watermarked "API KEY REQUIRED", so an unset key degrades the
 * map instead of breaking it.
 *
 * The key is read straight off `process.env` (not the server-only `env` proxy
 * in ./env) because these tiles load in client components — Next only inlines
 * NEXT_PUBLIC_* at build time via direct member access. Same approach as
 * src/lib/umami.ts.
 */

const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim();

export const CARTO_TILE_URL = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${
  cartoKey ? `?key=${encodeURIComponent(cartoKey)}` : ""
}`;

export const CARTO_SUBDOMAINS = ["a", "b", "c", "d"];
