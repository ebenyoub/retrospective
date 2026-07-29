import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../../services/message.service", () => ({
  addMessage: vi.fn(),
  getMessages: vi.fn(),
}));

vi.mock("../../utils/sessionActor", () => ({
  resolveSessionActor: vi.fn(),
}));

vi.mock("../../realtime/socket", () => ({
  emitMessageAdded: vi.fn(),
}));

import { createMessage, getMessages } from "../message.controller";
import {
  addMessage as addMessageService,
  getMessages as getMessagesService,
} from "../../services/message.service";
import { resolveSessionActor } from "../../utils/sessionActor";
import { emitMessageAdded } from "../../realtime/socket";
import type { AuthRequest } from "../../types";

const mockAddMessageService = addMessageService as unknown as Mock;
const mockGetMessagesService = getMessagesService as unknown as Mock;
const mockResolveSessionActor = resolveSessionActor as unknown as Mock;
const mockEmitMessageAdded = emitMessageAdded as unknown as Mock;

const createMockResponse = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res as unknown as Response;
    },
    json(payload: unknown) {
      res.body = payload;
      return res as unknown as Response;
    },
  };
  return res;
};

const createMockRequest = (
  params: Record<string, string>,
  body: unknown = {}
): AuthRequest => {
  return {
    params,
    body,
  } as unknown as AuthRequest;
};

describe("message.controller", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getMessages", () => {
    it("résout l'acteur de session et retourne la liste des messages", async () => {
      const req = createMockRequest({ sessionId: "1" });
      const res = createMockResponse();

      mockResolveSessionActor.mockResolvedValueOnce({ participantId: 10, role: "participant" });
      const list = [{ id: 1, content: "Hello" }];
      mockGetMessagesService.mockResolvedValueOnce(list);

      await getMessages(req, res as unknown as Response);

      expect(mockResolveSessionActor).toHaveBeenCalledWith(req, 1);
      expect(mockGetMessagesService).toHaveBeenCalledWith(1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ success: true, data: list });
    });
  });

  describe("createMessage", () => {
    it("crée un message et le diffuse via socket", async () => {
      const req = createMockRequest({ sessionId: "1" }, { content: "Hey there" });
      const res = createMockResponse();

      mockResolveSessionActor.mockResolvedValueOnce({ participantId: 10, role: "participant" });
      const created = { id: 2, sessionId: 1, authorId: 10, authorName: "Sarah", content: "Hey there" };
      mockAddMessageService.mockResolvedValueOnce(created);

      await createMessage(req, res as unknown as Response);

      expect(mockResolveSessionActor).toHaveBeenCalledWith(req, 1, { requireOpen: true });
      expect(mockAddMessageService).toHaveBeenCalledWith({
        sessionId: 1,
        participantId: 10,
        content: "Hey there",
      });
      expect(mockEmitMessageAdded).toHaveBeenCalledWith(1, created);
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: "Message envoyé.",
        data: created,
      });
    });
  });
});
