import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

vi.mock("../../models/card.model", () => ({
  findCardOwner: vi.fn(),
}));

vi.mock("../../models/comment.model", () => ({
  deleteCommentById: vi.fn(),
  findCommentById: vi.fn(),
  findCommentOwner: vi.fn(),
  findCommentsByCardId: vi.fn(),
  insertComment: vi.fn(),
}));

import { findCardOwner } from "../../models/card.model";
import {
  deleteCommentById,
  findCommentById,
  findCommentOwner,
  findCommentsByCardId,
  insertComment,
} from "../../models/comment.model";
import { addComment, getComments, removeComment } from "../comment.service";
import { AppError } from "../../utils/AppError";

const mockFindCardOwner = findCardOwner as unknown as Mock;
const mockDeleteCommentById = deleteCommentById as unknown as Mock;
const mockFindCommentById = findCommentById as unknown as Mock;
const mockFindCommentOwner = findCommentOwner as unknown as Mock;
const mockFindCommentsByCardId = findCommentsByCardId as unknown as Mock;
const mockInsertComment = insertComment as unknown as Mock;

const commentRow = {
  id: 1,
  card_id: 5,
  author_participant_id: 9,
  author_name: "Sarah",
  content: "Peut-on préciser ce point ?",
  created_at: new Date("2026-07-16T10:00:00.000Z"),
};

describe("comment.service", () => {
  beforeEach(() => {
    mockFindCardOwner.mockReset();
    mockDeleteCommentById.mockReset();
    mockFindCommentById.mockReset();
    mockFindCommentOwner.mockReset();
    mockFindCommentsByCardId.mockReset();
    mockInsertComment.mockReset();
  });

  describe("getComments", () => {
    it("lève une AppError 404 si la carte n'existe pas", async () => {
      mockFindCardOwner.mockResolvedValueOnce(null);

      await expect(getComments(1, 999)).rejects.toMatchObject({
        statusCode: 404,
        code: "CARD_NOT_FOUND",
      } satisfies Partial<AppError>);
    });

    it("renvoie les commentaires mappés en camelCase", async () => {
      mockFindCardOwner.mockResolvedValueOnce({ id: 5, author_participant_id: 9 });
      mockFindCommentsByCardId.mockResolvedValueOnce([commentRow]);

      const result = await getComments(1, 5);

      expect(result).toEqual([
        {
          id: 1,
          cardId: 5,
          authorId: 9,
          authorName: "Sarah",
          content: "Peut-on préciser ce point ?",
          createdAt: commentRow.created_at,
        },
      ]);
    });
  });

  describe("addComment", () => {
    it("lève une AppError 400 si le contenu est vide", async () => {
      await expect(
        addComment({ participantId: 9, sessionId: 1, cardId: 5, content: "   " })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: "COMMENT_CONTENT_REQUIRED",
      } satisfies Partial<AppError>);

      expect(mockFindCardOwner).not.toHaveBeenCalled();
    });

    it("lève une AppError 404 si la carte n'existe pas", async () => {
      mockFindCardOwner.mockResolvedValueOnce(null);

      await expect(
        addComment({ participantId: 9, sessionId: 1, cardId: 999, content: "Un commentaire" })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "CARD_NOT_FOUND",
      } satisfies Partial<AppError>);
    });

    it("crée le commentaire et renvoie le résumé mappé", async () => {
      mockFindCardOwner.mockResolvedValueOnce({ id: 5, author_participant_id: 2 });
      mockInsertComment.mockResolvedValueOnce(1);
      mockFindCommentById.mockResolvedValueOnce(commentRow);

      const result = await addComment({ participantId: 9, sessionId: 1, cardId: 5, content: " Peut-on préciser ce point ? " });

      expect(mockInsertComment).toHaveBeenCalledWith(5, 9, "Peut-on préciser ce point ?");
      expect(result).toEqual({
        id: 1,
        cardId: 5,
        authorId: 9,
        authorName: "Sarah",
        content: "Peut-on préciser ce point ?",
        createdAt: commentRow.created_at,
      });
    });
  });

  describe("removeComment", () => {
    it("lève une AppError 404 si le commentaire n'existe pas", async () => {
      mockFindCommentOwner.mockResolvedValueOnce(null);

      await expect(removeComment({ participantId: 9, cardId: 5, commentId: 999 })).rejects.toMatchObject({
        statusCode: 404,
        code: "COMMENT_NOT_FOUND",
      } satisfies Partial<AppError>);
    });

    it("lève une AppError 404 si le commentaire n'appartient pas à la carte indiquée", async () => {
      mockFindCommentOwner.mockResolvedValueOnce({ id: 1, card_id: 6, author_participant_id: 9 });

      await expect(removeComment({ participantId: 9, cardId: 5, commentId: 1 })).rejects.toMatchObject({
        statusCode: 404,
        code: "COMMENT_NOT_FOUND",
      } satisfies Partial<AppError>);

      expect(mockDeleteCommentById).not.toHaveBeenCalled();
    });

    it("lève une AppError 403 si le participant n'est pas l'auteur", async () => {
      mockFindCommentOwner.mockResolvedValueOnce({ id: 1, card_id: 5, author_participant_id: 2 });

      await expect(removeComment({ participantId: 9, cardId: 5, commentId: 1 })).rejects.toMatchObject({
        statusCode: 403,
        code: "COMMENT_FORBIDDEN",
      } satisfies Partial<AppError>);

      expect(mockDeleteCommentById).not.toHaveBeenCalled();
    });

    it("supprime le commentaire si le participant en est l'auteur", async () => {
      mockFindCommentOwner.mockResolvedValueOnce({ id: 1, card_id: 5, author_participant_id: 9 });

      await removeComment({ participantId: 9, cardId: 5, commentId: 1 });

      expect(mockDeleteCommentById).toHaveBeenCalledWith(1);
    });
  });
});
