# Workflow de développement du projet

Ce document définit la méthode de travail du projet.
Ces règles priment sur les préférences de l'IA.

---

# Source de vérité
Le Product Backlog est la source officielle des priorités.
L'IA ne choisit jamais elle-même la prochaine fonctionnalité.
Elle exécute la première tâche prioritaire non terminée, sauf décision explicite de l'utilisateur.

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
