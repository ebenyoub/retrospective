# Architecture d'orchestration multi-agents — référence portable

> Ce document décrit le système d'agents de façon **indépendante du projet Rétrospective**.
> L'implémentation opérationnelle pour ce projet vit dans `.claude/ORCHESTRATOR.md` et
> `.claude/DELEGATION.md` — ce sont eux la source d'exécution réelle, pas ce fichier. Ce
> document est le résumé à copier/adapter pour un autre projet.

Version **v1.2** (2026-07-21, revue de cohérence post-pilote). Voir `PILOTS.md` pour
l'historique des pilotes et `LESSONS_LEARNED.md` pour le détail des corrections apportées.

## Principe fondateur

Le contexte principal (orchestrateur) devient un **orchestrateur léger** : il sélectionne
la tâche, délègue chaque étape à un agent spécialisé travaillant dans son propre contexte,
collecte des synthèses structurées, et ne lit, ne modifie, ni ne teste jamais lui-même le
code applicatif — même pour une modification triviale (voir `developer-fast`).

## Invariant structurel

**Aucun agent n'appelle jamais un autre agent.** Seul l'orchestrateur invoque des agents ;
chaque agent lui rend la main. Ce n'est pas qu'une convention : dans Claude Code, c'est
garanti par le fait qu'aucun agent ne dispose de l'outil d'invocation d'agent dans son
`tools:`. Toute cascade non maîtrisée est structurellement impossible.

## Roster (13 agents + orchestrateur, gelé)

Un nouvel agent n'est créé que si une difficulté réelle, observée dans la pratique,
l'exige — jamais par anticipation d'un problème hypothétique (règle appliquée dès la
conception : `workflow-validator` et une machine à états rigide ont été envisagés puis
écartés faute de preuve d'un besoin réel — voir `LESSONS_LEARNED.md` si un futur pilote en
apporte une).

| Rôle | Responsabilité unique |
|---|---|
| orchestrator | Dispatch, jamais de code/test/review lui-même |
| analyst-ticket | Portée technique du ticket, périmètre, découpage éventuel |
| analyst-functional | Règles métier, ambiguïtés, formule la question — ne tranche jamais |
| architect | Conseil d'architecture, ne modifie jamais rien |
| briefing-agent | Transforme le périmètre validé en mandat minimal (obligatoire/optionnel) |
| developer / developer-fast | Implémentation, jamais de revue de son propre travail |
| qa-tests | Tests, ne modifie jamais le code applicatif |
| reviewer-code | Revue du diff uniquement, ne corrige jamais |
| documentation-technique | Doc de suivi technique (PROJECT_STATE, TODO, DECISIONS, CURRENT_TASK/HANDOVER) |
| documentation-jury | Doc de soutenance, spécialisée, jamais fusionnée avec la précédente |
| commit-agent | Prépare message/fichiers/diff, n'exécute **jamais** `git commit` |
| decision-recorder | Persiste immédiatement une décision humaine déjà exprimée, hors pipeline |

## Pipeline standard

```
Vérification préalable (état Git réel vs état documenté)
→ analyst-ticket
→ analyst-functional (si ambiguïté métier)
→ architect (si décision d'architecture)
→ briefing-agent
→ developer | developer-fast
→ qa-tests
→ reviewer-code
→ documentation-technique (+ documentation-jury en parallèle si pertinent)
→ commit-agent
→ validation utilisateur
→ orchestrateur exécute le commit
```

`decision-recorder` est hors pipeline : invoqué à tout moment dès qu'une décision humaine
explicite est détectée.

## Codes de retour standardisés

```
SUCCESS            → étape suivante
NEEDS_DECISION      → utilisateur, puis decision-recorder
TEST_FAILED          → retour au développeur puis re-test
REVIEW_BLOCKED         → retour au développeur puis re-test puis re-revue
OUT_OF_SCOPE             → redispatch (agent spécialisé, ou découpage du ticket)
CONTEXT_TOO_LARGE          → retour à analyst-ticket, redéfinir le périmètre
TOOLS_UNAVAILABLE            → seul cas où l'orchestrateur peut agir lui-même
PROCESS_VIOLATION             → arrêt, remédiation (branche/ticket), escalade si non triviale
```

Sept codes couvraient le chemin heureux et les échecs techniques ; le huitième
(`PROCESS_VIOLATION`) a été ajouté après un cas réel observé, pas par anticipation —
cohérent avec la règle de gel du roster.

## Règles d'or transverses

- Le reviewer ne corrige jamais son propre constat.
- Le testeur ne modifie jamais le code applicatif.
- L'analyste ne développe jamais.
- Le développeur ne valide jamais définitivement son propre travail.
- **La vérification Git Flow appartient à qui elle sert réellement, pas à qui pourrait
  bêtement la recopier.** Leçon en deux temps : le pilote `DEV-ENV-01` a montré qu'un
  renvoi court vers un document externe ne suffit pas (v1.1, correction : consigne explicite
  dans chaque agent) ; la revue de cohérence suivante a montré que la majorité des agents
  n'avaient de toute façon pas l'outil pour exécuter cette consigne (v1.2, correction :
  l'orchestrateur garantit les préconditions Git avant chaque délégation ; seuls
  `commit-agent` et `reviewer-code` — pour qui c'est le cœur de la mission, pas un
  prérequis — vérifient encore par eux-mêmes). Le principe final : une responsabilité doit
  être portée par l'agent dont c'est réellement le métier, jamais dupliquée « par
  précaution » sur des agents qui ne peuvent de toute façon pas l'honorer.
- Chaque mandat envoyé à un agent inclut l'état d'exécution courant du pipeline, pas
  seulement sa tâche ponctuelle.
- Chaque agent a un budget déclaré (fichiers, commandes, taille de sortie) — un
  dépassement doit être détecté et déclaré par l'agent lui-même, jamais silencieux. Ces
  budgets sont recalibrés à partir de mesures réelles de pilotes, pas figés à la
  conception.

## Portabilité vers un autre projet

Ce qui est réellement portable, tel quel :
- l'invariant « aucun agent n'appelle un agent » ;
- le roster et la responsabilité unique de chaque rôle ;
- les codes de retour et le format de mandat/retour (dont `ÉTAT GIT CONFIRMÉ`) ;
- la règle « une responsabilité appartient à qui elle sert réellement, jamais dupliquée par
  précaution sur des agents qui ne peuvent pas l'honorer » ;
- la philosophie de budgets mesurables, recalibrés par l'usage réel.

Ce qui doit être adapté par projet :
- les chemins de fichiers exacts (ex. `docs/PROJECT_STATE.md`) ;
- le contenu spécifique des règles Git Flow (nom de branches, workflow de PR) ;
- les agents de développement spécialisés (`backend-express`/`frontend-react`/
  `database-mysql` sont propres à la stack de ce projet).

## Limite opérationnelle connue (Claude Code)

Un agent nouvellement créé n'est pas immédiatement reconnu par le dispatch natif
(`subagent_type`) — le registre est figé en début de session. Voir
`.claude/ORCHESTRATOR.md` §Limite opérationnelle pour le contournement et son coût (perte
de l'enforcement réel des restrictions d'outils tant que l'agent n'est pas reconnu
nativement).
