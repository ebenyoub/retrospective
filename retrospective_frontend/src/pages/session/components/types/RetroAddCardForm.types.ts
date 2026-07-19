export interface RetroAddCardFormProps {
  /** Couleur hexadécimale de la colonne (ex: '#16a34a') pour colorier la bordure et le bouton. */
  color: string;
  onAddCard: (content: string) => Promise<void> | void;
}
