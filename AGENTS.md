# AGENTS — Adaptateur Codex Multi-Agents

Version **v2.1 (Subagents natifs Codex)** — conforme au ticket `T-AI-PLATFORM-CODEX-BOOTSTRAP`.

Ce document est le contrat d'orchestration officiel pour **Codex CLI 0.144.6** sur ce dépôt.

---

## 1. Principe de fonctionnement Codex

Codex CLI dispose de subagents natifs. Les agents personnalisés du projet sont définis
dans `.codex/agents/*.toml` et chargés par leur champ `name`.

La configuration projet `.codex/config.toml` fixe `agents.max_depth = 1` pour empêcher
un agent enfant de relancer d'autres agents, et `agents.max_threads = 6` pour limiter
le parallélisme.

Le fil principal reste l'orchestrateur. Il lance les agents personnalisés nécessaires,
attend leurs retours, interprète leurs `STATUS` et décide de la suite. L'ancienne
approche `codex exec` n'est conservée que comme fallback legacy non interactif ; elle
n'est plus le chemin nominal de la plateforme.

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
| **Architecte Simple** | `architecte-simple.toml` | `read-only` | Arbitrage technique simple, anti-sur-ingénierie et explicabilité DWWM |
| **Briefing Agent** | `briefing-agent.toml` | `read-only` | Rédige le mandat minimal et cadré pour le développeur |
| **Développeur Général** | `developer.toml` | `workspace-write` | Implémente la solution technique du ticket (Backend/Frontend/SQL) |
| **Développeur Rapide** | `developer-fast.toml` | `workspace-write` | Tâches triviales et ponctuelles (≤ 2 fichiers) |
| **Spécialiste Backend** | `backend.toml` | `workspace-write` | Développe les routes Express et contrôleurs |
| **Backend Express** | `backend-express.toml` | `workspace-write` | Développe les routes, contrôleurs et middlewares Express ciblés |
| **Spécialiste Frontend** | `frontend.toml` | `workspace-write` | Développe les composants React et styles |
| **Frontend React** | `frontend-react.toml` | `workspace-write` | Développe les composants, hooks et pages React ciblés |
| **Spécialiste Database** | `database.toml` | `workspace-write` | Développe les migrations et scripts SQL |
| **Database MySQL** | `database-mysql.toml` | `workspace-write` | Conçoit les schémas, migrations et requêtes MySQL ciblés |
| **QA / Tests** | `qa.toml` | `workspace-write` | Exécute les suites de tests sans modifier le code applicatif |
| **QA Tests** | `qa-tests.toml` | `workspace-write` | Écrit ou exécute les tests ciblés après développement |
| **Reviewer** | `reviewer.toml` | `read-only` | Analyse le `git diff` uniquement pour valider la qualité |
| **Reviewer Code** | `reviewer-code.toml` | `read-only` | Relit le diff avec critères DWWM, sécurité de base et cohérence |
| **Sécurité** | `security.toml` | `read-only` | Audit de sécurité (dépendances, vulnérabilités, secrets) |
| **Product Owner** | `product-owner.toml` | `read-only` | Représente les exigences produit et la vision du backlog |
| **Consignateur Décision**| `decision-recorder.toml` | `workspace-write` | Ajoute la décision validée dans `DECISIONS.md` |
| **Agent Commit** | `commit-agent.toml` | `read-only` | Prépare le message de commit (NE COMMITTE JAMAIS) |
| **Documentation** | `documentation.toml` | `workspace-write` | Met à jour la doc de suivi hors contexte actif (`PROJECT_STATE`, `TODO`, docs techniques) |
| **Documentation Technique** | `documentation-technique.toml` | `workspace-write` | Maintient les documents techniques et décisions hors contexte actif |
| **Documentation Jury** | `documentation-jury.toml` | `workspace-write` | Prépare les documents et preuves destinés au jury DWWM |
| **Formateur DWWM** | `formateur-dwwm.toml` | `read-only` | Vérifie l'explicabilité jury et la couverture des compétences DWWM |

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

1. **Analyse** : lancer `analyst-ticket` comme subagent natif.
2. **Briefing** : lancer `briefing-agent` si le mandat de développement doit être cadré.
3. **Développement** : lancer `developer`, `developer-fast` ou le spécialiste adapté.
4. **QA** : lancer `qa` ou `qa-tests`.
5. **Revue** : lancer `reviewer` ou `reviewer-code`.
6. **Documentation** : lancer `documentation` uniquement si une doc de suivi doit être
   mise à jour.

Pendant le pilote, utiliser `/agent` pour inspecter les fils créés et vérifier que les
rôles n'ont pas été simulés dans le fil principal.
