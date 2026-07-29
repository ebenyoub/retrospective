export interface ActionItem {
  id: number;
  sessionId: number;
  description: string;
  owner: string;
  deadline: string | null;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}
