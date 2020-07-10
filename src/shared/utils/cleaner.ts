export function cleanName(name: string): string {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/[: ]/g, '_');
}

export function cleanFbNodeName(name: string): string {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/[\.\#\$\[\]]/g, '');
}
