export interface CreateActionInput {
  description: string;
  owner: string;
  priority: "high" | "medium" | "low";
  deadline?: string | null;
}

export interface ActionDetails {
  id: number;
  sessionId: number;
  description: string;
  owner: string;
  deadline: string | null;
  priority: "high" | "medium" | "low";
  createdAt: string;
}
