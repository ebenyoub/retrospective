# Orchestrateur — contrat du contexte principal

Ce document formalise le rôle du contexte principal (orchestrateur). Il ne duplique pas
`.claude/PROJECT_WORKFLOW.md` (règles de fond) ni `.claude/DELEGATION.md` (codes de
retour, format de mandat/retour, budgets) : il précise uniquement ce que l'orchestrateur
a le droit de faire lui-même, et comment il pilote le pipeline.

Version **v1.2** — révisée le 2026-07-21 (répartition de la responsabilité Git Flow, voir
plus bas), après le pilote `DEV-ENV-01` (2026-07-20). Voir `docs/ai-platform/ARCHITECTURE.md`
(description portable du système) et `docs/ai-platform/LESSONS_LEARNED.md` (détail des
corrections apportées).

## Règle absolue

**L'orchestrateur ne lit, ne modifie et ne teste jamais lui-même le code applicatif —
même pour une modification triviale.** Pour toute tâche de code, il délègue toujours :
- à `developer-fast` pour une modification minimale et bornée ;
- à `backend-express` / `frontend-react` / `database-mysql` pour tout le reste.

Seule exception : une impossibilité technique explicitement démontrée par un agent
délégué (code de retour `TOOLS_UNAVAILABLE`) — jamais un choix de convenance ou de
rapidité.

**Aucun agent n'appelle jamais un autre agent.** Seul l'orchestrateur invoque des
agents ; chaque agent lui rend la main. C'est structurel, pas seulement une convention :
aucun agent de ce projet ne dispose de l'outil d'invocation d'agent dans son `tools:`.

**Chaque mandat envoyé à un agent inclut systématiquement l'état d'exécution courant du
pipeline** (étapes déjà faites, décisions déjà prises/exécutées) — pas seulement la tâche
ponctuelle de l'agent. Son absence a produit, lors du pilote `DEV-ENV-01`, un agent
recommandant une action déjà effectuée (voir `docs/ai-platform/LESSONS_LEARNED.md`).

## Responsabilité Git Flow (v1.2)

**L'orchestrateur garantit les préconditions Git avant chaque délégation — les agents ne
vérifient plus Git eux-mêmes, sauf deux exceptions.**

Concrètement : avant de dispatcher un agent qui va agir (lire en profondeur, écrire, ou
préparer une action), l'orchestrateur exécute `git status --short --branch` (et `git log`
si pertinent), interprète le résultat, et inscrit une conclusion explicite dans le mandat
sous le champ `ÉTAT GIT CONFIRMÉ` (branche, propreté, périmètre attendu — voir le protocole
de mandat dans `.claude/DELEGATION.md`). Cette vérification se fait **avant chaque dispatch
d'écriture**, pas uniquement une fois en tête de pipeline — l'état peut changer entre deux
étapes (intervention manuelle, plusieurs minutes d'écart).

**Exceptions, où l'agent conserve sa propre vérification Git** (parce que c'est le cœur de
sa mission, pas un prérequis externe à sa mission) :
- `commit-agent` — confirmer la branche fait partie de préparer un commit correct.
- `reviewer-code` — la cohérence branche/ticket fait partie de la revue elle-même.

Tous les autres agents (`analyst-ticket`, `analyst-functional`, `briefing-agent`,
`architecte-simple`, `formateur-dwwm`, `documentation-jury`, `documentation-technique`,
`decision-recorder`, `backend-express`, `frontend-react`, `database-mysql`,
`developer-fast`, `qa-tests`) font confiance au champ `ÉTAT GIT CONFIRMÉ` de leur mandat
sans le revérifier. `backend-express` a perdu l'outil `Bash` à cette occasion (il ne
servait qu'à ce contrôle, désormais inutile pour cet agent).

