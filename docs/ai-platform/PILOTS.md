# Journal des pilotes du système d'agents

Chaque pilote teste le pipeline lui-même, pas seulement le ticket qui sert de prétexte.
Le succès se juge d'abord sur l'architecture du workflow, ensuite sur la qualité de la
modification technique livrée.

## Méthodologie

Toute évolution de ce système suit désormais :

```
Hypothèse → Pilote → Mesures → Validation → Règle officielle
```

au lieu d'un ajout direct sur intuition dans un fichier de règles. Une règle n'entre dans
`VALIDATED_RULES.md` qu'après être passée par ce cycle complet — voir ce fichier pour le
grand livre des règles effectivement prouvées, distinct des règles simplement conçues ou
en attente de re-validation.

---

## Pilote #1 — DEV-ENV-01 (2026-07-20)

**Ticket** : Fiabiliser le hot reload backend Docker (ajout du flag `--poll` au script
`dev` de `ts-node-dev`, `retrospective_backend/package.json`).

**Pourquoi ce ticket** : petit, technique, sans ambiguïté métier, peu de fichiers, facile
à vérifier, facile à annuler — critères choisis explicitement pour tester le pipeline
sans risque produit.

**Chaîne exécutée** : `analyst-ticket → briefing-agent → developer-fast → qa-tests →
reviewer-code → documentation-technique → commit-agent` (+ `decision-recorder` hors
pipeline). `analyst-functional` et `architect` sautés (aucune ambiguïté métier, choix
technique mineur).

**Résultat** : `SUCCESS` sur les 8 dispatches. 301/301 tests backend, `tsc --noEmit`
propre, hot reload vérifié réellement en conditions Docker (2 fois). 258 942 tokens
sous-agents cumulés, ~7,7 minutes d'exécution séquentielle, **0 fichier de code
applicatif lu par l'orchestrateur**.

**Verdict sur le pipeline** : globalement positif — l'invariant « aucun agent n'appelle
un agent » a tenu, `briefing-agent` et `commit-agent` ont fonctionné exactement comme
conçus. Mais un défaut de conception réel a été découvert : aucun des 3 premiers agents
n'a vérifié le Git Flow avant que `developer-fast` modifie un fichier directement sur
`dev`. Détail complet des 5 leçons tirées : voir `LESSONS_LEARNED.md`.

**Corrections apportées (v1.1)**, avant tout second pilote :
- Git Flow réintégré explicitement dans les 7 nouveaux agents (pas seulement référencé).
- Code de retour `PROCESS_VIOLATION` ajouté.
- Champ `ÉTAT D'EXÉCUTION COURANT` ajouté au protocole de mandat.
- Budgets `qa-tests`, `reviewer-code`, `commit-agent`, `decision-recorder` recalibrés à
  partir des mesures réelles.

**Statut à la fin du pilote** : branche `feature/DEV-ENV-01-hot-reload` créée, changement
revu `PRÊT À COMMITTER`, proposition de commit préparée par `commit-agent`, **pas commité,
pas mergé** — en attente de validation utilisateur.

**Addendum du même jour** : en préparant séparément le commit de l'infrastructure IA
elle-même (fichiers `.claude/`/`docs/ai-platform/`), `commit-agent` a détecté que ce
périmètre ne correspondait pas à la branche courante (`feature/DEV-ENV-01-hot-reload`,
nommée pour un autre sujet) et a renvoyé `PROCESS_VIOLATION` sans préparer de proposition.
Première preuve concrète, en conditions réelles, qu'un agent peut **bloquer** une action
non conforme plutôt que de se contenter de répéter une consigne en texte. Voir
`VALIDATED_RULES.md`.

---

## Pilote #2 — à planifier

Critère de déclenchement : après validation de la v1.1 par l'utilisateur. Objectif
suggéré : tester une boucle d'échec réelle (`TEST_FAILED` ou `REVIEW_BLOCKED`), non
exercée par le pilote #1 (chemin heureux complet, aucun échec rencontré).
