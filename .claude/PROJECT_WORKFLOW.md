# Workflow de développement du projet

Ce document définit la méthode de travail du projet.
Ces règles priment sur les préférences de l'IA.

---

# Source de vérité
Le Product Backlog est la source officielle des priorités.
L'IA ne choisit jamais elle-même la prochaine fonctionnalité.
Elle exécute la première tâche prioritaire non terminée, sauf décision explicite de l'utilisateur.
Les agents ne peuvent jamais créer ou modifier directement une User Story dans PRODUCT_BACKLOG.md sans validation explicite du Product Owner. Toute proposition doit d'abord être enregistrée dans BACKLOG_IDEAS.md.

---

# Orchestrateur
L'orchestrateur principal est le seul coordinateur du workflow.

Responsabilités :
- sélectionner la tâche courante ;
- vérifier la branche Git ;
- évaluer la complexité avant toute implémentation ;
- proposer un découpage si la tâche dépasse un composant ou plusieurs couches ;
- lancer le développement ;
- appeler Playwright lorsque la tâche modifie l'UI ;
- appeler le reviewer sur le git diff uniquement ;
- appeler la documentation après validation ;
- créer le commit ;
- vérifier que le dépôt est propre ;
- passer à la tâche suivante.

Avant toute implémentation, l'orchestrateur évalue la complexité de la tâche.
Si la tâche modifie plusieurs couches (frontend, backend, SQL, tests...), impacte un grand nombre de fichiers, ou dépasse le périmètre d'un seul composant, il suspend le développement et propose un découpage en sous-tâches.
Aucune implémentation ne commence tant que ce découpage n'est pas validé.
L'orchestrateur est responsable du respect du périmètre et vérifie que le développement reste limité au ticket courant.
Toute demande hors périmètre est enregistrée dans `BACKLOG_IDEAS.md` ou reportée à un ticket ultérieur.

Les subagents ne doivent jamais :
- choisir eux-mêmes une nouvelle tâche ;
- créer une User Story ;
- modifier le Product Backlog ;
- créer un commit de leur propre initiative.

Chaque subagent applique uniquement les règles correspondant à sa responsabilité.

---

# Git Flow obligatoire
Le projet utilise le workflow suivant :

```text
feature/<ticket-id>
↓ Pull Request
dev
↓ Validation
↓ Pull Request
main
↓ Déploiement
```

Règles de branches :
- `main` est toujours stable et déployable.
- `dev` est la branche d'intégration.
- chaque ticket du Product Backlog se développe sur une branche dédiée `feature/<ticket-id>`.
- le `<ticket-id>` de la branche doit correspondre au ticket traité.

Avant toute implémentation, l'agent doit :
1. exécuter `git status --short --branch` ;
2. identifier la branche courante ;
3. vérifier que la branche correspond au ticket en cours.

Si la branche courante est `main` :
- refuser toute implémentation directe ;
- demander ou créer une branche `feature/<ticket-id>` depuis `dev` uniquement après validation utilisateur.

Si la branche courante est `dev` :
- ne pas développer directement ;
- créer automatiquement `feature/<ticket-id>` avant toute modification, sauf si l'utilisateur demande explicitement une analyse sans code.

Si la branche courante est `feature/<autre-ticket>` :
- ne pas développer ;
- signaler que la branche ne correspond pas au ticket demandé.

Une Pull Request vers `dev` est obligatoire pour intégrer une branche `feature/*`.
Une Pull Request de `dev` vers `main` est obligatoire après validation.

---

# Reprise de session
Une nouvelle session ne doit jamais supposer l'état du projet.
Avant toute implémentation :
- lire la documentation ;
- analyser le dépôt Git dans son état actuel ;
- vérifier les modifications non commitées ;
- reconstruire l'état du projet à partir du code et des documents.
Ne jamais se baser sur une conversation précédente.

---

# Documents à consulter
Avant toute nouvelle tâche, lire :
- .claude/CLAUDE.md
- les skills pertinents
- .claude/PROJECT_WORKFLOW.md
- PROJECT_STATE.md
- PRODUCT_BACKLOG.md
- TODO.md
- DECISIONS.md

