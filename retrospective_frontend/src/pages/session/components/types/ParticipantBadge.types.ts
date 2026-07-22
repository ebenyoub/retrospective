export interface ParticipantBadgeProps {
  displayName: string;
  // Le renommage n'est proposé qu'à l'invité : l'utilisateur connecté porte
  // le nom de son compte, qui ne se modifie pas depuis une session.
  canRename: boolean;
  isReadOnly: boolean;
  onRename: (pseudo: string) => Promise<boolean>;
  onLeave: () => void | Promise<void>;
}
