import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { connectDB } from "@/lib/db";
import { Partner, Product } from "@/models";
import { loadSolutionPageForAdmin } from "../../_components/load-solution-page";
import { SolutionPageForm } from "../../_components/solution-page-form";
import { ProductsManager } from "./products-manager";

export interface ProductRow {
  id: string;
  partnerId: string | null;
  principleOverride: { name: string; logoUrl: string; origin: string };
  productType: { id: string; en: string };
  skuCount: number;
  partnershipStart: number | null;
  photos: string[];
  order: number;
  isActive: boolean;
}

export interface PartnerOption {
  id: string;
  name: string;
  logoUrl: string;
}

async function loadProducts(): Promise<ProductRow[]> {
  await connectDB();
  const docs = await Product.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    partnerId: d.partnerId ? String(d.partnerId) : null,
    principleOverride: {
      name: d.principleOverride?.name ?? "",
      logoUrl: d.principleOverride?.logoUrl ?? "",
      origin: d.principleOverride?.origin ?? "",
    },
    productType: {
      id: d.productType?.id ?? "",
      en: d.productType?.en ?? "",
    },
    skuCount: d.skuCount ?? 0,
    partnershipStart: d.partnershipStart ?? null,
    photos: Array.isArray(d.photos) ? d.photos : [],
    order: d.order ?? 0,
    isActive: d.isActive ?? true,
  }));
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
  const [page, products, partners] = await Promise.all([
    loadSolutionPageForAdmin("trading-products"),
    loadProducts(),
    loadPartnerOptions(),
  ]);
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("pages.tradingProducts.title")}
        description={t("pages.tradingProducts.description")}
      />
      <SolutionPageForm
        slug="trading-products"
        initial={page}
        additionalTabs={[
          {
            value: "products",
            label: t("nouns.product"),
            content: <ProductsManager initial={products} partners={partners} />,
          },
        ]}
      />
    </div>
  );
}
