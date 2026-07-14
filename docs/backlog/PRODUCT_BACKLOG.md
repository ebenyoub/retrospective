# Product Backlog Officiel

> Référence centrale de planification et d'avancement des fonctionnalités du projet.
> Réordonné de façon stricte en fonction des sources d'origine et de la valeur pour le MVP.

---

## Légende des Statuts

| Statut | Signification |
| :--- | :--- |
| ⬜ À faire | Pas encore démarré |
| 🔵 En cours | En cours de développement ou de rédaction |
| 🟡 Partiellement terminé | Base technique ou UI présente, mais fonctionnalité produit non complète |
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
| **US-07** | Écriture des cartes | User Story (`US-07`), Cahier des charges (4.) | Cœur métier : expression écrite des retours de sprint. | 🟡 Partiellement terminé |
| **US-08** | Distribution de votes | User Story (`US-08`), Cahier des charges (4.) | Cœur métier : priorisation démocratique des sujets de discussion. | 🟡 Partiellement terminé |
| **US-09** | Vue des résultats | User Story (`US-09`), Cahier des charges (4.) | Permet la synthèse finale des cartes triées par votes. | 🟡 Partiellement terminé |
| **US-10** | Rôles & Transitions d'étape | Cahier des charges (3. Facilitateur), Figma (`App.tsx`) | Permet au facilitateur de guider la session (salle d'attente -> écriture -> vote -> résultats). | 🟡 Partiellement terminé |
| **T-FIG-01**| Timer d'étape visuel et fonctionnel | Figma (`screens/WritingScreen.tsx`/`VoteScreen.tsx`) | Timer visible et réellement utile pour piloter le temps de l'étape. | 🟡 Partiellement terminé |
| **T-FIG-02**| Menu d'actions `…` | Figma (Bouton de sortie de session en cours) | Permet aux participants de quitter la session à tout moment. | ✅ Terminé |
| **T-NAV-01**| Navigation de retour | Correction d'agencement (Cahier des charges : 14. Interface claire) | Bloque la boucle de redirection automatique vers la session active. | ✅ Terminé |
| **T-UX-01** | Affichage du quota de votes restants | Figma (`VoteScreen.tsx` : pastilles + texte) | **Indispensable** pour permettre au participant de piloter la consommation de ses 5 votes au cours de la phase. | ✅ Terminé |
| **T-DOC-02**| Finalisation docs techniques (`API.md`/`DATABASE.md`) | Référentiel jury DWWM (Livrables académiques obligatoires) | Indispensable pour la validation du titre professionnel. | ✅ Terminé |

### Roadmap MVP par User Story — 2026-07-14

> `BACKLOG-REALIGN-01` corrige l'écart entre "fonctionnalité techniquement présente" et "fonctionnalité produit terminée".
> Une User Story large reste 🟡 tant que toutes ses sous-tâches MVP ne sont pas livrées, testées et validées.
> L'orchestrateur exécute en priorité la première tâche `P0` non terminée dans l'ordre d'implémentation MVP.

#### **US-07 — Écriture des cartes**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-07-DONE-01** | P0 | Création des cartes dans les 3 colonnes techniques. | Une carte peut être créée dans chaque colonne technique. | ✅ Terminé |
| **TODO-FORMAT-01** | P0 | Formats MVP dynamiques à 3 colonnes. | Le format choisi est persisté et affiché en Écriture/Résultats. | ✅ Terminé |
| **MVP-WRITING-01** | P0 | Finaliser le design des cartes et actions Modifier/Supprimer. | Les actions ne cassent plus le design, restent accessibles et ne régressent pas. | ✅ Terminé |
| **MVP-TIMER-01** | P0 | Rendre le timer d'étape fonctionnel. | Le timer démarre, se met à jour et reste cohérent avec l'étape. | ✅ Terminé |
| **MVP-PARTICIPANTS-01** | P1 | Corriger l'UX du drawer Participants. | Le drawer affiche les vrais participants et respecte l'UX cible desktop/mobile. | ✅ Terminé |
| **MVP-DISCUSSION-01** | P1 | Finaliser Discussion. | Le panneau affiche des messages réels ou un périmètre produit borné explicitement. | ✅ Terminé |
| **MVP-COMMENTS-01** | P1 | Implémenter les commentaires de cartes utilisables. | Les commentaires peuvent être consultés/ajoutés sans données fictives. | ✅ Terminé |
| **MVP-WRITING-STATE-01** | P2 | Finaliser états chargement/erreur/vides. | Les états sont clairs, non bloquants et testés. | ✅ Terminé |

#### **US-08 — Distribution de votes**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-08-DONE-01** | P0 | Backend de vote avec limite de 5 votes. | Le backend empêche le dépassement du quota. | ✅ Terminé |
| **US-08-DONE-02** | P0 | Bouton de vote et compteur sur les cartes. | Le participant peut voter et voir le compteur. | ✅ Terminé |
| **T-UX-01** | P0 | Quota de votes restants visible. | Le quota reste visible pendant la phase de vote. | ✅ Terminé |
| **MVP-VOTE-01** | P0 | Finaliser la salle de vote complète. | La salle de vote est conforme au prototype et validée avec Playwright. | ✅ Terminé |
| **MVP-VOTE-TRANSITION-01** | P1 | Vérifier les votes lors des transitions. | Aucun vote ne régresse entre écriture, vote et résultats. | ✅ Terminé |

