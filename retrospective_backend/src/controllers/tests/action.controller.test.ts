import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSessionActions, createSessionAction } from "../action.controller";
import * as actionService from "../../services/action.service";
import * as socketRealtime from "../../realtime/socket";
import * as sessionActor from "../../utils/sessionActor";
import { AppError } from "../../utils/AppError";

vi.mock("../../services/action.service");
vi.mock("../../realtime/socket");
vi.mock("../../utils/sessionActor");
vi.mock("../../utils/authUser", () => ({
  requireAuthUser: () => ({ userId: 1, username: "JohnDoe" }),
}));

const createMockResponse = () => {
  const res = {} as any;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("action.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSessionActions", () => {
    it("devrait lever une erreur si le paramètre sessionId est manquant", async () => {
      const req = { params: {} } as any;
      const res = createMockResponse();

      await expect(getSessionActions(req, res)).rejects.toThrow(
        new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED")
      );
    });

    it("devrait rejeter si l'appelant n'a pas d'identité de session valide", async () => {
      const req = { params: { sessionId: "10" } } as any;
      const res = createMockResponse();

      vi.mocked(sessionActor.resolveSessionActor).mockRejectedValueOnce(
        new AppError(401, "Authentification requise.", "SESSION_ACTOR_REQUIRED")
      );

      await expect(getSessionActions(req, res)).rejects.toThrow(
        new AppError(401, "Authentification requise.", "SESSION_ACTOR_REQUIRED")
      );
      expect(actionService.getActions).not.toHaveBeenCalled();
    });

    it("devrait retourner la liste des actions avec un status 200", async () => {
      const req = { params: { sessionId: "10" } } as any;
      const res = createMockResponse();
      const mockActions = [{ id: 1, description: "Action test" }] as any;

      vi.mocked(sessionActor.resolveSessionActor).mockResolvedValueOnce({
        participantId: 9,
        displayName: "Sarah",
        role: "participant",
      });
      vi.mocked(actionService.getActions).mockResolvedValueOnce(mockActions);

      await getSessionActions(req, res);

      expect(sessionActor.resolveSessionActor).toHaveBeenCalledWith(req, 10);
      expect(actionService.getActions).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActions,
      });
    });
  });

  describe("createSessionAction", () => {
    it("devrait lever une erreur si le paramètre sessionId est manquant", async () => {
      const req = { params: {}, body: {} } as any;
      const res = createMockResponse();

      await expect(createSessionAction(req, res)).rejects.toThrow(
        new AppError(400, "L'ID de session est requis.", "SESSION_ID_REQUIRED")
      );
    });

    it("devrait appeler le service d'ajout d'action, diffuser par socket et répondre 201", async () => {
      const req = {
        params: { sessionId: "10" },
        body: {
          description: "Ajouter un test",
          owner: "Bob",
          priority: "high",
          deadline: "2026-07-22",
        },
      } as any;
      const res = createMockResponse();
      const mockCreated = { id: 22, description: "Ajouter un test", owner: "Bob" } as any;

      vi.mocked(actionService.addAction).mockResolvedValueOnce(mockCreated);

      await createSessionAction(req, res);

      expect(sessionActor.resolveSessionActor).toHaveBeenCalledWith(req, 10, { requireOpen: true });
      expect(actionService.addAction).toHaveBeenCalledWith(10, 1, {
        description: "Ajouter un test",
        owner: "Bob",
        priority: "high",
        deadline: "2026-07-22",
      });
      expect(socketRealtime.emitActionAdded).toHaveBeenCalledWith(10, mockCreated);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Action enregistrée.",
        data: mockCreated,
      });
    });

    it("ne crée pas d'action si l'identité de session ouverte est refusée", async () => {
      const req = {
        params: { sessionId: "10" },
        body: {
          description: "Ajouter un test",
          owner: "Bob",
          priority: "high",
          deadline: null,
        },
      } as any;
      const res = createMockResponse();

      vi.mocked(sessionActor.resolveSessionActor).mockRejectedValueOnce(
        new AppError(400, "Session clôturée.", "SESSION_CLOSED")
      );

      await expect(createSessionAction(req, res)).rejects.toThrow(
        new AppError(400, "Session clôturée.", "SESSION_CLOSED")
      );
      expect(sessionActor.resolveSessionActor).toHaveBeenCalledWith(req, 10, { requireOpen: true });
      expect(actionService.addAction).not.toHaveBeenCalled();
      expect(socketRealtime.emitActionAdded).not.toHaveBeenCalled();
    });
  });
});