**Limite assumée, pas ignorée** : cette garantie repose sur la rigueur de l'orchestrateur à
chaque dispatch, pas sur un mécanisme infaillible — une intervention manuelle de
l'utilisateur entre la vérification et l'exécution (ex. `git checkout` tapé directement)
reste possible et non détectable a priori. Les étapes en aval (`qa-tests`, `reviewer-code`,
`commit-agent`) restent un filet de détection a posteriori, comme observé lors du pilote
`DEV-ENV-01` (voir `docs/ai-platform/LESSONS_LEARNED.md`).

## Limite opérationnelle connue (Claude Code)

Un agent nouvellement créé dans `.claude/agents/*.md` n'est pas immédiatement reconnu par
le dispatch natif (`subagent_type`) — le registre d'agents disponibles est figé en début de
session. Avant reconnaissance native, un appel échoue avec la liste des agents disponibles
au démarrage. Contournement le temps de la reconnaissance : dispatcher via `general-purpose`
en demandant explicitement de lire et suivre le fichier `.claude/agents/<nom>.md` comme
consigne. **Ce contournement ne fait pas respecter la restriction d'outils réelle
(`tools:`)** — seul le texte de la consigne est appliqué, pas le sandboxing technique.
Toujours vérifier, avant un pilote, si les agents nouvellement créés sont reconnus
nativement (l'erreur d'un appel `Agent` liste les agents reconnus) ; le cas échéant,
utiliser le dispatch natif pour une restriction d'outils réellement appliquée.

## Vérification préalable (avant de choisir ou reprendre un ticket)

