# Pilotes de Qualification d'Orchestration Multi-Agents

Version **v1.5** — mise à jour le 2026-07-21 (statut Codex : gabarits implémentés,
qualification d'exécution non démontrée).

---

## Qualification des Adaptateurs

| Adaptateur | Plateforme | Statut | Ticket Pilote | Rapport / Preuve |
| :--- | :--- | :---: | :--- | :--- |
| **Claude Adapter** | Claude Code | ✅ QUALIFIÉ | `DEV-ENV-01` | Validé avec succès |
| **AGY Adapter** | AntiGravity | ✅ QUALIFIÉ | `T-AI-PLATFORM-03` | Validé avec 15 sub-agents |
| **Codex Adapter** | Codex CLI 0.144.3 | ⚪ NON QUALIFIÉ | `T-AI-PLATFORM-CODEX-02` | Gabarits et schéma présents ; aucun pipeline bout en bout prouvé |

---

## Pilotes de Validation Codex (`T-AI-PLATFORM-CODEX-02`)

### 1. État des preuves

Les gabarits de rôles, les sandboxes déclarés et le schéma JSON sont présents dans le
dépôt. Ils ne constituent pas une preuve d'isolation, d'invocation réussie ni de
conformité de sortie. Aucune preuve exécutable d'un pilote Codex terminé n'est consignée
ici.

---

### 2. Matrice des Scénarios de Qualification Bout en Bout (En Cours)

| Scénario Pilote | Pipeline Exécuté | Statut Attendu | Résultat & Preuve |
| :--- | :--- | :---: | :--- |
| **Scénario 1 : Pipeline Nominal** | Orchestrateur → analyst-ticket → briefing-agent → developer → qa → reviewer → documentation | `SUCCESS` | Non exécuté |
| **Scénario 2 : Rebond Échec Test** | Orchestrateur → developer → qa (`TEST_FAILED`) → developer → qa | `SUCCESS` après rebond | Non exécuté |
| **Scénario 3 : Hors Périmètre** | Orchestrateur → developer-fast (`OUT_OF_SCOPE`) → Stop/Escalade | `OUT_OF_SCOPE` | Non exécuté |
| **Scénario 4 : Indécision Métier** | Orchestrateur → analyst-functional (`NEEDS_DECISION`) → Arbitrage | `NEEDS_DECISION` | Non exécuté |
| **Scénario 5 : Résilience Timeout** | Orchestrateur → agent (`AGENT_TIMEOUT`) → Fallback | `ORCHESTRATOR_FALLBACK` | Non exécuté |
