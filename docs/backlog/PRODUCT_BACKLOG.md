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
| **US-07** | Écriture des cartes | User Story (`US-07`), Cahier des charges (4.) | Cœur métier : expression écrite des retours de sprint. | ✅ Terminé |
| **US-08** | Distribution de votes | User Story (`US-08`), Cahier des charges (4.) | Cœur métier : priorisation démocratique des sujets de discussion. Le vote, le quota, les erreurs et les transitions sont validés. | ✅ Terminé |
| **US-09** | Vue des résultats | User Story (`US-09`), Cahier des charges (4.) | Permet la synthèse finale des cartes triées par votes. | ✅ Terminé |
| **US-10** | Rôles & Transitions d'étape | Cahier des charges (3. Facilitateur), Figma (`App.tsx`) | Permet au facilitateur de guider la session (salle d'attente -> écriture -> vote -> résultats). | ✅ Terminé |
| **T-FIG-01**| Timer d'étape visuel et fonctionnel | Figma (`screens/WritingScreen.tsx`/`VoteScreen.tsx`) | Timer visible et réellement utile pour piloter le temps de l'étape. | ✅ Terminé |
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
| **MVP-COMMENTS-01** | P1 | Implémenter les commentaires de cartes utilisables. | Les commentaires peuvent être consultés/ajoutés sans données fictives. | ✅ Terminé (2026-07-16, réellement implémenté : table `card_comments`, routes dédiées, suppression par l'auteur) |
| **MVP-WRITING-STATE-01** | P2 | Finaliser états chargement/erreur/vides. | Les états sont clairs, non bloquants et testés. | ✅ Terminé |

#### **US-08 — Distribution de votes**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-08-DONE-01** | P0 | Backend de vote avec limite de 5 votes. | Le backend refuse les votes invalides et expose le quota après vote. | ✅ Terminé |
| **US-08-DONE-02** | P0 | Bouton de vote et compteur sur les cartes. | L'UI affiche l'état de vote et le compteur mis à jour après action. | ✅ Terminé |
| **T-UX-01** | P0 | Quota de votes restants visible. | Le quota reste cohérent après vote, erreur et transition. | ✅ Terminé |
| **MVP-VOTE-01** | P0 | Salle de vote complète. | La salle de vote est validée avec données réelles simulées et parcours participant. | ✅ Terminé |
| **MVP-VOTE-TRANSITION-01** | P1 | Vérifier les votes lors des transitions. | Les cartes sont rafraîchies au passage en vote et restent cohérentes ensuite. | ✅ Terminé |
| **MVP-VOTE-03** | P0 | Finaliser et valider le vote de bout en bout. | Un participant autorisé vote au plus cinq fois ; compteur, quota, erreurs et résultats restent cohérents après rechargement et transition. | ✅ Terminé |

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

#### **US-13 — Plan d'action & Résumé produit**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **MVP-ACTION-01** | P1 | Ajouter le plan d'action. | Le facilitateur peut consulter/préparer les actions prévues par le prototype ; l'écriture est refusée en session clôturée. | ✅ Terminé |
| **MVP-SUMMARY-01** | P1 | Ajouter l'écran résumé. | Le résumé clôture la rétrospective proprement et reste lisible pour les participants autorisés. | ✅ Terminé |
| **MVP-E2E-01** | P0 | Vérifier le parcours MVP jusqu'aux résultats. | Le parcours création -> écriture -> vote -> résultats est couvert et validé sans rupture majeure. | ✅ Terminé |

#### **US-14 — Sessions clôturées en lecture seule**

| ID | Priorité | Objectif | Critères d'acceptation courts | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **MVP-CLOSED-SESSION-01** | P0 | Finaliser le cycle de vie d'une session clôturée. | Après clôture, le code ne permet plus de rejoindre la session ; toute écriture, vote ou modification est refusée, tandis que la consultation autorisée reste en lecture seule. | ✅ Terminé |

### Ordre d'implémentation MVP

| Ordre | ID | Parent | Priorité | Objectif | Statut |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **MVP-WRITING-01** | US-07 | P0 | Finaliser le design des cartes et des actions Modifier/Supprimer. | ✅ Terminé |
| 2 | **MVP-TIMER-01** | US-07 / US-10 | P0 | Rendre le timer d'étape fonctionnel. | ✅ Terminé |
| 3 | **MVP-VOTE-03** | US-08 | P0 | Finaliser et valider le vote de bout en bout. | ✅ Terminé |
| 3.1 | **MVP-VOTE-01** | US-08 | P0 | Salle de vote : capacité existante à qualifier. | ✅ Terminé |
| 3.2 | **MVP-VOTE-02** | US-08 | P0 | Validation E2E de la salle de vote. | ✅ Terminé |
| 4 | **MVP-RESULTS-01** | US-09 | P0 | Finaliser l'écran Résultats. | ✅ Terminé |
| 4.1 | **MVP-RESULTS-02** | US-09 | P0 | Validation E2E de l'écran Résultats. | ✅ Terminé |
| 5 | **MVP-TRANSITION-01** | US-10 | P0 | Valider toutes les transitions d'étape. | ✅ Terminé |
| 5.1 | **MVP-TRANSITION-02** | US-10 | P0 | Validation E2E de l'enchaînement des étapes. | ✅ Terminé |
| 6 | **MVP-E2E-01** | Transverse (US-07 à US-10) | P0 | Vérifier le parcours MVP jusqu'aux résultats. | ✅ Terminé |
| 6.1 | **MVP-E2E-02** | Transverse (US-07 à US-13) | P0 | Validation E2E du parcours produit complet. | ✅ Terminé |
| 6.2 | **MVP-CLOSED-SESSION-01** | US-14 | P0 | Finaliser le cycle de vie d'une session clôturée. | ✅ Terminé |
| 7 | **MVP-PARTICIPANTS-01** | US-07 | P1 | Corriger l'UX du drawer Participants. | ✅ Terminé |
| 7.1 | **MVP-PARTICIPANTS-02** | US-07 | P1 | Validation E2E du drawer Participants. | ✅ Terminé |
| 8 | **MVP-DISCUSSION-01** | US-07 | P1 | Finaliser Discussion. | ✅ Terminé |
| 8.1 | **MVP-DISCUSSION-02** | US-07 | P1 | Validation E2E du drawer Discussion. | ✅ Terminé |
| 9 | **MVP-COMMENTS-01** | US-07 | P1 | Implémenter les commentaires de cartes. | ✅ Terminé |
| 9.1 | **MVP-COMMENTS-02** | US-07 | P1 | Validation E2E de la modal Commentaires. | ✅ Terminé |
| 10 | **MVP-ACTION-01** | US-13 | P1 | Plan d'action : capacité existante à qualifier. | ✅ Terminé |
| 11 | **MVP-SUMMARY-01** | US-13 | P1 | Résumé : capacité existante à qualifier. | ✅ Terminé |
| 12 | **MVP-WRITING-STATE-01** | US-07 | P2 | Finaliser les états chargement/erreur/vides. | ✅ Terminé |
| 12.1 | **MVP-WRITING-STATE-02** | US-07 | P2 | Validation E2E des états de chargement et vides. | ✅ Terminé |

### Historique des chantiers techniques

> Ces tickets servent d'historique. L'orchestrateur ne doit plus les choisir comme prochaines tâches MVP.

| ID | Résultat | Statut actuel |
| :--- | :--- | :--- |
| **T-SESSION-BAR-01** | `SessionContextBar` isolée : retour, breadcrumb, étape, code, déclencheurs. | ✅ Base validée |
| **T-SESSION-BAR-02** | `SessionActionBar` isolée : compteur, timer visuel, bouton principal. | ✅ Base validée |
| **T-SESSION-BAR-03** | Participants affichés dans un drawer avec données réelles. | 🟡 À reprendre via `MVP-PARTICIPANTS-01` |
| **T-SESSION-BAR-04** | Discussion affichée dans un drawer sans données fictives. | 🟡 À reprendre via `MVP-DISCUSSION-01` |
| **T-SESSION-BAR-05** | Modal de commentaires sans persistance fictive. | ✅ Repris et terminé via `MVP-COMMENTS-01` (2026-07-16) |
| **T-SESSION-BAR-06** | Revue UI finale de base de l'écran Écriture. | ✅ Historique validé |

---

## 2. Évolutions (Hors MVP / Après la soutenance)

Fonctionnalités issues du prototype Figma ou des chantiers de stabilisation technique, intéressantes mais non bloquantes pour le flux MVP.

| ID | User Story / Tâche | Origine | Justification Évolution | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-11** | Chat de discussion de session | Figma (`components/DiscussionPanel`), Backlog (`B20` Hors scope) | Communication écrite annexe ; le débat a lieu à l'oral pendant la réunion. Capacité existante qualifiée par tests backend, frontend et E2E. | ✅ Terminé |
| **US-13** | Plan d'action & Écran résumé | Figma (`screens/ActionScreen.tsx` / `SummaryScreen.tsx`) | Capacités post-réunion distinctes du parcours MVP, qualifiées par tests ciblés et parcours E2E produit complet. | ✅ Terminé |
| **US-14** | Cycle de vie du code de session / sessions clôturées en lecture seule | Investigation utilisateur (401 `/auth/profile`) ayant mené à une revue du cycle de vie des sessions, 2026-07-19/20 | Sécurité et cohérence métier : un code à 4 chiffres ne doit pas être un identifiant permanent, une session close ne doit plus être modifiable ni rejoignable. | ✅ Terminé |
| **US-15** | Corrections UX post-tests réels (retour d'étape, Discussion docké, podium Plan d'action) | Retours utilisateur après un test de charge réel (50 participants, cartes, votes, commentaires), 2026-07-20 | Ergonomie facilitateur (erreur de manipulation récupérable) et productivité (discuter et consulter le podium sans changer d'écran). | ✅ Terminé |
| **T-UI-01** | Homogénéisation des Toasts (Tailwind) | Audit technique ultérieur (2026-07-09) | Polish visuel mineur ; les alertes de l'application sont déjà fonctionnelles. | ✅ Terminé (2026-07-19 : `ToastStyled.tsx`/`ToastNotification.tsx` alignés sur le thème navy de l'app) |
| **T-ARCHI-01**| Migration des formulaires vers RHF | Audit technique ultérieur (2026-07-13) | Harmonisation interne du code ; la validation manuelle actuelle est déjà OK. | ✅ Terminé (2026-07-20 : Login/Signup/SessionCreate/Forgot migrés vers React Hook Form + Zod, une PR par formulaire) |
| **T-AUTH-FORGOT-BREVO-01** | Finaliser le mot de passe oublié avec Brevo | Retour utilisateur 2026-07-22 ; référence technique existante dans `loge_restaurant` | Le parcours forgot/reset existe déjà mais l'envoi réel d'e-mail doit être configuré via SMTP Brevo, sans dépendre de l'ancien transport Gmail. | ✅ Terminé (2026-07-22 : transport SMTP Brevo configuré, `.env.example`/Docker/docs alignés, tests ciblés OK) |
| **T-PART-02**| Expiration du jeton invité | Audit technique ultérieur (2026-07-13) | Optimisation de sécurité de BDD en production. | ✅ Terminé (2026-07-20 : jeton invité limité à 24h depuis la jointure, alignée sur le cookie de reprise) |
| **T-CLEANUP-01**| Nettoyage des anciens invités | Audit technique ultérieur (2026-07-10) | Nettoyage de données de test en base de développement. | ✅ Terminé (2026-07-20 : script SQL manuel `cleanup_dev_test_guests.sql`, 65 lignes supprimées sur la base de dev) |
| **T-CLEANUP-02**| Suppression du hook mort `useFormValidation` | Audit technique post T-ARCHI-01 (2026-07-20) | Suppression du code mort frontend devenu obsolète après migration RHF. | ✅ Terminé (2026-07-21 : hook `useFormValidation.ts`, types et tests supprimés) |
| **T-AI-PLATFORM-03**| Synchronisation automatique du contexte partagé | Audit du workflow IA après dérive `CURRENT_TASK.md` / `HANDOVER.md` constatée le 2026-07-21 | Fiabiliser la reprise de session multi-IA en rendant la synchronisation de l'état partagé obligatoire, vérifiable et la plus dérivée possible de l'état Git réel. | ✅ Terminé (2026-07-22 : décision `CONTEXT_SYNC.md`, contrats Claude/Codex alignés) |
| **T-AI-PLATFORM-CODEX-BOOTSTRAP** | Qualification & Bootstrap de l'Infrastructure Codex CLI | Qualification adaptateur Codex suite aux revues d'architecture multi-agents | Adapter la couche Codex au mécanisme natif de subagents, conserver `.codex/agents/` comme roster projet et valider par une exécution réelle dans Codex. | ✅ Terminé (2026-07-22 : agents natifs `analyst-ticket` et `architect` lancés avec succès ; scénarios avancés à éprouver sur tickets réels) |



### T-AI-PLATFORM-03 — Synchronisation automatique du contexte partagé

**Objectif**

Empêcher qu'une nouvelle session IA reparte d'un contexte obsolète alors que le dépôt a
déjà avancé. Le ticket doit rendre la synchronisation de `CURRENT_TASK.md` et
`HANDOVER.md` impossible à oublier, cohérente avec Git, et portable entre Claude, Codex
et AGY.

**Problème observé**

Le 2026-07-21, une reprise de session a montré une divergence entre :
- l'état Git réel (`feature/T-CLEANUP-02-dead-code-useFormValidation`) ;
- le ticket effectivement en cours ;
- `CURRENT_TASK.md` et `HANDOVER.md`, restés sur `US-13`.

Cette divergence n'a pas cassé le dépôt, mais elle fragilise la reprise de session, la
qualité des mandats, la review et l'audit.

**Périmètre**

- Définir les sources de vérité du workflow IA.
- Définir les éléments dérivables automatiquement et ceux qui restent éditables.
- Définir la responsabilité exclusive de mise à jour du contexte partagé.
- Définir les garde-fous bloquants à la clôture d'un ticket.
- Définir les scénarios de reprise et d'échec à couvrir.

**Hors périmètre**

- Instrumentation complète du workflow (ticket dédié `T-AI-PLATFORM-05`).
- Portage complet multi-IA et matrice de compatibilité (ticket dédié
  `T-AI-PLATFORM-06`).
- Refonte globale du pipeline d'agents hors besoin direct de synchronisation.

**Sources de vérité à arbitrer explicitement**

- Git : branche active, dernier commit, état du working tree.
- Ticket actif dans le backlog.
- Dernier `STATUS` du pipeline.
- `CURRENT_TASK.md`.
- `HANDOVER.md`.

**Hypothèse directrice**

`CURRENT_TASK.md` et `HANDOVER.md` ne doivent plus être traités comme des documents libres
indépendants. Ils doivent devenir des artefacts fortement contraints, idéalement générés
ou au minimum synchronisés à partir de l'état réel du workflow.

**Responsabilités attendues**

- Orchestrateur : vérifie l'état Git réel, synchronise l'état partagé, bloque la clôture
  si le contexte n'est pas cohérent.
- Developer : modifie uniquement le code du ticket ; ne touche jamais au contexte
  partagé.
- Reviewer : valide ou bloque le diff ; ne modifie jamais le contexte partagé.
- Documentation : enrichit la documentation technique si demandé, mais ne devient pas la
  source de vérité du ticket actif.
- Tous les autres agents : lecture seule sur le contexte partagé.

**Invariants attendus**

- Impossible d'avoir un `CURRENT_TASK.md` incohérent avec la branche active sans signal
  explicite de divergence.
- Impossible de clôturer un ticket avec `STATUS: SUCCESS` sans synchronisation explicite
  de l'état partagé.
- Une reprise de session doit permettre d'identifier sans ambiguïté : branche active,
  ticket actif, dernier `STATUS`, prochaine action.
- En cas de divergence entre Git et un document, Git gagne ; l'écart est signalé et non
  masqué.

**Critères d'acceptation**

- Le workflow définit noir sur blanc quelle donnée est source de vérité, dérivée ou
  éditable.
- La responsabilité de mise à jour de `CURRENT_TASK.md` et `HANDOVER.md` appartient à un
  seul rôle : l'orchestrateur.
- La clôture d'un ticket terminé inclut obligatoirement une étape de synchronisation de
  l'état partagé avant l'autorisation de commit ou de fin de workflow.
- Une reprise de session sur Claude, Codex ou AGY suit la même logique de lecture de
  l'état partagé, même si l'implémentation diffère selon la plateforme.
- Le système prévoit explicitement quoi faire si la synchronisation échoue, si Git a
  changé entre deux étapes, ou si les documents partagés sont obsolètes.

**Scénarios de test à couvrir**

- Changement de branche entre deux tickets.
- Ticket abandonné puis repris plus tard.
- Reprise après 24 h avec dépôt modifié.
- Conflit entre branche active et ticket déclaré.
- Crash ou interruption d'un subagent en cours de workflow.
- Interruption entre review, documentation et commit.

**Livrable attendu**

Une décision d'architecture opérationnelle décrivant :
- le modèle de vérité retenu ;
- le cycle de synchronisation ;
- les responsabilités exactes ;
- les garde-fous de clôture ;
- les scénarios de test à automatiser ou à exécuter manuellement ensuite.

---

### T-AI-PLATFORM-CODEX-BOOTSTRAP — Qualification & Bootstrap de l'Infrastructure Codex CLI

**Objectif**

Construire et qualifier l'adaptateur Codex CLI (`.codex/`, agents personnalisés natifs, politique de timeout) sans altérer le noyau fonctionnel commun (`.claude/`, `docs/ai-platform/`), puis faire valider l'exécution réelle par Codex CLI sur son propre adaptateur.

**Principe d'Ingénierie**

*« AntiGravity construit, Codex valide que ça marche. »*

AGY est une plateforme qualifiée et stable. Elle crée l'adaptateur Codex de manière isolée. Codex n'intervient qu'en étape finale pour tester et prouver l'exécution effective de son adaptateur.

**Périmètre du Ticket**

1. **Analyse AGY** : Étudier les capacités réelles de la version installée de Codex CLI (sub-agents, flags CLI, sandboxing, formats).
2. **Construction AGY / Codex** : Créer le dossier `.codex/`, porter les rôles sous forme d'agents personnalisés Codex natifs, définir la politique de résilience `AGENT_TIMEOUT` (1 retry max → arrêt propre / escalade).
3. **Mise à jour AGENTS.md** : Aligner le point d'entrée Codex avec l'adaptateur `.codex/`.
4. **Pilote de Qualification Codex** : Rédiger le test minimal de qualification pour Codex CLI.
5. **Validation par Codex** : Passer la main à Codex CLI pour exécuter le test minimal sur son adaptateur. En cas d'erreur, AGY ajuste l'adaptateur à partir des logs d'échec.

**Livrables Attendu**

- Adaptateur `.codex/` complet et documenté.
- `AGENTS.md` mis à jour.
- Pilote de qualification Codex réussi.

---


## 3. Évolutions futures / V2 (Sans source d'origine)

Idées d'évolutions n'ayant aucune source dans le cahier des charges, les User Stories, le Product Backlog d'origine ou le prototype Figma.

* **Le regroupement des cartes (Clustering / Fusion de doublons)** :
  * *Origine* : Aucune.
  * *Pourquoi V2* : Tâche absente de l'ensemble des documents initiaux. Exclue du MVP en raison de la forte complexité de restructuration du schéma de base de données et de l'UI qu'elle introduirait (non justifiée pour le titre professionnel).
