export interface JoinSessionValues {
  code: string;
  pseudo?: string;
}

export interface JoinSessionFormProps {
  onSessionJoined: (sessionId: number) => void;
}

export interface GuestJoinData {
  id: number;
  displayName: string;
  guestToken: string;
  sessionId: number;
}
