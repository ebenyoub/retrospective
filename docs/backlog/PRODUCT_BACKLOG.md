# Product Backlog Officiel

> Référence centrale de planification et d'avancement des fonctionnalités du projet.
> Réordonné de façon stricte en fonction des sources d'origine et de la valeur pour le MVP.

---

## Légende des Statuts

| Statut | Signification |
| :--- | :--- |
| ⬜ À faire | Pas encore démarré |
| 🔵 En cours | En cours de développement ou de rédaction |
| ✅ Terminé | Livré, validé techniquement (tests) et fonctionnellement |

---

## 1. Périmètre MVP (Must Have avant la soutenance)

Fonctionnalités explicitement justifiées par le cahier des charges, les User Stories d'origine, le Product Backlog initial ou le prototype Figma.

| ID | User Story / Tâche | Origine | Justification MVP | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | Inscription utilisateur | User Story (`US-01`), Cahier des charges (4.) | Indispensable pour la création de comptes facilitateurs réels. | ✅ Terminé |
| **US-02** | Connexion utilisateur & JWT | User Story (`US-02`), Cahier des charges (4.) | Permet l'accès sécurisé aux sessions et à l'historique. | ✅ Terminé |
| **US-03** | Déconnexion | User Story (`US-03`), Cahier des charges (4.) | Assure la sécurité d'accès après la réunion. | ✅ Terminé |
| **US-04** | Création de session | User Story (`US-04`), Cahier des charges (4.) | Permet au facilitateur d'initialiser une rétrospective. | ✅ Terminé |
| **US-05** | Liste des sessions | User Story (`US-05`), Product Backlog d'origine (`B07`) | Fournit au facilitateur et aux inscrits leur historique de rétros. | ✅ Terminé |
| **US-06** | Rejoindre une session | User Story (`US-06`), Cahier des charges (4.) | Indispensable pour la participation collaborative des équipes. | ✅ Terminé |
| **US-07** | Écriture des cartes | User Story (`US-07`), Cahier des charges (4.) | Cœur métier : expression écrite des retours de sprint. | ✅ Terminé |
| **US-08** | Distribution de votes | User Story (`US-08`), Cahier des charges (4.) | Cœur métier : priorisation démocratique des sujets de discussion. | ✅ Terminé |
| **US-09** | Vue des résultats | User Story (`US-09`), Cahier des charges (4.) | Permet la synthèse finale des cartes triées par votes. | ✅ Terminé |
| **US-10** | Rôles & Transitions d'étape | Cahier des charges (3. Facilitateur), Figma (`App.tsx`) | Permet au facilitateur de guider la session (salle d'attente -> écriture -> vote -> résultats). | ✅ Terminé |
| **T-FIG-01**| Timer d'étape visuel | Figma (`screens/WritingScreen.tsx`/`VoteScreen.tsx`) | Puce visuelle `TimerChip` pour le respect du temps d'étape. | ✅ Terminé |
| **T-FIG-02**| Menu d'actions `…` | Figma (Bouton de sortie de session en cours) | Permet aux participants de quitter la session à tout moment. | ✅ Terminé |
| **T-NAV-01**| Navigation de retour | Correction d'agencement (Cahier des charges : 14. Interface claire) | Bloque la boucle de redirection automatique vers la session active. | ✅ Terminé |
| **T-UX-01** | Affichage du quota de votes restants | Figma (`VoteScreen.tsx` : pastilles + texte) | **Indispensable** pour permettre au participant de piloter la consommation de ses 5 votes au cours de la phase. | ✅ Terminé |
| **T-DOC-02**| Finalisation docs techniques (`API.md`/`DATABASE.md`) | Référentiel jury DWWM (Livrables académiques obligatoires) | Indispensable pour la validation du titre professionnel. | ✅ Terminé |

### Chantier prioritaire — Écran Écriture : zone sous le header principal

> Découpage validé le 2026-07-13 à partir du prototype Figma Make (`Shell.tsx`, `WritingScreen.tsx`, `VoteScreen.tsx`, `DiscussionPanel.tsx`, `CommentsModal.tsx`), de l'état réel du code et des documents de suivi.
> Le prototype contient deux barres sous le header principal : une barre de contexte de session puis une barre d'actions d'étape. Aucune de ces barres n'est validée comme terminée à ce stade.

