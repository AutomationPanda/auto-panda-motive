export interface HeroImageDimensions {
  width: number;
  height: number;
}

/** Intrinsic pixel sizes for hero images (reserves layout before decode). */
export const HERO_IMAGE_DIMENSIONS: Readonly<
  Record<string, HeroImageDimensions>
> = {
  "https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/1970-vw-beetle/hero.webp": {
    width: 2048,
    height: 1065,
  },
  "https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/1974-karmann-ghia/hero.webp": {
    width: 2048,
    height: 931,
  },
  "https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/1979-vw-bus/hero.webp": {
    width: 2048,
    height: 1510,
  },
  "https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/2006-mercedes-c280/hero.webp": {
    width: 2048,
    height: 1271,
  },
  "https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/2007-chrysler-300/hero.webp": {
    width: 2048,
    height: 1328,
  },
  "https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/cars/2012-chrysler-200/hero.webp": {
    width: 2048,
    height: 1286,
  },
  "https://cdn.jsdelivr.net/gh/AutomationPanda/auto-panda-motive-photos/images/pages/about.webp": {
    width: 2048,
    height: 1653,
  },
};

export function getHeroDimensions(
  src: string,
): HeroImageDimensions | undefined {
  return HERO_IMAGE_DIMENSIONS[src];
}

export function getHeroAspectRatio(src: string): string | undefined {
  const dimensions = getHeroDimensions(src);
  if (!dimensions) {
    return undefined;
  }

  return `${dimensions.width} / ${dimensions.height}`;
}
