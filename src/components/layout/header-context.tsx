"use client";

import { createContext, useContext } from "react";

/**
 * Whether the header is currently rendered in **overlay** mode — i.e. floating
 * over a dark hero photo with no background of its own. Nav text, the logo,
 * and the tools cluster all read this to swap to a light variant so they stay
 * legible. Provider lives on the Header; the default is `false` so other
 * trees (admin shell, login) get the normal styling.
 */
export const HeaderOverlayContext = createContext(false);

export function useHeaderOverlay(): boolean {
  return useContext(HeaderOverlayContext);
}