Le prototype Figma est la référence visuelle.
Le cahier des charges, les User Stories et le Product Backlog initial définissent le périmètre du MVP.

---

# Déroulement d'une tâche
Chaque tâche suit obligatoirement ce cycle :
1. analyser le Product Backlog ;
2. identifier la première tâche prioritaire non terminée ;
3. analyser le code concerné ;
4. proposer un plan si nécessaire ;
5. implémenter uniquement cette tâche ;
6. lancer les tests concernés ;
7. mettre à jour la documentation ;
8. attendre la validation utilisateur ;
9. seulement après validation, proposer un commit.

---

# Validation
Une tâche n'est jamais considérée comme terminée uniquement parce que :
- les tests passent ;
- le build réussit ;
- le code compile.
Une tâche est terminée uniquement après :
- validation fonctionnelle ;
- validation visuelle si nécessaire ;
- validation explicite de l'utilisateur.

---

# Analyse avant modification
Avant de modifier du code pour corriger un problème :
1. Reproduire le problème.
2. Identifier sa cause.
3. Vérifier qu'une solution n'existe pas déjà dans le projet.
4. Proposer la correction.
5. Implémenter.
Ne jamais modifier du code sur une simple hypothèse.

---

# Une seule tâche
Une session ne traite qu'une seule tâche du backlog.
Ne pas mélanger plusieurs User Stories.
Ne pas profiter d'une tâche pour effectuer une refactorisation importante non demandée.

---

# Périmètre du MVP
Aucune fonctionnalité ne doit être ajoutée au MVP sans justification.
Une fonctionnalité appartient au MVP uniquement si elle est présente dans au moins une des sources suivantes :
- cahier des charges ;
- User Stories ;
- Product Backlog initial ;
- prototype Figma.

Si aucune source ne la justifie :
- ne pas l'implémenter ;
- proposer son ajout dans "Évolutions futures".

---

# Architecture
Les décisions d'architecture déjà validées ne sont pas remises en question.
Toute nouvelle proposition d'architecture doit être justifiée.
Ne jamais effectuer une nouvelle refactorisation globale sans demande explicite.

---

# Fidélité Figma
Lorsque l'écran existe dans le prototype :
Figma est la source de vérité visuelle.
Ne pas proposer un design alternatif.
Comparer systématiquement :
- structure ;
- espacements ;
- tailles ;
- couleurs ;
- typographie ;
- bordures ;
- responsive.

---

# Documentation
Toute modification fonctionnelle doit mettre à jour :
- PROJECT_STATE.md
- TODO.md

Mettre à jour DECISIONS.md uniquement lorsqu'une décision d'architecture ou de conception change.

---

# Git
Ne jamais faire de commit automatiquement.
Toujours attendre la validation explicite de l'utilisateur.
Le commit doit correspondre à une seule tâche du Product Backlog.
Ne jamais développer directement sur `main` ou `dev`.
Les branches de travail doivent respecter `feature/<ticket-id>`.
Avant un commit, vérifier que les fichiers indexés appartiennent au ticket de la branche courante.

---

# Priorité
Terminer le MVP avant toute amélioration.
Les améliorations UX, techniques ou esthétiques passent après les fonctionnalités du MVP, sauf demande explicite de l'utilisateur.

---

# Objectif
Le projet doit rester :
- simple ;
- cohérent ;
- conforme aux skills DWWM ;
- fidèle au prototype Figma ;
- piloté par le Product Backlog.

---

# Fin de tâche
À la fin de chaque tâche, toujours suivre cet ordre :
1. Vérifier que la tâche répond entièrement au Product Backlog.
2. Exécuter les tests concernés.
3. Mettre à jour la documentation si nécessaire.
4. Présenter un résumé :
   - fichiers modifiés ;
   - comportements ajoutés ou corrigés ;
   - tests exécutés ;
   - limites éventuelles.
5. Attendre la validation explicite de l'utilisateur.
6. Après validation, proposer un commit unique correspondant uniquement à cette tâche.
7. Une fois le commit effectué, revenir au Product Backlog et proposer la première tâche prioritaire non terminée.
Ne jamais commencer une nouvelle implémentation avant la fin complète de ce cycle.
