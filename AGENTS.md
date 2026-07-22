# AGENTS — Adaptateur Codex Multi-Agents

Version **v2.0 (Adaptateur Codex Qualifié)** — créative et conforme au ticket `T-AI-PLATFORM-CODEX-02`.

Ce document est le contrat d'orchestration officiel pour **Codex CLI 0.144.3** sur ce dépôt.

---

## 1. Principe de fonctionnement Codex

Dans Codex CLI, les sous-agents ne sont pas des sous-processus invoqués dynamiquement au sein de la même session. Ce sont des **gabarits de prompt (prompts templates)** situés dans `.codex/agents/*.toml` lancés par l'orchestrateur via une commande CLI séparée :

```bash
cat .codex/agents/<role>.toml | codex exec --sandbox <read-only|workspace-write> --output-schema .codex/schema/agent_response.json "[MANDAT]"
```

---

## 2. Invariants & Règles de l'Orchestrateur

1. **L'Orchestrateur est l'unique décideur** : Il sélectionne le ticket, évalue la complexité, lance le rôle adapté et interprète la réponse `STATUS`.
2. **Interdiction de Coder / Tester / Relire** : L'orchestrateur ne modifie jamais lui-même le code applicatif, n'exécute pas les tests et ne fait pas la revue.
3. **Mode de Secours (ORCHESTRATOR_FALLBACK)** : Après l'échec définitif d'un rôle, l'orchestrateur consigne la raison, recherche d'abord un rôle existant raisonnablement compétent pour reprendre cette tâche, explique pourquoi ce remplaçant est pertinent et lui délègue le mandat minimal. Il ne sollicite l'utilisateur que si aucun rôle du dépôt ne convient raisonnablement. Il passe alors en mode de secours explicite `ORCHESTRATOR_FALLBACK`.
4. **Interdiction absolue de Commit Automatique** : Aucun agent ni sous-agent ne peut exécuter `git commit`, `git push` ou `git merge`. Seul l'utilisateur (ou l'orchestrateur après validation explicite) crée le commit.
5. **Contexte partagé synchronisé** : L'orchestrateur est le seul responsable de synchroniser `CURRENT_TASK.md` et `HANDOVER.md`. Ces fichiers sont des artefacts de reprise, pas des sources de vérité autonomes. En cas d'écart avec Git, Git gagne et l'orchestrateur retourne `CONTEXT_OUT_OF_SYNC` avant toute délégation d'écriture.

### Continuité après une recommandation

Après le retour d'un agent, l'orchestrateur évalue lui-même si la recommandation est
claire et si une décision utilisateur est réellement requise. Lorsqu'aucun arbitrage
produit, de périmètre, de sécurité ou d'autorisation n'est nécessaire, il ne s'arrête pas
à la synthèse de l'analyse : il propose l'étape suivante du workflow, avec les seuls
rôles utiles. Il ne lance toutefois aucun rôle sans l'accord explicite de l'utilisateur.

Toute réponse de synthèse qui contient une recommandation claire se termine par la
section exacte **`NEXT EXECUTION PLAN`**, comprenant :

- **Décision retenue**
- **Raisons**
- **Agents à lancer ensuite**
- **Ordre d'exécution**
- **Ce qui sera modifié**
- **Ce qui ne sera pas modifié**
- **Risques éventuels**
- **Point auquel une validation utilisateur devient réellement nécessaire**

Une validation utilisateur est réellement nécessaire uniquement si plusieurs options
restent matériellement équivalentes après analyse, si le choix modifie le périmètre
produit convenu, si une action externe ou difficilement réversible doit être autorisée,
ou si un statut du pipeline impose une escalade. Dans tous les autres cas, la réponse
termine explicitement par : « J’ai une recommandation claire et un plan d’exécution.
Puis-je lancer l’étape suivante ? »

---

## 3. Roster des Rôles Codex (`.codex/agents/`)

