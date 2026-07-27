import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { Mock } from "vitest";

vi.mock("../../services/comment.service", () => ({
  addComment: vi.fn(),
  getComments: vi.fn(),
  removeComment: vi.fn(),
}));

vi.mock("../../utils/sessionActor", () => ({
  resolveSessionActor: vi.fn(),
}));

vi.mock("../../realtime/socket");

import { createComment, deleteComment, getComments } from "../comment.controller";
import {
  addComment as addCommentService,
  getComments as getCommentsService,
  removeComment as removeCommentService,
} from "../../services/comment.service";
import { resolveSessionActor } from "../../utils/sessionActor";
import * as socketRealtime from "../../realtime/socket";
import type { AuthRequest } from "../../types";

const mockAddCommentService = addCommentService as unknown as Mock;
const mockGetCommentsService = getCommentsService as unknown as Mock;
const mockRemoveCommentService = removeCommentService as unknown as Mock;
const mockResolveSessionActor = resolveSessionActor as unknown as Mock;

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
  body: Record<string, unknown>,
  params: Record<string, string> = { sessionId: "1", cardId: "5" }
): AuthRequest =>
  ({
    user: { userId: 1, username: "Elyas" },
    params,
    body,
  }) as unknown as AuthRequest;

describe("comment.controller", () => {
  beforeEach(() => {
    mockAddCommentService.mockReset();
    mockGetCommentsService.mockReset();
    mockRemoveCommentService.mockReset();
    mockResolveSessionActor.mockReset();
    mockResolveSessionActor.mockResolvedValue({ participantId: 9, displayName: "Sarah", role: "participant" });
    vi.mocked(socketRealtime.emitCommentAdded).mockReset();
  });

  it("GET : renvoie 200 et les commentaires de la carte", async () => {
    mockGetCommentsService.mockResolvedValueOnce([
      { id: 1, cardId: 5, authorId: 9, authorName: "Sarah", content: "Un commentaire", createdAt: new Date() },
    ]);

    const req = createMockRequest({});
    const res = createMockResponse();

    await getComments(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean; data: unknown[] };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(mockGetCommentsService).toHaveBeenCalledWith(1, 5);
  });

  it("POST : appelle le service puis renvoie 201", async () => {
    const created = {
      id: 1,
      cardId: 5,
      authorId: 9,
      authorName: "Sarah",
      content: "Peut-on préciser ce point ?",
      createdAt: new Date(),
    };
    mockAddCommentService.mockResolvedValueOnce(created);
    const req = createMockRequest({ content: "Peut-on préciser ce point ?" });
    const res = createMockResponse();

    await createComment(req, res as unknown as Response);

    expect(res.statusCode).toBe(201);
    const body = res.body as { success: boolean; data: { id: number } };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(1);
    expect(mockAddCommentService).toHaveBeenCalledWith({
      participantId: 9,
      sessionId: 1,
      cardId: 5,
      content: "Peut-on préciser ce point ?",
    });
    expect(mockResolveSessionActor).toHaveBeenCalledWith(req, 1, { requireOpen: true });
    // Diffusion temps réel : sans cet appel, les autres participants ne
    // voient le nouveau commentaire qu'en rouvrant le panneau ou en rechargeant.
    expect(socketRealtime.emitCommentAdded).toHaveBeenCalledWith(1, 5, created);
  });

  it("POST : ne capture pas les erreurs du service", async () => {
    mockAddCommentService.mockRejectedValueOnce(new Error("boom"));
    const req = createMockRequest({ content: "" });
    const res = createMockResponse();

    await expect(createComment(req, res as unknown as Response)).rejects.toThrow("boom");
  });

  it("DELETE : appelle le service puis renvoie 200", async () => {
    mockRemoveCommentService.mockResolvedValueOnce(undefined);
    const req = createMockRequest({}, { sessionId: "1", cardId: "5", commentId: "1" });
    const res = createMockResponse();

    await deleteComment(req, res as unknown as Response);

    expect(res.statusCode).toBe(200);
    const body = res.body as { success: boolean };
    expect(body.success).toBe(true);
    expect(mockRemoveCommentService).toHaveBeenCalledWith({
      participantId: 9,
      cardId: 5,
      commentId: 1,
    });
  });

  it("DELETE : ne capture pas les erreurs du service", async () => {
    mockRemoveCommentService.mockRejectedValueOnce(new Error("boom"));
    const req = createMockRequest({}, { sessionId: "1", cardId: "5", commentId: "1" });
    const res = createMockResponse();

    await expect(deleteComment(req, res as unknown as Response)).rejects.toThrow("boom");
  });
});
