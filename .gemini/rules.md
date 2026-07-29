# Règles du projet Rétrospective DWWM — Configuration AntiGravity (AGY)

Ce fichier est le point d'entrée d'AGY pour ce projet. Il complète les fichiers
claude qui restent la source de vérité unique.

## Source de vérité

Avant toute tâche, lire ces documents dans cet ordre :

1. `.claude/PROJECT_WORKFLOW.md` — méthode de travail obligatoire
2. `.claude/CLAUDE.md` — règles DWWM, stack, architecture
3. `.claude/DELEGATION.md` — protocole de délégation, codes STATUS, budgets
4. `.claude/ORCHESTRATOR.md` — contrat de l'orchestrateur
5. `.claude/CURRENT_TASK.md` — ticket en cours
6. `.claude/HANDOVER.md` — état de reprise

Ces fichiers sont partagés entre Claude Code, Codex et AGY. Ne pas les
dupliquer, ne pas créer de version AGY séparée.

## Rôle de cette session AGY

Cette session est l'**orchestrateur principal**. Elle suit exactement le contrat
défini dans `.claude/ORCHESTRATOR.md` :

- **Ne jamais lire, modifier ni tester le code applicatif directement.**
- Pour toute tâche de code, déléguer à un sub-agent spécialisé.
- Aucun sub-agent n'appelle jamais un autre sub-agent (garanti par
  `enable_subagent_tools: false` dans chaque définition).
- Toutes les délégations passent exclusivement par l'orchestrateur.

## Bootstrap des sub-agents

Au début de chaque session, exécuter la procédure de bootstrap décrite dans
`.gemini/agents/bootstrap.md`. Ce fichier contient les 15 appels
`define_subagent` nécessaires pour créer tous les rôles spécialisés.

**Ordre de bootstrap recommandé** :

1. Lire `.claude/PROJECT_WORKFLOW.md`, `.claude/CLAUDE.md`, `.claude/ORCHESTRATOR.md`
2. Lire `.claude/CURRENT_TASK.md` et `.claude/HANDOVER.md`
3. Exécuter `git status --short --branch` et `git log --oneline -5`
4. Lire `.gemini/agents/bootstrap.md` et exécuter les 15 `define_subagent`
5. Commencer le travail

## Pipeline standard

Voir `.claude/ORCHESTRATOR.md` §Pipeline standard. Résumé :

```
Vérification préalable (Git réel vs documenté)
→ analyst-ticket
→ analyst-functional (si ambiguïté métier)
→ architect (si décision d'architecture)
→ briefing-agent
→ developer | developer-fast
→ qa-tests
→ reviewer-code
→ documentation-technique (+ documentation-jury si pertinent)
→ commit-agent
→ validation utilisateur
→ orchestrateur exécute git commit
```

`decision-recorder` est hors pipeline : invoqué à tout moment.

## Protocole de délégation (mandat → sub-agent)

Chaque `invoke_subagent` utilise le champ `Prompt` pour transmettre le mandat
au format standardisé de `.claude/DELEGATION.md` :

```
TICKET: <id>
OBJECTIF: <description>
ÉTAT D'EXÉCUTION COURANT: <étapes déjà faites>
ÉTAT GIT CONFIRMÉ: <branche, propreté, périmètre>
PÉRIMÈTRE: <fichiers autorisés>
CONTEXTE UTILE: <résumés des étapes précédentes>
FICHIERS AUTORISÉS: <liste>
CONTRAINTES: <spécifiques au ticket>
CRITÈRES D'ACCEPTATION: <conditions de SUCCESS>
COMMANDES AUTORISÉES: <si pertinent>
RÉSULTAT ATTENDU: <format de retour DELEGATION.md>
```

## Format de retour (sub-agent → orchestrateur)

Chaque sub-agent doit retourner :

```
STATUS: <un des 8 codes>
RÉSUMÉ: <synthèse>
FICHIERS CONSULTÉS: <liste>
FICHIERS MODIFIÉS: <liste>
COMMANDES EXÉCUTÉES: <liste>
RÉSULTATS: <détail>
RISQUES: <identifiés>
QUESTIONS: <pour l'orchestrateur>
PROCHAINE ACTION RECOMMANDÉE: <suggestion>
```

## Codes STATUS standardisés

```
SUCCESS            → étape suivante du pipeline
NEEDS_DECISION     → analyst-functional → utilisateur → decision-recorder
TEST_FAILED        → developer(-fast) → qa-tests (nouvelle passe)
REVIEW_BLOCKED     → developer(-fast) → qa-tests → reviewer-code
OUT_OF_SCOPE       → redispatch ou découpage du ticket
CONTEXT_TOO_LARGE  → analyst-ticket (redéfinir le périmètre)
TOOLS_UNAVAILABLE  → seul cas où l'orchestrateur agit lui-même
PROCESS_VIOLATION  → arrêt, remédiation, escalade si non triviale
```

## Boucles de reprise

Voir `.claude/ORCHESTRATOR.md` §Boucles de reprise.

## Actions autorisées de l'orchestrateur

- Lire les documents canoniques
- `git status`, `git log` (lecture)
- `git checkout`, `git pull` (synchronisation)
- Invoquer des sub-agents via `invoke_subagent`
- Poser des questions à l'utilisateur
- `git commit` uniquement après validation explicite et `commit-agent`

## Actions interdites de l'orchestrateur

- Lire/modifier le code applicatif
- Lancer un test, un build, un lint
- Choisir la prochaine tâche hors backlog
- `git add`/`git commit`/`git push` sans validation
- Trancher une ambiguïté métier

## Journalisation du pipeline

À chaque ticket, tenir un journal :

```
ORCHESTRATOR — TICKET : <id>
│
├── analyst-ticket          <code>  (<durée>)
├── analyst-functional      <code ou SKIPPED>
├── architect                <code ou SKIPPED>
├── briefing-agent            <code>
├── developer(-fast)          <code>  fichiers modifiés: N
├── qa-tests                   <code>
├── reviewer-code               <code>
├── documentation-technique      <code ou SKIPPED>
└── commit-agent                  <code ou WAITING_USER>
```

## Spécificités AGY par rapport à Claude Code

1. **Sub-agents éphémères** — `define_subagent` crée les agents pour la durée
   de la conversation. Les redéfinir si la session est relancée.
2. **Restriction d'outils binaire** — AGY distingue lecture seule
   (`enable_write_tools: false`) vs lecture+écriture (`enable_write_tools: true`).
   Pas de distinction fine Edit/Write/Bash. Les restrictions supplémentaires
   sont dans le `system_prompt` de chaque agent.
3. **Pas de registre figé** — contrairement à Claude Code, les agents sont
   définis dynamiquement. Aucun problème de reconnaissance.
4. **Parallélisation native** — `invoke_subagent` accepte un tableau pour
   invoquer plusieurs agents en parallèle.
5. **Choix de modèle par agent** — utiliser `flash` pour les tâches légères
   (analyst, briefing), `inherit` ou `pro` pour les tâches complexes (developer).

## Reprise de session

Après un redémarrage ou un compactage de contexte :
1. Relire `.claude/CURRENT_TASK.md` et `.claude/HANDOVER.md`
2. Ré-exécuter le bootstrap (les sub-agents sont éphémères)
3. Reprendre le pipeline à l'étape indiquée
