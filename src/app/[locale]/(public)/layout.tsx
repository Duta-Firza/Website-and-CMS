import { UmamiScript } from "@/components/analytics/umami-script";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getSolutionPageVisibilityMap } from "@/lib/cms/solutions";

// This layout (and every public page under it) reads CMS content from MongoDB
// on each render. The production build runs in CI with no DB access and no
// runtime secrets — those live only on the VM (/opt/dutafirza/shared/.env) — so
// static prerendering here would fail validating env / connecting to Mongo.
// Render on demand at runtime on the VM instead. Content is admin-editable, so
// dynamic SSR (always fresh, no rebuild) is the right model anyway.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const visibility = await getSolutionPageVisibilityMap();
  return (
    <>
      <Header visibility={visibility} />
      {/* `pt-16` reserves space for the fixed h-16 navbar. Landing pulls its
          hero up with `-mt-16` so the photo underflows the transparent navbar. */}
      <main className="flex flex-1 flex-col pt-16">{children}</main>
      <Footer />
      {/* Analytics lives here, not in the root layout, so the CMS is never
          tracked. Next loads it once across navigations within this layout. */}
      <UmamiScript />
    </>
  );
}
