/** Origin API tanpa suffix /api — untuk URL file /uploads/... */
export function getApiOrigin(): string {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return base.replace(/\/api\/?$/, '') || 'http://localhost:5000';
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${getApiOrigin()}${path}`;
  return path;
}