#### **T-SESSION-BAR-01 — SessionContextBar**

| Champ | Valeur |
| :--- | :--- |
| Identifiant | **T-SESSION-BAR-01** |
| Titre | SessionContextBar fidèle au prototype |
| Priorité | P0 |
| Statut | ✅ Terminé — validé utilisateur |
| Objectif | Obtenir la première barre sous le header principal : contexte de session uniquement, sans compteur de cartes, timer ni bouton principal. |
| Critères d'acceptation | Le bouton Retour est visible et fonctionnel ; le breadcrumb reprend la structure du prototype (`Range ta chambre / session / étape`) ; le nom de session a une taille et une troncature conformes ; le `StepIndicator` est centré sur desktop ; le code de session, Participants et Discussion sont positionnés à droite ; la barre reste lisible en responsive ; aucun élément de `SessionActionBar` n'est rendu dans cette barre. |
| Fichiers probablement concernés | `retrospective_frontend/src/pages/session/SessionDashboard.tsx`, `retrospective_frontend/src/pages/session/components/SessionContextBar.tsx`, `retrospective_frontend/src/pages/session/components/StepIndicator.tsx`, `retrospective_frontend/src/pages/session/sessionStep.ts`, `retrospective_frontend/src/pages/session/SessionDashboard.test.tsx` |
| Dépendances | Aucune tâche fonctionnelle ; doit reprendre l'état non commité actuel sans considérer la barre comme validée. |
| Tests attendus | Tests React sur le rendu de la barre, le bouton Retour, le code de session, le placement logique des déclencheurs Participants/Discussion et l'absence du compteur/timer/bouton principal dans cette barre ; vérification visuelle Figma desktop/mobile. |
| Source justifiant la tâche | Figma (`figma_make/src/app/components/Shell.tsx` — `NavBar`) ; cahier des charges (interface claire et simple) ; backlog initial via `T-NAV-01` pour la navigation de retour ; évolution ultérieure : aucun nouveau comportement hors Figma. |

#### **T-SESSION-BAR-02 — SessionActionBar**

| Champ | Valeur |
| :--- | :--- |
| Identifiant | **T-SESSION-BAR-02** |
| Titre | SessionActionBar fidèle au prototype |
| Priorité | P0 |
| Statut | ✅ Terminé — validé utilisateur |
| Objectif | Obtenir la seconde barre sous le header principal : actions d'étape uniquement. |
| Critères d'acceptation | Le compteur total de cartes est rendu dans cette barre en étape écriture ; l'indicateur de votes restants reste rendu dans cette barre en étape vote ; le timer est rendu dans cette barre ; le bouton principal facilitateur est rendu dans cette barre ; aucune troisième ligne ou troisième navbar n'apparaît ; la barre reproduit la sub-toolbar Figma des écrans `WritingScreen` et `VoteScreen` ; aucun élément de contexte de session n'y est déplacé. |
| Fichiers probablement concernés | `retrospective_frontend/src/pages/session/SessionDashboard.tsx`, `retrospective_frontend/src/pages/session/components/SessionActionBar.tsx`, `retrospective_frontend/src/pages/session/components/TimerChip.tsx`, `retrospective_frontend/src/pages/session/SessionDashboard.test.tsx` |
| Dépendances | **T-SESSION-BAR-01** validée pour éviter de redéplacer des éléments entre les deux barres. |
| Tests attendus | Tests React sur compteur, votes restants, timer, bouton principal selon l'étape et le rôle ; test d'absence de troisième barre ; vérification visuelle Figma desktop/mobile. |
| Source justifiant la tâche | Figma (`WritingScreen.tsx` et `VoteScreen.tsx` — sub-toolbar) ; User Stories `US-07`, `US-08`, `US-10` ; cahier des charges (ajout de cartes, vote, démarrage/clôture de session) ; backlog initial via tâches Figma timer/quota. |

#### **T-SESSION-BAR-03 — ParticipantsDrawer**

