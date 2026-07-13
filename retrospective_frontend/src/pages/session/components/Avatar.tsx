// Avatar rond avec les initiales de l'auteur. La couleur est déterministe :
// on la déduit de l'identifiant pour qu'un même auteur ait toujours la même.
const PALETTE = [
  '#3b82f6', // bleu
  '#ef4444', // rouge
  '#10b981', // vert
  '#f59e0b', // orange
  '#8b5cf6', // violet
  '#ec4899', // rose
  '#14b8a6', // turquoise
  '#6366f1', // indigo
];

const Avatar = ({ name, id, size = 18 }: { name: string; id: number; size?: number }) => {
  const initials =
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'P';

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full font-sans font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        background: PALETTE[id % PALETTE.length],
        fontSize: size * 0.45,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
