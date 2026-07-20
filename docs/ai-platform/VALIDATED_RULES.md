# Règles validées — système d'agents

Ce document ne contient **que** des règles démontrées par un pilote réel, jamais une
intention ou une préférence de conception. Trois statuts possibles :

- **VALIDÉ** — observé fonctionner en conditions réelles, sur au moins un pilote.
- **PARTIELLEMENT VALIDÉ** — observé fonctionner avec au moins une réserve notée.
- **EN ATTENTE DE VALIDATION** — correction appliquée suite à une leçon (voir
  `LESSONS_LEARNED.md`), mais pas encore re-testée par un pilote depuis.

Ne pas ajouter une ligne ici sans preuve tirée de `PILOTS.md`. C'est la différence
avec un fichier de conventions générique (souhaits/règles mélangés) : chaque ligne d'ici
est le résultat d'une observation, pas d'une intention.

---

## VALIDÉ

### ✓ Git Flow vérifié avant une action d'écriture, blocage réel si non conforme
**Pilote** : DEV-ENV-01 (+ vérification du commit infrastructure IA, 2026-07-20).
**Résultat** : `commit-agent` a détecté que le périmètre demandé (infrastructure IA) ne
correspondait pas à la branche courante (`feature/DEV-ENV-01-hot-reload`, nommée pour un
autre sujet) et a renvoyé `STATUS: PROCESS_VIOLATION` sans préparer de proposition —
plutôt que de produire un commit incohérent. Preuve qu'un agent peut **faire respecter**
une règle, pas seulement la répéter en texte.

### ✓ Aucun agent n'appelle un autre agent (invariant structurel)
**Pilote** : DEV-ENV-01, 9 dispatches consécutifs.
**Résultat** : chaque agent a rendu la main à l'orchestrateur sans exception ; aucune
cascade non maîtrisée observée.

### ✓ Le reviewer ne modifie jamais le code, travaille uniquement sur le périmètre du diff
**Pilote** : DEV-ENV-01.
**Résultat** : `reviewer-code` a strictement limité sa lecture à 1 fichier
(`retrospective_backend/package.json`) malgré 8 fichiers modifiés/non trackés présents sur
la même branche ; aucune modification effectuée.

### ✓ Le testeur ne modifie jamais le code applicatif de façon persistante
**Pilote** : DEV-ENV-01.
**Résultat** : `qa-tests` a modifié `server.ts` temporairement pour un test de hot reload,
puis restauré (`git checkout --`), diff final nul vérifié.

### ✓ `commit-agent` ne committe jamais lui-même
**Pilote** : DEV-ENV-01.
**Résultat** : deux mandats exécutés (dont un bloqué par `PROCESS_VIOLATION`), aucune
commande d'écriture Git (`git add`/`git commit`) exécutée par l'agent dans les deux cas.

### ✓ Le briefing (`briefing-agent`) réduit le nombre de fichiers lus par le développeur
**Pilote** : DEV-ENV-01.
**Résultat** : périmètre reçu = 2 fichiers exacts, aucun fichier de plus lu ;
`developer-fast` n'a eu besoin de rien redécouvrir par lui-même.

### ✓ Un dépassement de budget est détecté et déclaré plutôt que silencieux
**Pilote** : DEV-ENV-01.
**Résultat** : `commit-agent` s'est arrêté à son budget de commandes de lecture et a
explicitement signalé ce qu'il n'avait pas pu vérifier plutôt que de le passer sous
silence.

---

## PARTIELLEMENT VALIDÉ

### ⚠ `decision-recorder` persiste une décision humaine immédiatement
**Pilote** : DEV-ENV-01.
**Résultat** : décision persistée avec succès dans `DECISIONS.md`/`PROJECT_STATE.md`, mais
sa `PROCHAINE ACTION RECOMMANDÉE` était erronée (proposait une action déjà effectuée),
faute d'état d'exécution dans son mandat. Corrigé en v1.1 (champ `ÉTAT D'EXÉCUTION
COURANT`) — non re-testé depuis la correction.

---

## EN ATTENTE DE VALIDATION (correction v1.1 appliquée, pas encore re-testée)

### `analyst-ticket` / `briefing-agent` / `developer-fast` vérifient le Git Flow avant d'agir
**Origine** : leçon #1 du pilote DEV-ENV-01 — ces trois agents n'avaient initialement
qu'un renvoi vers `PROJECT_WORKFLOW.md`, insuffisant en pratique (`developer-fast` a écrit
sur `dev` sans branche dédiée). Consigne explicite réintégrée en v1.1.
**À valider** : lors du prochain pilote, confirmer que la vérification bloque bien
*avant* toute écriture, pas seulement *a posteriori* comme cette fois (où c'est
`qa-tests`, plus tard dans la chaîne, qui avait détecté l'anomalie).

### `PROCESS_VIOLATION` couvre correctement les anomalies de processus au-delà de Git Flow
**Origine** : leçon #4 du pilote DEV-ENV-01.
**À valider** : un cas hors Git Flow (ticket manquant, périmètre non déclaré) n'a pas
encore été observé en pratique.

### Budgets recalibrés (`qa-tests`, `reviewer-code`, `commit-agent`, `decision-recorder`)
**Origine** : leçon #5 du pilote DEV-ENV-01.
**À valider** : les nouveaux seuils n'ont pas encore été mesurés sur un second pilote.

### Boucles d'échec (`TEST_FAILED`, `REVIEW_BLOCKED`, `OUT_OF_SCOPE`, `CONTEXT_TOO_LARGE`)
**Origine** : conçues dès le départ, jamais déclenchées — le pilote #1 a suivi un chemin
heureux complet sans aucun échec réel.
**À valider** : nécessite un pilote conçu pour provoquer un échec réel (voir `PILOTS.md`,
pilote #2 proposé).
