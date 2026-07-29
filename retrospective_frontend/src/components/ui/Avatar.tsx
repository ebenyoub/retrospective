import type { AvatarProps } from './types/Avatar.types';

const AVATAR_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
];

const initialsForName = (name: string, fallback: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || fallback;

const colorForSeed = (seed: string | number): string => {
  if (typeof seed === 'number') {
    return AVATAR_COLORS[seed % AVATAR_COLORS.length];
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const Avatar = ({
  name,
  colorSeed,
  size = 18,
  fontSize = size * 0.45,
  fallback = '?',
}: AvatarProps) => (
  <div
    aria-hidden="true"
    className="flex flex-shrink-0 select-none items-center justify-center rounded-full font-sans font-bold text-white"
    style={{
      width: size,
      height: size,
      backgroundColor: colorForSeed(colorSeed),
      fontSize,
    }}
  >
    {initialsForName(name, fallback)}
  </div>
);

export default Avatar;
