import { API_URL } from '@/constants/api';

/**
 * Rewrite a backend asset URL so it is reachable from the mobile app.
 *
 * The API generates public-disk URLs using APP_URL. In local development
 * APP_URL is often http://localhost:8000, which the mobile app cannot
 * resolve. When the URL uses localhost/127.0.0.1, replace its origin with
 * the configured API_URL origin.
 */
export function rewriteAssetUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (!isLocalhost) {
      return url;
    }

    const apiOrigin = new URL(API_URL).origin;
    const rewritten = `${apiOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    return rewritten;
  } catch {
    return url;
  }
}
