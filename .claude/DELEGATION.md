# Délégation aux sous-agents

Ce document complète `.claude/PROJECT_WORKFLOW.md` (§ Orchestrateur) et
`.claude/ORCHESTRATOR.md` (contrat détaillé du contexte principal, pipeline, journal
d'exécution). Il ne les duplique pas.

Version **v1.3** — révisée le 2026-07-21 (sections « Codes de retour possibles » ajoutées
aux 8 agents originaux, frontière developer-fast clarifiée, comptage du roster corrigé —
voir `docs/ai-platform/LESSONS_LEARNED.md` entrée #8). Voir `docs/ai-platform/ARCHITECTURE.md` pour la
description portable de ce système (indépendante de ce projet) et
`docs/ai-platform/LESSONS_LEARNED.md` pour le détail de ce qui a changé et pourquoi.

## Principe

L'orchestrateur principal conserve toujours :
- l'objectif métier du ticket ;
- les décisions d'architecture actées ;
- la synthèse finale et la proposition de commit (jamais son exécution avant validation).

Il ne code, ne teste et ne relit jamais lui-même — voir `.claude/ORCHESTRATOR.md`.

**Depuis la v1.2, l'orchestrateur garantit aussi les préconditions Git avant chaque
délégation** (branche, propreté du dépôt) — la plupart des agents ne vérifient plus Git
eux-mêmes, à l'exception de `commit-agent` et `reviewer-code` (pour qui cette vérification
fait partie intégrante de leur mission). Voir `.claude/ORCHESTRATOR.md §Responsabilité Git
Flow` pour le détail complet et le raisonnement.

**Aucun agent n'appelle jamais un autre agent.** Seul l'orchestrateur invoque des agents ;
chaque agent lui rend la main. C'est structurel : aucun agent de ce projet ne dispose de
l'outil d'invocation d'agent dans son `tools:`.

## Rôles

| Rôle | Claude Code (`.claude/agents/`) | Codex (`.codex/agents/`) | Portage Codex |
|---|---|---|---|
| Orchestration | — (contrat dans `.claude/ORCHESTRATOR.md`) | — | Différé |
| Analyse technique du ticket | analyst-ticket | — | Différé |
| Analyse fonctionnelle / métier | analyst-functional | — | Différé |
| Décision d'architecture (conseil) | architecte-simple | — | Différé |
| Préparation du contexte de dev | briefing-agent | — | Différé |
| Développement | backend-express, frontend-react, database-mysql | — | Différé |
| Développement minimal (tâches triviales) | developer-fast | — | Différé |
| Tests | qa-tests | qa | Déjà portée |
| Revue | reviewer-code | reviewer | Déjà portée |
| Documentation technique / suivi projet | documentation-technique | — | Différé |
| Documentation soutenance DWWM | documentation-jury | — | Différé |
| Préparation de commit (jamais d'exécution) | commit-agent | — | Différé |
| Enregistrement des décisions humaines | decision-recorder | — | Différé |
| Autre (conseil, ne modifie aucun fichier) | formateur-dwwm | — | Différé |

**Roster gelé à 13 rôles + l'orchestrateur** (15 fichiers dans `.claude/agents/*.md` : le
rôle « Développement » regroupe 3 agents spécialisés — `backend-express`, `frontend-react`,
`database-mysql` — comptés comme un seul rôle dans ce gel ; correction de comptage v1.3,
`ARCHITECTURE.md`/`LESSONS_LEARNED.md` divergeaient). Un nouvel agent n'est créé que si une
difficulté réelle, observée dans la pratique, l'exige — jamais par anticipation d'un
problème hypothétique.

## Codes de retour standardisés

```
SUCCESS            → l'orchestrateur avance à l'étape suivante du pipeline
NEEDS_DECISION     → orchestrateur → analyst-functional → utilisateur → decision-recorder
TEST_FAILED        → orchestrateur → developer(-fast) → qa-tests (nouvelle passe)
REVIEW_BLOCKED     → orchestrateur → developer(-fast) → qa-tests → reviewer-code
OUT_OF_SCOPE       → orchestrateur → redispatch (voir l'agent concerné)
CONTEXT_TOO_LARGE  → orchestrateur → analyst-ticket (redéfinir le périmètre)
TOOLS_UNAVAILABLE  → seul cas où l'orchestrateur peut agir lui-même, après ce signal
PROCESS_VIOLATION  → orchestrateur s'arrête, remédie (ex : créer la branche manquante) avant
                      de continuer ; si la remédiation n'est pas triviale, escalade à
                      l'utilisateur plutôt que de trancher seul (ajouté en v1.1, pilote
                      DEV-ENV-01 — voir docs/ai-platform/LESSONS_LEARNED.md)
```

`PROCESS_VIOLATION` peut être émis par **n'importe quel agent**, à tout moment : c'est le
code dédié aux violations de règles de processus (branche incorrecte, ticket ne correspondant
pas à la branche, périmètre non déclaré) — distinct de `OUT_OF_SCOPE` (le périmètre du ticket
est correct mais trop grand) et de `TOOLS_UNAVAILABLE` (un outil technique manque).

Ce sont des seuils que chaque agent s'applique à lui-même en suivant sa consigne, pas une
limite mécanique imposée par l'outillage — leur valeur est de rendre un dépassement
détectable et déclaré plutôt que silencieux.

## Budgets par agent (fichiers / commandes / taille de sortie)

Budgets révisés en v1.1 (recalibrage à partir des mesures réelles du pilote `DEV-ENV-01` —
les budgets initiaux étaient des estimations, deux se sont révélés trop stricts en pratique)
puis en v1.2 (retrait de la clause « commandes shell » pour `backend-express` groupe, `Bash`
n'y étant plus disponible). Voir `docs/ai-platform/LESSONS_LEARNED.md` pour le détail.

```
analyst-ticket            ≤ 10 fichiers lus  · 0 écriture             · sortie ≤ 500 mots
analyst-functional        ≤ 6 documents      · 0 écriture*            · sortie ≤ 500 mots
architecte-simple          ≤ 10 fichiers      · 0 écriture             · sortie ≤ 500 mots
briefing-agent              ≤ 8 fichiers (= périmètre reçu) · 0 écriture · 0 shell · sortie ≤ 400 mots
developer-fast               ≤ 2 fichiers · ≤ 1 ticket                  · sortie ≤ 300 mots
backend-express /
frontend-react /
database-mysql                ≤ 8 fichiers · ≤ 30k tokens de contexte reçu
                                ≤ 1 ticket · sortie ≤ 300 mots
                                (aucun outil Bash depuis la v1.2 : plus de commande shell —
                                voir §Responsabilité Git Flow dans ORCHESTRATOR.md)
qa-tests                        ≤ 8 fichiers de test · ≤ 5 commandes
                                  sortie ≤ 30 lignes (régression standard) · ≤ 60 lignes si
                                  vérification fonctionnelle réelle demandée explicitement
                                  dans le mandat (Docker, navigateur...) — ↑ depuis v1.0,
                                  30 lignes était irréaliste pour documenter une vérification
                                  en environnement réel
reviewer-code                    borné par le diff · ≤ 6 commandes lecture (↑ depuis v1.0,
                                  ≤3 était sous-calibré : status+diff+diff --cached+3×log
                                  est un usage légitime, pas un dérapage) · sortie ≤ 20 remarques
documentation-technique            ≤ 4 documents · 0 commande shell       · sortie ≤ 300 mots
documentation-jury                  ≤ 4 documents · 0 commande shell       · sortie ≤ 300 mots
commit-agent                          ≤ 1 ticket · ≤ 3 commandes lecture    · sortie ≤ 200 mots
                                        (↑ depuis v1.0 : message+liste+résumé de diff tiennent
                                        mal en 150 mots)
decision-recorder                      ≤ 3 fichiers · 0 commande shell      · sortie ≤ 180 mots

* analyst-functional peut écrire dans BACKLOG_IDEAS.md, uniquement après validation
  explicite du Product Owner.
```

## Frontière developer-fast / développeur spécialisé (v1.3)

Le nombre de fichiers ne suffit pas à choisir seul entre `developer-fast` (≤ 2 fichiers)
et un développeur spécialisé (`backend-express`/`frontend-react`/`database-mysql`,
≤ 8 fichiers) : une zone de recouvrement existe entre 3 et 8 fichiers. Le critère décisif
est la **nature du changement**, pas sa taille :

- Modification mécanique et triviale (typo, import, valeur en dur, ajustement de style
  ponctuel) répétée à l'identique sur plusieurs fichiers → reste `developer-fast`, même
  au-delà de 2 fichiers si chaque occurrence est réellement identique et sans risque
  d'interprétation.
- Toute nouvelle logique, nouveau endpoint, nouvelle requête SQL, nouveau composant, ou
  changement de comportement observable → développeur spécialisé, même sur un seul
  fichier.

En cas de doute persistant, l'orchestrateur dispatche vers le développeur spécialisé
(budget plus large, jamais l'inverse) plutôt que de risquer un `OUT_OF_SCOPE` renvoyé par
`developer-fast` après coup.

## Portabilité (Claude Code → Codex → AGY)

Portage Codex/AGY volontairement différé jusqu'à validation du système sur plusieurs
tickets côté Claude Code. Éléments à garder strictement identiques lors du portage :
- le **format de mandat** et le **format de retour** ci-dessous (indépendants de la
  plateforme) ;
- les **codes de retour standardisés** et les **budgets** ci-dessus ;
- la règle absolue du `commit-agent` (jamais d'exécution Git) — non négociable, quelle
  que soit l'IA ;
- la table des rôles ci-dessus (nom du rôle, responsabilité unique) — seule la colonne
  « outils disponibles » varie selon la plateforme ;
- les boucles de reprise (`.claude/ORCHESTRATOR.md`) ;
- la règle « l'orchestrateur ne code jamais, `developer-fast` pour les tâches triviales »
  — un comportement, pas une implémentation technique liée à Claude Code.

Ce qui est spécifique à Claude Code et n'a pas vocation à être copié tel quel : le
frontmatter YAML (`tools:`), l'invocation via l'outil `Agent`. Côté Codex, l'équivalent
est `developer_instructions` en TOML (voir `.codex/agents/*.toml` existants).

## Règles de délégation

- Déléguer une tâche autonome et clairement bornée, dans le périmètre déclaré pour le
  ticket courant (cf. `.claude/CLAUDE.md` règle 11).
- Donner au sous-agent uniquement les fichiers et commandes nécessaires.
- Demander un résumé structuré, jamais la totalité des logs bruts.
- Ne jamais déléguer une décision métier, une modification ambiguë, ou le choix de la
  prochaine tâche (réservé à l'orchestrateur).
- Ne pas lancer deux sous-agents qui modifient les mêmes fichiers en parallèle.
- Un sous-agent ne committe jamais, ne merge jamais, ne change jamais de branche — y
  compris `commit-agent`, qui ne fait que préparer.
- Arrêter une investigation dès qu'elle sort du périmètre du ticket courant.

## Protocole de mandat (orchestrateur → agent)

```
TICKET
OBJECTIF
ÉTAT D'EXÉCUTION COURANT
ÉTAT GIT CONFIRMÉ
PÉRIMÈTRE
CONTEXTE UTILE (obligatoire / optionnel — voir briefing-agent)
FICHIERS AUTORISÉS
CONTRAINTES
CRITÈRES D'ACCEPTATION
COMMANDES AUTORISÉES
RÉSULTAT ATTENDU
```

**`ÉTAT D'EXÉCUTION COURANT`** (ajouté en v1.1) : quelles étapes du pipeline sont déjà
faites, quelles décisions ont déjà été prises/exécutées avant ce mandat. Champ obligatoire —
son absence a produit, lors du pilote `DEV-ENV-01`, un agent (`decision-recorder`)
recommandant une action déjà effectuée faute de savoir qu'elle l'était déjà.

**`ÉTAT GIT CONFIRMÉ`** (ajouté en v1.2) : branche courante, propreté du dépôt, périmètre
de fichiers attendu — vérifié par l'orchestrateur juste avant ce dispatch précis (voir
`.claude/ORCHESTRATOR.md §Responsabilité Git Flow`). Obligatoire pour tout agent qui va
agir, sauf `commit-agent`/`reviewer-code` qui vérifient eux-mêmes. Un agent qui reçoit un
mandat sans ce champ (hors ces deux exceptions), ou dont le contenu semble incohérent avec
la tâche demandée, doit s'arrêter et signaler `PROCESS_VIOLATION` plutôt qu'agir sur une
supposition.

## Format de retour obligatoire

Chaque sous-agent (Claude, Codex ou autre) doit retourner uniquement :

```
STATUS               (un des 8 codes ci-dessus)
RÉSUMÉ
FICHIERS CONSULTÉS
FICHIERS MODIFIÉS
COMMANDES EXÉCUTÉES
RÉSULTATS
RISQUES
QUESTIONS
PROCHAINE ACTION RECOMMANDÉE
```

Respecter le budget de mots/lignes/remarques de l'agent (table ci-dessus). Ne jamais
recopier des logs bruts complets : ne garder que ce qui est nécessaire à la décision.

## Boucles

Voir `.claude/ORCHESTRATOR.md` §Boucles de reprise — non dupliquées ici.

## Quand aucun sous-agent n'est disponible

Si la plateforme ne permet pas la délégation (ex : une IA sans mécanisme de sous-agent
documenté) :
- exécuter la tâche directement ;
- limiter la sortie affichée (options `--silent`, filtrage, résumé manuel) ;
- ne conserver que la synthèse dans le contexte ;
- ne jamais prétendre avoir délégué à un sous-agent qui n'existe pas.