| Champ | Valeur |
| :--- | :--- |
| Identifiant | **T-SESSION-BAR-03** |
| Titre | Panneau Participants depuis le déclencheur |
| Priorité | P1 |
| Statut | ✅ Terminé — validé utilisateur |
| Objectif | Ouvrir un panneau Participants depuis le déclencheur de `SessionContextBar` et afficher les vraies données de session. |
| Critères d'acceptation | Le déclencheur Participants ouvre/ferme le panneau ; le panneau affiche les vrais participants issus de `useSessionParticipants`/API, avec nom, rôle et statut disponibles ; desktop et mobile respectent le prototype ; fermeture accessible au clic et au clavier ; aucune donnée mockée n'est affichée comme réelle. |
| Fichiers probablement concernés | `retrospective_frontend/src/pages/session/components/SessionContextBar.tsx`, nouveau composant probable `ParticipantsDrawer.tsx`, `retrospective_frontend/src/pages/session/hooks/useSessionParticipants.ts`, `retrospective_frontend/src/pages/session/SessionDashboard.tsx`, tests associés. |
| Dépendances | **T-SESSION-BAR-01** validée ; données participants existantes déjà disponibles côté application. |
| Tests attendus | Tests React ouverture/fermeture, comptage, rendu des vrais participants, accessibilité du déclencheur et du panneau ; vérification visuelle Figma desktop/mobile. |
| Source justifiant la tâche | Figma (`Shell.tsx` — `ParticipantsSidebar`) ; cahier des charges (participants rejoignent une session) ; User Story `US-06` ; backlog initial `TODO-SESSION-01` déjà livré côté données mais pas sous forme de drawer Figma. |

#### **T-SESSION-BAR-04 — DiscussionDrawer**

| Champ | Valeur |
| :--- | :--- |
| Identifiant | **T-SESSION-BAR-04** |
| Titre | Panneau Discussion depuis le déclencheur |
| Priorité | P2 |
| Statut | ⬜ À faire |
| Objectif | Ouvrir le fil de discussion depuis le déclencheur de `SessionContextBar` et préparer l'intégration des messages/commentaires. |
| Critères d'acceptation | Le déclencheur Discussion ouvre/ferme un panneau conforme au prototype ; le panneau distingue clairement état vide, liste de messages et zone de saisie selon le périmètre validé ; le ticket ne crée pas encore les commentaires de cartes ; aucune donnée mockée n'est présentée comme réelle ; le comportement à implémenter est borné avant développement si une route backend manque. |
| Fichiers probablement concernés | `retrospective_frontend/src/pages/session/components/SessionContextBar.tsx`, nouveau composant probable `DiscussionDrawer.tsx`, `retrospective_frontend/src/pages/session/SessionDashboard.tsx`, tests associés ; backend uniquement si une décision produit valide la persistance des messages. |
| Dépendances | **T-SESSION-BAR-01** validée ; décision de périmètre sur données réelles de discussion si nécessaire. |
| Tests attendus | Tests React ouverture/fermeture, état vide, accessibilité, absence de mélange avec Participants ; tests API/backend seulement si persistance validée. |
| Source justifiant la tâche | Figma (`DiscussionPanel.tsx`) ; Product Backlog évolution `US-11` / backlog d'origine `B20` hors scope MVP ; évolution ultérieure validable après les deux barres. |

#### **T-SESSION-BAR-05 — Commentaires des cartes**

| Champ | Valeur |
| :--- | :--- |
| Identifiant | **T-SESSION-BAR-05** |
| Titre | Connexion des cartes au fil de discussion/commentaires |
| Priorité | P2 |
| Statut | ⬜ À faire |
| Objectif | Connecter les cartes au fil de discussion ou à un modal de commentaires uniquement si cette fonctionnalité est confirmée par les sources projet. |
| Critères d'acceptation | Le ticket commence par confirmer le périmètre exact : commentaires par carte, discussion globale, ou lien entre les deux ; les cartes affichent un compteur réel seulement si une source de données existe ; l'ouverture depuis une carte respecte le prototype ; aucune table/route n'est ajoutée sans validation du périmètre ; aucun comportement de vote/édition/suppression existant ne régresse. |
| Fichiers probablement concernés | `retrospective_frontend/src/pages/session/components/RetroCardItem.tsx`, `RetroColumn.tsx`, `SessionDashboard.tsx`, nouveau composant probable de commentaires, tests associés ; backend et SQL uniquement si validés. |
| Dépendances | **T-SESSION-BAR-04** ou décision produit explicite sur les commentaires ; ne pas démarrer avant confirmation du périmètre. |
| Tests attendus | Tests React compteur/ouverture/fermeture, non-régression cartes ; tests backend/API seulement si données persistées ; vérification visuelle Figma. |
| Source justifiant la tâche | Figma (`CommentsModal.tsx`, `commentCount` dans `WritingScreen.tsx`/`VoteScreen.tsx`) ; Product Backlog évolution `US-12` ; évolution ultérieure, non MVP par défaut. |

