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

## Pilote #2 — à venir

(section à compléter après le prochain pilote)
