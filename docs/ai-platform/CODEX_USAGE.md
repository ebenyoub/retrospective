# Utilisation de l'architecture multi-agents dans Codex

Version **v2.0** — mise à jour le 2026-07-22. Ce document décrit l'adaptateur Codex
actuel, basé sur les **subagents natifs Codex** et les agents personnalisés du dépôt.

## Constat actuel

La version locale vérifiée pendant `T-AI-PLATFORM-CODEX-BOOTSTRAP` est
`codex-cli 0.144.6`, avec le feature flag `multi_agent` actif et stable.

Les versions actuelles de Codex savent :

- lancer des subagents natifs depuis le fil principal ;
- afficher les fils d'agents via `/agent` dans le CLI ;
- charger des agents personnalisés depuis `.codex/agents/*.toml` ;
- appliquer les paramètres projet de `.codex/config.toml` ;
- utiliser les champs `name`, `description` et `developer_instructions` comme contrat
  minimal d'un agent personnalisé ;
- laisser le fil principal collecter les résultats et décider de la suite.

L'ancienne approche `codex exec` reste seulement un **fallback legacy** pour un flux
non interactif ou externe. Elle ne doit plus être utilisée comme chemin nominal de la
plateforme.

## Comment lancer le workflow dans Codex

1. **Orchestrateur** : rester dans le fil principal Codex.
2. **Préflight** : vérifier `git status --short --branch`, `git log --oneline -5`, le
   ticket actif et le contexte partagé.
3. **Délégation native** : demander explicitement à Codex de lancer les agents
   personnalisés nécessaires, par leur nom `.codex/agents/*.toml`.
4. **Inspection** : utiliser `/agent` pour vérifier les fils actifs ou terminés.
5. **Décision** : attendre les retours, lire les `STATUS`, puis décider de l'étape
   suivante.

Exemple de mandat :

```text
Utilise les agents personnalisés de `.codex/agents/`.

Lance réellement comme subagents natifs :
- analyst-ticket
- briefing-agent
- developer
- qa
- reviewer

Ne lance pas `codex exec`.
Ne simule pas les rôles dans le fil principal.
Chaque agent travaille dans son propre fil.
Retourne le STATUS de chaque agent et la synthèse finale.
```

## Rôles définis

| Famille | Agents Codex |
| :--- | :--- |
| Analyse | `analyst-ticket`, `analyst-functional`, `product-owner` |
| Architecture | `architect`, `architecte-simple` |
| Briefing | `briefing-agent` |
| Développement | `developer`, `developer-fast`, `backend`, `backend-express`, `frontend`, `frontend-react`, `database`, `database-mysql` |
| Validation | `qa`, `qa-tests`, `reviewer`, `reviewer-code`, `security` |
| Documentation / décisions | `documentation`, `documentation-technique`, `documentation-jury`, `decision-recorder`, `commit-agent`, `formateur-dwwm` |

Les fichiers `.codex/agents/*.toml` sont des agents personnalisés natifs Codex. Leur
champ `name` est la source de vérité utilisée au lancement.

## Différences Claude ↔ AGY ↔ Codex

| Point | Claude | AGY | Codex |
| :--- | :--- | :--- | :--- |
| Subagents | Natifs Claude Code | `DefineSubagent` / agents AGY | Natifs Codex |
| Définition des agents | `.claude/agents/*.md` | dynamique / règles AGY | `.codex/agents/*.toml` |
| Inspection | UI Claude | UI AGY | `/agent` / fils d'agents |
| Orchestrateur | Fil principal | Fil principal | Fil principal |
| Profondeur | Aucun agent n'appelle un agent | `enable_subagent_tools: false` | `agents.max_depth` par défaut à `1` |
| Ancien fallback | — | — | `codex exec` externe uniquement |

## Règles spécifiques Codex

- L'orchestrateur ne réalise pas le travail spécialisé d'un agent existant.
- Pour les tâches complexes, demander explicitement l'usage des subagents natifs.
- Garder `agents.max_depth = 1` pour empêcher un agent enfant de relancer d'autres
  agents.
- Ne pas lancer tous les agents par réflexe : sélectionner seulement les rôles utiles.
- Garder les tâches d'écriture parallèles rares et disjointes pour éviter les conflits.
- Les agents retournent un résultat structuré conforme au contrat commun (`STATUS`,
  `SUMMARY`, `EVIDENCE`, `FILES_MODIFIED`, `NEXT_ACTION`).
- Aucun agent ne committe, push ou merge.

## Reprendre une tâche déjà commencée

Au démarrage d'une session Codex :

1. Lire `AGENTS.md`.
2. Lire `.claude/CURRENT_TASK.md` et `.claude/HANDOVER.md`.
3. Exécuter `git status --short --branch` et `git log --oneline -5`.
4. Comparer Git, backlog et contexte partagé.
5. Si Git contredit les documents, retourner `CONTEXT_OUT_OF_SYNC` avant toute écriture.

La règle détaillée est dans `docs/ai-platform/CONTEXT_SYNC.md`.

## Qualification

Le pilote du 2026-07-22 a lancé avec succès des agents personnalisés Codex natifs :

- `analyst-ticket`
- `architect`

Ces agents ont travaillé dans des fils distincts et ont retourné des rapports structurés.
Cette preuve qualifie le bootstrap natif de l'adaptateur Codex. Les scénarios plus
avancés (`TEST_FAILED`, `OUT_OF_SCOPE`, `NEEDS_DECISION`, timeout) restent à éprouver au
fil de vrais tickets produit.
