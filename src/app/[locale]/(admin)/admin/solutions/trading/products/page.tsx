import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import {
  loadAdminProducts,
  type PartnerOption,
  type TradingWhatsapp,
} from "@/lib/cms/admin-products";
import { parseAdminListParams } from "@/lib/cms/list-params";
import { connectDB } from "@/lib/db";
import { Partner, SolutionPage } from "@/models";
import { loadSolutionPageForAdmin } from "../../_components/load-solution-page";
import { SolutionPageForm } from "../../_components/solution-page-form";
import { ProductsManager } from "./products-manager";

export type {
  PartnerOption,
  PrincipleEntryRow,
  ProductItemRow,
  ProductRow,
  TradingWhatsapp,
} from "@/lib/cms/admin-products";

async function loadTradingWhatsapp(): Promise<TradingWhatsapp> {
  await connectDB();
  const doc = await SolutionPage.findById("trading-products")
    .select("whatsappNumber whatsappTemplate")
    .lean<{ whatsappNumber?: string; whatsappTemplate?: { id?: string; en?: string } } | null>();
  return {
    number: doc?.whatsappNumber ?? "",
    template: {
      id: doc?.whatsappTemplate?.id ?? "",
      en: doc?.whatsappTemplate?.en ?? "",
    },
  };
}

async function loadPartnerOptions(): Promise<PartnerOption[]> {
  await connectDB();
  const docs = await Partner.find().select("_id name logoUrl").sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    logoUrl: d.logoUrl,
  }));
}

export default async function TradingProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [page, partners, whatsapp, locale, t, sp] = await Promise.all([
    loadSolutionPageForAdmin("trading-products"),
    loadPartnerOptions(),
    loadTradingWhatsapp(),
    getLocale(),
    getTranslations("Admin"),
    searchParams,
  ]);
  const params = parseAdminListParams(sp, "manual");
  const products = await loadAdminProducts(params);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.tradingProducts.title")}
        description={t("pages.tradingProducts.description")}
        titleAction={
          <PreviewLink
            href={`/${locale}/solutions/trading/products`}
            label={t("buttons.viewPublic")}
          />
        }
      />
      <SolutionPageForm
        slug="trading-products"
        initial={page}
        additionalTabs={[
          {
            value: "products",
            label: t("nouns.product"),
            content: (
              <ProductsManager
                items={products.items}
                total={products.total}
                allIds={products.allIds}
                origins={products.origins}
                partners={partners}
                whatsappNumber={whatsapp.number}
                whatsappTemplate={whatsapp.template}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
