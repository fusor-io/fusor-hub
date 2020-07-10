export function cleanName(name: string): string {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/[: ]/g, '_');
}