#### **T-SESSION-BAR-06 — Revue UI finale de l'écran Écriture**

| Champ | Valeur |
| :--- | :--- |
| Identifiant | **T-SESSION-BAR-06** |
| Titre | Revue UI finale de l'écran Écriture |
| Priorité | P1 |
| Statut | ⬜ À faire |
| Objectif | Comparer l'écran complet au prototype après validation des composants précédents et corriger uniquement les derniers écarts démontrés. |
| Critères d'acceptation | L'écran complet est comparé au prototype sur desktop et mobile ; seules les divergences restantes de l'écran Écriture sont corrigées ; les tâches validées précédentes ne sont pas modifiées sauf régression démontrée ; aucun nouveau regroupement fonctionnel n'est introduit ; la revue vérifie l'absence de troisième barre et la non-régression des cartes, colonnes, votes et résultats. |
| Fichiers probablement concernés | `retrospective_frontend/src/pages/session/SessionDashboard.tsx`, composants sous `retrospective_frontend/src/pages/session/components/`, tests de non-régression, documentation de suivi. |
| Dépendances | **T-SESSION-BAR-01** et **T-SESSION-BAR-02** validées ; **T-SESSION-BAR-03/04/05** selon périmètre retenu. |
| Tests attendus | Tests frontend ciblés ; build/lint frontend ; vérification visuelle Figma desktop/mobile ; revue du diff uniquement. |
| Source justifiant la tâche | Figma (`Shell.tsx`, `WritingScreen.tsx`, `VoteScreen.tsx`) ; cahier des charges (interface claire et responsive) ; évolution ultérieure de stabilisation visuelle. |

---

## 2. Évolutions (Hors MVP / Après la soutenance)

Fonctionnalités issues du prototype Figma ou des chantiers de stabilisation technique, intéressantes mais non bloquantes pour le flux MVP.

| ID | User Story / Tâche | Origine | Justification Évolution | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-11** | Chat de discussion de session | Figma (`components/DiscussionPanel`), Backlog (`B20` Hors scope) | Communication écrite annexe ; le débat a lieu à l'oral pendant la réunion. | ⬜ À faire |
| **US-12** | Commentaires sur les cartes | Figma (`components/CommentsModal` / `commentCount`) | Questions asynchrones ; le détail est clarifié de vive voix. | ⬜ À faire |
| **US-13** | Plan d'action & Écran résumé | Figma (`screens/ActionScreen.tsx` / `SummaryScreen.tsx`) | Suivi post-réunion ; le workflow du MVP s'arrête proprement aux résultats. | ⬜ À faire |
| **T-UI-01** | Homogénéisation des Toasts (Tailwind) | Audit technique ultérieur (2026-07-09) | Polish visuel mineur ; les alertes de l'application sont déjà fonctionnelles. | ⬜ À faire |
| **T-ARCHI-01**| Migration des formulaires vers RHF | Audit technique ultérieur (2026-07-13) | Harmonisation interne du code ; la validation manuelle actuelle est déjà OK. | ⬜ À faire |
| **T-PART-02**| Expiration du jeton invité | Audit technique ultérieur (2026-07-13) | Optimisation de sécurité de BDD en production. | ⬜ À faire |
| **T-CLEANUP-01**| Nettoyage des anciens invités | Audit technique ultérieur (2026-07-10) | Nettoyage de données de test en base de développement. | ⬜ À faire |

---

## 3. Évolutions futures / V2 (Sans source d'origine)

Idées d'évolutions n'ayant aucune source dans le cahier des charges, les User Stories, le Product Backlog d'origine ou le prototype Figma.

* **Le regroupement des cartes (Clustering / Fusion de doublons)** :
  * *Origine* : Aucune.
  * *Pourquoi V2* : Tâche absente de l'ensemble des documents initiaux. Exclue du MVP en raison de la forte complexité de restructuration du schéma de base de données et de l'UI qu'elle introduirait (non justifiée pour le titre professionnel).