1. Exécuter `git status --short --branch` et `git log --oneline -5`.
2. Comparer ce résultat à `.claude/CURRENT_TASK.md` / `.claude/HANDOVER.md`.
3. En cas de divergence (branche différente, PR mergée non reflétée, ticket dit « en
   cours » alors qu'il est déjà mergé) → s'arrêter, signaler l'écart à l'utilisateur, ne
   dispatcher aucun agent jusqu'à résolution.

Cette étape existe parce qu'elle a déjà été prise en défaut une fois sur ce projet
(audit du 2026-07-20 : `CURRENT_TASK.md`/`HANDOVER.md` décrivaient un état non commité
alors que le travail avait déjà été mergé via les PR #27 à #32).

## Synchronisation du contexte partagé (v1.3)

`CURRENT_TASK.md` et `HANDOVER.md` sont des artefacts de reprise, pas des sources de
vérité autonomes. L'orchestrateur est le seul responsable de les synchroniser à partir de
Git, du backlog et du dernier `STATUS` fiable du pipeline.

Règles :
- Git gagne toujours en cas de conflit avec un document.
- Aucun agent spécialisé ne modifie `CURRENT_TASK.md` ou `HANDOVER.md`.
- Avant clôture ou commit, l'orchestrateur synchronise ces fichiers ou signale
  explicitement pourquoi ils ne peuvent pas l'être.
- En cas d'écart non résolu, le pipeline retourne `CONTEXT_OUT_OF_SYNC` et aucun agent
  d'écriture n'est dispatché.

La décision portable complète est documentée dans
`docs/ai-platform/CONTEXT_SYNC.md`.

## Actions autorisées

- Lire les documents canoniques (`PROJECT_WORKFLOW.md`, `CLAUDE.md`, `CURRENT_TASK.md`,
  `HANDOVER.md`, `DELEGATION.md`) + `docs/backlog/*`.
- `git status --short --branch`, `git log` (lecture seule).
- `git checkout` (changement de branche, y compris pour synchroniser une branche de ticket
  après un merge), `git pull` (mise à jour d'une branche existante), `git branch -f <branche>
  <cible>` **uniquement si la branche déplacée ne porte aucun commit propre à rejouer**
  (sinon, remonter le risque à l'utilisateur avant toute opération). Ce sont des opérations
  de **synchronisation d'environnement** entre tickets — distinctes de l'analyse de portée
  d'un ticket, qui reste réservée à `analyst-ticket` (lequel n'a pas, et ne doit jamais
  avoir, l'outil Bash — précisément pour que cette frontière reste structurelle et pas
  seulement déclarative). Le `git status`/`git log` de la ligne précédente s'exécute aussi
  juste avant chaque dispatch d'un agent qui va agir, pour produire le champ
  `ÉTAT GIT CONFIRMÉ` de son mandat (voir §Responsabilité Git Flow ci-dessous).
- Invoquer des agents.
- Poser une question de clarification à l'utilisateur.
- Exécuter `git commit`, uniquement après validation explicite et après `commit-agent`.

## Actions interdites

- `Read`/`Edit`/`Write` sur le code applicatif.
- Lancer un test, un build, un lint.
- Choisir la prochaine tâche hors `docs/backlog/PRODUCT_BACKLOG.md`.
- `git add` / `git commit` / `git push` sans validation explicite.
- Trancher seul une ambiguïté métier (→ `analyst-functional`).

## Pipeline standard

```
Vérification préalable
→ analyst-ticket
→ analyst-functional (si ambiguïté métier détectée)
→ architect (si décision d'architecture nécessaire)
→ briefing-agent
→ developer | developer-fast
→ qa-tests
→ reviewer-code
→ documentation-technique (+ documentation-jury en parallèle si pertinent)
→ commit-agent
→ validation utilisateur
→ orchestrateur exécute git commit
```

`decision-recorder` n'est pas une étape séquentielle : il est invoqué hors pipeline, à
tout moment, dès qu'une décision utilisateur explicite est détectée dans la conversation.

## Boucles de reprise (pilotées par les codes de retour, voir DELEGATION.md)

| Code reçu | Rebouclage |
|---|---|
| `TEST_FAILED` | → developer(-fast) → qa-tests |
| `REVIEW_BLOCKED` | → developer(-fast) → qa-tests → reviewer-code |
| `NEEDS_DECISION` | → analyst-functional → utilisateur → decision-recorder → reprise |
| `OUT_OF_SCOPE` | → redispatch (developer-fast → developer spécialisé, ou découpage du ticket) |
| `CONTEXT_TOO_LARGE` | → analyst-ticket (redéfinir le périmètre) |
| `TOOLS_UNAVAILABLE` | → seul cas où l'orchestrateur peut agir lui-même, après ce signal |
| `PROCESS_VIOLATION` | → l'orchestrateur s'arrête, remédie (ex : créer la branche manquante) avant de continuer ; si la remédiation n'est pas triviale, escalade à l'utilisateur (comportement observé et validé lors du pilote `DEV-ENV-01`) |
| `SUCCESS` | → étape suivante du pipeline |

## Journalisation obligatoire du pipeline

À chaque exécution de ticket, l'orchestrateur tient un journal d'exécution, affiché à
l'utilisateur à la fin (ou sur demande en cours de route) :

```
ORCHESTRATOR — TICKET : <id>
│
├── analyst-ticket          <code>  (<durée>)  fichiers lus: N
├── analyst-functional      <code ou SKIPPED>  (<raison du skip si sauté>)
├── architect                <code ou SKIPPED>
├── briefing-agent            <code>  (<durée>)  fichiers lus: N
├── developer(-fast)          <code>  (<durée>)  fichiers modifiés: N
├── qa-tests                   <code>  (<durée>)
├── reviewer-code               <code>  (<durée>)
├── documentation-technique      <code ou SKIPPED>
└── commit-agent                  <code ou WAITING_USER>
```

Symboles de synthèse : ✅ SUCCESS · ⏭ SKIPPED (raison indiquée) · ⏸ WAITING_USER ·
❌ code d'échec (`TEST_FAILED`/`REVIEW_BLOCKED`/etc.). Pour chaque étape : code de
retour, temps d'exécution (best-effort), fichiers lus, fichiers modifiés — alimente le
rapport d'évaluation du pipeline en fin de pilote.

## Fin de cycle

Après `commit-agent` : présenter à l'utilisateur le journal complet, les fichiers
modifiés, le message de commit proposé, les résultats de tests, les limites connues —
puis attendre la validation explicite avant d'exécuter `git commit` (toujours
l'orchestrateur, jamais un subagent).
