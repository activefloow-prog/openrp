import type { AvatarOutfit, AvatarStyle } from './types.ts';

export const AVATAR_STYLES: readonly AvatarStyle[] = ['woman', 'man', 'free'];
export const AVATAR_OUTFITS: readonly AvatarOutfit[] = ['sage', 'sand', 'rose'];

export function isAvatarStyle(value: unknown): value is AvatarStyle {
  return typeof value === 'string' && AVATAR_STYLES.includes(value as AvatarStyle);
}

export function isAvatarOutfit(value: unknown): value is AvatarOutfit {
  return typeof value === 'string' && AVATAR_OUTFITS.includes(value as AvatarOutfit);
}
