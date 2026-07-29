# Pilotes de Qualification d'Orchestration Multi-Agents

Version **v2.0** — mise à jour le 2026-07-22 (statut Codex : bootstrap natif qualifié).

---

## Qualification des Adaptateurs

| Adaptateur | Plateforme | Statut | Ticket Pilote | Rapport / Preuve |
| :--- | :--- | :---: | :--- | :--- |
| **Claude Adapter** | Claude Code | ✅ QUALIFIÉ | `DEV-ENV-01` | Validé avec succès |
| **AGY Adapter** | AntiGravity | ✅ QUALIFIÉ | `T-AI-PLATFORM-03` | Validé avec 15 sub-agents |
| **Codex Adapter** | Codex CLI 0.144.6 | ✅ BOOTSTRAP QUALIFIÉ | `T-AI-PLATFORM-CODEX-BOOTSTRAP` | Agents personnalisés natifs lancés (`analyst-ticket`, `architect`) ; pipeline complet à éprouver sur tickets réels |

---

## Pilotes de Validation Codex (`T-AI-PLATFORM-CODEX-BOOTSTRAP`)

### 1. État des preuves

Les agents personnalisés `.codex/agents/*.toml` sont présents et reconnus par le mécanisme
natif de subagents Codex. Le pilote du 2026-07-22 a lancé deux agents personnalisés
distincts :

- `analyst-ticket` : audit de l'état de l'adaptateur Codex.
- `architect` : comparaison entre l'ancienne documentation `codex exec` et le mécanisme
  natif disponible.

Les deux agents ont terminé en `STATUS: SUCCESS` et ont rendu des rapports structurés au
fil principal. Le bootstrap Codex est donc qualifié. Les scénarios de résilience restent
des validations progressives à mener sur de vrais tickets.

---

### 2. Matrice des Scénarios de Qualification Bout en Bout (En Cours)

| Scénario Pilote | Pipeline Exécuté | Statut Attendu | Résultat & Preuve |
| :--- | :--- | :---: | :--- |
| **Scénario 1 : Bootstrap natif partiel** | Orchestrateur → analyst-ticket → architect | `SUCCESS` | Exécuté le 2026-07-22 : agents natifs personnalisés lancés et terminés |
| **Scénario 2 : Rebond Échec Test** | Orchestrateur → developer → qa (`TEST_FAILED`) → developer → qa | `SUCCESS` après rebond | Non exécuté |
| **Scénario 3 : Hors Périmètre** | Orchestrateur → developer-fast (`OUT_OF_SCOPE`) → Stop/Escalade | `OUT_OF_SCOPE` | Non exécuté |
| **Scénario 4 : Indécision Métier** | Orchestrateur → analyst-functional (`NEEDS_DECISION`) → Arbitrage | `NEEDS_DECISION` | Non exécuté |
| **Scénario 5 : Résilience Timeout** | Orchestrateur → agent (`AGENT_TIMEOUT`) → Fallback | `ORCHESTRATOR_FALLBACK` | Non exécuté |