#### **US-09 — Vue des résultats**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-09-DONE-01** | P0 | Cartes triées par votes décroissants. | Les cartes les plus votées remontent en premier. | ✅ Terminé |
| **US-09-DONE-02** | P0 | Top 3, statistiques et libellés de format. | Les résultats affichent votes, cartes et colonnes du format choisi. | ✅ Terminé |
| **MVP-RESULTS-01** | P0 | Finaliser l'écran Résultats. | L'écran est validé desktop/mobile avec données réelles et états limites. | ✅ Terminé |

#### **US-10 — Rôles & transitions d'étape**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-10-DONE-01** | P0 | Rôle facilitateur/participant connu par la session. | Les permissions de base sont identifiées. | ✅ Terminé |
| **US-10-DONE-02** | P0 | Passage salle d'attente -> écriture. | Le facilitateur lance l'écriture et les participants suivent. | ✅ Terminé |
| **MVP-TRANSITION-01** | P0 | Valider toutes les transitions d'étape. | Écriture -> Vote -> Résultats fonctionne pour plusieurs navigateurs. | ✅ Terminé |
| **MVP-PERMISSION-01** | P1 | Vérifier les permissions par rôle sur chaque étape. | Les participants ne déclenchent pas les actions facilitateur. | ✅ Terminé |

#### **US-11 — Plan d'action & Résumé produit**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **MVP-ACTION-01** | P1 | Ajouter le plan d'action. | Le facilitateur peut consulter/préparer les actions prévues par le prototype. | ❌ Reporté |
| **MVP-SUMMARY-01** | P1 | Ajouter l'écran résumé. | Le résumé final clôture la rétrospective proprement. | ❌ Reporté |
| **MVP-E2E-01** | P0 | Vérifier le parcours produit complet. | Playwright couvre création -> résumé sans rupture majeure. | ✅ Terminé |

### Ordre d'implémentation MVP

| Ordre | ID | Parent | Priorité | Objectif | Statut |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **MVP-WRITING-01** | US-07 | P0 | Finaliser le design des cartes et des actions Modifier/Supprimer. | ✅ Terminé |
| 2 | **MVP-TIMER-01** | US-07 / US-10 | P0 | Rendre le timer d'étape fonctionnel. | ✅ Terminé |
| 3 | **MVP-VOTE-01** | US-08 | P0 | Finaliser la salle de vote complète. | ✅ Terminé |
| 3.1 | **MVP-VOTE-02** | US-08 | P0 | Validation E2E de la salle de vote. | ✅ Terminé |
| 4 | **MVP-RESULTS-01** | US-09 | P0 | Finaliser l'écran Résultats. | ✅ Terminé |
| 4.1 | **MVP-RESULTS-02** | US-09 | P0 | Validation E2E de l'écran Résultats. | ✅ Terminé |
| 5 | **MVP-TRANSITION-01** | US-10 | P0 | Valider toutes les transitions d'étape. | ✅ Terminé |
| 5.1 | **MVP-TRANSITION-02** | US-10 | P0 | Validation E2E de l'enchaînement des étapes. | ✅ Terminé |
| 6 | **MVP-E2E-01** | US-11 | P0 | Vérifier le parcours produit complet. | ✅ Terminé |
| 6.1 | **MVP-E2E-02** | US-11 | P0 | Validation E2E du parcours produit complet. | ✅ Terminé |
| 7 | **MVP-PARTICIPANTS-01** | US-07 | P1 | Corriger l'UX du drawer Participants. | ✅ Terminé |
| 7.1 | **MVP-PARTICIPANTS-02** | US-07 | P1 | Validation E2E du drawer Participants. | ✅ Terminé |
| 8 | **MVP-DISCUSSION-01** | US-07 | P1 | Finaliser Discussion. | ✅ Terminé |
| 9 | **MVP-COMMENTS-01** | US-07 | P1 | Implémenter les commentaires de cartes. | ✅ Terminé |
| 10 | **MVP-ACTION-01** | US-11 | P1 | Ajouter le plan d'action. | ❌ Reporté |
| 11 | **MVP-SUMMARY-01** | US-11 | P1 | Ajouter l'écran résumé. | ❌ Reporté |
| 12 | **MVP-WRITING-STATE-01** | US-07 | P2 | Finaliser les états chargement/erreur/vides. | ✅ Terminé |

### Historique des chantiers techniques

> Ces tickets servent d'historique. L'orchestrateur ne doit plus les choisir comme prochaines tâches MVP.

| ID | Résultat | Statut actuel |
| :--- | :--- | :--- |
| **T-SESSION-BAR-01** | `SessionContextBar` isolée : retour, breadcrumb, étape, code, déclencheurs. | ✅ Base validée |
| **T-SESSION-BAR-02** | `SessionActionBar` isolée : compteur, timer visuel, bouton principal. | ✅ Base validée |
| **T-SESSION-BAR-03** | Participants affichés dans un drawer avec données réelles. | 🟡 À reprendre via `MVP-PARTICIPANTS-01` |
| **T-SESSION-BAR-04** | Discussion affichée dans un drawer sans données fictives. | 🟡 À reprendre via `MVP-DISCUSSION-01` |
| **T-SESSION-BAR-05** | Modal de commentaires sans persistance fictive. | 🟡 À reprendre via `MVP-COMMENTS-01` |
| **T-SESSION-BAR-06** | Revue UI finale de base de l'écran Écriture. | ✅ Historique validé |

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
