export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export function slugToText(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}


