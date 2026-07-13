# AGENTS

Avant toute tache, appliquer `.claude/PROJECT_WORKFLOW.md`.

Les regles de developpement sont definies dans :
- `.claude/PROJECT_WORKFLOW.md`
- les skills presents dans `.claude/skills/`

Les subagents ont des responsabilites limitees :
- `qa` : verification qualite
- `reviewer` : revue de code
- `documentation` : documentation

Ne dupliquez pas les regles presentes dans `.claude/PROJECT_WORKFLOW.md`.
Chaque agent applique uniquement les regles correspondant a sa responsabilite.
