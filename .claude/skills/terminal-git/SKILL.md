---
name: terminal-git
description: Vocabulaire terminal et workflow Git/GitHub tels qu'enseignés dans la formation d'Elyas (cours 02-Terminal, 09-Git-Github - la-plateforme.io). Couvre les commandes de base du terminal et la "routine Git" attendue par la prof (status/add/commit/pull/push). À consulter avant de proposer des commandes terminal ou un message/workflow de commit pour un projet d'Elyas, afin de rester conforme à sa méthode de travail.
---

# Terminal & Git/GitHub

Cours sources : 02-Terminal, 09-Git-Github.

## Terminal — vocabulaire et commandes de base
- Vocabulaire : répertoire, fichier, extension, chemin absolu/relatif, commande.
- Commandes enseignées : `pwd`, `cd <dir>`, `cd ..`, `cd /`, `cd` (ou `cd ~`), `ls`, `ls <chemin>`.
- Raccourcis : Tab (auto-complétion), flèches haut/bas (historique), `Ctrl+C` (stopper une commande), `Shift+Ctrl+C`/`Shift+Ctrl+V` (copier-coller dans le terminal).
- **Règle explicite de la prof** : éviter les accents et les espaces dans les noms de fichiers/dossiers (problèmes d'interprétation selon OS/terminal).

## Git — la "routine" enseignée
Cycle de base :
```
git status              # voir ce qui a changé
git add <fichier>        # mettre en zone de préparation (staging)
git commit -m "message"  # sauvegarder définitivement dans l'historique
```
- **Règle sur les messages de commit** (donnée explicitement par la prof) : le message décrit uniquement les changements apportés. Ne jamais y mettre l'auteur ou la date — Git les gère déjà automatiquement.
- Collaboration : `git pull` (récupérer les changements distants), `git push` (envoyer ses changements).
- **Workflow attendu par la prof (à reproduire systématiquement)** :
  - Avant de coder : `git pull`
  - Après avoir codé : `git status` → `git add` → `git commit -m "..."` → `git pull` → `git push` (gérer un éventuel conflit avant de pouvoir push)

### Gestion des conflits
1. `git push` refusé → le conflit doit être résolu en local.
2. `git pull` pour rapatrier le conflit.
3. Éditer manuellement les fichiers en conflit.
4. `git add <fichier résolu>`
5. `git commit` (finalise le merge)
6. `git push`

### Démarrer un projet
- Projet existant : `git clone <url>` puis `cd` dans le dossier créé avant toute autre commande.
- Nouveau projet : `mkdir projet && cd projet && touch README.md && git init && git remote add origin <url>`

## GitHub
- **Distinction insistée par la prof** : Git (l'outil de versioning) ≠ GitHub (le service web d'hébergement basé sur Git, créé en 2008). Ne pas confondre les deux dans une explication.
- Concurrents à connaître : Bitbucket, GitLab.

## Checklist avant chaque session de travail
- [ ] `git pull` fait avant de commencer à coder ?
- [ ] Le message de commit décrit-il uniquement le changement (pas d'auteur/date) ?
- [ ] `git status` vérifié avant chaque `git add`/`commit` ?
- [ ] `git push` fait en fin de session (après résolution des conflits éventuels) ?
