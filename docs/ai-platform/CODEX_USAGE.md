# Utilisation de l'architecture multi-agents dans Codex

Version **v1.1** — mise à jour le 2026-07-21. Ce document ne redéfinit aucune règle métier
ou de processus : il explique comment le contrat canonique d'`AGENTS.md` et le schéma
`.codex/schema/agent_response.json` s'exécutent concrètement avec Codex CLI.

## Constat de départ (à lire avant d'utiliser `.codex/agents/`)

Codex CLI (`codex-cli 0.144.3`, vérifié le 2026-07-21 via `codex --help` / `codex features
list` / `~/.codex/config.toml`) n'a **aucun mécanisme natif** équivalent à l'outil `Agent`
de Claude Code :
- pas de sous-commande `codex agent`, pas de registre de sous-agents ;
- pas de lecture automatique d'un dossier `.codex/agents/` ;
- pas de restriction d'outils fine (`tools:` par agent) — le seul contrôle technique réel
  est le **sandbox du processus** (`--sandbox read-only|workspace-write|danger-full-access`),
  une permission d'écriture globale, pas un allowlist d'outils précis.

**Conséquence assumée** : les fichiers `.codex/agents/*.toml` ne sont pas des sous-agents
auto-invoqués. Ce sont des **gabarits de prompt** que l'orchestrateur (toi, ou un script)
copie dans une invocation `codex exec` séparée. La délégation dans Codex est **manuelle**,
pas automatique — c'est la divergence la plus importante avec Claude Code, à ne jamais
perdre de vue en l'utilisant.

## Comment lancer le workflow dans Codex

1. **Orchestrateur** = la session Codex par défaut (interactive `codex` ou `codex exec`
   à la racine du projet, sans profil de rôle). Elle lit `AGENTS.md` automatiquement au
   démarrage — c'est l'équivalent réel de `CLAUDE.md`/`.claude/ORCHESTRATOR.md` côté Codex.
   Elle sélectionne la tâche, vérifie Git, découpe si besoin, et **ne code jamais
   elle-même** — comme côté Claude.

2. **Déléguer un rôle** = lancer une invocation Codex séparée avec le gabarit du rôle
   collé en tête de prompt, en choisissant le sandbox adapté :

   ```bash
   # Rôle développeur (a besoin d'écrire) :
   codex exec --sandbox workspace-write "$(cat .codex/agents/developer.toml | sed -n '/developer_instructions/,$p')
   ---
   TICKET: <id>
   OBJECTIF: <...>
   PÉRIMÈTRE: <fichiers autorisés>
   ÉTAT GIT: <branche, propreté — vérifiés par toi juste avant, voir plus bas>
   "

   # Rôle reviewer / QA en lecture (n'a pas besoin d'écrire du code applicatif) :
   codex exec --sandbox read-only "$(cat .codex/agents/reviewer.toml | sed -n '/developer_instructions/,$p')
   ---
   Relis le diff du ticket <id>.
   "
   ```

   En pratique, il est plus simple d'ouvrir le fichier `.toml` du rôle, de copier le
   contenu de `developer_instructions`, de le coller en tête du prompt `codex exec`, et
   d'y ajouter le mandat du ticket (même structure que le mandat Claude — voir
   `.claude/DELEGATION.md §Protocole de mandat`, réutilisé tel quel).

3. **QA a besoin d'exécuter des commandes** (tests, `tsc`) → sandbox `workspace-write`
   également (le shell est nécessaire), mais QA ne modifie jamais le code applicatif de
   façon persistante (même règle que côté Claude — restaurer après un test manuel).

4. **Retour à l'orchestrateur** = la session déléguée retourne un objet JSON conforme à
   `.codex/schema/agent_response.json` : `STATUS`, `SUMMARY`, `EVIDENCE`,
   `FILES_MODIFIED`, `NEXT_ACTION`. L'orchestrateur interprète ce résultat et décide de
   la suite.

5. **Commit** : comme côté Claude, aucun rôle Codex n'exécute `git commit`. Le gabarit
   `commit-agent.toml` prépare seulement le message ; l'utilisateur valide puis crée le
   commit.

## Rôles définis dans le contrat Codex

| Rôle Claude | Équivalent Codex | Statut |
|---|---|---|
| Orchestrateur | Session par défaut + `AGENTS.md` | Rôle de coordination |
| Analyste Ticket | `analyst-ticket.toml` | Gabarit `read-only` |
| Analyste Fonctionnel | `analyst-functional.toml` | Gabarit `read-only` |
| Architecte | `architect.toml` | Gabarit `read-only` |
| Briefing Agent | `briefing-agent.toml` | Gabarit `read-only` |
| Développeur général / rapide | `developer.toml`, `developer-fast.toml` | Gabarits `workspace-write` |
| Backend / Frontend / Database | `backend.toml`, `frontend.toml`, `database.toml` | Gabarits `workspace-write` |
| QA / Reviewer / Sécurité | `qa.toml`, `reviewer.toml`, `security.toml` | Gabarits dédiés |
| Product Owner | `product-owner.toml` | Gabarit `read-only` |
| Consignateur décision / Commit / Documentation | `decision-recorder.toml`, `commit-agent.toml`, `documentation.toml` | Gabarits dédiés |

