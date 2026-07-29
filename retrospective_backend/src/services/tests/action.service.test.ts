import { describe, it, expect, vi, beforeEach } from "vitest";
import { getActions, addAction } from "../action.service";
import * as sessionModel from "../../models/session.model";
import * as actionModel from "../../models/action.model";
import { AppError } from "../../utils/AppError";

vi.mock("../../models/session.model");
vi.mock("../../models/action.model");

describe("action.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActions", () => {
    it("devrait lever une erreur si la session n'existe pas", async () => {
      vi.mocked(sessionModel.findSessionById).mockResolvedValueOnce(null);

      await expect(getActions(999)).rejects.toThrow(
        new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND")
      );
    });

    it("devrait retourner la liste des actions mappée en détails", async () => {
      const mockSession = { id: 10, owner_id: 1, status: "open" } as any;
      const mockRows = [
        {
          id: 1,
          session_id: 10,
          description: "Description test",
          owner: "Bob",
          deadline: new Date("2026-07-20T00:00:00.000Z"),
          priority: "low" as const,
          created_at: new Date("2026-07-19T10:00:00.000Z"),
        },
      ];

      vi.mocked(sessionModel.findSessionById).mockResolvedValueOnce(mockSession);
      vi.mocked(actionModel.findActionsBySessionId).mockResolvedValueOnce(mockRows as any);

      const result = await getActions(10);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        sessionId: 10,
        description: "Description test",
        owner: "Bob",
        deadline: "2026-07-20",
        priority: "low",
        createdAt: "2026-07-19T10:00:00.000Z",
      });
    });
  });

  describe("addAction", () => {
    it("devrait lever une erreur si la session n'existe pas", async () => {
      vi.mocked(sessionModel.findSessionById).mockResolvedValueOnce(null);

      await expect(
        addAction(999, 1, { description: "Act", owner: "A", priority: "high" })
      ).rejects.toThrow(
        new AppError(404, "Session non trouvée.", "SESSION_NOT_FOUND")
      );
    });

    it("devrait lever une erreur si l'utilisateur n'est pas le facilitateur", async () => {
      const mockSession = { id: 10, owner_id: 1, status: "open" } as any;
      vi.mocked(sessionModel.findSessionById).mockResolvedValueOnce(mockSession);

      await expect(
        addAction(10, 2, { description: "Act", owner: "A", priority: "high" })
      ).rejects.toThrow(
        new AppError(403, "Seul le facilitateur peut ajouter des actions à la session.", "FORBIDDEN")
      );
    });

    it("devrait refuser l'ajout d'action sur une session clôturée", async () => {
      const mockSession = { id: 10, owner_id: 1, status: "closed" } as any;
      vi.mocked(sessionModel.findSessionById).mockResolvedValueOnce(mockSession);

      await expect(
        addAction(10, 1, { description: "Act", owner: "A", priority: "high" })
      ).rejects.toMatchObject({ statusCode: 400, code: "SESSION_CLOSED" } satisfies Partial<AppError>);
      expect(actionModel.insertAction).not.toHaveBeenCalled();
    });

    it("devrait insérer et retourner les détails de l'action créée si tout est correct", async () => {
      const mockSession = { id: 10, owner_id: 1, status: "open" } as any;
      vi.mocked(sessionModel.findSessionById).mockResolvedValueOnce(mockSession);
      vi.mocked(actionModel.insertAction).mockResolvedValueOnce({ insertId: 77, affectedRows: 1 });

      const result = await addAction(10, 1, {
        description: "Faire le recap",
        owner: "Elyas",
        priority: "high",
        deadline: "2026-07-25",
      });

      expect(result).toEqual({
        id: 77,
        sessionId: 10,
        description: "Faire le recap",
        owner: "Elyas",
        priority: "high",
        deadline: "2026-07-25",
        createdAt: expect.any(String),
      });
      expect(actionModel.insertAction).toHaveBeenCalledWith(10, "Faire le recap", "Elyas", "high", "2026-07-25");
    });
  });
});
