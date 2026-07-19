import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../../models/message.model", () => ({
  insertMessage: vi.fn(),
  findMessagesBySessionId: vi.fn(),
  findMessageById: vi.fn(),
}));

vi.mock("../../models/session.model", () => ({
  findSessionById: vi.fn(),
}));

import {
  insertMessage,
  findMessagesBySessionId,
  findMessageById,
} from "../../models/message.model";
import { findSessionById } from "../../models/session.model";
import { getMessages, addMessage } from "../message.service";
import { AppError } from "../../utils/AppError";

const mockInsertMessage = insertMessage as unknown as Mock;
const mockFindMessagesBySessionId = findMessagesBySessionId as unknown as Mock;
const mockFindMessageById = findMessageById as unknown as Mock;
const mockFindSessionById = findSessionById as unknown as Mock;

describe("message.service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getMessages", () => {
    it("lève une erreur 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);

      await expect(getMessages(404)).rejects.toThrowError(
        new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND")
      );
    });

    it("retourne les messages si la session existe", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 1, name: "Retro" });
      const mockRows = [
        { id: 10, session_id: 1, author_participant_id: 2, author_name: "John", content: "Hello", created_at: new Date() },
      ];
      mockFindMessagesBySessionId.mockResolvedValueOnce(mockRows);

      const res = await getMessages(1);
      expect(res).toHaveLength(1);
      expect(res[0]).toEqual({
        id: 10,
        sessionId: 1,
        authorId: 2,
        authorName: "John",
        content: "Hello",
        createdAt: mockRows[0].created_at,
      });
    });
  });

  describe("addMessage", () => {
    it("lève une erreur 400 si le message est vide", async () => {
      await expect(addMessage({ sessionId: 1, participantId: 2, content: "   " })).rejects.toThrowError(
        new AppError(400, "Le message ne peut pas être vide.", "MESSAGE_CONTENT_REQUIRED")
      );
    });

    it("lève une erreur 400 si le message est trop long", async () => {
      await expect(addMessage({ sessionId: 1, participantId: 2, content: "a".repeat(501) })).rejects.toThrowError(
        new AppError(400, "Le message ne peut pas dépasser 500 caractères.", "MESSAGE_TOO_LONG")
      );
    });

    it("lève une erreur 404 si la session n'existe pas", async () => {
      mockFindSessionById.mockResolvedValueOnce(null);

      await expect(addMessage({ sessionId: 1, participantId: 2, content: "Hello" })).rejects.toThrowError(
        new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND")
      );
    });

    it("insère et retourne le message inséré", async () => {
      mockFindSessionById.mockResolvedValueOnce({ id: 1, name: "Retro" });
      mockInsertMessage.mockResolvedValueOnce(10);
      const createdRow = {
        id: 10,
        session_id: 1,
        author_participant_id: 2,
        author_name: "John",
        content: "Hello",
        created_at: new Date(),
      };
      mockFindMessageById.mockResolvedValueOnce(createdRow);

      const res = await addMessage({ sessionId: 1, participantId: 2, content: "Hello  " });
      expect(mockInsertMessage).toHaveBeenCalledWith(1, 2, "Hello");
      expect(res).toEqual({
        id: 10,
        sessionId: 1,
        authorId: 2,
        authorName: "John",
        content: "Hello",
        createdAt: createdRow.created_at,
      });
    });
  });
});
