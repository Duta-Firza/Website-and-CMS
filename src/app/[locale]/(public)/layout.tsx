import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* `pt-16` reserves space for the fixed h-16 navbar. Landing pulls its
          hero up with `-mt-16` so the photo underflows the transparent navbar. */}
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
