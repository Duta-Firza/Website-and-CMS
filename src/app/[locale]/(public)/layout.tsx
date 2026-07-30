import { UmamiScript } from "@/components/analytics/umami-script";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getSolutionPageVisibilityMap } from "@/lib/cms/solutions";

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
