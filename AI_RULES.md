# AI_RULES

Point d'entrée générique pour toute IA autre que Claude Code ou Codex (par exemple AGY), ou pour un chargement manuel en début de session.

La source de vérité de ce projet est unique et se trouve dans `.claude/` :

- `.claude/PROJECT_WORKFLOW.md` — méthode de travail obligatoire (Git flow, cycle de tâche, validation, périmètre MVP).
- `.claude/CLAUDE.md` — règles de niveau DWWM (simplicité, lisibilité, périmètre autorisé par tâche).
- `.claude/DELEGATION.md` — règles de délégation aux sous-agents et format de retour attendu.
- `.claude/CURRENT_TASK.md` — ticket en cours, périmètre autorisé, prochaine action unique.
- `.claude/HANDOVER.md` — état de reprise factuel après compactage de contexte ou changement d'IA.

Avant toute tâche, lire ces cinq documents dans cet ordre. Ne pas recopier leur contenu ailleurs : ce fichier ne fait que pointer vers eux.

Suivre les mêmes règles de délégation que Claude Code et Codex (`.claude/DELEGATION.md`) si la plateforme utilisée le permet. Ne pas inventer un mécanisme de sous-agent si l'IA en cours d'usage n'en dispose pas : dans ce cas, exécuter la tâche directement et ne conserver qu'une synthèse dans le contexte, jamais la totalité des logs.

## À propos d'AGY spécifiquement

Le fichier de configuration réellement chargé automatiquement par AGY n'a pas pu être vérifié depuis ce dépôt (aucune preuve d'un dossier ou nom de configuration propre à AGY). Ne pas supposer qu'AGY lit `AI_RULES.md` automatiquement : tant que ce mécanisme n'est pas confirmé, ce fichier doit être fourni manuellement en début de session.
