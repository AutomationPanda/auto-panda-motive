import { withBase } from "./url";

/**
 * Resolve an image source for use in `<img>` tags and CSS backgrounds.
 *
 * Car and story photos use full jsDelivr URLs from
 * https://github.com/AutomationPanda/auto-panda-motive-photos and are returned
 * unchanged. Site-local assets (favicon, logo) use paths under `public/` and are
 * prefixed with the Astro base path.
 */
export function resolveImage(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return withBase(src.startsWith("/") ? src : `/${src}`);
}
