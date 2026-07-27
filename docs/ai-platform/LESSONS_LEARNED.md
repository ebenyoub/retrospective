# Leçons apprises — système d'agents

Format par leçon : problème observé → cause → correction → décision retenue. Alimenté à
chaque pilote (voir `PILOTS.md`). Ce fichier est la mémoire des raisons qui ont façonné
l'architecture — utile pour la maintenir, l'expliquer, ou la réutiliser sur un autre
projet sans reproduire les mêmes erreurs.

---

## Pilote #1 — DEV-ENV-01 (2026-07-20)

### 1. Git Flow non vérifié par les nouveaux agents (leçon la plus importante)

**Problème observé** : `developer-fast` a modifié `retrospective_backend/package.json`
directement sur la branche `dev`, sans branche `feature/*` créée au préalable — détecté
tardivement, par `qa-tests`, presque par hasard (vérification en conditions réelles).

**Cause** : les 7 nouveaux agents portaient un paragraphe court — *« applique les règles
de `PROJECT_WORKFLOW.md` (§Git Flow), ne les recopie pas ici »* — pensé pour réduire la
duplication relevée lors de l'audit initial. En pratique, ce renvoi n'a déclenché aucune
vérification concrète chez `analyst-ticket`, `briefing-agent` ni `developer-fast`. Les 8
agents d'origine (`backend-express` etc.) portent au contraire une consigne écrite en dur
et n'ont jamais présenté ce défaut.

**Correction** : réintégration d'un paragraphe Git Flow explicite (vérification
`git status --short --branch`, refus sur `main`, arrêt + `PROCESS_VIOLATION` sur `dev`
sans branche dédiée) dans chacun des 7 nouveaux agents, sur le modèle des 8 d'origine.

**Décision retenue** : les règles critiques (branche, ticket, périmètre) doivent toujours
être écrites explicitement dans chaque agent qui en a besoin, jamais seulement
référencées — même au prix d'une duplication. La réduction de duplication n'est pas un
objectif qui prime sur la fiabilité d'une règle de sécurité de processus.

---

### 2. Le contournement `general-purpose` ne fait pas respecter les restrictions d'outils

**Problème observé** : `developer-fast` a utilisé `Bash` alors que son `tools:` déclaré
(`Read, Edit, Grep, Glob`) ne le contient pas — et, contrairement à `analyst-ticket` un
peu plus tôt dans le même pilote, ne l'a pas signalé lui-même.

**Cause** : au moment de leur premier appel, les 7 nouveaux agents n'étaient pas encore
reconnus nativement par le dispatch `subagent_type` du harnais Claude Code (registre figé
en début de session). Le contournement utilisé (`general-purpose` + persona chargée en
texte depuis le fichier `.claude/agents/<nom>.md`) fait respecter le contenu de la
consigne, mais **pas** la restriction technique d'outils réelle.

**Correction** : aucune action de code — les agents ont été reconnus nativement en cours
de pilote (probablement dès la création effective des fichiers). `qa-tests`,
`reviewer-code`, `documentation-technique`, `commit-agent` et `decision-recorder` ont
ensuite tourné en dispatch natif, avec la vraie restriction d'outils appliquée.

**Décision retenue** : avant tout futur pilote, vérifier explicitement si les agents
concernés sont reconnus nativement (un appel `Agent` échoué liste les agents disponibles).
Documenté comme limite opérationnelle connue dans `.claude/ORCHESTRATOR.md` et
`ARCHITECTURE.md` pour ne pas la redécouvrir à chaque fois.

---

### 3. `decision-recorder` a recommandé une action déjà effectuée

**Problème observé** : sa `PROCHAINE ACTION RECOMMANDÉE` proposait de vérifier/créer la
branche `feature/DEV-ENV-01-hot-reload` — déjà créée avant son invocation.

**Cause** : son mandat contenait le contenu de la décision à persister, mais pas l'état
d'exécution du pipeline au moment de l'appel.

