// Le reste des données (nom/code de session, step, participants, panneaux...)
// vient désormais de useSessionContext() : ces props restent locales à
// SessionDashboard, elles ne concernent pas l'état partagé de la session
// (affichage éphémère ou action déjà résolue par le parent).
export interface SessionContextBarProps {
  isSessionCodeCopied: boolean;
  canRenameSelf?: boolean;
  onBack: () => void | Promise<void>;
  onCopySessionCode: () => void;
}
