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

## À propos d'AGY (AntiGravity) spécifiquement

AGY dispose d'un mécanisme natif de sous-agents (`define_subagent` / `invoke_subagent`)
qui supporte l'architecture multi-agents de ce projet. La configuration AGY se trouve
dans `.gemini/` :

- `.gemini/rules.md` — point d'entrée AGY, contrat de l'orchestrateur adapté
- `.gemini/agents/bootstrap.md` — définitions des 15 sub-agents à créer en début de session
- `.gemini/settings.json` — configuration projet AGY

Capacités réelles d'AGY :
- `define_subagent` : crée un type de sub-agent avec `system_prompt` et restrictions d'outils
- `invoke_subagent` : invoque un sub-agent avec un mandat (supporte l'invocation parallèle)
- `send_message` : communication orchestrateur ↔ sub-agent
- `enable_subagent_tools: false` (défaut) : garantit structurellement que les sub-agents
  ne peuvent pas invoquer d'autres sub-agents — même invariant que Claude Code
- `enable_write_tools` : restriction binaire (lecture seule vs lecture+écriture) — moins
  fine que le `tools:` de Claude Code mais suffisante avec les contraintes textuelles

Limitations connues :
- Les sub-agents sont **éphémères** (durée de la conversation) — les redéfinir à chaque
  nouvelle session via le bootstrap `.gemini/agents/bootstrap.md`
- La granularité des outils est binaire (lecture vs écriture), pas individuelle — les
  restrictions supplémentaires sont dans le `system_prompt` de chaque agent
- Pas de fichier de configuration projet chargé automatiquement de façon vérifiée —
  le bootstrap doit être lancé explicitement en début de session
