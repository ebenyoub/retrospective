import React from 'react';

// 1. Définition de l'interface des Props
// On étend les props standard d'un élément SVG pour accepter className, style, onClick, etc.
interface RtcLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Couleur optionnelle pour surcharger la couleur des traits et remplissages.
   * Si omis, le logo héritera de la couleur CSS du parent ('currentColor').
   * @example "red", "#000000", "var(--primary-color)"
   */
  color?: string;
}

// 2. Le Composant typé
// On déstructure les props directement dans les arguments.
// On définit une valeur par défaut pour 'color'.
// On utilise '...restProps' pour récupérer tout le reste (className, width, etc.).
const RtcLogo = ({
  color = 'currentColor', // Valeur par défaut si la prop n'est pas fournie
  ...restProps            // Le reste des props standard SVG
}: RtcLogoProps) => {

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 300"
      // 3. On propage les props standard sur la balise svg
      // (ex: si on passe className="mon-logo", il sera appliqué ici)
      {...restProps}
    >
      {/* Partie gauche : le chaos */}
      <g transform="translate(50, 50) scale(0.8)">
        <path
          d="M10,150 Q30,10 80,50 T150,10 Q200,80 150,150 T80,200 Q30,180 10,150"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path
          d="M40,40 L180,180 M180,40 L40,180"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path
          d="M20,100 L190,100 M100,20 L100,190"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <circle cx="50" cy="60" r="5" fill={color} />
        <circle cx="160" cy="140" r="5" fill={color} />
        <circle cx="120" cy="30" r="8" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="60" cy="170" r="8" fill="none" stroke={color} strokeWidth="2" />
      </g>

      {/* Lignes de séparation */}
      <line x1="220" y1="40" x2="220" y2="260" stroke={color} strokeWidth="2" />
      <line x1="230" y1="40" x2="230" y2="260" stroke={color} strokeWidth="2" />

      {/* Partie droite : l'ordre */}
      <g transform="translate(260, 50) scale(0.8)">
        <line x1="20" y1="40" x2="20" y2="200" stroke={color} strokeWidth="8" />
        <circle cx="20" cy="20" r="15" fill="none" stroke={color} strokeWidth="8" />
      </g>

      {/* Textes */}
      {/* Note: j'ai laissé les polices génériques pour l'exemple */}
      <text
        x="350"
        y="170"
        fontFamily="sans-serif, Montserrat, Futura, Arial"
        fontWeight="900"
        fontSize="100"
        fill={color}
      >
        RTC
      </text>
      <text
        x="350"
        y="230"
        fontFamily="monospace, 'Fira Code', 'Roboto Mono', Courier"
        fontSize="30"
        fill={color}
      >
        Range ta chambre
      </text>
    </svg>
  );
};

export default RtcLogo;