Ces gabarits correspondent au roster d'`AGENTS.md`. Leur présence documente le contrat
de rôle ; elle ne constitue pas une preuve de qualification d'exécution.

## Différences de comportement Claude ↔ Codex

1. **Délégation automatique vs manuelle** — Claude Code invoque un sous-agent dans le
   même fil de conversation via l'outil `Agent`, avec restriction d'outils réellement
   appliquée (`tools:`). Codex n'a pas cet outil : chaque rôle est une invocation
   `codex exec` séparée, lancée manuellement (ou par un script externe que tu écrirais),
   sans registre ni dispatch natif.

2. **Restriction d'outils : fine vs coarse** — Claude restreint précisément les outils
   par agent (`Read, Edit, Grep, Glob` par exemple). Codex ne peut restreindre qu'au
   niveau du **sandbox du processus** (lecture seule / écriture workspace / accès total).
   Un rôle Codex en sandbox `workspace-write` a techniquement accès à *tous* les outils
   disponibles dans ce mode, pas seulement ceux listés dans son gabarit — la limite
   déclarée dans le `.toml` reste **une consigne, pas une garantie technique**, contrairement
   à Claude Code où l'absence de l'outil est structurelle.

3. **« Aucun agent n'appelle un agent » : structurel vs conventionnel** — Côté Claude,
   c'est garanti par construction (aucun agent n'a l'outil d'invocation d'agent). Côté
   Codex, **rien n'empêche techniquement** une session en sandbox `workspace-write`
   d'exécuter elle-même une commande shell relançant `codex`/`codex exec` — l'invariant
   tient uniquement parce que chaque gabarit `.toml` l'interdit explicitement en texte
   et qu'aucun script d'auto-dispatch n'existe dans ce projet. **Capacité non disponible,
   signalée explicitement** : il n'y a pas de garantie structurelle équivalente à Claude
   Code sur ce point.

4. **`ÉTAT GIT CONFIRMÉ` non automatisable** — Côté Claude (v1.2/v1.3), l'orchestrateur
   garantit les préconditions Git avant chaque délégation grâce à son propre contrôle
   dans le même processus. Côté Codex, l'orchestrateur (session par défaut) et le rôle
   délégué (`codex exec` séparé) ne partagent pas de mémoire — il n'y a **aucun moyen
   automatique de transmettre un état déjà vérifié**. Chaque gabarit Codex revérifie donc
   `git status --short --branch` lui-même (retour au modèle pré-v1.1 de Claude, par
   nécessité et non par préférence — voir la leçon correspondante dans
   `LESSONS_LEARNED.md` pour comprendre pourquoi ce choix avait justement été abandonné
   côté Claude).

5. **Rôles spécialisés** — le roster Codex définit des gabarits dédiés pour le backend,
   le frontend, la base de données et les tâches rapides. Leur sélection relève de
   l'orchestrateur, conformément à `AGENTS.md`.

6. **Contrat de retour** : le schéma Codex est la référence pour les cinq champs JSON ;
   la matrice des statuts, dont `BLOCKED`, est définie dans `AGENTS.md`.

## Limitations connues

- Aucun dispatch automatique : la délégation Codex demande une action humaine
  (copier/coller le gabarit, choisir le sandbox, lancer `codex exec`) à chaque étape.
- Pas de restriction d'outils techniquement appliquée, seulement le sandbox
  (lecture/écriture) et la consigne textuelle du gabarit.
- Pas de garantie structurelle contre un agent qui en invoquerait un autre — repose sur
  la consigne, pas sur l'absence technique de la capacité.
- La présence des gabarits ne qualifie pas leur exécution : consulter `PILOTS.md` pour
  l'état factuel de qualification.

## Reprendre une tâche déjà commencée sous Claude

Rien de spécifique à faire : `.claude/CURRENT_TASK.md` et `.claude/HANDOVER.md` sont des
fichiers du dépôt, pas des artefacts propres à Claude Code — une session Codex les lit
normalement avec ses outils de lecture de fichiers standards. Au démarrage d'une session
Codex sur ce projet :

1. Lire `AGENTS.md` (chargé automatiquement).
2. Lire `.claude/CURRENT_TASK.md` puis `.claude/HANDOVER.md` — jamais supposer l'état à
   partir d'une conversation précédente, y compris une conversation Claude.
3. Exécuter `git status --short --branch` et comparer à ce que ces deux documents
   annoncent — signaler tout écart avant de continuer (même règle que côté Claude,
   voir `.claude/ORCHESTRATOR.md §Vérification préalable`).
4. Reprendre le pipeline à l'étape indiquée par `CURRENT_TASK.md` (« Prochaine action
   unique »), en dispatchant manuellement le rôle Codex correspondant si nécessaire.

Si Git contredit `CURRENT_TASK.md` ou `HANDOVER.md`, Git gagne. Le fil principal Codex
doit traiter l'écart comme `CONTEXT_OUT_OF_SYNC`, synchroniser le contexte partagé ou
demander validation avant toute délégation d'écriture. Les rôles `documentation*` ne
modifient pas ces deux fichiers ; ils ne fournissent que les informations nécessaires à
l'orchestrateur. Voir `docs/ai-platform/CONTEXT_SYNC.md`.

Aucune conversion de format n'est nécessaire : le ticket, le périmètre et l'état Git sont
les mêmes documents, lus par les deux plateformes.
