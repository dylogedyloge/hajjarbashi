import type { Metadata } from "next";
import { fetchCategories } from "@/lib/advertisements";

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractSeoFromTags(tags?: string[]): { title?: string; description?: string } {
  const result: { title?: string; description?: string } = {};
  if (!Array.isArray(tags)) return result;
  for (const tag of tags) {
    if (!tag || typeof tag !== "string") continue;
    const [key, ...rest] = tag.split("=");
    const value = rest.join("=").trim();
    if (!value) continue;
    if (!result.title && key === "seo:title") result.title = value;
    if (!result.description && key === "seo:description") result.description = value;
    if (result.title && result.description) break;
  }
  return result;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string; locale: string }>;
}): Promise<Metadata> {
  const { name, locale } = await params;
  const currentLocale = locale || "en";
  const categories = await fetchCategories(currentLocale);

  const match = categories.find((c: any) => slugify(c?.name || "") === slugify(name));

  const { title: tagTitle, description: tagDesc } = extractSeoFromTags(match?.tags);

  const title = tagTitle || match?.name || (currentLocale === "fa" ? "دسته‌بندی" : "Category");

  const fallbackDesc = match?.description ? String(match.description).slice(0, 160) : undefined;
  const description = tagDesc || fallbackDesc;

  const canonicalPath = `/${currentLocale}/categories/${slugify(name)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
  };
}


