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
