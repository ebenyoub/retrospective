export interface SessionIdentityBarProps {
  canRenameSelf?: boolean;
  onBack: () => void | Promise<void>;
  isDesktopViewport: boolean;
}
