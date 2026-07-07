# CLAUDE.md — Projet Rétrospective DWWM

## Contexte du projet

Application web de rétrospective agile, présentée au titre professionnel DWWM.
Stack : React + TypeScript + Vite (frontend), Node.js + Express + TypeScript (backend), MySQL.

## Règles obligatoires

1. **Niveau DWWM** — Toute solution doit rester compréhensible par un développeur en formation. Si c'est trop complexe, c'est trop.

2. **Simplifier, pas complexifier** — Avant d'ajouter une abstraction, demande-toi si le code serait plus clair sans. La réponse est souvent oui.

3. **Pas de patterns avancés** — Pas de Clean Architecture, CQRS, Event Sourcing, microservices, DDD, Repository Pattern lourd, ou autre architecture d'entreprise. Des contrôleurs Express simples suffisent.

4. **Explicable à l'oral** — Chaque ligne de code doit pouvoir être expliquée devant un jury en 30 secondes. Si ce n'est pas le cas, refactoriser.

5. **Cohérence de style** — Rester proche du code existant : fonctions simples, requêtes SQL lisibles, composants React sans magie, hooks directs.

6. **Mettre à jour PROJECT_STATE.md** — Avant toute modification importante, mettre à jour `docs/PROJECT_STATE.md` pour garder une trace de l'état du projet.

7. **Workflow ticket** — Chaque fonctionnalité suit ce cycle :
   `analyse → proposition → validation → développement → test → documentation`
   Ne pas sauter d'étape.

8. **Un sujet à la fois** — Ne jamais développer plusieurs grosses fonctionnalités en parallèle. Finir, tester, documenter, puis passer à la suite.

9. **Lisibilité > performance** — Un code un peu moins optimisé mais clair vaut mieux qu'un code brilliant mais illisible. On optimise seulement si c'est nécessaire.

10. **Justification simple** — Tout choix technique doit pouvoir être justifié en une phrase simple. Si on ne sait pas pourquoi on a choisi quelque chose, on le reconsidère.

## Architecture du projet

```
retrospective/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── authentication/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── pages/
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── authentication/
│   │   ├── controllers/
│   │   └── session/
├── docs/              # Documentation projet
└── .claude/           # Configuration Claude
```

## Ce qu'on utilise

- JWT pour l'authentification
- bcrypt pour le hachage des mots de passe
- nodemailer pour les emails
- MySQL avec requêtes SQL directes (pas d'ORM)
- Context React pour l'état global (pas de Redux)
- Fetch API (pas d'axios sauf si déjà présent)

## Ce qu'on n'utilise pas

- ORM type Prisma ou Sequelize (sauf si déjà présent)
- Redux / Zustand / Jotai
- Clean Architecture
- Patterns trop abstraits
- Librairies UI lourdes non justifiées

## Agents disponibles

Voir `.claude/agents/` pour les agents spécialisés par domaine.

## Skills disponibles

Voir `.claude/skills/` pour les guides par domaine technique.

## Boucle de travail (anti-gaspillage de tokens)

Chaque tâche suit : `Backlog → 1 tâche → code → test/build → review diff → docs → commit`.

11. **Périmètre autorisé par tâche** — Avant de coder, la tâche déclare les dossiers/fichiers qu'elle a le droit de toucher (ex : "uniquement `src/pages/home/` et `src/main.tsx`"). On ne sort pas de ce périmètre sans validation explicite. Objectif : éviter de relire ou modifier tout le projet pour une tâche ciblée.

12. **Review = diff uniquement** — La relecture de code (`reviewer-code`) ne lit que le diff et les fichiers effectivement modifiés par la tâche en cours, jamais l'ensemble du repo. Si un fichier hors diff doit être consulté pour comprendre le contexte, le citer explicitement plutôt que de tout relire.
