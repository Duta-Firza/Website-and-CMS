import { getLocale, getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PreviewLink } from "@/components/admin/preview-link";
import { connectDB } from "@/lib/db";
import { Partner, Product, SolutionPage } from "@/models";
import { loadSolutionPageForAdmin } from "../../_components/load-solution-page";
import { SolutionPageForm } from "../../_components/solution-page-form";
import { ProductsManager } from "./products-manager";

export interface PrincipleEntryRow {
  partnerId: string | null;
  name: string;
  logoUrl: string;
}

export interface ProductItemRow {
  name: { id: string; en: string };
  photos: string[];
}

export interface ProductRow {
  id: string;
  principles: PrincipleEntryRow[];
  origin: string;
  productType: { id: string; en: string };
  skuCount: number;
  partnershipStart: number | null;
  whatsappTemplate: { id: string; en: string };
  items: ProductItemRow[];
  order: number;
  isActive: boolean;
}

export interface TradingWhatsapp {
  number: string;
  template: { id: string; en: string };
}

export interface PartnerOption {
  id: string;
  name: string;
  logoUrl: string;
}

const EMPTY_LOCALIZED = { id: "", en: "" };

interface RawProductDoc {
  _id: unknown;
  principles?: { partnerId?: unknown; name?: string; logoUrl?: string }[];
  origin?: string;
  items?: { name?: { id?: string; en?: string }; photos?: string[] }[];
  partnerId?: unknown;
  principleOverride?: { name?: string; logoUrl?: string; origin?: string };
  photos?: string[];
  productType?: { id?: string; en?: string };
  skuCount?: number;
  partnershipStart?: number | null;
  whatsappTemplate?: { id?: string; en?: string };
  order?: number;
  isActive?: boolean;
}

async function loadProducts(): Promise<ProductRow[]> {
  await connectDB();
  const docs = await Product.find().sort({ order: 1 }).lean<RawProductDoc[]>();
  return docs.map((d) => {
    // Map principles: prefer new array; fall back to legacy single-principle shape.
    const principles: PrincipleEntryRow[] =
      Array.isArray(d.principles) && d.principles.length > 0
        ? d.principles.map((p) => ({
            partnerId: p?.partnerId ? String(p.partnerId) : null,
            name: p?.name ?? "",
            logoUrl: p?.logoUrl ?? "",
          }))
        : d.partnerId || d.principleOverride?.name || d.principleOverride?.logoUrl
          ? [
              {
                partnerId: d.partnerId ? String(d.partnerId) : null,
                name: d.principleOverride?.name ?? "",
                logoUrl: d.principleOverride?.logoUrl ?? "",
              },
            ]
          : [];

    // Items: prefer new array; fall back to wrapping legacy photos[] as one unnamed item.
    const items: ProductItemRow[] =
      Array.isArray(d.items) && d.items.length > 0
        ? d.items.map((it) => ({
            name: { id: it?.name?.id ?? "", en: it?.name?.en ?? "" },
            photos: Array.isArray(it?.photos) ? it.photos : [],
          }))
        : Array.isArray(d.photos) && d.photos.length > 0
          ? [{ name: EMPTY_LOCALIZED, photos: d.photos }]
          : [];

    return {
      id: String(d._id),
      principles,
      origin: d.origin || d.principleOverride?.origin || "",
      productType: {
        id: d.productType?.id ?? "",
        en: d.productType?.en ?? "",
      },
      skuCount: d.skuCount ?? 0,
      partnershipStart: d.partnershipStart ?? null,
      whatsappTemplate: {
        id: d.whatsappTemplate?.id ?? "",
        en: d.whatsappTemplate?.en ?? "",
      },
      items,
      order: d.order ?? 0,
      isActive: d.isActive ?? true,
    };
  });
}

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

export default async function TradingProductsAdminPage() {
  const [page, products, partners, whatsapp, locale, t] = await Promise.all([
    loadSolutionPageForAdmin("trading-products"),
    loadProducts(),
    loadPartnerOptions(),
    loadTradingWhatsapp(),
    getLocale(),
    getTranslations("Admin"),
  ]);
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
                initial={products}
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
