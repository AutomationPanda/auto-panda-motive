import { withBase } from "./url";

export function resolveImage(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return withBase(src.startsWith("/") ? src : `/${src}`);
}
