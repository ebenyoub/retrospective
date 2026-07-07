# Skill : dwwm-project

## Rôle

Compétences globales pour gérer un projet DWWM de bout en bout : organisation, priorisation, documentation, préparation jury.

## Quand l'utiliser

- Pour organiser le travail en sprints simples
- Pour vérifier qu'une fonctionnalité couvre les compétences DWWM
- Pour maintenir la documentation à jour
- Avant chaque session de travail, pour relire `docs/PROJECT_STATE.md`

## Niveau attendu

DWWM — Développeur Web et Web Mobile. Ni trop basique (on sait coder), ni trop avancé (on peut expliquer chaque ligne).

## Bonnes pratiques

- Mettre à jour `docs/PROJECT_STATE.md` avant et après chaque session de travail
- Une fonctionnalité = un ticket = une branche (si Git flow utilisé)
- Tester manuellement avant de cocher "terminé"
- Ajouter une entrée dans `docs/CHANGELOG.md` à chaque livraison
- Collecter les preuves au fur et à mesure (pas à la fin)

## Erreurs à éviter

- Développer plusieurs fonctionnalités en même temps
- Ignorer la documentation jusqu'à la veille de la soutenance
- Oublier de tester les cas d'erreur
- Choisir une technologie sans savoir l'expliquer au jury
- Sous-estimer le temps de préparation de l'oral

## Checklist avant chaque session de travail

- [ ] Relire `docs/PROJECT_STATE.md`
- [ ] Identifier le ticket en cours dans `docs/backlog/SPRINT_BACKLOG.md`
- [ ] Vérifier qu'il n'y a pas de blocage non résolu
- [ ] Savoir ce qu'on veut livrer à la fin de la session

## Checklist après chaque livraison

- [ ] Fonctionnalité testée (cas nominal + cas d'erreur)
- [ ] `docs/PROJECT_STATE.md` mis à jour
- [ ] `docs/CHANGELOG.md` mis à jour
- [ ] Ticket coché dans le sprint backlog
- [ ] Commit Git avec un message clair
