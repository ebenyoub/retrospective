# Synchronisation du contexte partagé

Ticket : `T-AI-PLATFORM-03`

## Objectif

Empêcher qu'une session IA reprenne un ticket à partir d'un état documentaire obsolète.
Le contexte partagé doit toujours pouvoir être vérifié contre l'état Git réel.

## Sources de vérité

| Donnée | Source de vérité | Règle |
| :--- | :--- | :--- |
| Branche active | Git (`git status --short --branch`) | Git gagne toujours |
| Dernier commit | Git (`git log --oneline -5`) | Git gagne toujours |
| Working tree | Git (`git status --short`) | Git gagne toujours |
| Ticket actif | `docs/backlog/PRODUCT_BACKLOG.md` + branche active | Divergence signalée |
| Dernier `STATUS` pipeline | Orchestrateur | Reporté dans le contexte partagé |
| Prochaine action | Orchestrateur | Dérivée du dernier statut et du backlog |

`CURRENT_TASK.md` et `HANDOVER.md` ne sont pas des sources de vérité indépendantes. Ce
sont des artefacts de reprise, synchronisés à partir de Git, du backlog et du dernier
statut fiable du pipeline.

## Responsabilité exclusive

L'orchestrateur est le seul rôle responsable de synchroniser `CURRENT_TASK.md` et
`HANDOVER.md`.

Les agents spécialisés peuvent lire ces fichiers, mais ne les modifient pas. Ils
retournent uniquement les informations nécessaires à l'orchestrateur dans leur sortie
structurée (`STATUS`, `SUMMARY`, `EVIDENCE`, `FILES_MODIFIED`, `NEXT_ACTION`).

## Cycle obligatoire

### Au démarrage ou après compactage

1. Lire les règles d'orchestration de la plateforme courante.
2. Exécuter `git status --short --branch`.
3. Exécuter `git log --oneline -5`.
4. Lire `CURRENT_TASK.md` et `HANDOVER.md`.
5. Comparer les documents à Git.
6. Si une divergence existe, signaler `CONTEXT_OUT_OF_SYNC` et ne dispatcher aucun agent
   d'écriture avant résolution.

### Avant chaque délégation

1. Vérifier l'état Git réel.
2. Inclure dans le mandat le champ `ÉTAT GIT CONFIRMÉ`.
3. Inclure le ticket actif, le dernier `STATUS` et la prochaine action attendue.

### Avant clôture ou commit

1. Vérifier que le ticket est terminé (`STATUS: SUCCESS` ou décision utilisateur).
2. Vérifier que le diff correspond au ticket.
3. Synchroniser `CURRENT_TASK.md` et `HANDOVER.md`.
4. Vérifier à nouveau `git status --short --branch`.
5. Autoriser seulement ensuite la proposition de commit.

## Gestion des divergences

| Divergence | Action |
| :--- | :--- |
| Branche active différente du ticket documenté | `CONTEXT_OUT_OF_SYNC`, arrêt avant écriture |
| Working tree non vide alors que le contexte indique « propre » | Signalement + diff ciblé |
| Ticket marqué terminé mais branche encore active avec diff | Demander clôture, commit ou abandon |
| Documents obsolètes après commit | Synchronisation immédiate par l'orchestrateur |
| Agent interrompu avant retour structuré | Reprendre depuis Git + dernier `STATUS` fiable |

## Critères d'acceptation

- Une reprise de session identifie sans ambiguïté la branche, le ticket, le dernier
  statut et la prochaine action.
- Aucun agent spécialisé ne modifie `CURRENT_TASK.md` ou `HANDOVER.md`.
- Un ticket ne peut pas être considéré clôturé sans synchronisation explicite du contexte
  partagé.
- En cas de conflit entre Git et un document, Git gagne et l'écart est signalé.