**Correction** : ajout d'un champ `ÉTAT D'EXÉCUTION COURANT`, obligatoire, au protocole de
mandat (`.claude/DELEGATION.md`).

**Décision retenue** : chaque mandat envoyé par l'orchestrateur inclut désormais
systématiquement où en est le pipeline, pas seulement la tâche ponctuelle de l'agent
destinataire.

---

### 4. Aucun code de retour pour les anomalies de processus

**Problème observé** : `qa-tests` a dû signaler l'anomalie Git Flow en texte libre dans
son `RÉSUMÉ`, faute d'un code standardisé adapté (les 7 codes existants couvrent
test/review/scope/context/outils, pas une violation de règle de workflow elle-même).

**Cause** : conception initiale des codes de retour pensée pour les échecs techniques du
ticket, pas pour les violations de règles de processus.

**Correction** : ajout du code `PROCESS_VIOLATION`, émissible par n'importe quel agent à
tout moment.

**Décision retenue** : le roster de codes reste ouvert à extension mesurée — un nouveau
code n'est ajouté qu'après un cas réel observé, jamais par anticipation (même principe que
pour le roster d'agents).

---

### 5. Budgets sous-calibrés pour `reviewer-code` et `qa-tests` en vérification réelle

**Problème observé** : `reviewer-code` a exécuté 6 commandes de lecture Git (status, diff,
diff --cached, 3× log ciblé) contre 3 budgétées — toutes légitimes, aucun dérapage réel.
`qa-tests` a largement dépassé les 30 lignes de sortie budgétées en documentant une
vérification fonctionnelle réelle (redémarrage Docker, édition de fichier, observation de
logs, reproduit 2 fois).

**Cause** : budgets initiaux fixés par estimation à la conception, avant toute mesure
réelle.

**Correction** : `reviewer-code` recalibré à ≤ 6 commandes lecture. `qa-tests` recalibré à
≤ 30 lignes pour une régression standard, ≤ 60 lignes si une vérification fonctionnelle
réelle en environnement est explicitement demandée dans le mandat. `commit-agent` et
`decision-recorder` légèrement relevés (150→200 mots et 150→180 mots) pour la même
raison : les budgets initiaux ne laissaient pas assez de place aux livrables attendus.

**Décision retenue** : les budgets sont révisés à chaque pilote sur la base de mesures
réelles, jamais figés définitivement à la conception. Un budget dépassé de façon légitime
et déclarée est un signal de recalibrage, pas une faute de l'agent.

---

## Revue de cohérence post-merge (2026-07-20, hors pilote)

### 6. Actions autorisées de l'orchestrateur trop restrictives par rapport à ses propres responsabilités déjà établies

**Problème observé** : l'orchestrateur a exécuté `git checkout`, `git pull` et
`git branch -f` pour resynchroniser `feature/DEV-ENV-01-hot-reload` après le merge de
`feature/AI-PLATFORM-v1.1`, alors qu'`ORCHESTRATOR.md §Actions autorisées` n'listait
explicitement que `git status`/`git log` (lecture seule).

**Cause** : ces opérations de synchronisation d'environnement étaient déjà implicitement
assumées ailleurs dans le même système (`developer-fast.md` : « la création de branche
reste une action de l'orchestrateur » ; boucle `PROCESS_VIOLATION` d'`ORCHESTRATOR.md` :
« remédie, ex : créer la branche manquante ») mais jamais rendues explicites dans la
section qui définit précisément ce que l'orchestrateur a le droit de faire.

**Correction** : `git checkout`/`git pull`/`git branch -f` (ce dernier uniquement sans
commit propre à rejouer) ajoutés explicitement aux actions autorisées de l'orchestrateur,
avec un renvoi clair : ce sont des opérations de synchronisation d'environnement, jamais
une analyse de portée de ticket (réservée à `analyst-ticket`).

**Décision retenue** : `analyst-ticket` reste volontairement sans outil `Bash` — la
frontière entre orchestrateur (environnement/Git Flow) et `analyst-ticket` (portée
fonctionnelle d'un ticket déjà identifié) doit rester structurelle, pas seulement
déclarative dans un document.

**Effet de bord découvert pendant cette revue, non corrigé ici** : 6 des 7 nouveaux agents
(`analyst-ticket`, `analyst-functional`, `briefing-agent`, `developer-fast`,
`documentation-technique`, `decision-recorder`) portent un paragraphe Git Flow leur
demandant d'exécuter `git status --short --branch` alors qu'aucun n'a l'outil `Bash` —
resté invisible tant qu'ils tournaient via le contournement `general-purpose` (qui
n'applique pas les restrictions d'outils), redevenu un vrai problème maintenant qu'ils
tournent nativement. À corriger séparément, avec validation explicite avant modification
(hors périmètre de cette clarification ponctuelle).

---

## Revue de cohérence complète (2026-07-21, hors pilote)

Audit systématique croisant `tools:` déclaré vs instructions vs `DELEGATION.md` sur les 15
agents. 2 problèmes critiques, 3 importants, 6 mineurs identifiés. Traités un par un,
critiques d'abord, sur arbitrage explicite avant chaque application (pas de correction en
bloc).

### 7. La majorité des agents ne pouvaient pas exécuter leur propre consigne Git Flow

**Problème observé** : 11 des 15 agents (les 6 non corrigés à l'entrée #6, plus
`architecte-simple`, `formateur-dwwm`, `documentation-jury` côté agents originaux) portaient
une consigne « exécute `git status --short --branch` » sans avoir l'outil `Bash`.
Structurellement inexécutable pour tous ces agents.

**Cause** : la correction v1.1 (entrée #1) a généralisé la même consigne à tous les
nouveaux agents sans croiser chaque fois avec leur `tools:` réel ; les 3 agents originaux
concernés portaient le même défaut depuis avant la refonte, jamais détecté faute d'audit
croisé.

**Correction (v1.2)** : répartition de la responsabilité plutôt que correction uniforme.
L'orchestrateur garantit désormais les préconditions Git avant chaque délégation (pas
seulement en tête de pipeline) et les inscrit dans un nouveau champ de mandat
`ÉTAT GIT CONFIRMÉ`. Les agents pour qui la vérification Git est un prérequis externe à
leur mission (tous sauf deux) font confiance à ce champ sans le revérifier. Deux
exceptions : `commit-agent` et `reviewer-code` conservent leur propre vérification, parce
que confirmer la branche fait partie intégrante de leur mission elle-même (préparer un
commit correct / juger une revue conforme au workflow), pas un prérequis externe à côté.
`backend-express` a perdu l'outil `Bash` au passage : il ne lui servait qu'à ce contrôle,
plus aucun usage documenté après ce retrait.

**Décision retenue** : une responsabilité doit être portée par l'agent dont c'est
réellement le métier — jamais dupliquée « par précaution » sur des agents qui ne peuvent
de toute façon pas l'honorer. Ça affine l'entrée #1 sans la contredire : le problème n'était
pas « les agents doivent tous vérifier Git eux-mêmes », mais « la vérification doit exister
quelque part et être réellement exécutable » — la version 1.1 avait raison sur le second
point, tort sur le premier.

**Limite assumée** : cette garantie centralisée dépend de la rigueur de l'orchestrateur à
chaque dispatch, pas d'un mécanisme infaillible. Une intervention manuelle de l'utilisateur
entre la vérification et l'exécution reste possible et non détectable a priori — les étapes
en aval (`qa-tests`, `reviewer-code`, `commit-agent`) restent un filet de détection a
posteriori, pas remplacées par cette centralisation.

**Reste à traiter** (audit du 2026-07-21, non corrigé dans cette passe, en attente
d'arbitrage) :
- C2 — `reviewer-code.md` recopie une définition obsolète du format de retour (pré-v1.1) au
  lieu de renvoyer à `DELEGATION.md`.
- I1 — les 8 agents originaux n'ont pas de section « Codes de retour possibles » explicite.
- I2 — frontière floue entre `developer` (≤8 fichiers) et `developer-fast` (≤2 fichiers)
  pour un périmètre de 3 à 8 fichiers.
- M1 à M6 — incohérences mineures de documentation (voir l'audit complet du 2026-07-21).

---

## Pilote #2 — à venir

(section à compléter après le prochain pilote)
