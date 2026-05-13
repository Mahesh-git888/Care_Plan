import type { MetadataRoute } from "next";

import { verticalList } from "@/data/verticals";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.portea.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...verticalList.map((v) => ({
      url: `${SITE_URL}/${v.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
