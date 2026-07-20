# Délégation aux sous-agents

Ce document complète `.claude/PROJECT_WORKFLOW.md` (§ Orchestrateur). Il ne le duplique pas.

## Principe

L'orchestrateur principal conserve toujours :
- l'objectif métier du ticket ;
- les décisions d'architecture ;
- les modifications de code principales ;
- la synthèse finale et la proposition de commit.

Les sous-agents déjà définis dans ce projet, classés par rôle :

| Rôle | Claude Code (`.claude/agents/`) | Codex (`.codex/agents/`) |
|---|---|---|
| Orchestration | — (agent principal, pas de sous-agent dédié) | — |
| Développement | backend-express, frontend-react, database-mysql | — |
| Tests | qa-tests | qa |
| Revue | reviewer-code | reviewer |
| Documentation | documentation-jury | documentation |
| Autre (conseil, ne modifie aucun fichier) | architecte-simple, formateur-dwwm | — |

Chaque agent référence ce fichier plutôt que d'en recopier le contenu ; les consignes propres à son rôle restent dans son propre fichier.

Ils prennent en charge, lorsque la plateforme le permet :
- lancement des tests backend / frontend, lint, typecheck ;
- tests Playwright ;
- revue de code ciblée sur le diff ;
- documentation liée au ticket ;
- analyse d'un point d'architecture isolé.

## Règles de délégation

- Déléguer une tâche autonome et clairement bornée, dans le périmètre déclaré pour le ticket courant (cf. `.claude/CLAUDE.md` règle 11).
- Donner au sous-agent uniquement les fichiers et commandes nécessaires.
- Demander un résumé structuré, jamais la totalité des logs bruts.
- Ne jamais déléguer une décision métier, une modification ambiguë, ou le choix de la prochaine tâche (réservé à l'orchestrateur, cf. `.claude/PROJECT_WORKFLOW.md`).
- Ne pas lancer deux sous-agents qui modifient les mêmes fichiers en parallèle.
- Un sous-agent ne committe jamais, ne merge jamais, ne change jamais de branche.
- Arrêter une investigation dès qu'elle sort du périmètre du ticket courant.

## Format de retour obligatoire

Chaque sous-agent (Claude, Codex ou autre) doit retourner uniquement :

```
## Tâche exécutée
## Commandes lancées
## Résultat
## Erreurs éventuelles
## Fichiers concernés
## Conclusion
## Action recommandée
```

Ne jamais recopier des centaines de lignes de terminal brutes dans le contexte de l'orchestrateur : ne garder que ce qui est nécessaire à la décision.

## Quand aucun sous-agent n'est disponible

Si la plateforme ne permet pas la délégation (ex : une IA sans mécanisme de sous-agent documenté) :
- exécuter la tâche directement ;
- limiter la sortie affichée (options `--silent`, filtrage, résumé manuel) ;
- ne conserver que la synthèse dans le contexte ;
- ne jamais prétendre avoir délégué à un sous-agent qui n'existe pas.
