import { DevToolsDashboard } from "@/components/devtools/dashboard";
import { assertDevSession } from "@/lib/devtools/dev-session";

export const dynamic = "force-dynamic";

export default async function DevToolsPage() {
  await assertDevSession("/devtools");
  return <DevToolsDashboard />;
}