| Rôle | Fichier `.toml` | Sandbox OS | Responsabilité Unique |
| :--- | :--- | :--- | :--- |
| **Analyste Ticket** | `analyst-ticket.toml` | `read-only` | Portée technique du ticket, périmètre et proposition de découpage |
| **Analyste Fonctionnel** | `analyst-functional.toml` | `read-only` | Règles métier, clarification des exigences et indécisions |
| **Architecte** | `architect.toml` | `read-only` | Conseil d'architecture et conformité aux patrons de conception |
| **Briefing Agent** | `briefing-agent.toml` | `read-only` | Rédige le mandat minimal et cadré pour le développeur |
| **Développeur Général** | `developer.toml` | `workspace-write` | Implémente la solution technique du ticket (Backend/Frontend/SQL) |
| **Développeur Rapide** | `developer-fast.toml` | `workspace-write` | Tâches triviales et ponctuelles (≤ 2 fichiers) |
| **Spécialiste Backend** | `backend.toml` | `workspace-write` | Développe les routes Express et contrôleurs |
| **Spécialiste Frontend** | `frontend.toml` | `workspace-write` | Développe les composants React et styles |
| **Spécialiste Database** | `database.toml` | `workspace-write` | Développe les migrations et scripts SQL |
| **QA / Tests** | `qa.toml` | `workspace-write` | Exécute les suites de tests sans modifier le code applicatif |
| **Reviewer** | `reviewer.toml` | `read-only` | Analyse le `git diff` uniquement pour valider la qualité |
| **Sécurité** | `security.toml` | `read-only` | Audit de sécurité (dépendances, vulnérabilités, secrets) |
| **Product Owner** | `product-owner.toml` | `read-only` | Représente les exigences produit et la vision du backlog |
| **Consignateur Décision**| `decision-recorder.toml` | `workspace-write` | Ajoute la décision validée dans `DECISIONS.md` |
| **Agent Commit** | `commit-agent.toml` | `read-only` | Prépare le message de commit (NE COMMITTE JAMAIS) |
| **Documentation** | `documentation.toml` | `workspace-write` | Met à jour la doc de suivi hors contexte actif (`PROJECT_STATE`, `TODO`, docs techniques) |

---

## 4. Contrat de Retour Obligatoire (JSON Schema)

Chaque rôle retournera un objet JSON conforme au schéma `.codex/schema/agent_response.json` contenant les 5 champs :

- `STATUS` : Le code d'état d'exécution
- `SUMMARY` : Synthèse claire du résultat
- `EVIDENCE` : Preuves factuelles (diff, logs de test, fichiers lus)
- `FILES_MODIFIED` : Liste des fichiers impactés
- `NEXT_ACTION` : Recommandation pour l'étape suivante

---

## 5. Matrice de Résilience & Gestion des Erreurs

| Code STATUS | Décideur | Action de Relance / Escalade | Tentatives Max |
| :--- | :--- | :--- | :---: |
| `TEST_FAILED` | Orchestrateur | Relance `developer` avec le rapport d'échec pour correction | 2 |
| `REVIEW_BLOCKED` | Orchestrateur | Relance `developer` avec les remarques du reviewer | 2 |
| `NEEDS_DECISION` | Orchestrateur | Invoque `analyst-functional` puis sollicite l'utilisateur | 1 |
| `OUT_OF_SCOPE` | Orchestrateur | Invoque `analyst-ticket` pour découper le ticket | 1 |
| `PROCESS_VIOLATION` | Orchestrateur | Stoppe le pipeline, rectifie la branche/environnement ou sollicite l'utilisateur | 1 |
| `AGENT_TIMEOUT` | Orchestrateur | Relance l'agent une seconde fois. En cas de récidive, passe en `ORCHESTRATOR_FALLBACK` | 2 |
| `BLOCKED` | Orchestrateur | Suspend le ticket et remonte le blocage à l'utilisateur | 1 |
| `CONTEXT_OUT_OF_SYNC` | Orchestrateur | Stoppe le pipeline, compare Git / backlog / contexte partagé, synchronise ou demande validation | 1 |

---

## 6. Guide de Qualification (Pilote)

Pour exécuter un pilote de qualification Codex complet sur un ticket :

1. **Analyse** : `cat .codex/agents/analyst-ticket.toml | codex exec --sandbox read-only "[TICKET]"`
2. **Briefing** : `cat .codex/agents/briefing-agent.toml | codex exec --sandbox read-only "[CONTEXTE]"`
3. **Développement** : `cat .codex/agents/developer.toml | codex exec --sandbox workspace-write "[MANDAT]"`
4. **QA** : `cat .codex/agents/qa.toml | codex exec --sandbox workspace-write "Exécute les tests"`
5. **Revue** : `cat .codex/agents/reviewer.toml | codex exec --sandbox read-only "Revoie le diff"`
6. **Documentation** : `cat .codex/agents/documentation.toml | codex exec --sandbox workspace-write "Met à jour la doc"`
