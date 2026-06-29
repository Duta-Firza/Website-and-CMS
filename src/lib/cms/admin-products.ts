import type { PipelineStage } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import type { AdminListParams, PaginateResult } from "./list-params";

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

function mapProduct(d: RawProductDoc): ProductRow {
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
    productType: { id: d.productType?.id ?? "", en: d.productType?.en ?? "" },
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
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Server-side products query. Status/origin filters and the SKU/manual sorts run
 * as a plain indexed find with `countDocuments` + `skip`/`limit`. Search and the
 * "name" sorts need the principle name — which may live on a linked Partner — so
 * those go through an aggregation that `$lookup`s partners and computes a name +
 * searchable text field before paginating. Either way only one page is read.
 */
export async function loadAdminProducts(
  params: AdminListParams,
): Promise<PaginateResult<ProductRow> & { origins: string[] }> {
  await connectDB();

  // Status + origin are plain document fields — applied before any join.
  // biome-ignore lint/suspicious/noExplicitAny: Mongoose filter shape is built dynamically
  const baseMatch: Record<string, any> = {};
  if (params.status === "active") baseMatch.isActive = { $ne: false };
  else if (params.status === "inactive") baseMatch.isActive = false;
  if (params.filter !== "all") baseMatch.origin = params.filter;

  // The product name is derived from linked partners, so search and name-sort
  // need the $lookup path; everything else stays a plain query.
  const needsName = Boolean(params.q) || params.sort === "nameAsc" || params.sort === "nameDesc";

  let sort: Record<string, 1 | -1>;
  switch (params.sort) {
    case "nameAsc":
      sort = { _nameLower: 1, _id: 1 };
      break;
    case "nameDesc":
      sort = { _nameLower: -1, _id: 1 };
      break;
    case "skuDesc":
      sort = { skuCount: -1, order: 1 };
      break;
    case "skuAsc":
      sort = { skuCount: 1, order: 1 };
      break;
    default:
      sort = { order: 1 };
  }

  let items: ProductRow[];
  let total: number;

  if (!needsName) {
    total = await Product.countDocuments(baseMatch);
    const pageCount = Math.max(1, Math.ceil(total / params.pageSize));
    const page = Math.min(params.page, pageCount);
    const docs = await Product.find(baseMatch)
      .sort(sort)
      .skip((page - 1) * params.pageSize)
      .limit(params.pageSize)
      .lean<RawProductDoc[]>();
    items = docs.map(mapProduct);
  } else {
    const prefix: PipelineStage[] = [];
    if (Object.keys(baseMatch).length > 0) prefix.push({ $match: baseMatch });
    prefix.push(
      {
        $lookup: {
          from: "partners",
          localField: "principles.partnerId",
          foreignField: "_id",
          as: "_partners",
        },
      },
      {
        $addFields: {
          _name: {
            $trim: {
              input: {
                $reduce: {
                  input: { $ifNull: ["$principles", []] },
                  initialValue: "",
                  in: {
                    $concat: [
                      "$$value",
                      " ",
                      {
                        $let: {
                          vars: {
                            m: {
                              $first: {
                                $filter: {
                                  input: "$_partners",
                                  as: "p",
                                  cond: { $eq: ["$$p._id", "$$this.partnerId"] },
                                },
                              },
                            },
                          },
                          in: { $ifNull: ["$$m.name", { $ifNull: ["$$this.name", ""] }] },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          _nameLower: { $toLower: "$_name" },
          _search: {
            $toLower: {
              $concat: [
                "$_name",
                " ",
                { $ifNull: ["$origin", ""] },
                " ",
                { $ifNull: ["$productType.id", ""] },
                " ",
                { $ifNull: ["$productType.en", ""] },
                " ",
                {
                  $reduce: {
                    input: { $ifNull: ["$items", []] },
                    initialValue: "",
                    in: {
                      $concat: [
                        "$$value",
                        " ",
                        { $ifNull: ["$$this.name.id", ""] },
                        " ",
                        { $ifNull: ["$$this.name.en", ""] },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    );
    if (params.q) {
      prefix.push({ $match: { _search: { $regex: escapeRegExp(params.q.toLowerCase()) } } });
    }

    const countRes = await Product.aggregate([...prefix, { $count: "total" }]);
    total = countRes[0]?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / params.pageSize));
    const page = Math.min(params.page, pageCount);
    const data = await Product.aggregate([
      ...prefix,
      { $sort: sort },
      { $skip: (page - 1) * params.pageSize },
      { $limit: params.pageSize },
      { $project: { _partners: 0, _name: 0, _nameLower: 0, _search: 0 } },
    ]);
    items = data.map((d) => mapProduct(d as RawProductDoc));
  }

  // Distinct origins across the whole catalogue drive the filter dropdown.
  const originVals = (await Product.distinct("origin")) as string[];
  const origins = [...new Set(originVals.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  // Tiny canonical-order id index backs drag-reorder reconstruction (pristine).
  const index = await Product.find({}, { _id: 1 }).sort({ order: 1 }).lean<{ _id: unknown }[]>();
  const allIds = index.map((d) => String(d._id));

  return { items, total, allIds, origins };
}
