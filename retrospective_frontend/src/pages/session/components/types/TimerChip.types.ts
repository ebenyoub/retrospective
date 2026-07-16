export interface TimerChipProps {
  // Échéance absolue (ISO) fournie par le backend : la seule source de vérité.
  endsAt: string | null;
  // Seul le facilitateur peut cliquer sur le compteur pour le modifier.
  isEditable?: boolean;
  onSubmitMinutes?: (minutes: number) => Promise<boolean>;
}
