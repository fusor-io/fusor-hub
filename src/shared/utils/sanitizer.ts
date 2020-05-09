export function sanitizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z\d]/g, '')
    .trim();
}
