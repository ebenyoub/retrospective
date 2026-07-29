export type Screen = "home" | "waiting" | "writing" | "vote" | "results" | "action" | "summary";
export type Category = "positif" | "negatif" | "idee";
export type ParticipantStatus = "online" | "away" | "offline";

export interface Card {
  id: number;
  author: string;
  content: string;
  votes: number;
  category: Category;
  votedByMe: boolean;
  commentCount: number;
}

export interface Comment {
  id: number;
  cardId: number;
  author: string;
  text: string;
  time: string;
}

export interface Message {
  id: number;
  me: boolean;
  author: string;
  text: string;
  time: string;
}

export interface Participant {
  id: number;
  name: string;
  avatarColor: string;
  status: ParticipantStatus;
  isAdmin: boolean;
}

export interface ActionItem {
  id: number;
  description: string;
  owner: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

export interface AppState {
  screen: Screen;
  screenHistory: Screen[];
  cards: Card[];
  comments: Comment[];
  messages: Message[];
  actions: ActionItem[];
  votesLeft: number;
  isDiscussionOpen: boolean;
  isParticipantsPanelOpen: boolean;
  commentsCardId: number | null;
  sessionName: string;
  sessionStartTime: Date;
}
