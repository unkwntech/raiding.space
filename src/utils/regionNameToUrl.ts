export function regionNameToUrl(name: string): string {
  return name.replace(/ /g, '_');
}

export function regionNameFromSlug(slug: string): string {
  return slug.replace(/_/g, ' ');
}
