import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/site-settings";

function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return configured.replace(/\/$/, "");
}

function toSlug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "model";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings] = await Promise.all([getSiteSettings()]);
  const baseUrl = getBaseUrl();
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/models/${toSlug(settings.name)}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
