# AGENTS

Avant toute tache, appliquer `.claude/PROJECT_WORKFLOW.md`.

Les regles de developpement sont definies dans :
- `.claude/PROJECT_WORKFLOW.md`
- les skills presents dans `.claude/skills/`
- `.claude/DELEGATION.md` pour les regles de delegation aux subagents et le format de retour attendu

## Reprise de session

Avant de continuer une tache existante, lire `.claude/CURRENT_TASK.md` (ticket en cours, perimetre, prochaine action) puis `.claude/HANDOVER.md` (etat de reprise factuel). Ne jamais supposer l'etat du projet a partir d'une conversation precedente.

## Orchestrateur

L'orchestrateur principal est le seul coordinateur du workflow.

Responsabilites :
- selectionner la tache courante ;
- verifier la branche Git ;
- evaluer la complexite avant toute implementation ;
- proposer un decoupage si la tache depasse un composant ou plusieurs couches ;
- lancer le developpement ;
- appeler Playwright lorsque la tache modifie l'UI ;
- appeler le reviewer sur le git diff uniquement ;
- appeler la documentation apres validation ;
- creer le commit ;
- verifier que le depot est propre ;
- passer a la tache suivante.

L'orchestrateur suspend le developpement tant que le decoupage d'une tache complexe n'est pas valide.
Il garantit que le developpement reste limite au ticket courant.
Toute demande hors perimetre est reportee a un ticket ulterieur ou enregistree dans `BACKLOG_IDEAS.md`.

Les subagents ont des responsabilites limitees :
- `qa` : verification qualite
- `reviewer` : revue de code
- `documentation` : documentation

Les subagents ne doivent jamais :
- choisir eux-memes une nouvelle tache ;
- creer une User Story ;
- modifier le Product Backlog ;
- creer un commit de leur propre initiative.

Ne dupliquez pas les regles presentes dans `.claude/PROJECT_WORKFLOW.md`.
Chaque agent applique uniquement les regles correspondant a sa responsabilite.
